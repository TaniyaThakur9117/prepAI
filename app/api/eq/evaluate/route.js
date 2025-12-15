// import { NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export async function POST(req) {
//   try {
//     const { answers, userId, email, sessionId } = await req.json();

//     if (!answers || Object.keys(answers).length === 0) {
//       return NextResponse.json({ error: "No answers provided" }, { status: 400 });
//     }

//     // Combine all answers into one text
//     const answerText = Object.values(answers).join("\n");

//     // Calculate a basic score
//     const totalQuestions = Object.keys(answers).length || 1;
//     const averageLength = answerText.length / totalQuestions;
//     let basicScore = Math.min(100, Math.floor((averageLength / 50) * 100));
    
//     // Ensure minimum score for encouragement
//     if (basicScore < 60) basicScore = Math.max(60, basicScore + 20);

//     console.log(`📊 Processing evaluation for ${totalQuestions} answers`);

//     // API key from environment variable
//     const apiKey = process.env.GEMINI_API_KEY;
//     let feedback = "";
//     let finalScore = basicScore;

//     if (!apiKey) {
//       console.warn("GEMINI_API_KEY not found - using basic evaluation");
//       feedback = generateBasicFeedback(totalQuestions, finalScore);
//     } else {
//       try {
//         // Call Gemini API for enhanced evaluation
//         const modelName = "gemini-1.5-flash-latest";
//         const res = await fetch(
//           `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               contents: [
//                 {
//                   parts: [
//                     {
//                       text: `You are a supportive emotional intelligence coach. 

// Analyze these EQ assessment responses and provide encouraging, concise feedback in this exact format:

// 🎯 **Your EQ Score: XX/100**

// ✨ **Key Strengths:**
// - [Identify 2-3 positive qualities from their responses]

// 🌱 **Growth Opportunities:**
// - [Mention 2-3 areas for development in a positive way]

// 💡 **Quick Tips:**
// - [Give 2-3 practical, actionable suggestions]

// 🏆 **Overall:** [Write 1-2 encouraging sentences about their emotional intelligence journey]

// Keep the tone positive, supportive, and motivating. Focus on growth rather than deficiencies.

// User's responses to ${totalQuestions} EQ questions:
// ${answerText}

// Provide a score between 65-95 to keep it encouraging. Make the feedback concise and uplifting.`,
//                     },
//                   ],
//                 },
//               ],
//             }),
//           }
//         );

//         const data = await res.json();
//         console.log("Gemini API response received");

//         const geminiResponse = data?.candidates?.[0]?.content?.parts
//           ?.map((p) => p.text)
//           .join("\n")
//           ?.trim();

//         if (geminiResponse) {
//           feedback = geminiResponse;
          
//           // Try to extract score from Gemini response
//           const scorePatterns = [
//             /Your EQ Score:\s*(\d+)\/100/i,
//             /EQ Score:\s*(\d+)\/100/i,
//             /Score:\s*(\d+)\/100/i,
//             /(\d+)\/100/g,
//           ];

//           for (const pattern of scorePatterns) {
//             const match = feedback.match(pattern);
//             if (match && match[1]) {
//               const potentialScore = parseInt(match[1], 10);
//               if (potentialScore >= 60 && potentialScore <= 100) {
//                 finalScore = potentialScore;
//                 break;
//               }
//             }
//           }
//         } else {
//           feedback = generateBasicFeedback(totalQuestions, finalScore);
//         }
//       } catch (apiError) {
//         console.error("Gemini API error:", apiError);
//         feedback = generateBasicFeedback(totalQuestions, finalScore);
//       }
//     }

//     // Ensure score is in encouraging range
//     if (finalScore < 65) finalScore = Math.max(65, finalScore + 15);
//     if (finalScore > 95) finalScore = 95;

//     // Save results to database
//     try {
//       const { error: saveError } = await supabase
//         .from('eq_results')
//         .insert({
//           session_id: sessionId || `session_${Date.now()}`,
//           user_id: userId || null,
//           user_email: email || null,
//           total_questions: totalQuestions,
//           answered_questions: totalQuestions,
//           score: finalScore,
//           feedback: feedback,
//           submitted_at: new Date().toISOString()
//         });

//       if (saveError) {
//         console.error("Error saving results:", saveError);
//       } else {
//         console.log("✅ Results saved to database");
//       }
//     } catch (dbError) {
//       console.error("Database save error:", dbError);
//     }

