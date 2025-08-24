import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  try {
    console.log("=== GET REQUEST START ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const { userId } = auth();
    console.log("1. User ID from auth():", userId);
    
    if (!userId) {
      console.log("2. No userId found, checking if user is signed in");
      
      // Alternative: Try to get user directly
      try {
        const user = await currentUser();
        console.log("3. Current user (alternative check):", user?.id);
        
        if (!user?.id) {
          return NextResponse.json({ error: "No user ID found" }, { status: 401 });
        }
        
        // Use the user ID from currentUser if auth() didn't work
        const userEmail = user.primaryEmailAddress?.emailAddress;
        console.log("4. User email from currentUser:", userEmail);
        
        // Hardcoded admin check
        if (userEmail?.toLowerCase() !== "taniya.thakur9117@gmail.com") {
          console.log("5. User is not admin, email:", userEmail);
          return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
        }
        
        console.log("6. User is admin, fetching questions...");
        
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("7. Supabase error:", error);
          return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
        }
        
        console.log("8. Successfully fetched questions:", data?.length || 0);
        return NextResponse.json(data || []);
        
      } catch (userError) {
        console.error("Error getting current user:", userError);
        return NextResponse.json({ error: "Authentication error" }, { status: 401 });
      }
    }
    
    const user = await currentUser();
    console.log("3. Current user:", {
      id: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
      firstName: user?.firstName
    });
    
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    console.log("4. User email:", userEmail);
    
    // Hardcoded admin check for now
    if (userEmail?.toLowerCase() !== "taniya.thakur9117@gmail.com") {
      console.log("5. User is not admin, email:", userEmail);
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }
    
    console.log("6. User is admin, fetching questions...");
    
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("7. Supabase error:", error);
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
    }
    
    console.log("8. Successfully fetched questions:", data?.length || 0);
    return NextResponse.json(data || []);
    
  } catch (err) {
    console.error("9. Catch block error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log("=== POST REQUEST START ===");
    console.log("Request headers:", Object.fromEntries(request.headers.entries()));
    
    const { userId } = auth();
    console.log("1. User ID from auth():", userId);
    
    let user;
    if (!userId) {
      console.log("2. No userId found, trying currentUser directly");
      try {
        user = await currentUser();
        if (!user?.id) {
          return NextResponse.json({ error: "No user ID found" }, { status: 401 });
        }
      } catch (userError) {
        console.error("Error getting current user:", userError);
        return NextResponse.json({ error: "Authentication error" }, { status: 401 });
      }
    } else {
      user = await currentUser();
    }
    
    console.log("3. Current user:", {
      id: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
      firstName: user?.firstName
    });
    
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    
    // Hardcoded admin check for now
    if (userEmail?.toLowerCase() !== "taniya.thakur9117@gmail.com") {
      console.log("4. User is not admin, email:", userEmail);
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }
    
    console.log("5. User is admin, processing question...");
    
    const body = await request.json();
    console.log("6. Request body:", body);
    
    const { question, options, correct_option, type } = body;

    // Validation
    if (!question || !options || !correct_option || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: question, options, correct_option, type" 
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
      console.error("7. Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to insert question", details: error.message }, { status: 500 });
    }

    console.log("8. Successfully inserted question:", data?.id);
    return NextResponse.json({ success: true, data });
    
  } catch (err) {
    console.error("9. Catch block error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}