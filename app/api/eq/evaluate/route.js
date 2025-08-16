import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { answers } = await req.json();

    // Combine all answers into one text
    const answerText = Object.values(answers).join("\n");

    // Model name (remove extra space)
    const modelName = "gemini-1.5-flash-latest";

    // API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in .env.local");
    }

    // Call Gemini API
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
                  text: `You are an expert in emotional intelligence assessment. 
Evaluate the following answers carefully and provide concise, constructive feedback for improvement:\n${answerText}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await res.json();

    console.log("Gemini API raw response:", JSON.stringify(data, null, 2));

    let feedback =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("\n")
        ?.trim() || null;

    if (!feedback) {
      feedback = data?.error?.message
        ? `Error from Gemini API: ${data.error.message}`
        : "No feedback received from Gemini.";
    }

    return NextResponse.json({ result: feedback });
  } catch (error) {
    console.error("Error in EQ evaluation route:", error);
    return NextResponse.json(
      { result: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}