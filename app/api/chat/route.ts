import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import connectToDatabase from '@/lib/mongodb';
import ChatHistory from '@/lib/models/ChatHistory';
import Expense from '@/lib/models/Expense';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { chatSchema } from '@/lib/schemas';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;

  try {
    const session = await getUserContext(request);
    const userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    const body = await request.json();
    const validatedData = chatSchema.parse(body);

    await connectToDatabase();

    // Save user message
    const userMessage = new ChatHistory({
      userId,
      role: 'user',
      message: validatedData.message,
    });
    await userMessage.save();

    // Get recent chat history and expense data for context
    const chatHistory = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const expenses = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    const totalSpent = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

    // Build context message
    const systemMessage = `You are a helpful budget assistant. Help users track and analyze their expenses. 
Current spending summary:
- Total spent this month: $${totalSpent.toFixed(2)}
- Number of expenses: ${expenses.length}
- Average expense: $${(totalSpent / (expenses.length || 1)).toFixed(2)}

Recent expenses:
${expenses
  .slice(0, 5)
  .map((exp: any) => `- ${exp.item}: $${exp.amount} (${exp.category})`)
  .join('\n')}

Provide helpful budgeting advice and insights.`;

    // Prepare messages for Groq API
    const messages = [
      ...chatHistory
        .reverse()
        .slice(-5)
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.message,
        })),
      {
        role: 'user' as const,
        content: validatedData.message,
      },
    ];

    // Call Groq API
    const completion = await groq.messages.create({
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
      system: systemMessage,
      messages,
    });

    const assistantMessage =
      completion.content[0].type === 'text' ? completion.content[0].text : '';

    // Save assistant response
    const response = new ChatHistory({
      userId,
      role: 'assistant',
      message: assistantMessage,
    });
    await response.save();

    const response = NextResponse.json(
      { message: assistantMessage },
      { status: 200 }
    );
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Chat error:', error);

    if (error.name === 'ZodError') {
      const response = NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    if (isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  }
}
