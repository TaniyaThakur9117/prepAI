// import { auth, currentUser } from "@clerk/nextjs/server";
// import { createClient } from "@supabase/supabase-js";
// import { NextResponse } from "next/server";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// function isAdmin(email) {
//   const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
//   console.log("Admin emails from env:", allowed);
//   console.log("User email:", email?.toLowerCase());
//   const isUserAdmin = allowed.includes((email || "").toLowerCase());
//   console.log("Is admin:", isUserAdmin);
//   return isUserAdmin;
// }

// export async function GET() {
//   try {
//     const { userId } = auth();
//     console.log("GET - User ID:", userId);
    
//     if (!userId) {
//       console.log("No user ID found");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
    
//     const user = await currentUser();
//     console.log("GET - User email:", user?.primaryEmailAddress?.emailAddress);
    
//     if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
//       console.log("User is not admin");
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const { data, error } = await supabase
//       .from("questions")
//       .select("*")
//       .order("created_at", { ascending: false });
      
//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json({ error: "Database error" }, { status: 500 });
//     }
    
//     return NextResponse.json(data || []);
//   } catch (err) {
//     console.error("GET /api/admin/questions error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

// export async function POST(req) {
//   try {
//     const { userId } = auth();
//     console.log("POST - User ID:", userId);
    
//     if (!userId) {
//       console.log("No user ID found");
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
    
//     const user = await currentUser();
//     console.log("POST - User email:", user?.primaryEmailAddress?.emailAddress);
    
//     if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
//       console.log("User is not admin");
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const body = await req.json();
//     const { question, options, correct_option, type } = body;

//     // Validation
//     if (!question || !options || !correct_option || !type) {
//       return NextResponse.json({ 
//         error: "Missing required fields: question, options, correct_option, type" 
//       }, { status: 400 });
//     }

//     if (!Array.isArray(options) || options.length !== 4) {
//       return NextResponse.json({ 
//         error: "Options must be an array of 4 items" 
//       }, { status: 400 });
//     }

//     if (correct_option < 1 || correct_option > 4) {
//       return NextResponse.json({ 
//         error: "Correct option must be between 1 and 4" 
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
//       return NextResponse.json({ error: "Failed to insert question" }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data });
//   } catch (err) {
//     console.error("POST /api/admin/questions error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }

//app\api\admin\questions\routes.js
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAdmin(email) {
  const allowed = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
  console.log("Admin emails from env:", allowed);
  console.log("User email:", email?.toLowerCase());
  const isUserAdmin = allowed.includes((email || "").toLowerCase());
  console.log("Is admin:", isUserAdmin);
  return isUserAdmin;
}

export async function GET() {
  try {
    const { userId } = auth();
    console.log("GET - User ID:", userId);
    
    if (!userId) {
      console.log("No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await currentUser();
    console.log("GET - User email:", user?.primaryEmailAddress?.emailAddress);
    
    if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
      console.log("User is not admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (err) {
    console.error("GET /api/admin/questions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = auth();
    console.log("POST - User ID:", userId);
    
    if (!userId) {
      console.log("No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await currentUser();
    console.log("POST - User email:", user?.primaryEmailAddress?.emailAddress);
    
    if (!isAdmin(user?.primaryEmailAddress?.emailAddress)) {
      console.log("User is not admin");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { question, options, correct_option, type } = body;

    // Validation
    if (!question || !options || !correct_option || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: question, options, correct_option, type" 
      }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return NextResponse.json({ 
        error: "Options must be an array of 4 items" 
      }, { status: 400 });
    }

    if (correct_option < 1 || correct_option > 4) {
      return NextResponse.json({ 
        error: "Correct option must be between 1 and 4" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("questions")
      .insert([{
        question,
        options,
        correct_option: parseInt(correct_option),
        type
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to insert question" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("POST /api/admin/questions error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}