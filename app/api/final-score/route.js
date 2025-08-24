//app\api\final-score\route.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { round_type, total_score } = await req.json();
    const clerkId = req.headers.get("x-clerk-user-id"); // Get Clerk User ID from header

    if (!clerkId) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), { status: 401 });
    }

    const { data, error } = await supabase.from("test_results").insert([
      {
        clerk_id: clerkId,
        round_type,
        total_score,
      },
    ]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    console.error("Error saving final score:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

