'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/stores/auth-store';
import { api } from '@/lib/api';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      let response = await api.post<any>('/auth/login', formData);

      // Auto-parse if response is a string (final safety layer)
      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch (e) {
          // Stay as string if parse fails
        }
      }
      console.log(response);

      // Adaptive user extraction
      const userData = response?.user || response?.data?.user;
      const authToken = response?.token || response?.data?.token;

      console.log('[Login] API response:', response);
      console.log('[Login] Extracted userData:', userData);
      console.log('[Login] userData.role:', userData?.role);

      if (!userData || !authToken) {
        const receivedStr = typeof response === 'object' ? Object.keys(response || {}).join(', ') : `String value: "${String(response).substring(0, 100)}"`;
        throw new Error(`Authentication data not found in response. Received: ${receivedStr}`);
      }

      login(authToken, userData);

      // Redirect based on role with safety check
      const role = userData.role;
      console.log('[Login] Redirecting based on role:', role);

      if (!role) {
        console.log('[Login] No role found, redirecting to home');
        router.push('/');
        return;
      }

      // Use window.location for full page redirect to ensure cookie is available to middleware
      let redirectUrl: string;
      switch (role) {
        case 'superadmin':
          redirectUrl = '/superadmin/dashboard';
          break;
        case 'admin':
          redirectUrl = '/admin/dashboard';
          break;
        case 'tutor':
          redirectUrl = '/tutor/dashboard';
          break;
        case 'learner':
          redirectUrl = '/learner/dashboard';
          break;
        default:
          redirectUrl = '/';
      }
      console.log('[Login] Full redirect to:', redirectUrl);

      // Small delay to ensure cookie is committed before navigation
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setGeneralError((error as { message: string }).message);
      } else {
        setGeneralError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-2xl shadow-green-900/10 rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="text-center pb-2 pt-10">
        <div className="flex justify-center mb-6">
          <Logo iconOnly className="h-20 w-20" />
        </div>
        <CardTitle className="text-3xl font-poppins font-black text-gray-900 tracking-tight">Welcome Back</CardTitle>
        <CardDescription className="text-gray-500 font-medium">
          Secure access to the Edo digital ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 lg:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 animate-in fade-in slide-in-from-top-2">
              {generalError}
            </div>
          )}

          <Input
            label="Institutional Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="you@edoinnovates.com"
            required
            className="h-12"
          />

          <Input
            label="Secret Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="••••••••"
            required
            className="h-12"
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-black uppercase tracking-widest text-[#004D20] hover:text-[#00A651] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-[#004D20] hover:bg-black text-white h-14 rounded-2xl font-black shadow-xl shadow-green-900/20 transition-all duration-300 active:scale-95 text-lg" isLoading={isLoading}>
            Sign in
          </Button>

          <div className="text-center text-sm font-medium text-gray-400 uppercase tracking-widest pt-4">
            New talent?{' '}
            <Link href="/signup" className="text-[#004D20] hover:text-[#00A651] font-black transition-colors underline decoration-[#00A651]/30 underline-offset-4 pointer-events-auto">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
