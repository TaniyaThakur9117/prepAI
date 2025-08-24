// export async function submitAttempts(attempt) {
//   try {
//     const res = await fetch("/api/attempts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(attempt),
//     });

//     if (!res.ok) {
//       console.error("❌ HTTP error:", res.status);
//       return null;
//     }

//     const data = await res.json();
//     if (!data.success) {
//       console.error("❌ Submit attempts failed:", data.error);
//       return null;

//     }

//     console.log("✅ Attempt stored:", data.attempt);
//     return data.attempt;
//   } catch (err) {
//     console.error("❌ Submit attempts error:", err);
//     return null;
//   }
// }


"use client";

// Save answer
export async function saveAttempt(round, questionId, answer, isCorrect) {
  try {
    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ round, questionId, answer, isCorrect }),
    });
    return await res.json();
  } catch (err) {
    console.error("❌ Save attempt failed:", err);
  }
}

// Submit test
export async function submitAttempts() {
  try {
    const res = await fetch("/api/attempts", { method: "PUT" });
    return await res.json();
  } catch (err) {
    console.error("❌ Submit attempts failed:", err);
  }
}
