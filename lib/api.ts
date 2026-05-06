import { JWTPayload, ApiError, ApiRequestError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Token management
export async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // 1. Try the direct localStorage key (set by setToken() on login)
    const lsToken = localStorage.getItem('token');
    if (lsToken) return lsToken;

    // 2. Try the Zustand persisted auth store (key: 'auth-storage')
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string } };
        const zustandToken = parsed?.state?.token;
        if (zustandToken) {
          // Re-sync to the direct key so future calls are fast
          localStorage.setItem('token', zustandToken);
          return zustandToken;
        }
      }
    } catch {
      // Ignore parse errors
    }

    // 3. Fall back to cookie
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      const cookieToken = decodeURIComponent(match[1]);
      localStorage.setItem('token', cookieToken);
      return cookieToken;
    }

    return null;
  }

  // Server-side: read from cookies
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || null;
    console.log('[getToken] Server-side token found:', !!token);
    return token;
  } catch (error) {
    console.error('[getToken] Server-side error:', error);
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    // Write to the direct key (read by getToken)
    localStorage.setItem('token', token);
    // Keep the Zustand persisted store in sync
    try {
      const raw = localStorage.getItem('auth-storage');
      const parsed = raw ? (JSON.parse(raw) as { state?: Record<string, unknown> }) : { state: {} };
      parsed.state = { ...(parsed.state || {}), token };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    } catch {
      // Non-fatal
    }
    // Set cookie for server-side access
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  }
}

export async function removeToken(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } else {
    // Server-side: try to remove from cookies
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('token', '', { expires: new Date(0), path: '/' });
    } catch (e) {
      console.error('[removeToken] Server-side error:', e);
    }
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    let jsonPayload: string;
    if (typeof window !== 'undefined') {
      jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    }

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('[decodeToken] Error:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

// Simple in-memory cache for GET requests
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function clearCache(): void {
  cache.clear();
}

export function invalidateCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

interface FetchOptions extends Omit<RequestInit, 'cache'> {
  useCache?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    useCache = false,
    cacheKey,
    cacheDuration = CACHE_DURATION,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const key = cacheKey || url;

  // Check cache for GET requests
  if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      return cached.data as T;
    }
  }

  // Get token and check expiration
  const token = await getToken();
  if (token && isTokenExpired(token)) {
    await removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('[apiClient] No token available for authenticated request:', endpoint);
  }

  console.log(`[apiClient] Request: ${fetchOptions.method || 'GET'} ${url}`);

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });
  } catch (networkError) {
    // True network failure — server unreachable, DNS failure, CORS preflight blocked, etc.
    const msg = networkError instanceof Error ? networkError.message : String(networkError);
    console.error(`[apiClient] Network failure for ${url}:`, msg);
    throw new Error(`Cannot reach the server at ${API_BASE_URL}. Is the backend running? (${msg})`);
  }

  // Handle 401 - redirect to login
  if (response.status === 401) {
    await removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized. Please login again.');
  }

  // Handle 403
  if (response.status === 403) {
    console.error('[API] 403 Forbidden for:', endpoint);
  }

  // Parse body
  const bodyText = await response.text();
  let data: any;
  if (!bodyText || bodyText.trim() === '') {
    data = {};
  } else {
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = bodyText;
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      bodyText ||
      `HTTP ${response.status}`;
    const errors = typeof data === 'object' ? data?.errors : undefined;
    throw new ApiRequestError(response.status, message, errors);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  // Cache successful GET responses
  if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    cache.set(key, { data, timestamp: Date.now() });
  }

  return data as T;
}

// HTTP methods
export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  del: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  // File upload
  upload: async <T>(endpoint: string, formData: FormData) => {
    const token = await getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `HTTP error! status: ${response.status}`;
      throw new ApiRequestError(response.status, message, errorData.errors);
    }

    return response.json() as Promise<T>;
  },
};

export default api;
