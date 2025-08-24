//app/api/attempts/route.js
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    console.log("🔍 Starting API request...");
    
    // Create Supabase client inside function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get the user ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      console.log("🔴 No userId found from Clerk auth");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User not authenticated" 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("✅ Authenticated user:", userId);

    // Test Supabase connection with simple query first
    console.log("🔍 Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("attempts")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("🔴 Connection test failed:", testError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Connection failed: ${testError.message}`,
        hint: testError.hint,
        code: testError.code
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("✅ Supabase connection successful");

    // Parse request body
    const body = await req.json();
    console.log("📤 Received body:", body);

    // Prepare data for insertion
    const attemptData = {
      ...body,
      clerk_id: userId,
      created_at: new Date().toISOString() // Add timestamp
    };

    console.log("📤 Inserting data:", attemptData);

    // Insert the attempt
    const { data, error } = await supabase
      .from("attempts")
      .insert([attemptData])
      .select();

    if (error) {
      console.error("🔴 Insert failed:", error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("✅ Successfully inserted:", data);
    return new Response(JSON.stringify({ 
      success: true, 
      data,
      message: "Attempt saved successfully" 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message,
      stack: err.stack
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User not authenticated" 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log("✅ Submitting attempts for user:", userId);
    
    // Add your submission logic here
    
    return new Response(JSON.stringify({ 
      success: true,
      message: "Attempts submitted successfully" 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("❌ PUT error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

