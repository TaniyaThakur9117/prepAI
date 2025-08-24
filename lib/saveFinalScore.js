//lib\saveFinalScore.js
export async function saveFinalScore(round, totalScore) {
  try {
    const res = await fetch("/api/final-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If using Clerk, also send userId from frontend
        "x-clerk-user-id": window.Clerk?.user?.id || ""
      },
      body: JSON.stringify({
        round_type: round,
        total_score: totalScore,
      }),
    });

    return await res.json();
  } catch (err) {
    console.error("Save Final Score Error:", err);
    return null;
  }
}