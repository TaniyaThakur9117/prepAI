// //app/case-study/CaseSubmissionForm.jsx
// "use client";

// import { useState, useEffect } from "react";
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { Upload, FileText, Send, AlertCircle, CheckCircle, Loader2, BookOpen, User } from 'lucide-react';

// export default function CaseSubmissionForm({ caseId, userId, userEmail, userName }) {
//   const [text, setText] = useState("");
//   const [file, setFile] = useState(null);
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [messageType, setMessageType] = useState("");
//   const [dragOver, setDragOver] = useState(false);
//   const [caseStudy, setCaseStudy] = useState(null);
//   const [evaluation, setEvaluation] = useState(null);
//   const [existingSubmission, setExistingSubmission] = useState(null);

//   const supabase = createClientComponentClient();

//   // Fetch case study details and check for existing submission
//   useEffect(() => {
//     const fetchData = async () => {
//       // Fetch case study
//       const { data: caseData, error: caseError } = await supabase
//         .from('case_studies')
//         .select('*')
//         .eq('id', caseId)
//         .single();
      
//       if (caseData) setCaseStudy(caseData);
//       if (caseError) console.error('Error fetching case study:', caseError);

//       // Check for existing submission
//       const { data: submissionData, error: submissionError } = await supabase
//         .from('case_submissions')
//         .select('*')
//         .eq('case_id', caseId)
//         .eq('clerk_id', userId)
//         .order('created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (submissionData) {
//         setExistingSubmission(submissionData);
//         // If there's an existing submission with evaluation, show it
//         if (submissionData.evaluated && submissionData.score !== null) {
//           setEvaluation({
//             score: submissionData.score,
//             feedback: submissionData.feedback
//           });
//         }
//       }
//     };

//     if (caseId && userId) fetchData();
//   }, [caseId, userId, supabase]);

//   const handleSubmit = async () => {
//     if (!text.trim() && !file) {
//       setMessage("Please provide either text submission or upload a file.");
//       setMessageType("error");
//       return;
//     }

//     setIsLoading(true);
//     setMessage("Submitting your solution...");
//     setMessageType("info");
//     setEvaluation(null);

//     try {
//       let fileUrl = null;

//       // Upload file if exists
//       if (file) {
//         const ext = file.name.split(".").pop();
//         const fileName = `${userId}_${Date.now()}.${ext}`;

//         const { data: uploadData, error: uploadError } = await supabase.storage
//           .from("case-submissions")
//           .upload(fileName, file, {
//             cacheControl: '3600',
//             upsert: false
//           });

//         if (uploadError) {
//           console.error("Upload error:", uploadError);
//           setMessage("File upload failed: " + uploadError.message);
//           setMessageType("error");
//           setIsLoading(false);
//           return;
//         }

//         // Get public URL
//         const { data: { publicUrl } } = supabase.storage
//           .from("case-submissions")
//           .getPublicUrl(fileName);
        
//         fileUrl = publicUrl;
//       }

//       // Insert submission with Clerk user ID
//       const { data: submissionData, error: submissionError } = await supabase
//         .from("case_submissions")
//         .insert({
//           case_id: caseId,
//           clerk_id: userId, // Using actual Clerk user ID
//           submission_text: text.trim() || null,
//           submission_file_url: fileUrl
//         })
//         .select()
//         .single();

//       if (submissionError) {
//         console.error("Submission error:", submissionError);
//         setMessage("Submission failed: " + submissionError.message);
//         setMessageType("error");
//         setIsLoading(false);
//         return;
//       }

//       setMessage("Submitted successfully! AI is evaluating your solution...");
//       setMessageType("success");

//       // Call evaluation API
//       const res = await fetch("/api/evaluateSubmission", {
//         method: "POST",
//         body: JSON.stringify({ submissionId: submissionData.id }),
//         headers: { "Content-Type": "application/json" }
//       });

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.error || "Evaluation failed");
//       }

//       const result = await res.json();
//       setEvaluation(result);
//       setMessage("Evaluation complete!");
//       setMessageType("success");

//       // Clear form
//       setText("");
//       setFile(null);

//       // Update existing submission state
//       setExistingSubmission({
//         ...submissionData,
//         evaluated: true,
//         score: result.score,
//         feedback: result.feedback
//       });

