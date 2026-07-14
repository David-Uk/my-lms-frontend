'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <KeyRound className="h-10 w-10 text-[var(--brand-primary)]" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">Check Your Email</CardTitle>
          <CardDescription>
            If an account exists with this email, you will receive password reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <KeyRound className="h-10 w-10 text-gray-400" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-900">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Instructions
          </Button>

          <p className="text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link href="/login" className="text-[var(--link-color)] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