//     const response = {
//       result: feedback,
//       score: finalScore,
//       totalQuestions: totalQuestions,
//       completionRate: `${Math.round((totalQuestions / 15) * 100)}%`,
//       sessionId: sessionId,
//     };

//     return NextResponse.json(response);
//   } catch (error) {
//     console.error("Error in EQ evaluation route:", error);
    
//     // Fallback response
//     const fallbackScore = Math.floor(Math.random() * 20) + 70;
//     const totalAnswered = Object.keys(answers || {}).length;
    
//     return NextResponse.json({
//       result: generateBasicFeedback(totalAnswered, fallbackScore),
//       score: fallbackScore,
//       totalQuestions: totalAnswered,
//       error: "Using fallback evaluation due to server error"
//     });
//   }
// }

// function generateBasicFeedback(totalQuestions, score) {
//   const encouragingMessages = {
//     high: "You demonstrate strong emotional intelligence skills!",
//     medium: "You're on a great path to developing emotional intelligence!",
//     low: "Every step in emotional growth is valuable - keep going!"
//   };

//   const level = score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low';
  
//   return `🎯 **Your EQ Score: ${score}/100**

// ✨ **Key Strengths:**
// - You completed ${totalQuestions} questions, showing commitment to self-improvement
// - Your responses indicate thoughtfulness in emotional scenarios
// - You demonstrate awareness of emotional intelligence concepts

// 🌱 **Growth Opportunities:**
// - Continue practicing emotional awareness in daily situations
// - Focus on developing empathy through active listening
// - Work on expressing emotions in healthy, constructive ways

// 💡 **Quick Tips:**
// - Pause and reflect before reacting emotionally
// - Practice asking "How might others feel?" in various situations
// - Keep a daily journal of emotional experiences

// 🏆 **Overall:** ${encouragingMessages[level]} Your journey toward emotional growth is valuable and ongoing.

// 📊 Assessment Summary: ${score}/100 | ${totalQuestions} questions completed`;
// }