//     } catch (error) {
//       console.error("Submission error:", error);
//       setMessage(`Submission failed: ${error.message}`);
//       setMessageType("error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFileChange = (selectedFile) => {
//     if (selectedFile) {
//       const allowedTypes = [
//         'application/pdf',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'text/plain'
//       ];
      
//       if (!allowedTypes.includes(selectedFile.type)) {
//         setMessage("Please upload only PDF, DOC, DOCX, or TXT files.");
//         setMessageType("error");
//         return;
//       }
      
//       if (selectedFile.size > 10 * 1024 * 1024) {
//         setMessage("File size must be less than 10MB.");
//         setMessageType("error");
//         return;
//       }
      
//       setFile(selectedFile);
//       setMessage("");
//       setMessageType("");
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const droppedFile = e.dataTransfer.files[0];
//     handleFileChange(droppedFile);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//   };

//   const removeFile = () => {
//     setFile(null);
//     setMessage("");
//     setMessageType("");
//   };

//   const getMessageIcon = () => {
//     switch (messageType) {
//       case 'success':
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case 'error':
//         return <AlertCircle className="w-5 h-5 text-red-500" />;
//       case 'info':
//         return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
//       default:
//         return null;
//     }
//   };

//   const getMessageColor = () => {
//     switch (messageType) {
//       case 'success':
//         return 'bg-green-50 border-green-200 text-green-800';
//       case 'error':
//         return 'bg-red-50 border-red-200 text-red-800';
//       case 'info':
//         return 'bg-blue-50 border-blue-200 text-blue-800';
//       default:
//         return 'bg-gray-50 border-gray-200 text-gray-800';
//     }
//   };

//   const getScoreColor = (score) => {
//     if (score >= 90) return 'text-green-600';
//     if (score >= 80) return 'text-blue-600';
//     if (score >= 70) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getScoreGrade = (score) => {
//     if (score >= 90) return 'A';
//     if (score >= 80) return 'B';
//     if (score >= 70) return 'C';
//     if (score >= 60) return 'D';
//     return 'F';
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <div className="max-w-4xl mx-auto p-6 space-y-8">
//         {/* User Info Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
//           <div className="flex items-center">
//             <User className="w-5 h-5 text-blue-600 mr-2" />
//             <span className="text-sm text-gray-600">
//               Submitting as: <span className="font-medium text-gray-900">{userName}</span> ({userEmail})
//             </span>
//           </div>
//         </div>

//         {/* Header */}
//         <div className="text-center">
//           <h1 className="text-4xl font-bold text-gray-900 mb-4">Case Study Challenge</h1>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Analyze the case study and provide your innovative solution. Your submission will be evaluated by AI.
//           </p>
//         </div>

//         {/* Case Study Display */}
//         {caseStudy && (
//           <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
//             <div className="flex items-center mb-4">
//               <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
//               <h2 className="text-2xl font-bold text-gray-900">{caseStudy.title}</h2>
//             </div>
//             <div className="prose max-w-none">
//               <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                 {caseStudy.description}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Existing Submission Warning */}
//         {existingSubmission && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//             <div className="flex items-center">
//               <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
//               <div>
//                 <p className="text-yellow-800 font-medium">Previous Submission Found</p>
//                 <p className="text-yellow-700 text-sm">
//                   You have already submitted a solution for this case study. 
//                   Submitting again will create a new submission.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Submission Form */}
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
//           <div className="p-8">
//             {/* Text Submission Section */}
//             <div className="mb-8">
//               <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
//                 <FileText className="w-5 h-5 mr-2 text-blue-600" />
//                 Your Solution
//               </label>
//               <div className="relative">
//                 <textarea
//                   placeholder="Provide your detailed analysis and solution here. Include your problem identification, proposed solutions, implementation strategy, and expected outcomes..."
//                   value={text}
//                   onChange={(e) => setText(e.target.value)}
//                   className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-400"
//                   rows={10}
//                 />
//                 <div className="absolute bottom-3 right-3 text-sm text-gray-400">
//                   {text.length} characters
//                 </div>
//               </div>
//             </div>

//             {/* File Upload Section */}
//             <div className="mb-8">
//               <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
//                 <Upload className="w-5 h-5 mr-2 text-blue-600" />
//                 Upload Document (Optional)
//               </label>
              
