// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function GET(request) {
//   try {
//     // Get URL parameters for customization
//     const url = new URL(request.url);
//     const mcqCount = parseInt(url.searchParams.get('mcq_count')) || 5;
//     const debugCount = parseInt(url.searchParams.get('debug_count')) || 3;
//     const codingCount = parseInt(url.searchParams.get('coding_count')) || 2;
//     const difficulty = url.searchParams.get('difficulty'); // optional filter
//     const sessionId = url.searchParams.get('session_id') || Date.now().toString();

//     console.log(`Generating question set for session: ${sessionId}`);

//     // Build query conditions
//     let mcqQuery = supabase.from("technical_mcq").select("*");
//     let debugQuery = supabase.from("technical_debug").select("*");
//     let codingQuery = supabase.from("technical_coding").select("*");

//     // Apply difficulty filter if specified
//     if (difficulty) {
//       mcqQuery = mcqQuery.eq('difficulty', difficulty);
//       debugQuery = debugQuery.eq('difficulty', difficulty);
//       codingQuery = codingQuery.eq('difficulty', difficulty);
//     }

//     // Fetch all questions
//     const [mcqResult, debugResult, codingResult] = await Promise.all([
//       mcqQuery,
//       debugQuery,
//       codingQuery
//     ]);

//     // Check for errors
//     if (mcqResult.error || debugResult.error || codingResult.error) {
//       console.error('Database errors:', {
//         mcq: mcqResult.error,
//         debug: debugResult.error,
//         coding: codingResult.error
//       });
      
//       return NextResponse.json({
//         error: mcqResult.error?.message || debugResult.error?.message || codingResult.error?.message,
//       }, { status: 500 });
//     }

//     const allMcqs = mcqResult.data || [];
//     const allDebug = debugResult.data || [];
//     const allCoding = codingResult.data || [];

//     // Enhanced shuffle function with seeded randomization for consistency
//     const seededShuffle = (array, seed) => {
//       const arr = [...array];
//       const random = createSeededRandom(seed);
      
//       for (let i = arr.length - 1; i > 0; i--) {
//         const j = Math.floor(random() * (i + 1));
//         [arr[i], arr[j]] = [arr[j], arr[i]];
//       }
//       return arr;
//     };

//     // Create seeded random function for consistent randomization per session
//     const createSeededRandom = (seed) => {
//       let value = parseInt(seed) || 1;
//       return () => {
//         value = (value * 9301 + 49297) % 233280;
//         return value / 233280;
//       };
//     };

//     // Generate consistent random selection based on session ID
//     const selectedMcqs = seededShuffle(allMcqs, sessionId + 'mcq').slice(0, Math.min(mcqCount, allMcqs.length));
//     const selectedDebug = seededShuffle(allDebug, sessionId + 'debug').slice(0, Math.min(debugCount, allDebug.length));
//     const selectedCoding = seededShuffle(allCoding, sessionId + 'coding').slice(0, Math.min(codingCount, allCoding.length));

//     // Log selection for debugging
//     console.log('Selected questions:', {
//       mcq: selectedMcqs.length,
//       debug: selectedDebug.length,
//       coding: selectedCoding.length,
//       sessionId
//     });

//     // Format response with additional metadata
//     const response = {
//       session_id: sessionId,
//       generated_at: new Date().toISOString(),
//       mcqs: selectedMcqs.map(q => ({
//         ...q,
//         // Ensure options is parsed if it's a string
//         options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
//       })),
//       debug: selectedDebug,
//       coding: selectedCoding,
//       metadata: {
//         total_questions: selectedMcqs.length + selectedDebug.length + selectedCoding.length,
//         difficulty_filter: difficulty || 'all',
//         available_counts: {
//           mcq: allMcqs.length,
//           debug: allDebug.length,
//           coding: allCoding.length
//         }
//       }
//     };

//     return NextResponse.json(response);

//   } catch (error) {
//     console.error("Error fetching technical questions:", error);
//     return NextResponse.json({ 
//       error: "Internal server error",
//       details: error.message 
//     }, { status: 500 });
//   }
// }

// // POST method to save user session and answers (optional)
// export async function POST(request) {
//   try {
//     const { session_id, user_answers, score_data } = await request.json();

//     // Save user session data (optional - requires user_assessments table)
//     const { data, error } = await supabase
//       .from('user_assessments')
//       .insert({
//         session_id,
//         mcq_answers: user_answers?.mcq || {},
//         debug_answers: user_answers?.debug || {},
//         coding_answers: user_answers?.coding || {},
//         total_score: score_data?.totalScore || 0,
//         max_score: score_data?.maxScore || 0,
//         percentage: score_data?.percentage || 0,
//         completed_at: new Date().toISOString()
//       });

//     if (error) {
//       console.error('Error saving assessment:', error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ 
//       success: true, 
//       message: 'Assessment saved successfully',
//       assessment_id: data?.[0]?.id
//     });

