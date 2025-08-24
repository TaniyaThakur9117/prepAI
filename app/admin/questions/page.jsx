// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";

// export default function AdminQuestionsPage() {
//   const { user, isLoaded } = useUser();
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Define your admin email(s) from environment variable
//   const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];

//   const isAdmin = user?.primaryEmailAddress?.emailAddress &&
//                   adminEmails.includes(user.primaryEmailAddress.emailAddress.toLowerCase());

//   const loadQuestions = async () => {
//     if (!isAdmin) return;
    
//     setLoading(true);
//     setError("");
    
//     try {
//       console.log("Loading questions with client auth...");
      
//       const res = await fetch("/api/admin/questions-client", {
//         headers: {
//           "x-user-email": user.primaryEmailAddress?.emailAddress || "",
//           "x-user-id": user.id || "",
//         }
//       });
      
//       console.log("Response status:", res.status);
//       console.log("Response headers:", res.headers.get('content-type'));
      
//       // Get the raw response text first
//       const responseText = await res.text();
//       console.log("Raw response:", responseText);
      
//       if (!res.ok) {
//         // Try to parse as JSON if possible, otherwise use the text
//         let errorMessage;
//         try {
//           const errorData = JSON.parse(responseText);
//           errorMessage = errorData.error || `HTTP ${res.status}`;
//         } catch {
//           errorMessage = responseText || `HTTP ${res.status}`;
//         }
//         throw new Error(errorMessage);
//       }
      
//       // Try to parse the response as JSON
//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error("JSON parse error:", parseError);
//         console.error("Response that failed to parse:", responseText);
//         throw new Error("Invalid JSON response from server");
//       }
      
//       console.log("Questions loaded:", data?.length || 0);
//       setQuestions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Failed to load questions:", err);
//       setError(`Failed to load questions: ${err.message}`);
//       setQuestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isLoaded && isAdmin) {
//       loadQuestions();
//     }
//   }, [isLoaded, isAdmin]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
    
//     const form = new FormData(e.target);
    
//     try {
//       const payload = {
//         question: form.get("question"),
//         options: [
//           form.get("option1"),
//           form.get("option2"),
//           form.get("option3"),
//           form.get("option4"),
//         ],
//         correct_option: parseInt(form.get("correct_option")),
//         type: form.get("type"),
//       };

//       // Client-side validation
//       if (!payload.question || !payload.type) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       if (payload.options.some(opt => !opt)) {
//         setError("Please fill in all 4 options");
//         return;
//       }

//       if (isNaN(payload.correct_option) || payload.correct_option < 1 || payload.correct_option > 4) {
//         setError("Correct option must be a number between 1 and 4");
//         return;
//       }

//       console.log("Submitting question with payload:", payload);

//       const res = await fetch("/api/admin/questions-client", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "x-user-email": user.primaryEmailAddress?.emailAddress || "",
//           "x-user-id": user.id || "",
//         },
//         body: JSON.stringify(payload),
//       });

//       console.log("Submit response status:", res.status);
      
//       // Get raw response text first
//       const responseText = await res.text();
//       console.log("Submit raw response:", responseText);
      
//       // Try to parse as JSON
//       let data;
//       try {
//         data = JSON.parse(responseText);
//       } catch (parseError) {
//         console.error("JSON parse error:", parseError);
//         throw new Error("Invalid response from server");
//       }
      
//       console.log("Submit response data:", data);

//       if (!res.ok) {
//         throw new Error(data.error || "Failed to add question");
//       }

//       alert("✅ Question added successfully!");
//       e.target.reset(); // Clear form
//       await loadQuestions(); // Reload questions
//     } catch (err) {
//       console.error("Error adding question:", err);
//       setError(`Failed to add question: ${err.message}`);
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <div className="p-6">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="p-6">
//         <p>You must be signed in.</p>
//       </div>
//     );
//   }

//   if (!isAdmin) {
//     return (
//       <div className="p-6">
//         <p>🚫 Forbidden — Admins only</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Admin — Manage Questions</h1>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add Question Form */}
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Question *</label>
//             <textarea 
//               name="question" 
//               placeholder="Enter the question..."
//               className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//               rows="3"
//               required 
//             />
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Option 1 *</label>
//               <input 
//                 name="option1" 
//                 placeholder="Option 1" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Option 2 *</label>
//               <input 
//                 name="option2" 
//                 placeholder="Option 2" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Option 3 *</label>
//               <input 
//                 name="option3" 
//                 placeholder="Option 3" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required 
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Option 4 *</label>
//               <input 
//                 name="option4" 
//                 placeholder="Option 4" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required 
//               />
//             </div>
//           </div>

