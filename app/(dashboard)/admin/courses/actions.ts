'use server';

import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCourseAction(formData: { title: string; description: string; difficultyLevel: string }) {
  try {
    await api.post('/courses', formData);
    revalidatePath('/admin/courses');
  } catch (error) {
    console.error('Server Action Error:', error);
    return { error: 'Failed to create course' };
  }
  
  redirect('/admin/courses');
}

export async function updateCourseAction(id: string, formData: { title: string; description: string; difficultyLevel: string }) {
  try {
    await api.put(`/courses/${id}`, formData);
    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${id}`);
  } catch (error) {
    console.error('Server Action Error:', error);
    return { error: 'Failed to update course' };
  }
  
  redirect('/admin/courses');
}
