import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with error handling
let supabase;
try {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request) {
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      console.error("Supabase client not initialized");
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
      return NextResponse.json(
        { error: "Database configuration missing" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sessionId = searchParams.get("sessionId");

    console.log(`Fetching questions - Difficulty: ${difficulty}, Limit: ${limit}, Session: ${sessionId}`);

    // Build query
    let query = supabase.from("iq_questions").select("*");

    if (difficulty && difficulty !== 'null') {
      query = query.eq("difficulty", difficulty);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch questions from database",
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log(`Found ${data?.length || 0} questions in database`);

    if (!data || data.length === 0) {
      return NextResponse.json({ 
        questions: [],
        message: "No questions found in database"
      }, { status: 200 });
    }

    // Shuffle and limit questions
    const shuffledQuestions = shuffleArray(data);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));

    // Format questions with error handling
    const questions = selectedQuestions.map((q) => {
      try {
        // Handle different database schema possibilities
        const options = [];
        
        // Try different possible field names
        const optionA = q.option_a || q.optionA || q.option1 || '';
        const optionB = q.option_b || q.optionB || q.option2 || '';
        const optionC = q.option_c || q.optionC || q.option3 || '';
        const optionD = q.option_d || q.optionD || q.option4 || '';

        options.push(
          { id: "A", text: optionA },
          { id: "B", text: optionB },
          { id: "C", text: optionC },
          { id: "D", text: optionD }
        );

        // Handle correct option conversion
        let correctOption = q.correct_option || q.correctOption || q.correct_answer;
        
        if (typeof correctOption === "number") {
          correctOption = ["A", "B", "C", "D"][correctOption - 1] || "A";
        } else if (typeof correctOption === "string") {
          correctOption = correctOption.toUpperCase();
        }

        // Validate correct option
        if (!["A", "B", "C", "D"].includes(correctOption)) {
          correctOption = "A";
        }

        return {
          id: q.id,
          question: q.question || "Question text missing",
          options: options,
          correct_option: correctOption,
          difficulty: q.difficulty || "medium",
          explanation: q.explanation || null
        };
      } catch (err) {
        console.error("Error formatting question:", err, q);
        return null;
      }
    }).filter(q => q !== null); // Remove any null questions

    console.log(`Successfully formatted ${questions.length} questions`);

    // Shuffle options for each question (optional - makes it harder)
    questions.forEach(question => {
      try {
        const correctOption = question.correct_option;
        const correctText = question.options.find(opt => opt.id === correctOption)?.text || '';
        
        if (correctText) {
          // Shuffle the option texts
          const optionTexts = question.options.map(opt => opt.text);
          const shuffledTexts = shuffleArray(optionTexts);
          
          // Reassign texts
          question.options = question.options.map((opt, index) => ({
            id: opt.id,
            text: shuffledTexts[index] || ''
          }));
          
          // Update correct option based on new position
          const newCorrectOption = question.options.find(opt => opt.text === correctText);
          if (newCorrectOption) {
            question.correct_option = newCorrectOption.id;
          }
        }
      } catch (err) {
        console.error("Error shuffling options for question:", question.id, err);
      }
    });

    return NextResponse.json({ 
      questions,
      sessionId: sessionId || Date.now().toString(),
      totalAvailable: data.length,
      requested: limit,
      returned: questions.length
    }, { status: 200 });

  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}