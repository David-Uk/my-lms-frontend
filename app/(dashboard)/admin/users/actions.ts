'use server';

import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateUserAction(id: string, formData: any) {
  try {
    await api.put(`/users/${id}`, formData);
    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${id}/edit`);
  } catch (error) {
    console.error('Server Action Error:', error);
    return { error: 'Failed to update user' };
  }
  
  redirect('/admin/users');
}

export async function createUserAction(formData: any) {
  console.log('[createUserAction] Starting...', {
    isServer: typeof window === 'undefined',
    hasEmail: !!formData.email,
    role: formData.role
  });
  
  try {
    const result = await api.post('/users', formData);
    console.log('[createUserAction] Success:', result);
    revalidatePath('/admin/users');
  } catch (error: any) {
    console.error('Server Action Error:', error);
    return { 
      error: error.message || 'Failed to create user',
      details: error.errors
    };
  }
  
  redirect('/admin/users');
}
