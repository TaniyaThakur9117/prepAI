import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    // Fetch all questions from database
    const { data: allQuestions, error } = await supabase
      .from("eq_questions")
      .select("*")
      .order('id');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Analyze the data
    const totalQuestions = allQuestions.length;
    const uniqueIds = new Set(allQuestions.map(q => q.id)).size;
    const duplicateIds = totalQuestions - uniqueIds;
    
    // Find actual duplicates
    const idCounts = {};
    const duplicateDetails = [];
    
    allQuestions.forEach(q => {
      if (idCounts[q.id]) {
        idCounts[q.id]++;
        if (idCounts[q.id] === 2) {
          duplicateDetails.push(q.id);
        }
      } else {
        idCounts[q.id] = 1;
      }
    });

    // Check for duplicate question text
    const questionTexts = new Set();
    const duplicateTexts = [];
    
    allQuestions.forEach(q => {
      if (questionTexts.has(q.question)) {
        duplicateTexts.push(q.question.substring(0, 100) + "...");
      } else {
        questionTexts.add(q.question);
      }
    });

    // Check question completeness
    const incompleteQuestions = allQuestions.filter(q => 
      !q.option_a || !q.option_b || !q.option_c || !q.option_d
    );

    // Category analysis
    const categoryCount = {};
    allQuestions.forEach(q => {
      const category = q.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const report = {
      status: "success",
      database: {
        totalQuestions,
        uniqueIds,
        duplicateIds,
        duplicateIdsList: duplicateDetails,
        incompleteQuestions: incompleteQuestions.length,
        incompleteList: incompleteQuestions.slice(0, 3).map(q => ({
          id: q.id,
          question: q.question.substring(0, 50) + "...",
          missing: [
            !q.option_a && 'option_a',
            !q.option_b && 'option_b', 
            !q.option_c && 'option_c',
            !q.option_d && 'option_d'
          ].filter(Boolean)
        }))
      },
      content: {
        duplicateTextsCount: duplicateTexts.length,
        duplicateTextsList: duplicateTexts.slice(0, 3),
        categoryBreakdown: categoryCount
      },
      sampleQuestions: allQuestions.slice(0, 3).map(q => ({
        id: q.id,
        category: q.category,
        question: q.question.substring(0, 100) + "...",
        hasAllOptions: !!(q.option_a && q.option_b && q.option_c && q.option_d),
        created_at: q.created_at
      })),
      recommendations: []
    };

    // Add recommendations
    if (duplicateIds > 0) {
      report.recommendations.push("⚠️ Remove duplicate question IDs");
    }
    if (incompleteQuestions.length > 0) {
      report.recommendations.push("⚠️ Complete questions missing answer options");
    }
    if (totalQuestions < 15) {
      report.recommendations.push("📝 Add more questions (recommended: at least 20)");
    }
    if (duplicateTexts.length > 0) {
      report.recommendations.push("📝 Review and remove duplicate question content");
    }
    if (report.recommendations.length === 0) {
      report.recommendations.push("✅ Database looks healthy!");
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { 
        status: "error",
        error: `Database check failed: ${error.message}`,
        recommendations: ["🔧 Check database connection and credentials"]
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { action } = await req.json();
    
    if (action === "test_connection") {
      // Test basic connectivity
      const { data, error } = await supabase
        .from("eq_questions")
        .select("count")
        .limit(1);
        
      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: error.message 
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Database connection successful",
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: `Operation failed: ${error.message}` },
      { status: 500 }
    );
  }
}