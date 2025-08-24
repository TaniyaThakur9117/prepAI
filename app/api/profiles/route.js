import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { userId } = getAuth(req); // 👈 FIX: use getAuth for API routes
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const email = body?.email ?? null;

    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        { user_id: userId, email },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("❌ Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Profile synced:", data);
    return NextResponse.json({ success: true, profile: data?.[0] ?? null });
  } catch (err) {
    console.error("❌ API crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
