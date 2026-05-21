import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthToken(request: NextRequest): Promise<string | null> {
  const cookieStore = request.cookies;
  const token = cookieStore.get('token')?.value || null;
  return token;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await context.params;
    const body = await request.json();
    const { sessionName, sessionId, participants } = body;

    if (!quizId) {
      return NextResponse.json(
        { message: 'Quiz ID is required' },
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

    const sessionResponse = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizId}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionName, sessionId }),
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.json().catch(() => ({ message: 'Failed to create session' }));
      return NextResponse.json({ message: error.message }, { status: sessionResponse.status });
    }

    const sessionData = await sessionResponse.json();

    let inviteData = { tokens: [] };
    if (participants && participants.length > 0) {
      const inviteResponse = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizId}/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          sessionName: sessionData.sessionName,
          participants: participants.map((p: { email: string; firstName?: string; lastName?: string }) => ({
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email.split('@')[0],
            email: p.email,
          })),
        }),
      });

      if (!inviteResponse.ok) {
        const error = await inviteResponse.json().catch(() => ({ message: 'Failed to invite participants' }));
        return NextResponse.json({ message: error.message }, { status: inviteResponse.status });
      }

      inviteData = await inviteResponse.json();
    }

    return NextResponse.json({
      sessionId: sessionData.sessionId,
      sessionName: sessionData.sessionName,
      quiz: sessionData.quiz,
      invites: inviteData.tokens || [],
      inviteLink: `${request.headers.get('origin') || 'http://localhost:3000'}/quiz/take/${quizId}`,
    });
  } catch (error) {
    console.error('Error creating quiz session:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await context.params;

    if (!quizId) {
      return NextResponse.json(
        { message: 'Quiz ID is required' },
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

    const response = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizId}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch sessions' }));
      return NextResponse.json({ message: error.message }, { status: response.status });
    }

    const sessions = await response.json();
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching quiz sessions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}