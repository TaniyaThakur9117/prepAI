//app/api/admin/questions-client/[id]/route.js
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAdmin(email) {
  // Get admin emails from environment variable
  const adminEmails = process.env.ADMIN_EMAILS;
  
  if (!adminEmails) {
    console.warn("ADMIN_EMAILS environment variable not set");
    return false;
  }
  
  // Split by comma and trim whitespace, then convert to lowercase for comparison
  const adminEmailList = adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase());
  
  return email && adminEmailList.includes(email.toLowerCase());
}

export async function DELETE(request, { params }) {
  try {
    console.log("=== CLIENT AUTH DELETE START ===");
    
    const { id } = params;
    
    // Get user email from headers
    const userEmail = request.headers.get("x-user-email");
    const userId = request.headers.get("x-user-id");
    
    console.log("User email from headers:", userEmail);
    console.log("User ID from headers:", userId);
    console.log("Question ID to delete:", id);
    
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Missing user information" }, { status: 401 });
    }
    
    if (!isAdmin(userEmail)) {
      console.log("User is not admin:", userEmail);
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }
    
    console.log("User is admin, deleting question...");
    
    // First, get the question from main table to know its type and content
    const { data: questionData, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching question:", fetchError);
      return NextResponse.json({ error: "Failed to fetch question", details: fetchError.message }, { status: 500 });
    }

    if (!questionData) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    console.log("Question data:", questionData);
    const questionType = questionData.type;
    const questionText = questionData.question;
    console.log("Question type:", questionType);
    console.log("Question text:", questionText);

    // Map question types to their respective tables
    const typeTableMap = {
      'aptitude': 'aptitude_questions',
      'eq': 'eq_questions',
      'interview': 'interview_questions',
      'iq': 'iq_questions',
      'technical': 'technical_mcq'
    };

    let deletedFromTypeTable = false;
    let typeTableUsed = null;

    // Delete from type-specific table first
    const typeTableName = typeTableMap[questionType];
    if (typeTableName) {
      console.log(`Attempting to delete from ${typeTableName} table...`);
      
      try {
        // Since these are independent tables, we need to find the record by question text
        // or any other matching criteria, not by ID
        const { data: typeRecords, error: searchError } = await supabase
          .from(typeTableName)
          .select("*")
          .eq("question", questionText); // Match by question text

        if (searchError) {
          console.error(`Error searching in ${typeTableName}:`, searchError);
        } else if (typeRecords && typeRecords.length > 0) {
          console.log(`Found ${typeRecords.length} matching records in ${typeTableName}:`, typeRecords);
          
          // Delete all matching records (should typically be just one)
          for (const record of typeRecords) {
            const { error: typeDeleteError } = await supabase
              .from(typeTableName)
              .delete()
              .eq("id", record.id);

            if (typeDeleteError) {
              console.error(`Error deleting record ${record.id} from ${typeTableName}:`, typeDeleteError);
            } else {
              console.log(`Successfully deleted record ${record.id} from ${typeTableName}`);
              deletedFromTypeTable = true;
              typeTableUsed = typeTableName;
            }
          }
        } else {
          console.log(`No matching records found in ${typeTableName} for question: "${questionText}"`);
        }
      } catch (tableError) {
        console.error(`Error with table ${typeTableName}:`, tableError);
      }
    } else {
      console.warn(`Unknown question type: ${questionType}`);
    }

    // Delete from main questions table
    console.log("Deleting from main questions table...");
    const { data, error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: "Failed to delete question", details: error.message }, { status: 500 });
    }

    console.log("Successfully deleted question:", id);
    return NextResponse.json({ 
      success: true, 
      message: deletedFromTypeTable 
        ? "Question deleted successfully from both main and type-specific tables" 
        : "Question deleted from main table only (no matching record found in type-specific table)", 
      data,
      typeTableInfo: {
        deletedFromTypeTable,
        typeTableUsed,
        questionType,
        searchedBy: "question text"
      }
    });
    
  } catch (err) {
    console.error("Error in client auth DELETE:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    console.log("=== CLIENT AUTH PUT START ===");
    
    const { id } = params;
    
    // Get user email from headers
    const userEmail = request.headers.get("x-user-email");
    const userId = request.headers.get("x-user-id");
    
    console.log("User email from headers:", userEmail);
    console.log("User ID from headers:", userId);
    console.log("Question ID to update:", id);
    
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Missing user information" }, { status: 401 });
    }
    
    if (!isAdmin(userEmail)) {
      console.log("User is not admin:", userEmail);
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }
    
    console.log("User is admin, updating question...");
    
    const body = await request.json();
    console.log("Request body:", body);
    
    const { question, options, correct_option, type, category, difficulty, is_text_question } = body;

    // Validation
    if (!question || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: question, type" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData = {
      question,
      type,
      category: category || null,
      difficulty: difficulty || null,
      is_text_question: is_text_question || false
    };

    // Add options and correct_option only if they exist (for MCQ questions)
    if (options && Array.isArray(options)) {
      updateData.options = options;
      updateData.correct_option = parseInt(correct_option) || 1;
    }

    const { data, error } = await supabase
      .from("questions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update question", details: error.message }, { status: 500 });
    }

    console.log("Successfully updated question:", id);
    return NextResponse.json({ success: true, data });
    
  } catch (err) {
    console.error("Error in client auth PUT:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    console.log("=== CLIENT AUTH GET SINGLE START ===");
    
    const { id } = params;
    
    // Get user email from headers
    const userEmail = request.headers.get("x-user-email");
    const userId = request.headers.get("x-user-id");
    
    console.log("User email from headers:", userEmail);
    console.log("User ID from headers:", userId);
    console.log("Question ID to fetch:", id);
    
    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Missing user information" }, { status: 401 });
    }
    
    if (!isAdmin(userEmail)) {
      console.log("User is not admin:", userEmail);
      return NextResponse.json({ error: "Not authorized as admin" }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ error: "Question ID is required" }, { status: 400 });
    }
    
    console.log("User is admin, fetching question...");
    
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch question", details: error.message }, { status: 500 });
    }

    console.log("Successfully fetched question:", id);
    return NextResponse.json(data);
    
  } catch (err) {
    console.error("Error in client auth GET SINGLE:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}