//   } catch (error) {
//     console.error("Error saving assessment:", error);
//     return NextResponse.json({ 
//       error: "Failed to save assessment",
//       details: error.message 
//     }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Enhanced random seed generation for better question distribution
function generateQuestionSeed(userId, timestamp) {
  // Create a unique seed based on user and current session
  const baseString = `${userId}_${timestamp}_${Date.now()}`;
  return crypto.createHash('md5').update(baseString).digest('hex');
}

// Improved seeded random function for consistent but unique selections
function createSeededRandom(seed) {
  let value = parseInt(seed.substring(0, 8), 16) || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

// Enhanced shuffle with better distribution
function seededShuffle(array, seed) {
  const arr = [...array];
  const random = createSeededRandom(seed);
  
  // Fisher-Yates shuffle with seeded randomization
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Function to ensure question variety and avoid recent duplicates
async function getQuestionHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('user_question_history')
      .select('question_ids, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5); // Get last 5 sessions

    if (error) {
      console.log('No question history found or error:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.log('Error fetching question history:', error);
    return [];
  }
}

// Smart question selection to avoid recent repeats
function selectQuestionsWithVariety(allQuestions, requestedCount, recentQuestionIds, seed) {
  const recentIds = new Set(recentQuestionIds);
  
  // Separate recent and non-recent questions
  const nonRecentQuestions = allQuestions.filter(q => !recentIds.has(q.id));
  const recentQuestions = allQuestions.filter(q => recentIds.has(q.id));
  
  // Prioritize non-recent questions
  const shuffledNonRecent = seededShuffle(nonRecentQuestions, seed + '_new');
  const shuffledRecent = seededShuffle(recentQuestions, seed + '_old');
  
  // Take from non-recent first, then recent if needed
  const selectedQuestions = [
    ...shuffledNonRecent.slice(0, requestedCount),
    ...shuffledRecent.slice(0, Math.max(0, requestedCount - shuffledNonRecent.length))
  ];
  
  return selectedQuestions.slice(0, requestedCount);
}

// Save question set for this session
async function saveQuestionHistory(userId, sessionId, selectedQuestions) {
  try {
    const questionIds = {
      mcq: selectedQuestions.mcqs.map(q => q.id),
      debug: selectedQuestions.debug.map(q => q.id),
      coding: selectedQuestions.coding.map(q => q.id)
    };

    const { error } = await supabase
      .from('user_question_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        question_ids: questionIds,
        total_questions: selectedQuestions.mcqs.length + selectedQuestions.debug.length + selectedQuestions.coding.length,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('Could not save question history:', error.message);
    } else {
      console.log('Question history saved successfully');
    }
  } catch (error) {
    console.log('Error saving question history:', error);
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    
    // Enhanced parameters
    const mcqCount = parseInt(url.searchParams.get('mcq_count')) || 5;
    const debugCount = parseInt(url.searchParams.get('debug_count')) || 3;
    const codingCount = parseInt(url.searchParams.get('coding_count')) || 2;
    const difficulty = url.searchParams.get('difficulty');
    const userId = url.searchParams.get('user_id') || `anonymous_${Date.now()}`;
    const forceNew = url.searchParams.get('force_new') === 'true';
    const sessionId = url.searchParams.get('session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`Generating fresh question set for user: ${userId}, session: ${sessionId}`);

    // Get user's question history to avoid repeats
    const questionHistory = await getQuestionHistory(userId);
    const recentQuestionIds = questionHistory.flatMap(session => [
      ...(session.question_ids?.mcq || []),
      ...(session.question_ids?.debug || []),
      ...(session.question_ids?.coding || [])
    ]);

    console.log(`User has ${recentQuestionIds.length} recent questions to avoid`);

    // Build database queries with optional difficulty filter
    let mcqQuery = supabase.from("technical_mcq").select("*");
    let debugQuery = supabase.from("technical_debug").select("*");
    let codingQuery = supabase.from("technical_coding").select("*");

    if (difficulty) {
      mcqQuery = mcqQuery.eq('difficulty', difficulty);
      debugQuery = debugQuery.eq('difficulty', difficulty);
      codingQuery = codingQuery.eq('difficulty', difficulty);
    }

    // Fetch all available questions
    const [mcqResult, debugResult, codingResult] = await Promise.all([
      mcqQuery,
      debugQuery,
      codingQuery
    ]);

    // Check for database errors
    if (mcqResult.error || debugResult.error || codingResult.error) {
      console.error('Database errors:', {
        mcq: mcqResult.error,
        debug: debugResult.error,
        coding: codingResult.error
      });
      
      return NextResponse.json({
        error: mcqResult.error?.message || debugResult.error?.message || codingResult.error?.message,
      }, { status: 500 });
    }

    const allMcqs = mcqResult.data || [];
    const allDebug = debugResult.data || [];
    const allCoding = codingResult.data || [];

    // Generate unique seed for this session
    const questionSeed = generateQuestionSeed(userId, sessionId);
    
    // Smart question selection with variety
    const selectedMcqs = selectQuestionsWithVariety(
      allMcqs, 
      Math.min(mcqCount, allMcqs.length), 
      recentQuestionIds, 
      questionSeed + '_mcq'
    );
    
    const selectedDebug = selectQuestionsWithVariety(
      allDebug, 
      Math.min(debugCount, allDebug.length), 
      recentQuestionIds, 
      questionSeed + '_debug'
    );
    
    const selectedCoding = selectQuestionsWithVariety(
      allCoding, 
      Math.min(codingCount, allCoding.length), 
      recentQuestionIds, 
      questionSeed + '_coding'
    );

    // Prepare response data
    const responseData = {
      session_id: sessionId,
      user_id: userId,
      generated_at: new Date().toISOString(),
      seed: questionSeed,
      mcqs: selectedMcqs.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      })),
      debug: selectedDebug,
      coding: selectedCoding,
      metadata: {
        total_questions: selectedMcqs.length + selectedDebug.length + selectedCoding.length,
        difficulty_filter: difficulty || 'all',
        questions_avoided: recentQuestionIds.length,
        available_counts: {
          mcq: allMcqs.length,
          debug: allDebug.length,
          coding: allCoding.length
        },
        freshness: {
          mcq_new: selectedMcqs.filter(q => !recentQuestionIds.includes(q.id)).length,
          debug_new: selectedDebug.filter(q => !recentQuestionIds.includes(q.id)).length,
          coding_new: selectedCoding.filter(q => !recentQuestionIds.includes(q.id)).length
        }
      }
    };

    // Save this question set to history
    await saveQuestionHistory(userId, sessionId, responseData);

    console.log('Question selection completed:', {
      mcq: selectedMcqs.length,
      debug: selectedDebug.length,
      coding: selectedCoding.length,
      newQuestions: responseData.metadata.freshness.mcq_new + 
                   responseData.metadata.freshness.debug_new + 
                   responseData.metadata.freshness.coding_new
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error generating question set:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}

// Enhanced POST method for saving assessments with question tracking
export async function POST(request) {
  try {
    const { 
      session_id, 
      user_id, 
      user_answers, 
      score_data, 
      time_taken,
      question_feedback 
    } = await request.json();

    // Save user assessment with enhanced data
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('user_assessments')
      .insert({
        session_id,
        user_id: user_id || `anonymous_${Date.now()}`,
        mcq_answers: user_answers?.mcq || {},
        debug_answers: user_answers?.debug || {},
        coding_answers: user_answers?.coding || {},
        total_score: score_data?.totalScore || 0,
        max_score: score_data?.maxScore || 0,
        percentage: score_data?.percentage || 0,
        time_taken: time_taken || null,
        question_feedback: question_feedback || {},
        completed_at: new Date().toISOString()
      });

    if (assessmentError) {
      console.error('Error saving assessment:', assessmentError);
      return NextResponse.json({ error: assessmentError.message }, { status: 500 });
    }

    // Update question history with completion status
    await supabase
      .from('user_question_history')
      .update({ 
        completed: true, 
        completion_time: time_taken,
        final_score: score_data?.percentage || 0
      })
      .eq('session_id', session_id)
      .eq('user_id', user_id || `anonymous_${Date.now()}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Assessment saved successfully',
      assessment_id: assessmentData?.[0]?.id,
      session_id: session_id
    });

  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json({ 
      error: "Failed to save assessment",
      details: error.message 
    }, { status: 500 });
  }
}

// Additional endpoint for getting user statistics
export async function PUT(request) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user statistics
    const { data: assessments, error: assessmentError } = await supabase
      .from('user_assessments')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false });

    const { data: questionHistory, error: historyError } = await supabase
      .from('user_question_history')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (assessmentError || historyError) {
      return NextResponse.json({ 
        error: assessmentError?.message || historyError?.message 
      }, { status: 500 });
    }

    const stats = {
      total_assessments: assessments?.length || 0,
      average_score: assessments?.length > 0 
        ? Math.round(assessments.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessments.length)
        : 0,
      best_score: assessments?.length > 0 
        ? Math.max(...assessments.map(a => a.percentage || 0))
        : 0,
      total_questions_attempted: questionHistory?.reduce((sum, h) => sum + (h.total_questions || 0), 0) || 0,
      recent_sessions: questionHistory?.slice(0, 5) || [],
      improvement_trend: assessments?.slice(0, 5).map(a => a.percentage || 0) || []
    };

    return NextResponse.json({
      success: true,
      user_id,
      statistics: stats
    });

  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json({ 
      error: "Failed to fetch statistics",
      details: error.message 
    }, { status: 500 });
  }
}