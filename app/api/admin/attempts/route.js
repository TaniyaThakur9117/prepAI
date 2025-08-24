// app/api/admin/attempts/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";

function isAdmin(email) {
  const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  return allowed.includes((email || "").toLowerCase());
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await currentUser();
    if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = adminClient();
    const { data: attempts, error } = await supabase
      .from("attempts")
      .select("id, profile_id, test_type, score, total_questions, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    // Join with profiles for email
    const profileIds = [...new Set(attempts.map(a => a.profile_id).filter(Boolean))];
    let profilesMap = {};
    if (profileIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", profileIds);

      profiles?.forEach((p) => (profilesMap[p.id] = p.email));
    }

    const rows = attempts.map((a) => ({
      ...a,
      email: profilesMap[a.profile_id] || "",
    }));

    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /api/admin/attempts", e);
    return NextResponse.json([]);
  }
}