'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch (e) {
          // Stay as string if parse fails
        }
      }

      const userData = response?.user || response?.data?.user;
      const authToken = response?.token || response?.data?.token;

      if (!userData || !authToken) {
        const receivedStr = typeof response === 'object' ? Object.keys(response || {}).join(', ') : `String value: "${String(response).substring(0, 100)}"`;
        throw new Error(`Authentication data not found in response. Received: ${receivedStr}`);
      }

      login(authToken, userData);

      const role = userData.role;
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

      router.push(redirectUrl);
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {generalError}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[var(--link-color)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[var(--link-color)] hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