// app/api/eq/evaluate/route.js
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

    // Calculate answer quality metrics
    const totalQuestions = Object.keys(answers).length || 1;
    const totalLength = answerText.length;
    const averageLength = totalLength / totalQuestions;
    const wordCount = answerText.trim().split(/\s+/).length;
    const averageWordsPerAnswer = wordCount / totalQuestions;

    console.log(`📊 Processing evaluation for ${totalQuestions} answers`);
    console.log(`📝 Average length: ${averageLength.toFixed(0)} chars, Average words: ${averageWordsPerAnswer.toFixed(0)}`);

    // Check for low-quality responses
    const lowQualityPatterns = [
      /^(.)\1{2,}$/i,  // Repeated characters (hhhh, aaaa, 111)
      /^(test|testing|asdf|qwerty|12345|abc|xyz)/i,
      /^.{1,10}$/,  // Very short responses (under 10 chars)
      /^[^a-zA-Z]*$/,  // No letters at all
    ];

    const nonsensePatterns = [
      /^(.)\1{3,}/i,  // 4+ repeated characters (hhhhhh, aaaaaaa)
      /^[a-z]{1,3}$/i,  // Single letter or 2-3 random letters
      /^[\W\d]+$/,  // Only symbols and numbers
    ];

    let hasLowQualityAnswers = false;
    let lowQualityCount = 0;
    let nonsenseCount = 0;

    Object.values(answers).forEach(answer => {
      const trimmedAnswer = answer.trim();
      
      // Check for complete nonsense
      if (nonsensePatterns.some(pattern => pattern.test(trimmedAnswer)) || trimmedAnswer.length < 5) {
        nonsenseCount++;
        hasLowQualityAnswers = true;
      } 
      // Check for low quality
      else if (trimmedAnswer.length < 15 || lowQualityPatterns.some(pattern => pattern.test(trimmedAnswer))) {
        lowQualityCount++;
        hasLowQualityAnswers = true;
      }
    });

    // API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    let feedback = "";
    let finalScore = 0;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found - using basic evaluation");
      finalScore = calculateBasicScore(answers, hasLowQualityAnswers, lowQualityCount, nonsenseCount, totalQuestions);
      feedback = generateBasicFeedback(totalQuestions, finalScore, hasLowQualityAnswers, lowQualityCount, nonsenseCount, averageWordsPerAnswer);
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
                      text: `You are an experienced emotional intelligence coach conducting a professional EQ assessment.

Analyze these ${totalQuestions} EQ assessment responses critically and objectively. Evaluate:
1. **Response Quality**: Are answers thoughtful, detailed, and genuine? Or are they nonsensical, repetitive, or minimal effort?
2. **Emotional Awareness**: Do responses show understanding of emotions and emotional situations?
3. **Self-Reflection**: Is there evidence of genuine self-awareness and introspection?
4. **Practical Application**: Do answers demonstrate real-world emotional intelligence?

SCORING GUIDELINES:
- 85-100: Exceptional emotional intelligence with deep, thoughtful responses
- 70-84: Good emotional awareness with solid, meaningful responses  
- 50-69: Developing EQ with basic but genuine effort in responses
- 25-49: Poor quality responses with minimal effort or understanding
- 0-24: Complete nonsense (repeated characters like "hhhh", random text, no real answers)

**CRITICAL**: If responses contain:
- Repeated characters (hhhh, aaaa, etc.) - Score: 5-15
- Random text (asdf, qwerty, test, etc.) - Score: 10-20
- Extremely short answers (under 10 characters each) - Score: 5-20
- No coherent thoughts or emotional awareness - Score: 15-25
Then assign a VERY LOW score (5-25) and provide DIRECT, HONEST feedback about why this is unacceptable.

Provide feedback in this format:

🎯 **Your EQ Score: XX/100**

✨ **Key Strengths:**
- [List 2-3 genuine strengths IF the responses show quality. If responses are poor quality, state "Limited strengths observed in current responses"]

🌱 **Growth Opportunities:**
- [Provide 2-3 specific, honest areas for improvement based on actual response quality]

💡 **Quick Tips:**
- [Give 2-3 practical suggestions. If responses were poor quality, focus on how to provide better, more thoughtful answers]

🏆 **Overall:** [Write 1-2 honest sentences about their performance. Be supportive but truthful. If responses were low quality, acknowledge this directly]

User's responses to ${totalQuestions} EQ questions:
${answerText}

**Response Quality Metrics:**
- Average response length: ${averageLength.toFixed(0)} characters
- Average words per response: ${averageWordsPerAnswer.toFixed(0)} words
- Total questions answered: ${totalQuestions}

BE HONEST AND OBJECTIVE. Give real scores based on actual response quality.`,
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
            /(\d+)\/100/,
          ];

          for (const pattern of scorePatterns) {
            const match = feedback.match(pattern);
            if (match && match[1]) {
              const potentialScore = parseInt(match[1], 10);
              if (potentialScore >= 0 && potentialScore <= 100) {
                finalScore = potentialScore;
                break;
              }
            }
          }

          // If no score found, calculate based on quality
          if (finalScore === 0) {
            finalScore = calculateBasicScore(answers, hasLowQualityAnswers, lowQualityCount, nonsenseCount, totalQuestions);
          }
        } else {
          finalScore = calculateBasicScore(answers, hasLowQualityAnswers, lowQualityCount, nonsenseCount, totalQuestions);
          feedback = generateBasicFeedback(totalQuestions, finalScore, hasLowQualityAnswers, lowQualityCount, nonsenseCount, averageWordsPerAnswer);
        }
      } catch (apiError) {
        console.error("Gemini API error:", apiError);
        finalScore = calculateBasicScore(answers, hasLowQualityAnswers, lowQualityCount, nonsenseCount, totalQuestions);
        feedback = generateBasicFeedback(totalQuestions, finalScore, hasLowQualityAnswers, lowQualityCount, nonsenseCount, averageWordsPerAnswer);
      }
    }

    // Ensure score is within valid range
    finalScore = Math.max(0, Math.min(100, finalScore));

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
      qualityWarning: nonsenseCount > 0 ? `${nonsenseCount} nonsense response(s) detected` : 
                      hasLowQualityAnswers ? `${lowQualityCount} low-quality response(s) detected` : null
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in EQ evaluation route:", error);
    
    return NextResponse.json({
      error: "Failed to evaluate assessment. Please try again.",
      message: error.message
    }, { status: 500 });
  }
}

