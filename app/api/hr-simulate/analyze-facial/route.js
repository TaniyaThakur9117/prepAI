// app/api/hr-simulate/analyze-facial/route.js
// Facial expression analysis using Groq Vision

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ 
        metrics: {
          eyeContact: 0,
          smileIntensity: 0,
          headPose: 'No image',
          overallConfidence: 0
        }
      });
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Analyze facial expression with Groq Vision
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
            {
              type: 'text',
              text: `Analyze this person's facial expression for an interview context. Evaluate:

1. **Eye Contact (1-10)**: Are they looking at the camera? Direct gaze = high score. Looking away/down = low score.
2. **Smile Intensity (1-10)**: Rate their smile. Genuine smile = 8-10, slight smile = 5-7, neutral = 3-4, frown = 1-2.
3. **Head Pose**: Classify as "Centered", "Tilted Left", "Tilted Right", "Looking Down", or "Looking Away".
4. **Overall Confidence (1-10)**: Based on facial cues (eye contact, expression, posture visible), rate their confidence level.

Respond ONLY with valid JSON in this exact format (no other text):
{
  "eyeContact": <number 1-10>,
  "smileIntensity": <number 1-10>,
  "headPose": "<one of: Centered, Tilted Left, Tilted Right, Looking Down, Looking Away>",
  "overallConfidence": <number 1-10>
}`
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    
    // Parse JSON
    let metrics;
    try {
      metrics = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback: clean markdown if present
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      metrics = JSON.parse(cleanedText);
    }

    // Ensure all values are within bounds
    return NextResponse.json({
      metrics: {
        eyeContact: Math.max(1, Math.min(10, metrics.eyeContact || 5)),
        smileIntensity: Math.max(1, Math.min(10, metrics.smileIntensity || 5)),
        headPose: metrics.headPose || 'Analyzing...',
        overallConfidence: Math.max(1, Math.min(10, metrics.overallConfidence || 5))
      }
    });

  } catch (error) {
    console.error('Facial analysis error:', error);
    return NextResponse.json({
      metrics: {
        eyeContact: 0,
        smileIntensity: 0,
        headPose: 'Error',
        overallConfidence: 0
      }
    });
  }
}