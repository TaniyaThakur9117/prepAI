// app/api/scores/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST /api/scores: save final score for a session
export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      round,
      sessionId,
      totalQuestions,
      correct,
      score,
      percentage,
      finishedAt = new Date().toISOString(),
    } = body;

    if (!round || !sessionId) {
      return NextResponse.json({ success: false, error: "Missing round or sessionId" }, { status: 400 });
    }

    // Upsert session summary (create if new, update if exists)
    const { data, error } = await supabase
      .from("test_sessions")
      .upsert(
        {
          user_id: userId,
          round,
          session_id: sessionId,
          total_questions: totalQuestions ?? null,
          correct: correct ?? null,
          score: score ?? null,
          percentage: percentage ?? null,
          finished_at: finishedAt,
        },
        { onConflict: "session_id" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, session: data });
  } catch (err) {
    console.error("❌ /api/scores error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
