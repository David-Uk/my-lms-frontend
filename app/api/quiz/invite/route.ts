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
    const { quizId, participants, quiz } = body;

    if (!quizId) {
      return NextResponse.json(
        { message: 'Quiz ID is required' },
        { status: 400 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz data is required' },
        { status: 400 }
      );
    }

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

    // Step 1: Create the quiz in the database (only if it doesn't already exist)
    let quizIdForDb = quizId;
    let finalQuizData = null;
    console.log(`Checking if quiz ${quizId} exists...`);
    
    const checkResponse = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizId}`, {
      method: 'GET',
      headers: authHeaders,
    });

    if (checkResponse.ok) {
      console.log('Quiz already exists, skipping creation.');
      finalQuizData = await checkResponse.json();
    } else {
      console.log('Quiz does not exist, creating...');
      const createQuizResponse = await fetch(`${API_BASE_URL}/quizzes/standalone`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description || quiz.title,
          timeAllocated: quiz.durationMinutes || quiz.timeAllocated || 60,
          passMark: quiz.passMark,
          startDateTime: quiz.startDateTime,
          endDateTime: quiz.endDateTime,
          durationMinutes: quiz.durationMinutes,
          totalMarks: quiz.totalMarks,
        }),
      });

      if (!createQuizResponse.ok) {
        let errorData = '';
        try {
          errorData = await createQuizResponse.json();
        } catch (e) {
          errorData = await createQuizResponse.text();
        }
        console.error('Quiz creation failed:', createQuizResponse.status, errorData);
        throw new Error(`Failed to create quiz: ${JSON.stringify(errorData)}`);
      }

      finalQuizData = await createQuizResponse.json();
      quizIdForDb = finalQuizData.quiz?.id || finalQuizData.id;
      console.log('Quiz created with ID:', quizIdForDb);
    }

    // Step 2: Add questions to the quiz (if new or currently empty)
    const existingQuestions = finalQuizData?.questions || finalQuizData?.quiz?.questions || [];
    if (!checkResponse.ok || existingQuestions.length === 0) {
      console.log('Step 2: Adding questions...');
      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        try {
          const qRes = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizIdForDb}/questions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              type: question.type,
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              marks: question.marks,
            }),
          });
          if (!qRes.ok) {
            console.warn(`Failed to add question ${i + 1}/${questions.length}:`, await qRes.text());
          } else {
            console.log(`Added question ${i + 1}/${questions.length}`);
          }
        } catch (qError) {
          console.warn(`Error adding question ${i + 1}:`, qError);
        }
      }
    } else {
      console.log('Quiz already exists, skipping question addition to avoid duplicates.');
    }

    // Step 3: Invite participants (if any)
    let inviteData = { tokens: [] };
    if (participants && participants.length > 0) {
      console.log('Step 3: Inviting participants...');
      const inviteResponse = await fetch(`${API_BASE_URL}/quizzes/standalone/${quizIdForDb}/participants`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          participants: participants.map((p: { email: string; firstName?: string; lastName?: string }) => ({
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email.split('@')[0],
            email: p.email,
          })),
        }),
      });

      if (!inviteResponse.ok) {
        let errorData = '';
        try {
          errorData = await inviteResponse.json();
        } catch (e) {
          errorData = await inviteResponse.text();
        }
        console.error('Invite creation failed:', inviteResponse.status, errorData);
        throw new Error(`Failed to send invites: ${JSON.stringify(errorData)}`);
      }

      inviteData = await inviteResponse.json();
    }

    console.log('Process completed successfully');
    return NextResponse.json({
      message: 'Quiz created and invitations sent successfully',
      invites: inviteData.tokens || [],
      quizId: quizIdForDb,
      inviteLink: `${request.headers.get('origin') || 'http://localhost:3000'}/quiz/take/${quizIdForDb}`,
      quiz: finalQuizData?.quiz || finalQuizData,
    });
  } catch (error) {
    console.error('Error in invite route:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to send invitations', stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
