// import { NextResponse } from "next/server";
// import { requireAdminOrRedirect } from "@/lib/isAdmin";

// export async function POST(req) {
//   try {
//     const { answers, userId, email } = await req.json();

//     // Check admin status
//     const adminCheck = await requireAdminOrRedirect();
//     const isAdmin = adminCheck.ok;

//     // Combine all answers into one text
//     const answerText = Object.values(answers).join("\n");

//     // Calculate a basic score (you can modify this logic)
//     const totalQuestions = Object.keys(answers).length;
//     const averageLength = answerText.length / totalQuestions;
//     let score = Math.min(100, Math.floor((averageLength / 100) * 100)); // Basic scoring logic

//     // Model name
//     const modelName = "gemini-1.5-flash-latest";

//     // API key from environment variable
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       throw new Error("GEMINI_API_KEY is not set in .env.local");
//     }

//     // Call Gemini API
//     const res = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `You are an expert in emotional intelligence assessment. 
// Evaluate the following answers carefully and provide a comprehensive feedback with:
// 1. Overall EQ assessment
// 2. Strengths identified
// 3. Areas for improvement
// 4. Specific recommendations
// 5. A numerical score out of 100

// User's responses:\n${answerText}

// Please provide structured feedback that is constructive and actionable.`
//                 }
//               ]
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();

//     console.log("Gemini API raw response:", JSON.stringify(data, null, 2));

//     let feedback =
//       data?.candidates?.[0]?.content?.parts
//         ?.map((p) => p.text)
//         .join("\n")
//         ?.trim() || null;

//     if (!feedback) {
//       feedback = data?.error?.message
//         ? `Error from Gemini API: ${data.error.message}`
//         : "No feedback received from Gemini.";
//     }

//     // Extract score from feedback if possible (basic regex)
//     const scoreMatch = feedback.match(/(?:score|rating).*?(\d+).*?(?:out of|\/|\s).*?100/i);
//     if (scoreMatch) {
//       score = parseInt(scoreMatch[1]);
//     }

//     const response = { 
//       result: feedback, 
//       score: score,
//       isAdmin: isAdmin,
//       adminEmail: isAdmin ? adminCheck.email : null
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error in EQ evaluation route:", error);
//     return NextResponse.json(
//       { result: `Server error: ${error.message}`, score: 0 },
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

export async function POST(req) {
  try {
    const { answers, userId, email, sessionId } = await req.json();

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Combine all answers into one text
    const answerText = Object.values(answers).join("\n");

    // Calculate a basic score
    const totalQuestions = Object.keys(answers).length || 1;
    const averageLength = answerText.length / totalQuestions;
    let basicScore = Math.min(100, Math.floor((averageLength / 50) * 100));
    
    // Ensure minimum score for encouragement
    if (basicScore < 60) basicScore = Math.max(60, basicScore + 20);

    console.log(`📊 Processing evaluation for ${totalQuestions} answers`);

    // API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    let feedback = "";
    let finalScore = basicScore;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found - using basic evaluation");
      feedback = generateBasicFeedback(totalQuestions, finalScore);
    } else {
      try {
        // Call Gemini API for enhanced evaluation
        const modelName = "gemini-1.5-flash-latest";
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a supportive emotional intelligence coach. 

Analyze these EQ assessment responses and provide encouraging, concise feedback in this exact format:

🎯 **Your EQ Score: XX/100**

✨ **Key Strengths:**
- [Identify 2-3 positive qualities from their responses]

🌱 **Growth Opportunities:**
- [Mention 2-3 areas for development in a positive way]

💡 **Quick Tips:**
- [Give 2-3 practical, actionable suggestions]

🏆 **Overall:** [Write 1-2 encouraging sentences about their emotional intelligence journey]

Keep the tone positive, supportive, and motivating. Focus on growth rather than deficiencies.

User's responses to ${totalQuestions} EQ questions:
${answerText}

Provide a score between 65-95 to keep it encouraging. Make the feedback concise and uplifting.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await res.json();
        console.log("Gemini API response received");

        const geminiResponse = data?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text)
          .join("\n")
          ?.trim();

        if (geminiResponse) {
          feedback = geminiResponse;
          
          // Try to extract score from Gemini response
          const scorePatterns = [
            /Your EQ Score:\s*(\d+)\/100/i,
            /EQ Score:\s*(\d+)\/100/i,
            /Score:\s*(\d+)\/100/i,
            /(\d+)\/100/g,
          ];

          for (const pattern of scorePatterns) {
            const match = feedback.match(pattern);
            if (match && match[1]) {
              const potentialScore = parseInt(match[1], 10);
              if (potentialScore >= 60 && potentialScore <= 100) {
                finalScore = potentialScore;
                break;
              }
            }
          }
        } else {
          feedback = generateBasicFeedback(totalQuestions, finalScore);
        }
      } catch (apiError) {
        console.error("Gemini API error:", apiError);
        feedback = generateBasicFeedback(totalQuestions, finalScore);
      }
    }

    // Ensure score is in encouraging range
    if (finalScore < 65) finalScore = Math.max(65, finalScore + 15);
    if (finalScore > 95) finalScore = 95;

    // Save results to database
    try {
      const { error: saveError } = await supabase
        .from('eq_results')
        .insert({
          session_id: sessionId || `session_${Date.now()}`,
          user_id: userId || null,
          user_email: email || null,
          total_questions: totalQuestions,
          answered_questions: totalQuestions,
          score: finalScore,
          feedback: feedback,
          submitted_at: new Date().toISOString()
        });

      if (saveError) {
        console.error("Error saving results:", saveError);
      } else {
        console.log("✅ Results saved to database");
      }
    } catch (dbError) {
      console.error("Database save error:", dbError);
    }

    const response = {
      result: feedback,
      score: finalScore,
      totalQuestions: totalQuestions,
      completionRate: `${Math.round((totalQuestions / 15) * 100)}%`,
      sessionId: sessionId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in EQ evaluation route:", error);
    
    // Fallback response
    const fallbackScore = Math.floor(Math.random() * 20) + 70;
    const totalAnswered = Object.keys(answers || {}).length;
    
    return NextResponse.json({
      result: generateBasicFeedback(totalAnswered, fallbackScore),
      score: fallbackScore,
      totalQuestions: totalAnswered,
      error: "Using fallback evaluation due to server error"
    });
  }
}

function generateBasicFeedback(totalQuestions, score) {
  const encouragingMessages = {
    high: "You demonstrate strong emotional intelligence skills!",
    medium: "You're on a great path to developing emotional intelligence!",
    low: "Every step in emotional growth is valuable - keep going!"
  };

  const level = score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low';
  
  return `🎯 **Your EQ Score: ${score}/100**

✨ **Key Strengths:**
- You completed ${totalQuestions} questions, showing commitment to self-improvement
- Your responses indicate thoughtfulness in emotional scenarios
- You demonstrate awareness of emotional intelligence concepts

🌱 **Growth Opportunities:**
- Continue practicing emotional awareness in daily situations
- Focus on developing empathy through active listening
- Work on expressing emotions in healthy, constructive ways

💡 **Quick Tips:**
- Pause and reflect before reacting emotionally
- Practice asking "How might others feel?" in various situations
- Keep a daily journal of emotional experiences

🏆 **Overall:** ${encouragingMessages[level]} Your journey toward emotional growth is valuable and ongoing.

📊 Assessment Summary: ${score}/100 | ${totalQuestions} questions completed`;
}