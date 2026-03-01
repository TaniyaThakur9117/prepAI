// // app/api/chat/route.js
// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req) {
//   try {
//     const { messages } = await req.json();

//     // Validate input
//     if (!messages || !Array.isArray(messages)) {
//       return Response.json(
//         { error: "Messages array required" },
//         { status: 400 }
//       );
//     }

//     // Ensure no null message content
//     const cleanedMessages = messages
//       .filter(m => m?.content && typeof m.content === "string")
//       .map(m => ({
//         role: m.role || "user",
//         content: m.content.trim(),
//       }));

//     if (cleanedMessages.length === 0) {
//       return Response.json(
//         { error: "No valid message content provided" },
//         { status: 400 }
//       );
//     }

//     // OpenAI request
//     const completion = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: cleanedMessages,
//     });

//     return Response.json({
//       reply: completion.choices[0].message.content,
//     });
//   } catch (error) {
//     console.error("ERROR in /api/chat:", error);
//     return Response.json(
//       { error: error.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }




// app/api/chat/route.js

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY missing");
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return NextResponse.json(
        { error: "Groq API failed", details: err },
        { status: 500 }
      );
    }

    const data = await res.json();

    const reply =
      data?.choices?.[0]?.message?.content ?? "No response generated";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}