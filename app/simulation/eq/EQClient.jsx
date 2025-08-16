// "use client";
// import { useEffect, useState } from "react";
// import { CheckCircle, Brain, MessageSquare, Star, ArrowRight, Clock, User } from "lucide-react";

// export default function EQClient() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [answers, setAnswers] = useState({});
//   const [currentStep, setCurrentStep] = useState(0);
//   const [submitting, setSubmitting] = useState(false);
//   const [feedback, setFeedback] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [showResults, setShowResults] = useState(false);

//   useEffect(() => {
//     async function fetchQuestions() {
//       try {
//         const res = await fetch("/api/eq");
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }
//         const data = await res.json();
//         setQuestions(data);
//       } catch (err) {
//         console.error("Error fetching EQ questions:", err);
//         // You can add error state handling here if needed
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchQuestions();
//   }, []);

//   useEffect(() => {
//     if (questions.length > 0) {
//       const answeredCount = Object.keys(answers).length;
//       const newProgress = (answeredCount / questions.length) * 100;
//       setProgress(newProgress);
//     }
//   }, [answers, questions]);

//   const handleChange = (id, value) => {
//     setAnswers({ ...answers, [id]: value });
//   };

//   const handleNext = () => {
//     if (currentStep < questions.length - 1) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep > 0) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     try {
//       const res = await fetch("/api/eq/evaluate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ answers }),
//       });
      
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }
      
//       const feedbackData = await res.json();
//       setFeedback(feedbackData.result);
//       setShowResults(true);
//     } catch (error) {
//       console.error("Error submitting EQ assessment:", error);
//       setFeedback("Sorry, there was an error processing your assessment. Please try again.");
//       setShowResults(true);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetTest = () => {
//     setAnswers({});
//     setCurrentStep(0);
//     setFeedback(null);
//     setShowResults(false);
//     setProgress(0);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-lg text-gray-600">Loading your EQ assessment...</p>
//         </div>
//       </div>
//     );
//   }

//   if (showResults && feedback) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500">
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
//                 <CheckCircle className="h-10 w-10 text-green-600" />
//               </div>
//               <h1 className="text-4xl font-bold text-gray-800 mb-2">Assessment Complete!</h1>
//               <p className="text-gray-600">Here's your personalized EQ feedback</p>
//             </div>

//             <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
//               <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
//                 {feedback}
//               </pre>
//             </div>

