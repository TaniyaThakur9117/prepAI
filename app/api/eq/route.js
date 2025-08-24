// //app/api/eq/route.js
// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const sessionId = searchParams.get('session_id') || `session_${Date.now()}`;
//     const forceRefresh = searchParams.get('force_refresh') === 'true';
    
//     console.log(`🎲 Fetching random questions for session: ${sessionId}`);
    
//     // Fetch all questions from database
//     const { data: allQuestions, error } = await supabase
//       .from("eq_questions")
//       .select("*");

//     if (error) {
//       console.error("Error fetching EQ questions:", error.message);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     if (!allQuestions || allQuestions.length === 0) {
//       return NextResponse.json({ error: "No questions found" }, { status: 404 });
//     }

//     // Fisher-Yates shuffle algorithm for true randomization
//     const shuffleArray = (array) => {
//       const shuffled = [...array];
//       for (let i = shuffled.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//       }
//       return shuffled;
//     };

//     // Apply multiple randomization techniques
//     const randomizedQuestions = shuffleArray(allQuestions)
//       .sort(() => Math.random() - 0.5) // Additional randomization
//       .map(question => ({
//         ...question,
//         // Add randomization seed for this session
//         _randomSeed: Math.random(),
//         _sessionId: sessionId,
//         _fetchTime: new Date().toISOString()
//       }));

//     // Add some variety by potentially reversing order randomly
//     if (Math.random() > 0.5) {
//       randomizedQuestions.reverse();
//     }

//     const metadata = {
//       sessionId,
//       totalQuestions: randomizedQuestions.length,
//       randomizationApplied: true,
//       fetchTime: new Date().toISOString(),
//       randomSeed: Math.random().toString(36).substr(2, 9)
//     };

//     console.log(`✅ Returning ${randomizedQuestions.length} randomized questions`);

//     return NextResponse.json({
//       questions: randomizedQuestions,
//       metadata
//     });

//   } catch (error) {
//     console.error("Error in EQ route:", error);
//     return NextResponse.json(
//       { error: `Server error: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

// // POST method for submitting answers (if needed)
// export async function POST(req) {
//   try {
//     const { answers, sessionId } = await req.json();
    
//     // Here you could save the session answers to database if needed
//     console.log(`📝 Received answers for session: ${sessionId}`);
    
//     return NextResponse.json({ 
//       success: true, 
//       message: "Answers received",
//       sessionId 
//     });
    
//   } catch (error) {
//     console.error("Error saving answers:", error);
//     return NextResponse.json(
//       { error: `Error saving answers: ${error.message}` },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id") || `session_${Date.now()}`;
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`🎲 Fetching ${limit} random unique questions for session: ${sessionId}`);

    // Fetch all questions from database
    const { data: allQuestions, error } = await supabase
      .from("eq_questions")
      .select("*")
      .order('id');

    if (error) {
      console.error("Error fetching EQ questions:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!allQuestions || allQuestions.length === 0) {
      return NextResponse.json({ error: "No questions found in database" }, { status: 404 });
    }

    console.log(`📚 Total questions in database: ${allQuestions.length}`);

    // Randomize questions
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    
    // Take the requested number of questions
    const selectedQuestions = shuffled.slice(0, Math.min(limit, allQuestions.length));

    // Add metadata to each question for tracking
    const finalQuestions = selectedQuestions.map((question, index) => ({
      ...question,
      _sessionId: sessionId,
      _fetchTime: new Date().toISOString(),
      _questionOrder: index + 1,
    }));

    const metadata = {
      sessionId,
      totalQuestionsRequested: limit,
      totalQuestionsReturned: finalQuestions.length,
      totalQuestionsInDatabase: allQuestions.length,
      fetchTime: new Date().toISOString(),
    };

    console.log(`✅ Returning ${finalQuestions.length} questions`);
    console.log(`🔢 Question IDs: [${finalQuestions.map(q => q.id).join(', ')}]`);

    return NextResponse.json({
      questions: finalQuestions,
      metadata,
    });
  } catch (error) {
    console.error("Error in EQ route:", error);
    return NextResponse.json(
      { error: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { answers, sessionId, metadata } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    console.log(`📝 Saving answers for session: ${sessionId}`);
    console.log(`📊 Total answers received: ${Object.keys(answers).length}`);

    // Save individual responses
    const responses = Object.entries(answers).map(([questionId, answer]) => ({
      session_id: sessionId,
      question_id: parseInt(questionId),
      answer: answer,
      submitted_at: new Date().toISOString()
    }));

    // Insert responses into database
    const { error: responseError } = await supabase
      .from('eq_responses')
      .insert(responses);

    if (responseError) {
      console.error("Error saving responses:", responseError);
      // Don't fail the request if we can't save responses
    }

    return NextResponse.json({
      success: true,
      message: "Answers received and saved",
      sessionId,
      totalAnswers: Object.keys(answers).length
    });
  } catch (error) {
    console.error("Error saving answers:", error);
    return NextResponse.json(
      { error: `Error saving answers: ${error.message}` },
      { status: 500 }
    );
  }
}