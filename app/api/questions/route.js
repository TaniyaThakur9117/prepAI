

// //***********************************
// // app/api/questions/route.js
// // // app/api/questions/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY // use anon key if only reading public data
// );

// export async function GET(req) {
//   try {
//     // Extract query params
//     const { searchParams } = new URL(req.url);
//     const difficulty = searchParams.get("difficulty");
//     const limit = parseInt(searchParams.get("limit") || "10", 10);

//     // Query Supabase
//     let query = supabase.from("questions").select("*").limit(limit);

//     if (difficulty) {
//       query = query.eq("difficulty", difficulty);
//     }

//     const { data, error } = await query;

//     if (error) {
//       console.error("Supabase error:", error.message);
//       return NextResponse.json(
//         { error: "Failed to fetch questions" },
//         { status: 500 }
//       );
//     }

//     if (!data || data.length === 0) {
//       return NextResponse.json(
//         { questions: [] },
//         { status: 200 }
//       );
//     }

//     // Map questions to expected format
//     const questions = data.map((q) => ({
//       id: q.id,
//       question: q.question,
//       options: [q.option_a, q.option_b, q.option_c, q.option_d],
//       correct_option: q.correct_option, // ensure DB matches "A", "B", "C", "D"
//       difficulty: q.difficulty
//     }));

//     return NextResponse.json({ questions }, { status: 200 });

//   } catch (err) {
//     console.error("API error:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use anon key if only reading public data
);

export async function GET(req) {
  try {
    // Extract query params
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Query Supabase
    let query = supabase.from("questions").select("*").limit(limit);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { questions: [] },
        { status: 200 }
      );
    }

    // Map questions to expected format
    const questions = data.map((q) => ({
      id: q.id,
      question: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correct_option: q.correct_option, // ensure DB matches "A", "B", "C", "D"
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