//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={resetTest}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
//               >
//                 Take Test Again
//               </button>
//               <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
//                 Download Results
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (questions.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
//         <div className="text-center">
//           <MessageSquare className="h-16 w-16 text-red-400 mx-auto mb-4" />
//           <p className="text-lg text-gray-600">No EQ questions found.</p>
//         </div>
//       </div>
//     );
//   }

//   const currentQuestion = questions[currentStep];
//   const isLastQuestion = currentStep === questions.length - 1;
//   const canProceed = answers[currentQuestion?.id]?.trim().length > 10;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-4xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="bg-indigo-100 p-2 rounded-lg">
//                 <Brain className="h-6 w-6 text-indigo-600" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800">Emotional Intelligence Assessment</h1>
//                 <p className="text-sm text-gray-500">Question {currentStep + 1} of {questions.length}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2 text-sm text-gray-500">
//               <Clock className="h-4 w-4" />
//               <span>~15 minutes</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="bg-white">
//         <div className="max-w-4xl mx-auto px-6 py-2">
//           <div className="bg-gray-200 rounded-full h-2">
//             <div 
//               className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
//               style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
//             ></div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-500">
//           <div className="mb-8">
//             <div className="flex items-center space-x-2 mb-4">
//               <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
//                 Question {currentStep + 1}
//               </span>
//               {answers[currentQuestion?.id] && (
//                 <CheckCircle className="h-5 w-5 text-green-500" />
//               )}
//             </div>
            
//             <h2 className="text-2xl font-bold text-gray-800 leading-relaxed mb-6">
//               {currentQuestion?.question}
//             </h2>

//             <div className="relative">
//               <textarea
//                 className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 resize-none"
//                 placeholder="Share your thoughts and experiences... (minimum 10 characters)"
//                 value={answers[currentQuestion?.id] || ""}
//                 onChange={(e) => handleChange(currentQuestion?.id, e.target.value)}
//               />
//               <div className="absolute bottom-3 right-3 text-sm text-gray-400">
//                 {answers[currentQuestion?.id]?.length || 0} characters
//               </div>
//             </div>
            
//             {answers[currentQuestion?.id] && answers[currentQuestion?.id].length < 10 && (
//               <p className="text-amber-600 text-sm mt-2 flex items-center">
//                 <span className="mr-1">⚠️</span>
//                 Please provide a more detailed response (at least 10 characters)
//               </p>
//             )}
//           </div>

//           {/* Navigation */}
//           <div className="flex justify-between items-center">
//             <button
//               onClick={handlePrevious}
//               disabled={currentStep === 0}
//               className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
//             >
//               ← Previous
//             </button>

//             <div className="flex space-x-2">
//               {questions.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentStep(index)}
//                   className={`w-3 h-3 rounded-full transition-all duration-200 ${
//                     index === currentStep 
//                       ? 'bg-indigo-600' 
//                       : answers[questions[index]?.id] 
//                         ? 'bg-green-400' 
//                         : 'bg-gray-300'
//                   }`}
//                 />
//               ))}
//             </div>

//             {isLastQuestion ? (
//               <button
//                 onClick={handleSubmit}
//                 disabled={!canProceed || submitting}
//                 className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
//               >
//                 {submitting ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span>Analyzing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>Complete Assessment</span>
//                     <Star className="h-4 w-4" />
//                   </>
//                 )}
//               </button>
//             ) : (
//               <button
//                 onClick={handleNext}
//                 disabled={!canProceed}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
//               >
//                 <span>Next</span>
//                 <ArrowRight className="h-4 w-4" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Completion Stats */}
//         <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="bg-indigo-100 p-3 rounded-lg">
//                 <User className="h-6 w-6 text-indigo-600" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-gray-800">Progress Overview</h3>
//                 <p className="text-sm text-gray-500">
//                   {Object.keys(answers).length} of {questions.length} questions completed
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</div>
//               <p className="text-sm text-gray-500">Complete</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Brain, MessageSquare, Star, ArrowRight, Clock, User } from "lucide-react";

export default function EQClient() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch("/api/eq");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching EQ questions:", err);
        // You can add error state handling here if needed
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      const answeredCount = Object.keys(answers).length;
      const newProgress = (answeredCount / questions.length) * 100;
      setProgress(newProgress);
    }
  }, [answers, questions]);

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/eq/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const feedbackData = await res.json();
      setFeedback(feedbackData.result);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting EQ assessment:", error);
      setFeedback("Sorry, there was an error processing your assessment. Please try again.");
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetTest = () => {
    setAnswers({});
    setCurrentStep(0);
    setFeedback(null);
    setShowResults(false);
    setProgress(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your EQ assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Assessment Complete!</h1>
              <p className="text-gray-600">Here's your personalized EQ feedback</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                {feedback}
              </pre>
            </div>

            <div className="flex justify-center">
              <button
                onClick={resetTest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Take Test Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No EQ questions found.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion?.id]?.trim().length > 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Emotional Intelligence Assessment</h1>
                <p className="text-sm text-gray-500">Question {currentStep + 1} of {questions.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>~15 minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 transform transition-all duration-500">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded-full">
                Question {currentStep + 1}
              </span>
              {answers[currentQuestion?.id] && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 leading-relaxed mb-6">
              {currentQuestion?.question}
            </h2>

            <div className="relative">
              <textarea
                className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 resize-none"
                placeholder="Share your thoughts and experiences... (minimum 10 characters)"
                value={answers[currentQuestion?.id] || ""}
                onChange={(e) => handleChange(currentQuestion?.id, e.target.value)}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {answers[currentQuestion?.id]?.length || 0} characters
              </div>
            </div>
            
            {answers[currentQuestion?.id] && answers[currentQuestion?.id].length < 10 && (
              <p className="text-amber-600 text-sm mt-2 flex items-center">
                <span className="mr-1">⚠️</span>
                Please provide a more detailed response (at least 10 characters)
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              ← Previous
            </button>

            <div className="flex space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentStep 
                      ? 'bg-indigo-600' 
                      : answers[questions[index]?.id] 
                        ? 'bg-green-400' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed || submitting}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Assessment</span>
                    <Star className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Completion Stats */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Progress Overview</h3>
                <p className="text-sm text-gray-500">
                  {Object.keys(answers).length} of {questions.length} questions completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{Math.round(progress)}%</div>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
