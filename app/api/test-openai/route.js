import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    console.log('Testing OpenAI API...');
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('API Key preview:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "API is working!"' }],
      max_tokens: 20,
    });

    return NextResponse.json({
      success: true,
      message: response.choices[0].message.content,
      model: response.model,
    });
  } catch (error) {
    console.error('OpenAI test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      status: error.status,
    }, { status: 500 });
  }
}