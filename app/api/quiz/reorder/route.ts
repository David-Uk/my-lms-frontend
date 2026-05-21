import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthToken(request: NextRequest): Promise<string | null> {
  const cookieStore = request.cookies;
  const token = cookieStore.get('token')?.value || null;
  return token;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, questionIds } = body;

    if (!quizId) {
      return NextResponse.json(
        { message: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    if (!questionIds || !Array.isArray(questionIds)) {
      return NextResponse.json(
        { message: 'questionIds array is required' },
        { status: 400 }
      );
    }

    const token = await getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizId}/questions/reorder`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionIds }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to reorder questions' }));
      return NextResponse.json({ message: error.message }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error reordering questions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}