function calculateBasicScore(answers, hasLowQuality, lowQualityCount, nonsenseCount, totalQuestions) {
  const answerValues = Object.values(answers);
  
  // Categorize each answer
  const nonsensePatterns = [
    /^(.)\1{3,}/i,  // 4+ repeated characters
    /^[a-z]{1,3}$/i,  // 1-3 random letters
    /^[\W\d]+$/,  // Only symbols/numbers
  ];
  
  const lowQualityPatterns = [
    /^(.)\1{2,}$/i,  // 3+ repeated characters
    /^(test|testing|asdf|qwerty|12345|abc|xyz)/i,
  ];
  
  let goodAnswers = 0;
  let lowQualityAnswers = 0;
  let nonsenseAnswers = 0;
  let totalGoodLength = 0;
  let totalGoodWords = 0;
  
  answerValues.forEach(answer => {
    const trimmedAnswer = answer.trim();
    const wordCount = trimmedAnswer.split(/\s+/).length;
    
    // Categorize this answer
    if (nonsensePatterns.some(pattern => pattern.test(trimmedAnswer)) || trimmedAnswer.length < 5) {
      nonsenseAnswers++;
    } else if (trimmedAnswer.length < 15 || lowQualityPatterns.some(pattern => pattern.test(trimmedAnswer))) {
      lowQualityAnswers++;
    } else {
      // This is a good answer
      goodAnswers++;
      totalGoodLength += trimmedAnswer.length;
      totalGoodWords += wordCount;
    }
  });
  
  console.log(`📊 Answer Quality: ${goodAnswers} good, ${lowQualityAnswers} low-quality, ${nonsenseAnswers} nonsense`);
  
  // If ALL answers are nonsense
  if (nonsenseAnswers === totalQuestions) {
    return Math.floor(Math.random() * 10) + 5; // 5-15
  }
  
  // If NO good answers at all
  if (goodAnswers === 0) {
    return Math.floor(Math.random() * 15) + 10; // 10-25
  }
  
  // Calculate score based on good answers
  const avgGoodLength = goodAnswers > 0 ? totalGoodLength / goodAnswers : 0;
  const avgGoodWords = goodAnswers > 0 ? totalGoodWords / goodAnswers : 0;
  
  // Base score from good answers (0-60 points based on proportion)
  let score = Math.floor((goodAnswers / totalQuestions) * 60);
  
  // Quality bonus for good answers (0-40 points)
  if (goodAnswers > 0) {
    // Length bonus (0-20 points)
    if (avgGoodLength > 200) score += 20;
    else if (avgGoodLength > 150) score += 16;
    else if (avgGoodLength > 100) score += 12;
    else if (avgGoodLength > 50) score += 8;
    else score += 4;
    
    // Word count bonus (0-20 points)
    if (avgGoodWords > 40) score += 20;
    else if (avgGoodWords > 30) score += 16;
    else if (avgGoodWords > 20) score += 12;
    else if (avgGoodWords > 10) score += 8;
    else score += 4;
  }
  
  // Penalty for nonsense answers
  const nonsensePenalty = Math.floor((nonsenseAnswers / totalQuestions) * 30);
  score -= nonsensePenalty;
  
  // Penalty for low quality answers
  const lowQualityPenalty = Math.floor((lowQualityAnswers / totalQuestions) * 15);
  score -= lowQualityPenalty;
  
  // Ensure score is within valid range
  return Math.max(5, Math.min(95, score));
}