//               <div
//                 className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
//                   dragOver
//                     ? 'border-blue-400 bg-blue-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 }`}
//                 onDrop={handleDrop}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//               >
//                 {file ? (
//                   <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center">
//                       <FileText className="w-8 h-8 text-blue-600 mr-3" />
//                       <div className="text-left">
//                         <p className="font-medium text-gray-900">{file.name}</p>
//                         <p className="text-sm text-gray-500">
//                           {(file.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={removeFile}
//                       className="text-red-500 hover:text-red-700 font-medium"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-lg font-medium text-gray-900 mb-2">
//                       Drop your file here or click to browse
//                     </p>
//                     <p className="text-sm text-gray-500 mb-4">
//                       Supports PDF, DOC, DOCX, and TXT files up to 10MB
//                     </p>
//                     <input
//                       type="file"
//                       accept=".pdf,.doc,.docx,.txt"
//                       onChange={(e) => handleFileChange(e.target.files[0])}
//                       className="hidden"
//                       id="file-upload"
//                     />
//                     <label
//                       htmlFor="file-upload"
//                       className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
//                     >
//                       Choose File
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-center mb-6">
//               <button
//                 onClick={handleSubmit}
//                 disabled={isLoading || (!text.trim() && !file)}
//                 className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 {isLoading ? (
//                   <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                 ) : (
//                   <Send className="w-5 h-5 mr-2" />
//                 )}
//                 {isLoading ? 'Evaluating...' : 'Submit Solution'}
//               </button>
//             </div>

//             {/* Message Display */}
//             {message && (
//               <div className={`flex items-center p-4 rounded-lg border mb-6 ${getMessageColor()}`}>
//                 {getMessageIcon()}
//                 <span className="ml-2 font-medium">{message}</span>
//               </div>
//             )}

//             {/* Evaluation Results */}
//             {evaluation && (
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                 <h3 className="text-xl font-bold text-gray-900 mb-4">AI Evaluation Results</h3>
                
//                 <div className="flex items-center justify-center mb-6">
//                   <div className="text-center">
//                     <div className={`text-6xl font-bold ${getScoreColor(evaluation.score)} mb-2`}>
//                       {evaluation.score}
//                     </div>
//                     <div className="text-gray-600">
//                       Grade: <span className={`font-bold text-xl ${getScoreColor(evaluation.score)}`}>
//                         {getScoreGrade(evaluation.score)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg p-4 border border-gray-200">
//                   <h4 className="font-semibold text-gray-900 mb-2">Detailed Feedback:</h4>
//                   <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
//                     {evaluation.feedback}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Evaluation Criteria */}
//         <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Criteria</h3>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-1">Analytical Thinking (25%)</h4>
//                 <p className="text-sm text-gray-600">Problem identification, data analysis, logical reasoning</p>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-1">Creativity & Innovation (25%)</h4>
//                 <p className="text-sm text-gray-600">Novel solutions, creative approaches, out-of-the-box thinking</p>
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-1">Feasibility & Practicality (25%)</h4>
//                 <p className="text-sm text-gray-600">Realistic implementation, resource consideration, timeline</p>
//               </div>
//               <div>
//                 <h4 className="font-medium text-gray-900 mb-1">Presentation & Clarity (25%)</h4>
//                 <p className="text-sm text-gray-600">Clear communication, structure, professional presentation</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//app/case-studies/CaseSubmissionForm.jsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Upload, FileText, Send, AlertCircle, CheckCircle, Loader2, BookOpen, User } from 'lucide-react';

