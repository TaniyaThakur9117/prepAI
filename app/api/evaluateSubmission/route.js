// app/api/evaluateSubmission/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromFile } from '@/lib/fileUtils';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  console.log('=== API Route Called ===');
  
  try {
    // Parse request body 
    let submissionId;
    try {
      const body = await request.json();
      submissionId = body.submissionId;
      console.log('Received submissionId:', submissionId);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!submissionId) {
      console.error('Missing submissionId');
      return new Response(
        JSON.stringify({ error: "Submission ID is required" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check environment variables
    if (!process.env.GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY');
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing AI API key" }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Gemini API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);

    // Initialize Supabase client
    let supabase;
    try {
      supabase = createRouteHandlerClient({ cookies });
      console.log('Supabase client created');
    } catch (supabaseError) {
      console.error('Supabase client error:', supabaseError);
      return new Response(
        JSON.stringify({ error: "Database connection error" }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch submission with case study details
    console.log('Fetching submission from database...');
    const { data: submission, error: fetchError } = await supabase
      .from("case_submissions")
      .select(`
        *,
        case_studies(title, description)
      `)
      .eq("id", submissionId)
      .single();

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          error: "Database error", 
          details: fetchError.message,
          submissionId: submissionId
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!submission) {
      console.error('Submission not found:', submissionId);
      return new Response(
        JSON.stringify({ error: "Submission not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Submission found:', {
      id: submission.id,
      hasText: !!submission.submission_text,
      hasFile: !!submission.submission_file_url,
      caseStudyTitle: submission.case_studies?.title
    });

    let content = submission.submission_text || "";

    // Extract text if file exists
    if (submission.submission_file_url && !content.trim()) {
      console.log('Attempting to extract text from file:', submission.submission_file_url);
      try {
        content = await extractTextFromFile(submission.submission_file_url);
        console.log('File extraction successful, content length:', content.length);
      } catch (fileError) {
        console.error("File extraction error:", fileError);
        content = "Unable to extract file content. Please provide text submission.";
      }
    }

    if (!content.trim()) {
      console.error('No content found to evaluate');
      return new Response(
        JSON.stringify({ error: "No content found to evaluate" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content ready for evaluation, length:', content.length);
    console.log('Content preview:', content.substring(0, 200) + '...');

    // Enhanced Gemini AI evaluation with better error handling
    let model, result, response, text;
    try {
      console.log('Initializing Gemini AI...');
      
      // Try different model names if gemini-pro doesn't work
      const modelName = "gemini-1.5-flash"; // Updated model name
      model = genAI.getGenerativeModel({ model: modelName });
      console.log('Gemini model initialized with:', modelName);

      const prompt = `
You are an expert evaluator for business case studies. Please evaluate the following submission based on these criteria:

**Case Study Context:**
Title: ${submission.case_studies?.title || 'Unknown Case Study'}
Description: ${submission.case_studies?.description || 'No description available'}

**Student Submission:**
${content}

**Evaluation Criteria (each worth 25 points, total 100):**
1. **Analytical Thinking (25 points):** Problem identification, data analysis, logical reasoning
2. **Creativity & Innovation (25 points):** Novel solutions, creative approaches, out-of-the-box thinking
3. **Feasibility & Practicality (25 points):** Realistic implementation, resource consideration, timeline
4. **Presentation & Clarity (25 points):** Clear communication, structure, professional presentation

**Instructions:**
- Provide a score out of 100 (whole numbers only)
- Give detailed feedback explaining the score
- Highlight strengths and areas for improvement
- Be constructive and encouraging
- Format your response as JSON with "score" and "feedback" fields

Example format:
{
  "score": 85,
  "feedback": "Excellent analysis of the problem with creative solutions. The implementation plan is well-structured and realistic. Consider adding more specific metrics for measuring success."
}
`;

      console.log('Prompt length:', prompt.length);
      console.log('Sending request to Gemini...');
      
      // Add timeout and retry logic
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000);
      });

      const generatePromise = model.generateContent(prompt);
      
      result = await Promise.race([generatePromise, timeoutPromise]);
      response = await result.response;
      text = response.text();
      
      console.log('Gemini response received successfully');
      console.log('Response length:', text.length);
      console.log('Response preview:', text.substring(0, 300));

    } catch (aiError) {
      console.error('=== AI Generation Error Details ===');
      console.error('Error name:', aiError.name);
      console.error('Error message:', aiError.message);
      console.error('Error stack:', aiError.stack);
      
      // Check for specific error types
      if (aiError.message?.includes('API_KEY')) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid API key", 
            details: "Please check your Gemini API key configuration" 
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiError.message?.includes('quota') || aiError.message?.includes('limit')) {
        return new Response(
          JSON.stringify({ 
            error: "API quota exceeded", 
            details: "Please check your Gemini API quota and billing" 
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiError.message?.includes('timeout')) {
        return new Response(
          JSON.stringify({ 
            error: "API timeout", 
            details: "The AI service took too long to respond. Please try again." 
          }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          error: "AI evaluation failed", 
          details: aiError.message,
          errorType: aiError.name
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let evaluation;
    try {
      // Clean the response text
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON within the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      console.log('Attempting to parse JSON:', cleanText);
      evaluation = JSON.parse(cleanText);
      console.log('JSON parsing successful:', evaluation);
      
      // Validate the evaluation object
      if (typeof evaluation.score !== 'number' || !evaluation.feedback) {
        throw new Error('Invalid evaluation format');
      }
      
    } catch (parseError) {
      console.log('JSON parsing failed, extracting manually');
      console.log('Parse error:', parseError.message);
      console.log('Raw text to parse:', text);
      
      // If JSON parsing fails, extract score and use text as feedback
      const scoreMatch = text.match(/(?:score|Score).*?(\d+)/);
      evaluation = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 75,
        feedback: text.replace(/```json|```/g, '').trim()
      };
      console.log('Manual extraction result:', evaluation);
    }

    // Ensure score is within valid range
    if (evaluation.score < 0 || evaluation.score > 100) {
      evaluation.score = Math.max(0, Math.min(100, evaluation.score));
    }

    // Ensure feedback exists
    if (!evaluation.feedback || evaluation.feedback.trim() === '') {
      evaluation.feedback = 'Evaluation completed successfully.';
    }

    console.log('Final evaluation:', evaluation);
    console.log('Updating submission in database...');

    // Update submission with evaluation
    const { error: updateError } = await supabase
      .from("case_submissions")
      .update({
        evaluated: true,
        score: evaluation.score,
        feedback: evaluation.feedback
      })
      .eq("id", submissionId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to save evaluation", 
          details: updateError.message 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Evaluation saved successfully');
    return new Response(
      JSON.stringify(evaluation), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("=== API Route Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        type: error.name
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}