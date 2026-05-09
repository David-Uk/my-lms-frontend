import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function getAuthToken(request: NextRequest): Promise<string | null> {
  const cookieStore = request.cookies;
  const token = cookieStore.get('token')?.value || null;
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topics,
      numberOfQuestions,
      totalMarks,
      passMark,
      questionTypes,
      difficultyLevel,
      startDate,
      startTime,
      endDate,
      endTime,
      durationMinutes,
    } = body;

    if (!topics || !numberOfQuestions) {
      return NextResponse.json(
        { message: 'Topics and number of questions are required' },
        { status: 400 }
      );
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      return NextResponse.json(
        { message: 'Start and end date/time are required' },
        { status: 400 }
      );
    }

    // Get auth token from request cookies
    const token = await getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - no token found' },
        { status: 401 }
      );
    }

    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    // Proxy the request to the backend AI service
    const aiResponse = await fetch(`${API_BASE_URL}/ai/quiz`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        topic: topics,
        numberOfQuestions,
        totalMarks,
        passMark,
        questionTypes,
        difficultyLevel, // Use the value from request body
        startDate,
        startTime,
        endDate,
        endTime,
        durationMinutes,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      return NextResponse.json(
        { message: errorData.message || 'Failed to generate quiz via AI service' },
        { status: aiResponse.status }
      );
    }

    const aiResult = await aiResponse.json();
    
    // The backend returns a quiz with questions already
    // Format it to match what the frontend expects
    const quiz = {
      id: aiResult.id,
      assessmentId: aiResult.assessmentId || `assess_${Date.now()}`,
      title: aiResult.title,
      totalMarks: aiResult.totalMarks,
      passMark: aiResult.passMark,
      startDateTime: aiResult.startDateTime,
      endDateTime: aiResult.endDateTime,
      durationMinutes: aiResult.durationMinutes,
      timeAllocated: aiResult.timeAllocated || (aiResult.durationMinutes || 60),
      isGroup: aiResult.isGroup || false,
      groupPin: aiResult.groupPin || null,
    };

    const questions = aiResult.questions || [];

    return NextResponse.json({
      quiz,
      questions,
      message: 'Quiz generated successfully via AI',
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { message: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
