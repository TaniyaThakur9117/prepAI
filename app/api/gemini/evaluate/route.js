import { NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import pool from "@/lib/db";

function guessMimeFromUrl(url = "") {
  const u = url.toLowerCase();
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".mov")) return "video/quicktime";
  if (u.endsWith(".mp3")) return "audio/mpeg";
  if (u.endsWith(".wav")) return "audio/wav";
  if (u.endsWith(".m4a")) return "audio/mp4";
  return "application/octet-stream";
}

export async function POST(req) {
  try {
    const payload = await req.json();
    const {
      evaluationType,     // 'gd' | 'hr'
      transcript,         // string (GD chat transcript) OR HR answer text
      mediaUrl,           // optional audio/video
      targetId            // gd_session.id (for GD) or hr_answers.id (for HR)
    } = payload;

    if (!evaluationType || !targetId) {
      return NextResponse.json({ error: "evaluationType and targetId are required" }, { status: 400 });
    }

    // Build the rubric prompt
    const rubric = `
You are an interviewer/evaluator. Score on:
1) Body language (only if media provided; else return "not_applicable").
2) Response tone (confidence, clarity, empathy).
3) Relevance (does the answer address the prompt? use concise evidence).
Return JSON with keys: body_language, tone, relevance, overall_score (0-100), and feedback (short paragraph with actionable tips).
Use bullet-like sentences in feedback.
`;

    // Parts for Gemini (text + optional media)
    const parts = [];
    if (mediaUrl) {
      // Download media bytes (small files recommended, e.g., < 25–30MB)
      const res = await fetch(mediaUrl);
      if (!res.ok) throw new Error("Unable to fetch media from storage URL");
      const buf = Buffer.from(await res.arrayBuffer());
      const b64 = buf.toString("base64");
      parts.push({
        inlineData: { data: b64, mimeType: guessMimeFromUrl(mediaUrl) },
      });
    }

    // Provide context text
    const textContext =
      evaluationType === "gd"
        ? `Evaluate this Group Discussion transcript:\n\n${transcript || "(no transcript)"}`
        : `Evaluate this HR interview answer:\n\n${transcript || "(no answer text)"}`
    ;

    parts.push({ text: `${rubric}\n\n${textContext}` });

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const raw = result.response?.text?.() ?? "";
    // Try parse JSON; fall back to wrapping
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Extract JSON block if model wrapped it
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {
        body_language: mediaUrl ? { score: 0, notes: "Could not parse." } : "not_applicable",
        tone: { score: 0, notes: "Could not parse." },
        relevance: { score: 0, notes: "Could not parse." },
        overall_score: 0,
        feedback: raw.slice(0, 500)
      };
    }

    // Persist evaluation
    const insert = `
      INSERT INTO evaluations (target_type, target_id, model_name, body_language, tone, relevance, overall_score, feedback)
      VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7,$8)
      RETURNING id
    `;
    const values = [
      evaluationType,
      targetId,
      "gemini-1.5-pro",
      JSON.stringify(parsed.body_language ?? (mediaUrl ? {} : "not_applicable")),
      JSON.stringify(parsed.tone ?? {}),
      JSON.stringify(parsed.relevance ?? {}),
      Number(parsed.overall_score ?? 0),
      String(parsed.feedback ?? "")
    ];

    const { rows } = await pool.query(insert, values);

    return NextResponse.json({ ok: true, evaluationId: rows[0].id, result: parsed });
  } catch (err) {
    console.error("Gemini evaluation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
