// app/api/hr-simulate/analyze-chunk/route.js
// Using Groq API (FREE & FAST)

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || audioFile.size < 1000) {
      return NextResponse.json({ 
        metrics: {
          confidence: 0,
          clarity: 0,
          pacing: 'Analyzing...',
          fillerWordsCount: 0
        }
      });
    }

    // Transcribe with Groq Whisper (Super Fast!)
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: 'en'
    });

    const text = transcription.text || '';
    const wordCount = text.split(' ').length;
    
    // Count filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of'];
    const fillerWordsCount = fillerWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return count + (text.match(regex) || []).length;
    }, 0);

    // Calculate real-time metrics
    const confidence = Math.max(1, Math.min(10, 8 - fillerWordsCount));
    const clarity = Math.max(1, Math.min(10, 9 - (fillerWordsCount / Math.max(wordCount, 1)) * 50));
    
    // Pacing analysis
    let pacing = 'Good';
    if (wordCount > 50) pacing = 'Too Fast';
    else if (wordCount < 10) pacing = 'Too Slow';

    return NextResponse.json({
      metrics: {
        confidence: Math.round(confidence),
        clarity: Math.round(clarity),
        pacing,
        fillerWordsCount
      }
    });

  } catch (error) {
    console.error('Chunk analysis error:', error);
    return NextResponse.json({
      metrics: {
        confidence: 0,
        clarity: 0,
        pacing: 'Error',
        fillerWordsCount: 0
      }
    });
  }
}