function generateBasicFeedback(totalQuestions, score, hasLowQuality, lowQualityCount, nonsenseCount, avgWords) {
  let strengthsMessage = "";
  let growthMessage = "";
  let tipsMessage = "";
  let overallMessage = "";
  
  const goodAnswers = totalQuestions - lowQualityCount - nonsenseCount;
  const percentGood = Math.round((goodAnswers / totalQuestions) * 100);
  
  if (score < 25) {
    // Mostly/all nonsense
    strengthsMessage = `- You submitted the assessment form`;
    if (goodAnswers > 0) {
      strengthsMessage += `
- ${goodAnswers} out of ${totalQuestions} responses showed some effort`;
    }
    
    growthMessage = `- **Unacceptable Responses**: ${nonsenseCount} response(s) contain nonsense or repeated characters (e.g., "hhhh", "aaaa")
- **Invalid Assessment**: Too many low-quality responses to evaluate properly
- **Wasted Effort**: Your ${goodAnswers} good answer(s) are overshadowed by nonsense`;
    
    tipsMessage = `- **You must retake this assessment with genuine effort on ALL questions**
- Don't mix good answers with nonsense - it invalidates the entire assessment
- Write at least 2-3 meaningful sentences for EVERY question
- Take it seriously from start to finish`;
    
    overallMessage = `**Assessment largely invalid.** You answered ${goodAnswers}/${totalQuestions} questions properly, but ${nonsenseCount} nonsense responses make this unreliable. Please retake seriously.`;
    
  } else if (score < 40) {
    strengthsMessage = `- You provided ${goodAnswers} thoughtful response(s) out of ${totalQuestions}`;
    
    growthMessage = `- **Mixed Quality**: Only ${percentGood}% of responses are acceptable quality
- **${nonsenseCount > 0 ? nonsenseCount + ' Nonsense' : lowQualityCount + ' Low-Quality'} Response(s)**: These drag down your assessment
- **Inconsistent Effort**: Shows you CAN answer well, but didn't maintain effort`;
    
    tipsMessage = `- Apply the same effort to ALL questions, not just some
- Avoid rushing through questions with minimal or nonsense answers
- Your good answers show potential - be consistent
- Retake to show your true EQ with all quality responses`;
    
    overallMessage = `You demonstrated ability in ${goodAnswers} responses, but the ${nonsenseCount + lowQualityCount} poor responses significantly lower your score. Consistent effort across all questions is needed.`;
    
  } else if (score < 60) {
    strengthsMessage = `- You provided ${goodAnswers} thoughtful responses (${percentGood}% of total)`;
    if (goodAnswers > 5) {
      strengthsMessage += `
- Your better answers show emotional awareness and reflection`;
    }
    
    growthMessage = `- **Inconsistent Quality**: ${nonsenseCount + lowQualityCount} response(s) need improvement
- **Partial Effort**: Good responses show capability, but not maintained throughout
- **Lower Than Potential**: Your score doesn't reflect your best work`;
    
    tipsMessage = `- Maintain focus and effort on every single question
- Review and improve brief or rushed responses before submitting
- Your good answers prove you understand EQ - apply that to all questions`;
    
    overallMessage = `Your ${goodAnswers} quality responses show promise, but inconsistent effort limits your score. You're capable of much better with full engagement.`;
    
  } else if (score < 75) {
    strengthsMessage = `- You completed ${goodAnswers} questions with genuine effort (${percentGood}%)
- Most answers show emotional awareness and thoughtfulness`;
    if (lowQualityCount + nonsenseCount > 0) {
      strengthsMessage += `
- Majority of your responses demonstrate EQ understanding`;
    }
    
    growthMessage = `- **Nearly There**: A few responses (${lowQualityCount + nonsenseCount}) could be more detailed
- **Depth**: Some answers would benefit from more specific examples
- **Consistency**: Maintain your good response quality throughout`;
    
    tipsMessage = `- Review all responses before submitting to ensure quality
- Provide specific examples in every answer
- Take your time on each question - you have 30 minutes`;
    
    overallMessage = `Good foundation with ${goodAnswers} solid responses. Strengthening the remaining ${lowQualityCount + nonsenseCount} response(s) would significantly boost your EQ assessment.`;
    
  } else {
    strengthsMessage = `- Excellent work on ${goodAnswers} thoughtful, detailed responses
- Your answers demonstrate strong self-awareness and reflection
- Consistent quality throughout the assessment`;
    
    growthMessage = `- Continue deepening your empathy through diverse perspectives
- Practice emotional regulation in challenging situations
- Work on applying EQ concepts more consistently in daily life`;
    
    tipsMessage = `- Pause and reflect before reacting emotionally
- Practice asking "How might others feel?" in various situations
- Keep a daily journal of emotional experiences`;
    
    overallMessage = "You demonstrate strong emotional intelligence! Your journey toward emotional growth is valuable and ongoing. Keep practicing these skills.";
  }
  
  return `🎯 **Your EQ Score: ${score}/100**

✨ **Key Strengths:**
${strengthsMessage}

🌱 **Growth Opportunities:**
${growthMessage}

💡 **Quick Tips:**
${tipsMessage}

🏆 **Overall:** ${overallMessage}

📊 Assessment Summary: ${score}/100 | ${goodAnswers} quality responses, ${lowQualityCount} low-quality, ${nonsenseCount} nonsense | Avg ${avgWords.toFixed(0)} words per response`;
}