//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Correct Option (1-4) *</label>
//               <select 
//                 name="correct_option" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required
//               >
//                 <option value="">Select correct option</option>
//                 <option value="1">1</option>
//                 <option value="2">2</option>
//                 <option value="3">3</option>
//                 <option value="4">4</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Question Type *</label>
//               <select 
//                 name="type" 
//                 className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
//                 required
//               >
//                 <option value="">Select type</option>
//                 <option value="aptitude">Aptitude</option>
//                 <option value="iq">IQ</option>
//                 <option value="technical">Technical</option>
                
//               </select>
//             </div>
//           </div>

//           <button 
//             type="submit" 
//             className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-md transition-colors"
//           >
//             Add Question
//           </button>
//         </form>
//       </div>

//       {/* List Questions */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-semibold">Existing Questions ({questions.length})</h2>
//           <button
//             onClick={loadQuestions}
//             disabled={loading}
//             className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
//           >
//             {loading ? "Loading..." : "Reload"}
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
//             <p>Loading questions...</p>
//           </div>
//         ) : questions.length === 0 ? (
//           <div className="text-gray-500 text-center py-8">
//             No questions found. Add your first question above!
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {questions.map((q) => (
//               <div key={q.id} className="border border-gray-200 rounded p-4">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <p className="font-medium mb-2">{q.question}</p>
//                     <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
//                       {q.options && q.options.map((option, index) => (
//                         <div 
//                           key={index} 
//                           className={`${index + 1 === q.correct_option ? 'text-green-600 font-medium' : ''}`}
//                         >
//                           {index + 1}. {option} {index + 1 === q.correct_option && '✓'}
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex items-center space-x-4 text-xs text-gray-500">
//                       <span>Type: {q.type}</span>
//                       <span>ID: {q.id}</span>
//                       {q.created_at && (
//                         <span>Created: {new Date(q.created_at).toLocaleDateString()}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// //app\admin\questions\page.jsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function AdminQuestionsPage() {
  const { user, isLoaded } = useUser();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questionType, setQuestionType] = useState("mcq"); // 'mcq' or 'text'

  // Define your admin email(s) from environment variable
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];

  const isAdmin = user?.primaryEmailAddress?.emailAddress &&
                  adminEmails.includes(user.primaryEmailAddress.emailAddress.toLowerCase());

  const loadQuestions = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log("Loading questions with client auth...");
      
      const res = await fetch("/api/admin/questions-client", {
        headers: {
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
          "x-user-id": user.id || "",
        }
      });
      
      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get('content-type'));
      
      const responseText = await res.text();
      console.log("Raw response:", responseText);
      
      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || `HTTP ${res.status}`;
        } catch {
          errorMessage = responseText || `HTTP ${res.status}`;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response that failed to parse:", responseText);
        throw new Error("Invalid JSON response from server");
      }
      
      console.log("Questions loaded:", data?.length || 0);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError(`Failed to load questions: ${err.message}`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isAdmin) {
      loadQuestions();
    }
  }, [isLoaded, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const form = new FormData(e.target);
    
    try {
      let payload;
      
      // Determine if we're working with a text question
      const isTextQuestion = questionType === "text";
      
      if (isTextQuestion) {
        // Text Question payload (Interview/EQ) - Format as MCQ with dummy options
        payload = {
          question: form.get("question"),
          options: ["N/A", "N/A", "N/A", "N/A"], // Dummy options for text questions
          correct_option: 1, // Default to first option
          type: form.get("type"),
          category: form.get("category") || null,
          difficulty: form.get("difficulty") || null,
          is_text_question: true, // Flag to identify text questions
        };

        // Client-side validation for text questions
        if (!payload.question || !payload.type) {
          setError("Please fill in all required fields");
          return;
        }
      } else {
        // MCQ Question payload
        payload = {
          question: form.get("question"),
          options: [
            form.get("option1"),
            form.get("option2"),
            form.get("option3"),
            form.get("option4"),
          ],
          correct_option: parseInt(form.get("correct_option")),
          type: form.get("type"),
        };

        // Client-side validation for MCQ
        if (!payload.question || !payload.type) {
          setError("Please fill in all required fields");
          return;
        }

        if (payload.options.some(opt => !opt)) {
          setError("Please fill in all 4 options");
          return;
        }

        if (isNaN(payload.correct_option) || payload.correct_option < 1 || payload.correct_option > 4) {
          setError("Correct option must be a number between 1 and 4");
          return;
        }
      }

      console.log("Submitting question with payload:", payload);

      const res = await fetch("/api/admin/questions-client", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
          "x-user-id": user.id || "",
        },
        body: JSON.stringify(payload),
      });

      console.log("Submit response status:", res.status);
      
      const responseText = await res.text();
      console.log("Submit raw response:", responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Invalid response from server");
      }
      
      console.log("Submit response data:", data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to add question");
      }

      alert("✅ Question added successfully!");
      e.target.reset();
      await loadQuestions();
    } catch (err) {
      console.error("Error with question:", err);
      setError(`Failed to add question: ${err.message}`);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/questions-client/${questionId}`, {
        method: "DELETE",
        headers: {
          "x-user-email": user.primaryEmailAddress?.emailAddress || "",
          "x-user-id": user.id || "",
        },
      });

      console.log("Delete response status:", res.status);
      console.log("Delete response headers:", res.headers.get('content-type'));

      const responseText = await res.text();
      console.log("Delete raw response:", responseText);

      // Check if response is successful first
      if (!res.ok) {
        // Try to parse error message if response has content
        let errorMessage = `HTTP ${res.status}`;
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = responseText || errorMessage;
          }
        }
        throw new Error(errorMessage);
      }

      // For successful deletes, the server might return empty response or JSON
      // Don't require JSON parsing for successful deletes
      let data = {};
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          // If parsing fails but status is OK, assume success
          console.log("Response is not JSON, but delete was successful");
        }
      }

      alert("✅ Question deleted successfully!");
      await loadQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(`Failed to delete question: ${err.message}`);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <p className="text-gray-600 text-lg">You must be signed in.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-gray-600 text-lg font-medium">Forbidden — Admins only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage Questions - Add and Delete</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <span className="text-xl mr-3">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Question Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Question</h2>
          
          {/* Question Type Selector */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setQuestionType("mcq")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                questionType === "mcq"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Multiple Choice (MCQ)
            </button>
            <button
              type="button"
              onClick={() => setQuestionType("text")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                questionType === "text"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Text Question (Interview/EQ)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question *</label>
              <textarea 
                name="question" 
                placeholder="Enter the question..."
                className="w-full border-2 border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none" 
                rows="3"
                required 
              />
            </div>

            {/* MCQ Options */}
            {questionType === "mcq" && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Option 1 *</label>
                    <input 
                      name="option1" 
                      placeholder="Option 1" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Option 2 *</label>
                    <input 
                      name="option2" 
                      placeholder="Option 2" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Option 3 *</label>
                    <input 
                      name="option3" 
                      placeholder="Option 3" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Option 4 *</label>
                    <input 
                      name="option4" 
                      placeholder="Option 4" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Option (1-4) *</label>
                    <select 
                      name="correct_option" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required
                    >
                      <option value="">Select correct option</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type *</label>
                    <select 
                      name="type" 
                      className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                      required
                    >
                      <option value="">Select type</option>
                      <option value="aptitude">Aptitude</option>
                      <option value="iq">IQ</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Text Question Fields */}
            {questionType === "text" && (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type *</label>
                  <select 
                    name="type" 
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                    required
                  >
                    <option value="">Select type</option>
                    <option value="interview">Interview</option>
                    <option value="eq">Emotional Intelligence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <input 
                    name="category" 
                    placeholder="e.g., Behavioral, Technical" 
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select 
                    name="difficulty" 
                    className="w-full border-2 border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Add Question
              </button>
            </div>
          </form>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Questions ({questions.length})
            </h2>
            <button
              onClick={loadQuestions}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No questions found. Add your first question above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => {
                // Check if this is a text question
                const isTextQuestion = q.is_text_question || 
                                      q.type === "interview" ||
                                      q.type === "eq" ||
                                      (q.options && q.options.every(opt => opt === "N/A"));
                
                return (
                  <div key={q.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <p className="font-semibold text-gray-800 mb-3 text-lg">{q.question}</p>
                        
                        {/* Only show options for MCQ questions */}
                        {!isTextQuestion && q.options && (
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                            {q.options.map((option, index) => (
                              <div 
                                key={index} 
                                className={`p-2 rounded-lg ${
                                  index + 1 === q.correct_option 
                                    ? 'bg-green-50 text-green-700 font-medium border border-green-200' 
                                    : 'bg-gray-50'
                                }`}
                              >
                                {index + 1}. {option} {index + 1 === q.correct_option && '✅'}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {q.type}
                          </span>
                          {q.category && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {q.category}
                            </span>
                          )}
                          {q.difficulty && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              q.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {q.difficulty}
                            </span>
                          )}
                          <span className="text-gray-500">ID: {q.id}</span>
                          {q.created_at && (
                            <span className="text-gray-500">
                              Created: {new Date(q.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}// //app\admin\questions\page.jsx