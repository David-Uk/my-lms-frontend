import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, email } = body;

    if (!quizId || !email) {
      return NextResponse.json(
        { message: 'Quiz ID and email are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/quizzes/access/${quizId}/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'No invitation found for this email' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching access token:', error);
    return NextResponse.json(
      { message: 'Failed to verify access' },
      { status: 500 }
    );
  }
}
