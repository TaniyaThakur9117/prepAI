//app\api\technical-questions\route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Enhanced random seed generation with more entropy
function generateQuestionSeed(userId, timestamp, additionalEntropy = '') {
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const baseString = `${userId}_${timestamp}_${Date.now()}_${Math.random()}_${additionalEntropy}_${randomBytes}`;
  return crypto.createHash('sha256').update(baseString).digest('hex');
}

// Improved seeded random function with better distribution
function createSeededRandom(seed) {
  // Use multiple hash-based seeds for better randomness
  const seeds = [
    parseInt(seed.substring(0, 8), 16) || 1,
    parseInt(seed.substring(8, 16), 16) || 1,
    parseInt(seed.substring(16, 24), 16) || 1
  ];
  
  let index = 0;
  return () => {
    // Cycle through different seed values for better distribution
    const currentSeed = seeds[index % seeds.length];
    seeds[index % seeds.length] = (currentSeed * 16807 + index) % 2147483647;
    index++;
    return (seeds[index % seeds.length] - 1) / 2147483646;
  };
}

// Enhanced Fisher-Yates shuffle with multiple passes for better randomization
function enhancedShuffle(array, seed) {
  const arr = [...array];
  const random = createSeededRandom(seed);
  
  // Multiple shuffle passes for better randomization
  for (let pass = 0; pass < 3; pass++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  // Additional randomization based on question properties
  return arr.sort((a, b) => {
    const aHash = crypto.createHash('md5').update(seed + a.id).digest('hex');
    const bHash = crypto.createHash('md5').update(seed + b.id).digest('hex');
    return aHash.localeCompare(bHash);
  });
}

// Get comprehensive question history with decay (older questions become available again)
async function getQuestionHistory(userId, decayDays = 7) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - decayDays);

    const { data, error } = await supabase
      .from('user_question_history')
      .select('question_ids, created_at, completed, final_score')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.log('No question history found or error:', error.message);
      return { recentIds: [], allHistory: [] };
    }

    const allHistory = data || [];
    
    // Get all question IDs from recent sessions
    const recentIds = allHistory.flatMap(session => [
      ...(session.question_ids?.mcq || []),
      ...(session.question_ids?.debug || []),
      ...(session.question_ids?.coding || [])
    ]);

    return { recentIds, allHistory };
  } catch (error) {
    console.log('Error fetching question history:', error);
    return { recentIds: [], allHistory: [] };
  }
}

