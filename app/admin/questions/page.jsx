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






"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Plus, Trash2, RefreshCw, CheckCircle, Circle, Layers } from "lucide-react";

export default function AdminQuestionsPage() {
  const { user, isLoaded } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const userId = user?.id;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedForm, setSelectedForm] = useState("mcq");
  const [questionText, setQuestionText] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqCorrect, setMcqCorrect] = useState(1);
  const [mcqType, setMcqType] = useState("");

  const [textType, setTextType] = useState("");
  const [textCategory, setTextCategory] = useState("");

  const [hrQuestionText, setHrQuestionText] = useState("");
  const [hrCategory, setHrCategory] = useState("");
  const [hrDifficulty, setHrDifficulty] = useState("");

  const parseJSON = async (res) => {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON response:", text, err);
      throw new Error("Invalid JSON returned from server");
    }
  };

  const headersWithAuth = () => {
    return {
      "Content-Type": "application/json",
      "x-user-email": userEmail || "",
      "x-user-id": userId || ""
    };
  };

  const loadQuestions = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/questions-client", {
        method: "GET",
        headers: {
          "x-user-email": userEmail || "",
          "x-user-id": userId || ""
        }
      });

      const data = await parseJSON(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch questions");
      }

      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("loadQuestions error:", err);
      setError(err.message || "Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) loadQuestions();
  }, [isLoaded]);

  const resetAllFields = () => {
    setQuestionText("");
    setDifficulty("");
    setMcqOptions(["", "", "", ""]);
    setMcqCorrect(1);
    setMcqType("");
    setTextType("");
    setTextCategory("");
    setHrQuestionText("");
    setHrCategory("");
    setHrDifficulty("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) {
      setError("Clerk not loaded yet");
      return;
    }

    try {
      let payload = {};
      if (selectedForm === "hr") {
        if (!hrQuestionText.trim()) {
          setError("HR question text required");
          return;
        }
        payload = {
          is_hr: true,
          question_text: hrQuestionText.trim(),
          category: hrCategory || null,
          difficulty: hrDifficulty || null
        };
      } else if (selectedForm === "text") {
        if (!questionText.trim()) {
          setError("Question text required");
          return;
        }
        if (!textType) {
          setError("Please select text question type (Interview / EQ)");
          return;
        }
        payload = {
          question: questionText.trim(),
          type: textType,
          category: textCategory || null,
          difficulty: difficulty || null,
          is_text_question: true
        };
      } else if (selectedForm === "mcq") {
        if (!questionText.trim()) {
          setError("Question text required");
          return;
        }
        if (!mcqType) {
          setError("Please select MCQ type (aptitude / iq / technical)");
          return;
        }
        const opts = mcqOptions.map((o) => (typeof o === "string" ? o.trim() : o));
        if (opts.some((o) => !o)) {
          setError("All MCQ options are required");
          return;
        }
        if (!mcqCorrect || mcqCorrect < 1 || mcqCorrect > opts.length) {
          setError("Correct option must be between 1 and " + opts.length);
          return;
        }
        payload = {
          question: questionText.trim(),
          options: opts,
          correct_option: Number(mcqCorrect),
          type: mcqType
        };
      } else {
        setError("Please select a form type (MCQ / Text / HR)");
        return;
      }

      const res = await fetch("/api/admin/questions-client", {
        method: "POST",
        headers: headersWithAuth(),
        body: JSON.stringify(payload)
      });

      const data = await parseJSON(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to add question");
      }

      resetAllFields();
      await loadQuestions();
      alert("Question added ✓");
    } catch (err) {
      console.error("handleSubmit error:", err);
      setError(err.message || "Failed to add question");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setError("");

    try {
      const res = await fetch(`/api/admin/questions-client/${id}`, {
        method: "DELETE",
        headers: headersWithAuth()
      });

      const data = await parseJSON(res);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete question");
      }

      await loadQuestions();
      alert("Deleted ✓");
    } catch (err) {
      console.error("handleDelete error:", err);
      setError(err.message || "Failed to delete question");
    }
  };

  const renderOptions = (optionsField) => {
    if (!optionsField) return null;
    if (Array.isArray(optionsField)) {
      return optionsField;
    }
    try {
      const parsed = JSON.parse(optionsField);
      return Array.isArray(parsed) ? parsed : [String(optionsField)];
    } catch {
      return [String(optionsField)];
    }
  };

  const mcqList = questions.filter((q) => (q.table === "questions" || q.table === undefined) && ["aptitude", "iq", "technical"].includes(q.type));
  const textList = questions.filter((q) => (q.table === "questions" || q.table === undefined) && ["interview", "eq"].includes(q.type));
  const hrList = questions.filter((q) => q.table === "hr" || q.type === "hr");

  const getDifficultyColor = (diff) => {
    switch(diff?.toLowerCase()) {
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'aptitude': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'iq': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'technical': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'interview': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'eq': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'hr': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Question Management
            </h1>
          </div>
          <p className="text-slate-600 ml-14">Create and manage assessment questions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-3 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">!</span>
            </div>
            <span>{error}</span>
          </div>
        )}

        {/* Form Type Selector */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setSelectedForm("mcq")}
            className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden ${
              selectedForm === "mcq"
                ? "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-300 scale-105"
                : "bg-white text-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Multiple Choice</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedForm("text")}
            className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden ${
              selectedForm === "text"
                ? "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700 text-white shadow-2xl shadow-purple-300 scale-105"
                : "bg-white text-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-200 hover:border-purple-300"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Text Question</span>
            </div>
          </button>

          <button
            onClick={() => setSelectedForm("hr")}
            className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden ${
              selectedForm === "hr"
                ? "bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white shadow-2xl shadow-green-300 scale-105"
                : "bg-white text-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-200 hover:border-green-300"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>HR Question</span>
            </div>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-800">Add New Question</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* MCQ Form */}
            {selectedForm === "mcq" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question *</label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mcqOptions.map((opt, idx) => (
                    <div key={idx} className="relative">
                      <input
                        value={opt}
                        onChange={(e) => {
                          const arr = [...mcqOptions];
                          arr[idx] = e.target.value;
                          setMcqOptions(arr);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="w-full p-4 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Correct Option *</label>
                    <input
                      type="number"
                      min="1"
                      max="4"
                      value={mcqCorrect}
                      onChange={(e) => setMcqCorrect(Number(e.target.value))}
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                    <select 
                      value={mcqType} 
                      onChange={(e) => setMcqType(e.target.value)} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="aptitude">Aptitude</option>
                      <option value="iq">IQ</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Text Form */}
            {selectedForm === "text" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question *</label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                    <select 
                      value={textType} 
                      onChange={(e) => setTextType(e.target.value)} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="interview">Interview</option>
                      <option value="eq">EQ</option>
                    </select>
                  </div>

                  {textType === "interview" && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                      <input 
                        value={textCategory} 
                        onChange={(e) => setTextCategory(e.target.value)} 
                        placeholder="e.g., behavioral, technical" 
                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                    <select 
                      value={difficulty} 
                      onChange={(e) => setDifficulty(e.target.value)} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* HR Form */}
            {selectedForm === "hr" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text *</label>
                  <textarea
                    value={hrQuestionText}
                    onChange={(e) => setHrQuestionText(e.target.value)}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Enter your HR question here..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <input 
                      value={hrCategory} 
                      onChange={(e) => setHrCategory(e.target.value)} 
                      placeholder="e.g., communication" 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                    <select 
                      value={hrDifficulty} 
                      onChange={(e) => setHrDifficulty(e.target.value)} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Question
              </button>
            </div>
          </form>
        </div>

        {/* Questions Lists */}
        <div className="space-y-6">
          {/* MCQ Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 flex items-center justify-between border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Multiple Choice Questions</h3>
                <p className="text-sm text-slate-600 mt-1">{mcqList.length} questions</p>
              </div>
              <button 
                onClick={loadQuestions} 
                className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : mcqList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No MCQ questions found</div>
              ) : (
                <div className="space-y-4">
                  {mcqList.map((q) => {
                    const opts = renderOptions(q.options);
                    return (
                      <div key={q.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(q.type)}`}>
                                {q.type?.toUpperCase() || "MCQ"}
                              </span>
                              {q.difficulty && (
                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(q.difficulty)}`}>
                                  {q.difficulty.toUpperCase()}
                                </span>
                              )}
                            </div>
                            
                            <div className="font-semibold text-slate-800 mb-4 text-lg">{q.question}</div>

                            {opts && (
                              <div className="grid md:grid-cols-2 gap-3">
                                {opts.map((opt, i) => (
                                  <div 
                                    key={i} 
                                    className={`p-3 rounded-lg border-2 flex items-start gap-2 transition-all ${
                                      Number(q.correct_option) === i+1 
                                        ? "bg-emerald-50 border-emerald-400" 
                                        : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    {Number(q.correct_option) === i+1 ? (
                                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                                    )}
                                    <span className="text-sm text-slate-700">
                                      <span className="font-semibold">{i+1})</span> {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => handleDelete(q.id)} 
                            className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 hover:border-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Text Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-8 py-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Text Questions</h3>
              <p className="text-sm text-slate-600 mt-1">{textList.length} questions</p>
            </div>

            <div className="p-6">
              {textList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No text questions found</div>
              ) : (
                <div className="space-y-4">
                  {textList.map((q) => (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(q.type)}`}>
                              {q.type?.toUpperCase() || "TEXT"}
                            </span>
                            {q.difficulty && (
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-800 text-lg">{q.question}</div>
                        </div>

                        <button 
                          onClick={() => handleDelete(q.id)} 
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* HR Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">HR Questions</h3>
              <p className="text-sm text-slate-600 mt-1">{hrList.length} questions</p>
            </div>

            <div className="p-6">
              {hrList.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No HR questions found</div>
              ) : (
                <div className="space-y-4">
                  {hrList.map((q) => (
                    <div key={q.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all bg-gradient-to-br from-white to-slate-50">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getTypeColor('hr')}`}>
                              HR
                            </span>
                            {q.difficulty && (
                              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty.toUpperCase()}
                              </span>
                            )}
                            {q.category && (
                              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {q.category}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-800 text-lg">{q.question_text}</div>
                        </div>

                        <button 
                          onClick={() => handleDelete(q.id)} 
                          className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all border border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}