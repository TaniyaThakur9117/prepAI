import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role for secure server-side access
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let query = supabase.from("iq_questions").select("*").limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch IQ questions" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ questions: [] }, { status: 200 });
    }

    const questions = data.map((q) => ({
      id: q.id,
      question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correct_option: q.correct_option,
      difficulty: q.difficulty
    }));

    return NextResponse.json({ questions }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}