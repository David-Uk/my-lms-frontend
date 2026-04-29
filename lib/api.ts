import { JWTPayload, ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Token management
export async function getToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }

  // Server-side: try to get from cookies
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
    localStorage.setItem('token', token);
    // Set cookie for server-side access with all necessary attributes
    const isSecure = window.location.protocol === 'https:';
    const secureFlag = isSecure ? '; Secure' : '';
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
    console.log('[setToken] Cookie set, secure:', isSecure);
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
  console.log(`[apiClient] Headers:`, JSON.stringify({ ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : 'Missing' }));
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    // Handle 401 - redirect to login
    if (response.status === 401) {
      await removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized. Please login again.');
    }

    // Handle 403 - log but don't redirect (permission issue)
    if (response.status === 403) {
      console.error('[API] 403 Forbidden for:', endpoint);
      // Don't redirect - let the component handle it
    }

    // Get the response body as text first so we can try to parse it
    const bodyText = await response.text();
    let data: any;

    if (!bodyText || bodyText.trim() === '') {
      data = {};
    } else {
      try {
        data = JSON.parse(bodyText);
      } catch (e) {
        data = bodyText;
      }
    }

    // Handle other errors
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: (typeof data === 'object' && data?.message) || bodyText || `HTTP error! status: ${response.status}`,
        errors: typeof data === 'object' ? data?.errors : undefined,
      };
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return data as T;

    // Cache GET responses
    if (useCache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
      cache.set(key, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : 'Network error');
  }
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

  patch: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
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
      throw {
        status: response.status,
        message: errorData.message || `HTTP error! status: ${response.status}`,
      } as ApiError;
    }

    return response.json() as Promise<T>;
  },
};

export default api;
