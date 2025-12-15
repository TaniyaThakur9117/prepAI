// // app/api/hr-simulate/analyze-response/route.js
// // Using Groq API (FREE & FAST)

// import { NextResponse } from 'next/server';
// import Groq from 'groq-sdk';

// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const audioFile = formData.get('audio');
//     const questionText = formData.get('question');

//     // Step 1: Transcribe with Groq Whisper (Super Fast!)
//     const transcription = await groq.audio.transcriptions.create({
//       file: audioFile,
//       model: 'whisper-large-v3',
//       language: 'en'
//     });

//     const transcribedText = transcription.text || '';

//     // Step 2: Analyze with Groq LLM (Llama 3.3 70B)
//     const completion = await groq.chat.completions.create({
//       model: 'llama-3.3-70b-versatile',
//       messages: [{
//         role: 'user',
//         content: `You are an expert HR interviewer analyzing candidate responses. 

// Evaluate the following response on three key dimensions:
// 1. **Confidence (1-10)**: Assess certainty, assertiveness, lack of filler words, and overall conviction
// 2. **Content (1-10)**: Evaluate relevance to the question, depth of answer, structure, use of examples, and completeness
// 3. **Clarity (1-10)**: Judge articulation, coherence, logical flow of ideas, and communication effectiveness

// Question: ${questionText}

// Candidate's Response: ${transcribedText}

// Provide a detailed analysis in this exact JSON format (respond ONLY with valid JSON, no other text):
// {
//   "confidence": {
//     "score": <number 1-10>,
//     "feedback": "<detailed feedback about confidence level>"
//   },
//   "content": {
//     "score": <number 1-10>,
//     "feedback": "<detailed feedback about content quality>"
//   },
//   "clarity": {
//     "score": <number 1-10>,
//     "feedback": "<detailed feedback about clarity>"
//   },
//   "overall_feedback": "<comprehensive summary of the response>",
//   "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
//   "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
// }

// Be specific, constructive, and provide actionable feedback.`
//       }],
//       temperature: 0.7,
//       max_tokens: 2000,
//       response_format: { type: 'json_object' }
//     });

//     const responseText = completion.choices[0].message.content;
    
//     // Parse JSON
//     let feedback;
//     try {
//       feedback = JSON.parse(responseText);
//     } catch (parseError) {
//       // Fallback: clean markdown if present
//       let cleanedText = responseText.trim();
//       if (cleanedText.startsWith('```json')) {
//         cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
//       } else if (cleanedText.startsWith('```')) {
//         cleanedText = cleanedText.replace(/```\n?/g, '');
//       }
//       feedback = JSON.parse(cleanedText);
//     }

//     return NextResponse.json({
//       transcription: transcribedText,
//       feedback: feedback,
//     });

//   } catch (error) {
//     console.error('Analysis error:', error);
//     return NextResponse.json(
//       { 
//         error: 'Failed to analyze response',
//         details: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }








// app/api/hr-simulate/analyze-response-enhanced/route.js
// Enhanced analysis incorporating facial metrics

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const questionText = formData.get('question');
    
    // Optional: receive aggregated facial metrics from frontend
    const facialMetricsJSON = formData.get('facialMetrics');
    let facialMetrics = null;
    
    if (facialMetricsJSON) {
      try {
        facialMetrics = JSON.parse(facialMetricsJSON);
      } catch (e) {
        console.log('Could not parse facial metrics');
      }
    }

    // Step 1: Transcribe with Groq Whisper
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en'
    });

    const transcribedText = transcription.text || '';

    // Step 2: Build enhanced prompt with facial data
    let facialContext = '';
    if (facialMetrics) {
      facialContext = `

**Facial Expression Analysis (during response):**
- Eye Contact Score: ${facialMetrics.avgEyeContact}/10
- Smile Intensity: ${facialMetrics.avgSmile}/10
- Head Pose: ${facialMetrics.dominantPose}
- Visual Confidence: ${facialMetrics.avgConfidence}/10

Use these facial metrics to enhance your confidence assessment. Strong eye contact and centered head pose indicate confidence. Smiling appropriately shows engagement.`;
    }

    // Step 3: Analyze with Groq LLM
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an expert HR interviewer analyzing a candidate's complete interview response, including both verbal and non-verbal cues.

Evaluate the following response on these dimensions:
1. **Confidence (1-10)**: Assess certainty, assertiveness, lack of filler words, body language, and eye contact
2. **Content (1-10)**: Evaluate relevance to the question, depth of answer, structure, use of examples, and completeness
3. **Clarity (1-10)**: Judge articulation, coherence, logical flow of ideas, and communication effectiveness

Question: ${questionText}

Candidate's Verbal Response: ${transcribedText}
${facialContext}

Provide a comprehensive analysis in this exact JSON format (respond ONLY with valid JSON, no other text):
{
  "confidence": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback incorporating both verbal and non-verbal confidence indicators>"
  },
  "content": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback about content quality>"
  },
  "clarity": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback about clarity and articulation>"
  },
  "overall_feedback": "<comprehensive summary including both verbal content and non-verbal presentation>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Be specific, constructive, and provide actionable feedback that addresses both what was said and how it was delivered.`
      }],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    
    // Parse JSON
    let feedback;
    try {
      feedback = JSON.parse(responseText);
    } catch (parseError) {
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      feedback = JSON.parse(cleanedText);
    }

    return NextResponse.json({
      transcription: transcribedText,
      feedback: feedback,
    });

  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}