// "use client";

// // Save answer
// export async function saveAttempt(round, questionId, answer, isCorrect, score = 0) {
//   try {
//     // Get authentication token/key (adjust based on your auth method)
//     const authHeaders = {};
    
//     // Option 1: If using session/cookies (most common for Next.js)
//     // No additional headers needed - cookies are sent automatically
    
//     // Option 2: If using API key from environment
//     // authHeaders['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;
    
//     // Option 3: If using bearer token from localStorage/session
//     // const token = localStorage.getItem('authToken'); // Note: localStorage not available in Claude artifacts
//     // if (token) authHeaders['Authorization'] = `Bearer ${token}`;

//     const res = await fetch("/api/attempts", {
//       method: "POST",
//       headers: { 
//         "Content-Type": "application/json",
//         ...authHeaders
//       },
//       body: JSON.stringify({
//         round_type: round,
//         question_id: questionId,
//         submission: answer,
//         is_correct: isCorrect,
//         score: score,
//       }),
//       credentials: 'include' // Include cookies for authentication
//     });

//     // Check if the response is ok
//     if (!res.ok) {
//       const errorData = await res.text();
//       console.error("❌ API Error Response:", errorData);
//       throw new Error(`Failed to save attempt: ${res.status} ${errorData}`);
//     }

//     const data = await res.json();
//     return data;
//   } catch (err) {
//     console.error("❌ Save attempt failed:", err);
//     return null;
//   }
// }

// // Submit test
// export async function submitAttempts() {
//   try {
//     const res = await fetch("/api/attempts", { 
//       method: "PUT",
//       credentials: 'include' // Include cookies for authentication
//     });
    
//     // Check if the response is ok
//     if (!res.ok) {
//       const errorData = await res.text();
//       throw new Error(`HTTP ${res.status}: ${errorData}`);
//     }

//     const data = await res.json();
//     return data;
//   } catch (err) {
//     console.error("❌ Submit attempts failed:", err);
//     return null;
//   }
// }

//lib\saveAttempt.js
"use client";

// Save answer
export async function saveAttempt(round, questionId, answer, isCorrect, score = 0) {
  try {
    // Get authentication token/key (adjust based on your auth method)
    const authHeaders = {};
    
    // Option 1: If using session/cookies (most common for Next.js)
    // No additional headers needed - cookies are sent automatically
    
    // Option 2: If using API key from environment
    // authHeaders['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY;
    
    // Option 3: If using bearer token from localStorage/session
    // const token = localStorage.getItem('authToken'); // Note: localStorage not available in Claude artifacts
    // if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({
        round_type: round,
        question_id: questionId,
        submission: answer,
        is_correct: isCorrect,
        score: score,
      }),
      credentials: 'include' // Include cookies for authentication
    });

    // Check if the response is ok
    if (!res.ok) {
      const errorData = await res.text();
      console.error("❌ API Error Response:", errorData);
      throw new Error(`Failed to save attempt: ${res.status} ${errorData}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Save attempt failed:", err);
    return null;
  }
}

// Submit test
export async function submitAttempts() {
  try {
    const res = await fetch("/api/attempts", { 
      method: "PUT",
      credentials: 'include' // Include cookies for authentication
    });
    
    // Check if the response is ok
    if (!res.ok) {
      const errorData = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorData}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("❌ Submit attempts failed:", err);
    return null;
  }
}