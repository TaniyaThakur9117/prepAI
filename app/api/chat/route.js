// // app/api/chat/route.js
// import OpenAI from "openai";

// export async function POST(req) {
//   // protect this route with auth (Clerk) or a token if needed
//   const body = await req.json();
//   const { messages, stream = true } = body; // messages: [{role:'user'|'assistant'|'system', content:''}, ...]
//   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//   // Use the Responses API for flexible chat; this example streams text output.
//   if (stream) {
//     const response = await openai.responses.stream({
//       model: "gpt-4o-mini", // choose appropriate model
//       input: messages
//     });

//     // The SDK provides a ReadableStream in response.body; we can forward it
//     return new Response(response.body, {
//       headers: { "Content-Type": "text/event-stream" },
//     });
//   } else {
//     const response = await openai.responses.create({
//       model: "gpt-4o-mini",
//       input: messages
//     });
//     return new Response(JSON.stringify(response), { status: 200 });
//   }
// }

// app/api/chat/route.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    // Ensure no null message content
    const cleanedMessages = messages
      .filter(m => m?.content && typeof m.content === "string")
      .map(m => ({
        role: m.role || "user",
        content: m.content.trim(),
      }));

    if (cleanedMessages.length === 0) {
      return Response.json(
        { error: "No valid message content provided" },
        { status: 400 }
      );
    }

    // OpenAI request
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: cleanedMessages,
    });

    return Response.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("ERROR in /api/chat:", error);
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
