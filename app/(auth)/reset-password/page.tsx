'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setGeneralError('Invalid reset link. Please request a new one.');
    }
  }, [token, email]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setGeneralError((error as { message: string }).message);
      } else {
        setGeneralError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been reset successfully. Please login with your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {generalError}
            </div>
          )}
          
          <Input
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            error={errors.newPassword}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Reset Password
          </Button>

          <div className="text-center text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
