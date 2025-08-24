import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service key for admin queries
);

export async function GET() {
  try {
    // Fetch all attempts
    const { data: attempts, error } = await supabase
      .from("attempts")
      .select("user_id, score, category, created_at");

    if (error) throw error;

    // Fetch student profiles
    const { data: profiles } = await supabase.from("profiles").select("id, email");

    // Merge data
    const merged = attempts.map((a) => {
      const user = profiles.find((p) => p.id === a.user_id);
      return {
        email: user?.email || "Unknown",
        ...a,
      };
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
