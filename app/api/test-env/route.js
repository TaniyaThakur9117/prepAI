// app/api/test-env/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    has_judge0_key: !!process.env.JUDGE0_API_KEY,
    has_rapidapi_key: !!process.env.RAPIDAPI_KEY,
    judge0_key_length: process.env.JUDGE0_API_KEY?.length || 0,
    judge0_key_preview: process.env.JUDGE0_API_KEY ? 
      process.env.JUDGE0_API_KEY.substring(0, 10) + '...' : 'NOT FOUND',
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('JUDGE') || key.includes('RAPID')
    )
  });
}