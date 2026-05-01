'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, UserRole, UserStatus } from '@/types';
import { updateUserAction } from '../../actions';

export function UserEditForm({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    status: user.status,
    phoneNumber: user.phoneNumber || '',
    bio: user.bio || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await updateUserAction(user.id, formData);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-8">
        <CardTitle className="text-2xl font-black">Edit User</CardTitle>
        <CardDescription className="font-medium">Modify account details and permissions</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 animate-in shake-1 duration-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="h-12 rounded-xl"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-12 rounded-xl"
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
              >
                <option value="learner">Learner</option>
                <option value="tutor">Tutor</option>
                <option value="admin">Admin</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full h-12 rounded-xl border border-gray-200 px-4 text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="h-12 rounded-xl"
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
              rows={4}
              placeholder="User biography..."
            />
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 text-lg font-black transition-all active:scale-95" isLoading={isLoading}>
              Update Account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
