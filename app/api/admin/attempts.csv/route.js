// // app/api/admin/attempts.csv/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import { auth, currentUser } from "@clerk/nextjs/server";

// function isAdmin(email) {
//   const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
//   return allowed.includes((email || "").toLowerCase());
// }

// function adminClient() {
//   return createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
//   );
// }

// export async function GET() {
//   try {
//     const { userId } = auth();
//     if (!userId) return new Response("Unauthorized", { status: 401 });
//     const user = await currentUser();
//     if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
//       return new Response("Forbidden", { status: 403 });
//     }

//     const supabase = adminClient();
//     const { data: attempts } = await supabase
//       .from("attempts")
//       .select("id, profile_id, test_type, score, total_questions, created_at")
//       .order("created_at", { ascending: false });

//     const profileIds = [...new Set(attempts?.map(a => a.profile_id).filter(Boolean) || [])];
//     let profilesMap = {};
//     if (profileIds.length) {
//       const { data: profiles } = await supabase
//         .from("profiles")
//         .select("id, email")
//         .in("id", profileIds);

//       profiles?.forEach((p) => (profilesMap[p.id] = p.email));
//     }

//     const header = ["created_at", "email", "test_type", "score", "total_questions"].join(",");
//     const lines = (attempts || []).map(a =>
//       [
//         a.created_at,
//         (profilesMap[a.profile_id] || "").replace(/,/g, " "),
//         a.test_type,
//         a.score,
//         a.total_questions
//       ].join(",")
//     );

//     const csv = [header, ...lines].join("\n");

//     return new Response(csv, {
//       headers: {
//         "Content-Type": "text/csv",
//         "Content-Disposition": `attachment; filename="attempts.csv"`
//       }
//     });
//   } catch (e) {
//     console.error("GET /api/admin/attempts.csv", e);
//     return new Response("error", { status: 500 });
//   }
// }


//**2nd */
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function GET() {
//   const { data, error } = await supabase.from("attempts").select("user_id, score, category, created_at");

//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });

//   let csv = "user_id,score,category,date\n";
//   data.forEach((row) => {
//     csv += `${row.user_id},${row.score},${row.category},${row.created_at}\n`;
//   });

//   return new NextResponse(csv, {
//     headers: {
//       "Content-Type": "text/csv",
//       "Content-Disposition": "attachment; filename=attempts.csv",
//     },
//   });
// }


// app/api/admin/attempts.csv/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

function isAdmin(email) {
  const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  console.log("Admin emails configured:", allowed);
  console.log("Checking email:", email?.toLowerCase());
  return allowed.includes((email || "").toLowerCase());
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    console.log("CSV Export: Checking authentication...");

    // Get current user from Clerk
    const user = await currentUser();
    console.log("Current user:", user?.primaryEmailAddress?.emailAddress);

    if (!user) {
      console.log("No user found");
      return new Response("Please log in to access this feature", { status: 401 });
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!isAdmin(userEmail)) {
      console.log("User is not admin:", userEmail);
      return new Response("Admin access required", { status: 403 });
    }

    console.log("User authenticated as admin:", userEmail);

    // Try to fetch from test_results first
    let { data: results, error } = await supabase
      .from("test_results")
      .select("clerk_id, round_type, total_score, completed_at")
      .order("completed_at", { ascending: false });

    // If test_results doesn't exist or is empty, try attempts table
    if (error || !results || results.length === 0) {
      console.log("Trying attempts table...");
      
      const { data: attempts, error: attemptsError } = await supabase
        .from("attempts")
        .select("id, user_id, profile_id, test_type, score, total_questions, created_at")
        .order("created_at", { ascending: false });

      if (attemptsError) throw attemptsError;

      // Get profile emails if using attempts table
      const profileIds = [...new Set(attempts?.map(a => a.profile_id || a.user_id).filter(Boolean) || [])];
      let profilesMap = {};
      
      if (profileIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", profileIds);

        profiles?.forEach((p) => (profilesMap[p.id] = p.email));
      }

      // Format attempts data
      results = attempts?.map(a => ({
        clerk_id: profilesMap[a.profile_id] || profilesMap[a.user_id] || a.user_id || `user_${a.id}`,
        round_type: a.test_type || 'general',
        total_score: a.score || 0,
        completed_at: a.created_at
      })) || [];
    }

    // Create CSV content
    const headers = [
      'User ID',
      'Round Type', 
      'Score',
      'Completed At',
      'Date',
      'Time'
    ];

    const csvRows = [headers.join(',')];

    (results || []).forEach(row => {
      const completedAt = new Date(row.completed_at);
      const dateStr = completedAt.toLocaleDateString();
      const timeStr = completedAt.toLocaleTimeString();
      
      const csvRow = [
        `"${(row.clerk_id || '').toString().replace(/"/g, '""')}"`,
        `"${(row.round_type || '').toString().replace(/"/g, '""')}"`,
        row.total_score || 0,
        `"${row.completed_at || ''}"`,
        `"${dateStr}"`,
        `"${timeStr}"`
      ];
      
      csvRows.push(csvRow.join(','));
    });

    const csv = csvRows.join('\n');
    const filename = `batch-performance-${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    
    return NextResponse.json({
      error: 'Failed to export CSV',
      details: error.message,
      authenticated: false
    }, { status: 500 });
  }
}