// Advanced question selection with multiple strategies
function selectQuestionsAdvanced(allQuestions, requestedCount, recentQuestionIds, seed, difficulty = null) {
  const recentIds = new Set(recentQuestionIds);
  
  // Filter by difficulty if specified
  let filteredQuestions = difficulty 
    ? allQuestions.filter(q => q.difficulty === difficulty)
    : allQuestions;
  
  // Separate into tiers based on recency
  const freshQuestions = filteredQuestions.filter(q => !recentIds.has(q.id));
  const recentQuestions = filteredQuestions.filter(q => recentIds.has(q.id));
  
  // Create weighted selection based on question properties
  const weightedFresh = freshQuestions.map(q => ({
    ...q,
    weight: 1.0 + (q.difficulty_weight || 0) * 0.1
  }));
  
  const weightedRecent = recentQuestions.map(q => ({
    ...q,
    weight: 0.3 + (q.difficulty_weight || 0) * 0.05 // Lower weight for recent questions
  }));
  
  // Enhanced shuffle with different seeds
  const shuffledFresh = enhancedShuffle(weightedFresh, seed + '_fresh_enhanced');
  const shuffledRecent = enhancedShuffle(weightedRecent, seed + '_recent_enhanced');
  
  // Smart selection strategy
  let selectedQuestions = [];
  
  // Strategy 1: Try to get 80% fresh questions
  const targetFreshCount = Math.min(Math.ceil(requestedCount * 0.8), shuffledFresh.length);
  selectedQuestions.push(...shuffledFresh.slice(0, targetFreshCount));
  
  // Strategy 2: Fill remaining with least recently used
  const remainingCount = requestedCount - selectedQuestions.length;
  if (remainingCount > 0) {
    selectedQuestions.push(...shuffledRecent.slice(0, remainingCount));
  }
  
  // Strategy 3: If still not enough, add more fresh questions
  if (selectedQuestions.length < requestedCount && shuffledFresh.length > targetFreshCount) {
    const additionalFresh = shuffledFresh.slice(targetFreshCount, requestedCount);
    selectedQuestions.push(...additionalFresh);
  }
  
  // Final shuffle of selected questions
  return enhancedShuffle(selectedQuestions, seed + '_final').slice(0, requestedCount);
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    
    // Enhanced parameters with more customization
    const mcqCount = parseInt(url.searchParams.get('mcq_count')) || 5;
    const debugCount = parseInt(url.searchParams.get('debug_count')) || 3;
    const codingCount = parseInt(url.searchParams.get('coding_count')) || 2;
    const difficulty = url.searchParams.get('difficulty');
    const userId = url.searchParams.get('user_id') || `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = url.searchParams.get('session_id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const maxSimilar = parseInt(url.searchParams.get('max_similar')) || 1; // Max similar questions allowed
    const decayDays = parseInt(url.searchParams.get('decay_days')) || 7; // Days before questions become available again

    console.log(`🎯 Generating fresh question set for user: ${userId.slice(-8)}, session: ${sessionId.slice(-8)}`);

    // Get user's comprehensive question history
    const { recentIds, allHistory } = await getQuestionHistory(userId, decayDays);
    
    console.log(`📊 User stats: ${allHistory.length} sessions, ${recentIds.length} recent questions to avoid`);

    // Build database queries with enhanced filtering
    let mcqQuery = supabase.from("technical_mcq").select("*");
    let debugQuery = supabase.from("technical_debug").select("*");
    let codingQuery = supabase.from("technical_coding").select("*");

    // Apply difficulty filter if specified
    if (difficulty && difficulty !== 'all') {
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

    console.log(`📚 Available questions: MCQ=${allMcqs.length}, Debug=${allDebug.length}, Coding=${allCoding.length}`);

    // Generate enhanced unique seed for this session
    const questionSeed = generateQuestionSeed(userId, sessionId, `${Date.now()}_${Math.random()}`);
    
    // Advanced question selection with multiple strategies
    const selectedMcqs = selectQuestionsAdvanced(
      allMcqs, 
      Math.min(mcqCount, allMcqs.length), 
      recentIds, 
      questionSeed + '_mcq_advanced'
    );
    
    const selectedDebug = selectQuestionsAdvanced(
      allDebug, 
      Math.min(debugCount, allDebug.length), 
      recentIds, 
      questionSeed + '_debug_advanced'
    );
    
    const selectedCoding = selectQuestionsAdvanced(
      allCoding, 
      Math.min(codingCount, allCoding.length), 
      recentIds, 
      questionSeed + '_coding_advanced'
    );

    // Calculate freshness metrics
    const freshnessMcq = selectedMcqs.filter(q => !recentIds.includes(q.id)).length;
    const freshnessDebug = selectedDebug.filter(q => !recentIds.includes(q.id)).length;
    const freshnessCoding = selectedCoding.filter(q => !recentIds.includes(q.id)).length;
    
    const totalFresh = freshnessMcq + freshnessDebug + freshnessCoding;
    const totalSelected = selectedMcqs.length + selectedDebug.length + selectedCoding.length;

    // Prepare enhanced response data
    const responseData = {
      session_id: sessionId,
      user_id: userId,
      generated_at: new Date().toISOString(),
      seed: questionSeed.substring(0, 16), // Shorter for logging
      randomization_strategy: 'advanced_weighted_selection',
      mcqs: selectedMcqs.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        is_fresh: !recentIds.includes(q.id)
      })),
      debug: selectedDebug.map(q => ({
        ...q,
        is_fresh: !recentIds.includes(q.id)
      })),
      coding: selectedCoding.map(q => ({
        ...q,
        is_fresh: !recentIds.includes(q.id)
      })),
      metadata: {
        total_questions: totalSelected,
        total_fresh_questions: totalFresh,
        freshness_percentage: totalSelected > 0 ? Math.round((totalFresh / totalSelected) * 100) : 0,
        difficulty_filter: difficulty || 'mixed',
        questions_avoided: recentIds.length,
        user_session_count: allHistory.length,
        decay_period_days: decayDays,
        available_counts: {
          mcq: allMcqs.length,
          debug: allDebug.length,
          coding: allCoding.length
        },
        selection_quality: {
          mcq_fresh: freshnessMcq,
          mcq_total: selectedMcqs.length,
          debug_fresh: freshnessDebug,
          debug_total: selectedDebug.length,
          coding_fresh: freshnessCoding,
          coding_total: selectedCoding.length
        }
      }
    };

    // Save this enhanced question set to history
    await saveQuestionHistory(userId, sessionId, responseData);

    console.log(`✅ Question selection completed:`, {
      total: `${totalSelected} questions`,
      fresh: `${totalFresh} fresh (${Math.round((totalFresh / totalSelected) * 100)}%)`,
      breakdown: `MCQ: ${selectedMcqs.length}, Debug: ${selectedDebug.length}, Coding: ${selectedCoding.length}`,
      freshBreakdown: `MCQ: ${freshnessMcq}, Debug: ${freshnessDebug}, Coding: ${freshnessCoding}`
    });

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("❌ Error generating question set:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}

// Enhanced save function with better tracking
async function saveQuestionHistory(userId, sessionId, responseData) {
  try {
    const questionIds = {
      mcq: responseData.mcqs.map(q => q.id),
      debug: responseData.debug.map(q => q.id),
      coding: responseData.coding.map(q => q.id)
    };

    const { error } = await supabase
      .from('user_question_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        question_ids: questionIds,
        total_questions: responseData.metadata.total_questions,
        fresh_questions: responseData.metadata.total_fresh_questions,
        freshness_percentage: responseData.metadata.freshness_percentage,
        randomization_seed: responseData.seed,
        difficulty_filter: responseData.metadata.difficulty_filter,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.log('⚠️ Could not save question history:', error.message);
    } else {
      console.log('💾 Question history saved successfully');
    }
  } catch (error) {
    console.log('❌ Error saving question history:', error);
  }
}

// Keep your existing POST and PUT methods unchanged
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
      average_freshness: questionHistory?.length > 0
        ? Math.round(questionHistory.reduce((sum, h) => sum + (h.freshness_percentage || 0), 0) / questionHistory.length)
        : 0,
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