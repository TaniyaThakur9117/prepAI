import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const { data, error } = await supabaseAdmin.from("attempts").insert([{
      user_id: userId,
      test_type: body.test_type,
      score: body.score,
      total_questions: body.total_questions,
      correct_answers: body.correct_answers ?? null,
      duration_seconds: body.duration_seconds ?? null,
      percentage: body.percentage ?? null
    }]).select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // return current user's attempts (for analytics)
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("attempts")
    .select("*")
    .eq("user_id", userId)
    .order("attempted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}