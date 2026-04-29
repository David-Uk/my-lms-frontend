'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';
import type { SignupRequest } from '@/types';

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/signup', formData);
      setSuccess(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setGeneralError((error as { message: string }).message);
      } else {
        setGeneralError('Signup failed. Please try again.');
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
            <Logo className="h-12 w-12 text-[#004D20]" />
          </div>
          <CardTitle className="text-2xl">Account Created!</CardTitle>
          <CardDescription>
            Your account has been created successfully. Please login to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-6">
          <Logo iconOnly className="h-16 w-16" />
        </div>
        <CardTitle className="text-3xl font-poppins font-black text-gray-900 tracking-tight">Create an Account</CardTitle>
        <CardDescription className="font-medium text-gray-500">
          Join the Edo Innovates digital ecosystem
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {generalError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={errors.lastName}
              required
            />
          </div>

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

          <Input
            label="Phone Number (Optional)"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Bio (Optional)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <Button type="submit" className="w-full bg-[#004D20] hover:bg-black text-white h-12 rounded-xl font-bold shadow-xl shadow-green-900/10 transition-all duration-300" isLoading={isLoading}>
            Create Account
          </Button>

          <div className="text-center text-sm font-medium text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-[#004D20] hover:text-[#00A651] font-bold transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
