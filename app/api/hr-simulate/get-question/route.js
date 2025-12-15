// app\api\hr-simulate\get-question\route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase.from('hr_questions').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return random question
  const randomQuestion = data[Math.floor(Math.random() * data.length)];
  return NextResponse.json(randomQuestion);
}