export default function CaseSubmissionForm({ caseId, userId, userEmail, userName }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [caseStudy, setCaseStudy] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  const supabase = createClientComponentClient();

  // Fetch case study details and check for existing submission
  useEffect(() => {
    const fetchData = async () => {
      // Fetch case study
      const { data: caseData, error: caseError } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', caseId)
        .single();
      
      if (caseData) setCaseStudy(caseData);
      if (caseError) console.error('Error fetching case study:', caseError);

      // Check for existing submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('case_submissions')
        .select('*')
        .eq('case_id', caseId)
        .eq('clerk_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (submissionData) {
        setExistingSubmission(submissionData);
        // If there's an existing submission with evaluation, show it
        if (submissionData.evaluated && submissionData.score !== null) {
          setEvaluation({
            score: submissionData.score,
            feedback: submissionData.feedback
          });
        }
      }
    };

    if (caseId && userId) fetchData();
  }, [caseId, userId, supabase]);

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      setMessage("Please provide either text submission or upload a file.");
      setMessageType("error");
      return;
    }

    setIsLoading(true);
    setMessage("Submitting your solution...");
    setMessageType("info");
    setEvaluation(null);

    try {
      let fileUrl = null;

      // Upload file if exists
      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${userId}_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("case-submissions")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          setMessage("File upload failed: " + uploadError.message);
          setMessageType("error");
          setIsLoading(false);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("case-submissions")
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
      }

      // Insert submission with Clerk user ID
      const { data: submissionData, error: submissionError } = await supabase
        .from("case_submissions")
        .insert({
          case_id: caseId,
          clerk_id: userId, // Using actual Clerk user ID
          submission_text: text.trim() || null,
          submission_file_url: fileUrl
        })
        .select()
        .single();

      if (submissionError) {
        console.error("Submission error:", submissionError);
        setMessage("Submission failed: " + submissionError.message);
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      setMessage("Submitted successfully! AI is evaluating your solution...");
      setMessageType("success");

      // Call evaluation API
      const res = await fetch("/api/evaluateSubmission", {
        method: "POST",
        body: JSON.stringify({ submissionId: submissionData.id }),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Evaluation failed");
      }

      const result = await res.json();
      setEvaluation(result);
      setMessage("Evaluation complete!");
      setMessageType("success");

      // Clear form
      setText("");
      setFile(null);

      // Update existing submission state
      setExistingSubmission({
        ...submissionData,
        evaluated: true,
        score: result.score,
        feedback: result.feedback
      });

    } catch (error) {
      console.error("Submission error:", error);
      setMessage(`Submission failed: ${error.message}`);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage("Please upload only PDF, DOC, DOCX, or TXT files.");
        setMessageType("error");
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setMessage("File size must be less than 10MB.");
        setMessageType("error");
        return;
      }
      
      setFile(selectedFile);
      setMessage("");
      setMessageType("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setMessageType("");
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getMessageColor = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* User Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">
              Submitting as: <span className="font-medium text-gray-900">{userName}</span> ({userEmail})
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Case Study Challenge</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze the case study and provide your innovative solution. Your submission will be evaluated by AI.
          </p>
        </div>

        {/* Case Study Display */}
        {caseStudy && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">{caseStudy.title}</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {caseStudy.description}
              </p>
            </div>
          </div>
        )}

        {/* Existing Submission Warning */}
        {existingSubmission && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-yellow-800 font-medium">Previous Submission Found</p>
                <p className="text-yellow-700 text-sm">
                  You have already submitted a solution for this case study. 
                  Submitting again will create a new submission.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Text Submission Section */}
            <div className="mb-8">
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Your Solution
              </label>
              <div className="relative">
                <textarea
                  placeholder="Provide your detailed analysis and solution here. Include your problem identification, proposed solutions, implementation strategy, and expected outcomes..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-900 placeholder-gray-400"
                  rows={10}
                />
                <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                  {text.length} characters
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mb-8">
              <label className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                Upload Document (Optional)
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="w-8 h-8 text-blue-600 mr-3" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports PDF, DOC, DOCX, and TXT files up to 10MB
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading || (!text.trim() && !file)}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Evaluating...' : 'Submit Solution'}
              </button>
            </div>

            {/* Message Display */}
            {message && (
              <div className={`flex items-center p-4 rounded-lg border mb-6 ${getMessageColor()}`}>
                {getMessageIcon()}
                <span className="ml-2 font-medium">{message}</span>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluation && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Evaluation Results</h3>
                
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold ${getScoreColor(evaluation.score)} mb-2`}>
                      {evaluation.score}
                    </div>
                    <div className="text-gray-600">
                      Grade: <span className={`font-bold text-xl ${getScoreColor(evaluation.score)}`}>
                        {getScoreGrade(evaluation.score)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Detailed Feedback:</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {evaluation.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Evaluation Criteria */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evaluation Criteria</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Analytical Thinking (25%)</h4>
                <p className="text-sm text-gray-600">Problem identification, data analysis, logical reasoning</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Creativity & Innovation (25%)</h4>
                <p className="text-sm text-gray-600">Novel solutions, creative approaches, out-of-the-box thinking</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Feasibility & Practicality (25%)</h4>
                <p className="text-sm text-gray-600">Realistic implementation, resource consideration, timeline</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Presentation & Clarity (25%)</h4>
                <p className="text-sm text-gray-600">Clear communication, structure, professional presentation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}