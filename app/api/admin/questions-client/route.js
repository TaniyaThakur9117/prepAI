// //app/api/admin/questions-client/route.js
// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// function isAdmin(email) {
//   // Get admin emails from environment variable
//   const adminEmails = process.env.ADMIN_EMAILS;
  
//   if (!adminEmails) {
//     console.warn("ADMIN_EMAILS environment variable not set");
//     return false;
//   }
  
//   // Split by comma and trim whitespace, then convert to lowercase for comparison
//   const adminEmailList = adminEmails
//     .split(',')
//     .map(email => email.trim().toLowerCase());
  
//   return email && adminEmailList.includes(email.toLowerCase());
// }

// export async function GET(request) {
//   try {
//     console.log("=== CLIENT AUTH GET START ===");
    
//     // Get user email from headers (we'll send this from the client)
//     const userEmail = request.headers.get("x-user-email");
//     const userId = request.headers.get("x-user-id");
    
//     console.log("User email from headers:", userEmail);
//     console.log("User ID from headers:", userId);
    
//     if (!userEmail || !userId) {
//       return NextResponse.json({ error: "Missing user information" }, { status: 401 });
//     }
    
//     if (!isAdmin(userEmail)) {
//       console.log("User is not admin:", userEmail);
//       return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
//     }
    
//     console.log("User is admin, fetching questions...");
    
//     const { data, error } = await supabase
//       .from("questions")
//       .select("*")
//       .order("created_at", { ascending: false });
      
//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
//     }
    
//     console.log("Successfully fetched questions:", data?.length || 0);
//     return NextResponse.json(data || []);
    
//   } catch (err) {
//     console.error("Error in client auth GET:", err);
//     return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
//   }
// }

// export async function POST(request) {
//   try {
//     console.log("=== CLIENT AUTH POST START ===");
    
//     // Get user email from headers
//     const userEmail = request.headers.get("x-user-email");
//     const userId = request.headers.get("x-user-id");
    
//     console.log("User email from headers:", userEmail);
//     console.log("User ID from headers:", userId);
    
//     if (!userEmail || !userId) {
//       return NextResponse.json({ error: "Missing user information" }, { status: 401 });
//     }
    
//     if (!isAdmin(userEmail)) {
//       console.log("User is not admin:", userEmail);
//       return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
//     }
    
//     console.log("User is admin, processing question...");
    
//     const body = await request.json();
//     console.log("Request body:", body);
    
//     const { question, options, correct_option, type } = body;

//     // Validation
//     if (!question || !options || !correct_option || !type) {
//       return NextResponse.json({ 
//         error: "Missing required fields: question, options, correct_option, type" 
//       }, { status: 400 });
//     }

//     const { data, error } = await supabase
//       .from("questions")
//       .insert([{
//         question,
//         options,
//         correct_option: parseInt(correct_option),
//         type
//       }])
//       .select()
//       .single();

//     if (error) {
//       console.error("Supabase insert error:", error);
//       return NextResponse.json({ error: "Failed to insert question", details: error.message }, { status: 500 });
//     }

//     console.log("Successfully inserted question:", data?.id);
//     return NextResponse.json({ success: true, data });
    
//   } catch (err) {
//     console.error("Error in client auth POST:", err);
//     return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
//   }
// }



//app\api\admin\questions-client\route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAdmin(email) {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) return false;
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .includes(email?.toLowerCase());
}

// GET / fetch all questions
export async function GET(request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch both tables
    const { data: mcqQuestions, error: mcqError } = await supabase
      .from("questions")
      .select("*");

    const { data: hrQuestions, error: hrError } = await supabase
      .from("hr_questions")
      .select("*");

    if (mcqError || hrError) {
      return NextResponse.json({ error: mcqError?.message || hrError?.message || "Failed to fetch questions" }, { status: 500 });
    }

    // Add a 'table' field for frontend
    const mcq = mcqQuestions.map(q => ({ ...q, table: "questions" }));
    const hr = hrQuestions.map(q => ({ ...q, table: "hr" }));

    return NextResponse.json([...mcq, ...hr]);
  } catch (err) {
    console.error("GET /questions-client error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// POST / add a question
export async function POST(request) {
  try {
    const userEmail = request.headers.get("x-user-email");
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();

    if (body.is_hr) {
      const { data, error } = await supabase
        .from("hr_questions")
        .insert({
          question_text: body.question_text,
          category: body.category,
          difficulty: body.difficulty,
          expected_points: body.expected_points ?? 10
        });

      if (error) throw error;
      return NextResponse.json({ success: true, inserted: data });
    }

    if (body.is_text_question) {
      const { data, error } = await supabase
        .from("questions")
        .insert({
          question: body.question,
          type: body.type || "interview",
          category: body.category,
          difficulty: body.difficulty
        });

      if (error) throw error;
      return NextResponse.json({ success: true, inserted: data });
    }

    // MCQ
    const { data, error } = await supabase
      .from("questions")
      .insert({
        question: body.question,
        options: body.options,
        correct_option: body.correct_option,
        type: body.type || "aptitude"
      });

    if (error) throw error;
    return NextResponse.json({ success: true, inserted: data });
  } catch (err) {
    console.error("POST /questions-client error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}