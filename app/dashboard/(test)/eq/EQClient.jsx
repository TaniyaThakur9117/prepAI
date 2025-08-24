// "use client";

// import { useEffect, useState } from "react";
// import { 
//   Sun, Moon, Play, Check, X, HelpCircle, Trophy, Clock, 
//   ChevronRight, ChevronLeft, Save, Shuffle, Sparkles, 
//   RefreshCw, AlertCircle, CheckCircle, Brain, Star,
//   User, Award
// } from "lucide-react";

// export default function EQClient() {
//   const [isDark, setIsDark] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showResults, setShowResults] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
//   const [sessionId, setSessionId] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [metadata, setMetadata] = useState(null);
//   const [feedback, setFeedback] = useState('');
  
//   // Generate unique session ID on component mount
//   useEffect(() => {
//     const newSessionId = `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setSessionId(newSessionId);
//   }, []);

//   // Timer effect
//   useEffect(() => {
//     if (timeLeft > 0 && !showResults) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0) {
//       handleSubmit();
//     }
//   }, [timeLeft, showResults]);

//   // Enhanced fetch questions with true randomization
//   const fetchQuestions = async (forceRefresh = false) => {
//     if (forceRefresh) {
//       setIsRefreshing(true);
//       // Generate completely new session ID for fresh questions
//       const newSessionId = `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       setSessionId(newSessionId);
//     } else {
//       setLoading(true);
//     }
    
//     try {
//       const currentSessionId = forceRefresh ? 
//         `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : 
//         sessionId;
      
//       // Add cache-busting and randomization parameters
//       const queryParams = new URLSearchParams({
//         session_id: currentSessionId,
//         force_refresh: forceRefresh.toString(),
//         timestamp: Date.now().toString(),
//         random_seed: Math.random().toString()
//       });
      
//       console.log(`🎲 Fetching questions with session: ${currentSessionId.slice(-8)}`);
      
//       const res = await fetch(`/api/eq?${queryParams}`, {
//         method: 'GET',
//         headers: {
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache',
//           'Expires': '0'
//         }
//       });
      
//       const data = await res.json();

//       if (data.error) {
//         console.error("API Error:", data.error);
//         setQuestions([]);
//         setMetadata(null);
//       } else {
//         // Apply client-side randomization as additional layer
//         const clientRandomized = [...(data.questions || [])]
//           .sort(() => Math.random() - 0.5)
//           .map((q, index) => ({
//             ...q,
//             clientIndex: index,
//             clientRandomSeed: Math.random()
//           }));
          
//         setQuestions(clientRandomized);
//         setMetadata(data.metadata || null);
        
//         console.log(`✅ Loaded ${clientRandomized.length} randomized questions`);
        
//         // Update session ID if refreshed
//         if (forceRefresh) {
//           setSessionId(currentSessionId);
//           // Reset all state for fresh start
//           setAnswers({});
//           setCurrentIndex(0);
//           setTimeLeft(1800);
//           setShowResults(false);
//           setFeedback('');
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       setQuestions([]);
//       setMetadata(null);
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   // Load questions on mount
//   useEffect(() => {
//     if (sessionId) {
//       fetchQuestions();
//     }
//   }, [sessionId]);

//   // Handle answer selection
//   const handleAnswerSelect = (questionId, answer) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: answer
//     }));
//   };

//   // Navigate between questions
//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   // Submit answers for evaluation
//   const handleSubmit = async () => {
//     if (Object.keys(answers).length === 0) {
//       alert("Please answer at least one question before submitting.");
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       // First save the answers
//       await fetch('/api/eq', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           answers, 
//           sessionId,
//           metadata: {
//             ...metadata,
//             completedAt: new Date().toISOString(),
//             totalAnswered: Object.keys(answers).length,
//             totalQuestions: questions.length
//           }
//         })
//       });

//       // Then get evaluation feedback
//       const evalRes = await fetch('/api/eq/evaluate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ answers })
//       });
      
//       const evalData = await evalRes.json();
//       setFeedback(evalData.result || 'Evaluation completed successfully!');
      
//       setShowResults(true);
//       console.log("✅ Answers submitted and evaluated");
      
//     } catch (error) {
//       console.error("Error submitting answers:", error);
//       alert("Error submitting answers. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Refresh questions handler
//   const handleRefreshQuestions = () => {
//     if (window.confirm("This will load completely new random questions and reset your progress. Continue?")) {
//       fetchQuestions(true);
//     }
//   };

//   // Format time display
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const currentQuestion = questions[currentIndex];
//   const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
//   const answeredCount = Object.keys(answers).length;

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${isDark 
//         ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
//         : 'bg-gradient-to-br from-purple-50 via-white to-purple-100'
//       } flex items-center justify-center`}>
//         <div className="text-center">
//           <div className="relative mb-8">
//             <div className="w-20 h-20 mx-auto">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-ping opacity-75"></div>
//               <div className="relative bg-gradient-to-r from-purple-700 to-indigo-700 rounded-full h-full flex items-center justify-center">
//                 <Brain className="h-10 w-10 text-white animate-pulse" />
//               </div>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//               Preparing Your Assessment
//             </p>
//             <p className={`${isDark ? 'text-purple-300' : 'text-purple-600'} flex items-center justify-center gap-2`}>
//               <Sparkles className="h-4 w-4 animate-spin" />
//               Loading randomized questions...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-all duration-500 ${isDark 
//       ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
//       : 'bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-900'
//     }`}>
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? 'bg-purple-600' : 'bg-purple-200'} rounded-full opacity-20 animate-pulse`}></div>
//         <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? 'bg-indigo-600' : 'bg-indigo-200'} rounded-full opacity-20 animate-pulse delay-1000`}></div>
//       </div>

//       {/* Header */}
//       <div className={`relative z-10 ${isDark 
//         ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-xl border-purple-700/50' 
//         : 'bg-white/80 backdrop-blur-xl border-purple-200'
//       } border-b shadow-xl`}>
//         <div className="max-w-6xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-75"></div>
//                   <div className="relative bg-gradient-to-r from-purple-700 to-indigo-700 rounded-full p-3">
//                     <Brain className="h-7 w-7 text-white" />
//                   </div>
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
//                     Emotional Intelligence Assessment
//                   </h1>
//                   <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
//                     Discover your emotional superpowers
//                   </p>
//                 </div>
//               </div>
              
//               {metadata && (
//                 <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full ${isDark 
//                   ? 'bg-purple-800/50 text-purple-200' 
//                   : 'bg-purple-100 text-purple-700'
//                 }`}>
//                   <Sparkles className="h-4 w-4" />
//                   <span className="text-sm font-medium">Session: {metadata.randomSeed}</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="flex items-center gap-4">
//               {/* Refresh Button */}
//               <button
//                 onClick={handleRefreshQuestions}
//                 disabled={isRefreshing || showResults}
//                 className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${isDark
//                   ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg'
//                   : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg'
//                 } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
//                 title="Get new random questions"
//               >
//                 <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
//                 <span className="hidden sm:inline">New Questions</span>
//               </button>
              
//               {/* Timer */}
//               <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark
//                 ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
//                 : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
//               } shadow-lg`}>
//                 <Clock className="h-4 w-4 animate-pulse" />
//                 <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
//               </div>
              
//               {/* Theme Toggle */}
//               <button
//                 onClick={() => setIsDark(!isDark)}
//                 className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isDark 
//                   ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
//                   : 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg'
//                 }`}
//               >
//                 {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>
          
//           {/* Progress Bar */}
//           <div className="mt-6">
//             <div className="flex justify-between items-center mb-3">
//               <div className="flex items-center gap-2">
//                 <User className="h-4 w-4 text-purple-600" />
//                 <span className="text-sm font-medium">Question {currentIndex + 1} of {questions.length}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Award className="h-4 w-4 text-indigo-600" />
//                 <span className="text-sm font-medium">{answeredCount} completed</span>
//               </div>
//             </div>
//             <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-purple-200'} overflow-hidden shadow-inner`}>
//               <div 
//                 className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-full transition-all duration-500 ease-out shadow-lg"
//                 style={{ width: `${progress}%` }}
//               >
//                 <div className="h-full bg-white/30 animate-pulse rounded-full"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
//         {!showResults ? (
//           currentQuestion && (
//             <div className={`${isDark 
//               ? 'bg-gradient-to-br from-gray-800/90 to-purple-900/90 backdrop-blur-xl border-purple-700/50' 
//               : 'bg-white/90 backdrop-blur-xl border-purple-200'
//             } rounded-3xl shadow-2xl p-8 border transition-all duration-500 hover:shadow-purple-500/20`}>
//               <div className="mb-8">
//                 {/* Question Header */}
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
//                     {currentIndex + 1}
//                   </div>
//                   <div className="flex-1">
//                     <h2 className="text-xl font-bold leading-relaxed mb-2">
//                       {currentQuestion.question}
//                     </h2>
//                     <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
//                       <HelpCircle className="h-4 w-4" />
//                       <span>Choose the response that best reflects your approach</span>
//                     </div>
//                   </div>
//                 </div>
//                 {currentQuestion.scenario && (
//                   <div className={`${isDark 
//                     ? 'bg-gradient-to-r from-purple-800/50 to-indigo-800/50 border-purple-600/30' 
//                     : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
//                   } p-6 rounded-2xl mb-6 border backdrop-blur-sm`}>
//                     <div className="flex items-start gap-3">
//                       <Star className={`h-5 w-5 mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
//                       <p className="text-sm leading-relaxed">{currentQuestion.scenario}</p>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="space-y-4">
//                   {currentQuestion.options?.map((option, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleAnswerSelect(currentQuestion.id, option)}
//                       className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group ${
//                         answers[currentQuestion.id] === option
//                           ? `${isDark 
//                               ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 shadow-purple-500/20' 
//                               : 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-purple-500/20'
//                             } shadow-xl`
//                           : `${isDark 
//                               ? 'border-gray-600 hover:border-purple-400 hover:bg-purple-800/20' 
//                               : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
//                             }`
//                       }`}
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
//                           answers[currentQuestion.id] === option
//                             ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg'
//                             : `${isDark ? 'border-gray-400 group-hover:border-purple-400' : 'border-purple-300 group-hover:border-purple-500'}`
//                         }`}>
//                           {answers[currentQuestion.id] === option && (
//                             <Check className="w-4 h-4 text-white" />
//                           )}
//                         </div>
//                         <span className="flex-1 leading-relaxed">{option}</span>
//                       </div>
//                     </button>
//                   )) || (
//                     <div className="relative">
//                       <textarea
//                         value={answers[currentQuestion.id] || ''}
//                         onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
//                         placeholder="Share your thoughts and approach here..."
//                         rows={4}
//                         className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 focus:scale-[1.02] resize-none ${isDark 
//                           ? 'bg-gray-800/50 border-gray-600 focus:border-purple-500 text-white placeholder-gray-400' 
//                           : 'bg-white border-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-500'
//                         } focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:shadow-xl backdrop-blur-sm`}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Navigation */}
//               <div className="flex justify-between items-center pt-6 border-t border-purple-200/30">
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentIndex === 0}
//                   className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
//                     currentIndex === 0
//                       ? 'opacity-50 cursor-not-allowed'
//                       : `${isDark 
//                           ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                           : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//                         } shadow-lg hover:shadow-xl`
//                   }`}
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                   Previous
//                 </button>
                
//                 <div className="flex gap-4">
//                   <button
//                     onClick={handleSubmit}
//                     disabled={isSubmitting || answeredCount === 0}
//                     className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-xl ${
//                       isSubmitting || answeredCount === 0
//                         ? 'opacity-50 cursor-not-allowed bg-gray-500'
//                         : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/20'
//                     }`}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         Evaluating...
//                       </>
//                     ) : (
//                       <>
//                         <Trophy className="h-5 w-5" />
//                         Complete Assessment ({answeredCount})
//                       </>
//                     )}
//                   </button>
                  
//                   {currentIndex < questions.length - 1 && (
//                     <button
//                       onClick={handleNext}
//                       className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                     >
//                       Next
//                       <ChevronRight className="h-5 w-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         ) : (
//           /* Results */
//           <div className={`${isDark 
//             ? 'bg-gradient-to-br from-gray-800/90 to-purple-900/90 backdrop-blur-xl border-purple-700/50' 
//             : 'bg-white/90 backdrop-blur-xl border-purple-200'
//           } rounded-3xl shadow-2xl p-8 border text-center`}>
//             <div className="mb-8">
//               <div className="relative mb-6">
//                 <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
//                 <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
//                   <CheckCircle className="h-12 w-12 text-white" />
//                 </div>
//               </div>
//               <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
//                 Assessment Complete!
//               </h2>
//               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark 
//                 ? 'bg-purple-800/50 text-purple-200' 
//                 : 'bg-purple-100 text-purple-700'
//               }`}>
//                 <Award className="h-5 w-5" />
//                 <span className="font-medium">
//                   {answeredCount} out of {questions.length} questions completed
//                 </span>
//               </div>
//             </div>
            
//             {feedback && (
//               <div className={`${isDark 
//                 ? 'bg-gradient-to-r from-purple-800/50 to-indigo-800/50 border-purple-600/30' 
//                 : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
//               } p-8 rounded-2xl mb-8 border text-left`}>
//                 <div className="flex items-center gap-3 mb-4">
//                   <Brain className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
//                   <h3 className="text-xl font-bold">Your Personalized Insights:</h3>
//                 </div>
//                 <div className="prose dark:prose-invert max-w-none">
//                   {feedback.split('\n').map((paragraph, index) => (
//                     paragraph.trim() && (
//                       <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>
//                     )
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <button
//                 onClick={() => handleRefreshQuestions()}
//                 className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/20"
//               >
//                 <RefreshCw className="h-5 w-5" />
//                 Take New Assessment
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


//app\dashboard\(test)\eq\EQClient.jsx
// "use client";

// import { useEffect, useState } from "react";
// import { 
//   Sun, Moon, Play, Check, X, HelpCircle, Trophy, Clock, 
//   ChevronRight, ChevronLeft, Save, Shuffle, Sparkles, 
//   RefreshCw, AlertCircle, CheckCircle, Brain, Star,
//   User, Award
// } from "lucide-react";
// import { saveAttempt } from "@/lib/saveAttempt";

// export default function EQClient() {
//   const [isDark, setIsDark] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showResults, setShowResults] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
//   const [sessionId, setSessionId] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [metadata, setMetadata] = useState(null);
//   const [feedback, setFeedback] = useState('');
  
//   // Generate unique session ID on component mount
//   useEffect(() => {
//     const newSessionId = `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     setSessionId(newSessionId);
//   }, []);

//   // Timer effect
//   useEffect(() => {
//     if (timeLeft > 0 && !showResults) {
//       const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0) {
//       handleSubmit();
//     }
//   }, [timeLeft, showResults]);

//   // Enhanced fetch questions with true randomization
//   const fetchQuestions = async (forceRefresh = false) => {
//     if (forceRefresh) {
//       setIsRefreshing(true);
//       // Generate completely new session ID for fresh questions
//       const newSessionId = `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       setSessionId(newSessionId);
//     } else {
//       setLoading(true);
//     }
    
//     try {
//       const currentSessionId = forceRefresh ? 
//         `eq_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : 
//         sessionId;
      
//       // Add cache-busting and randomization parameters
//       const queryParams = new URLSearchParams({
//         session_id: currentSessionId,
//         force_refresh: forceRefresh.toString(),
//         timestamp: Date.now().toString(),
//         random_seed: Math.random().toString()
//       });
      
//       console.log(`🎲 Fetching questions with session: ${currentSessionId.slice(-8)}`);
      
//       const res = await fetch(`/api/eq?${queryParams}`, {
//         method: 'GET',
//         headers: {
//           'Cache-Control': 'no-cache, no-store, must-revalidate',
//           'Pragma': 'no-cache',
//           'Expires': '0'
//         }
//       });
      
//       const data = await res.json();

//       if (data.error) {
//         console.error("API Error:", data.error);
//         setQuestions([]);
//         setMetadata(null);
//       } else {
//         // Apply client-side randomization as additional layer
//         const clientRandomized = [...(data.questions || [])]
//           .sort(() => Math.random() - 0.5)
//           .map((q, index) => ({
//             ...q,
//             clientIndex: index,
//             clientRandomSeed: Math.random()
//           }));
          
//         setQuestions(clientRandomized);
//         setMetadata(data.metadata || null);
        
//         console.log(`✅ Loaded ${clientRandomized.length} randomized questions`);
        
//         // Update session ID if refreshed
//         if (forceRefresh) {
//           setSessionId(currentSessionId);
//           // Reset all state for fresh start
//           setAnswers({});
//           setCurrentIndex(0);
//           setTimeLeft(1800);
//           setShowResults(false);
//           setFeedback('');
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching questions:", error);
//       setQuestions([]);
//       setMetadata(null);
//     } finally {
//       setLoading(false);
//       setIsRefreshing(false);
//     }
//   };

//   // Load questions on mount
//   useEffect(() => {
//     if (sessionId) {
//       fetchQuestions();
//     }
//   }, [sessionId]);

//   // Handle answer selection with saveAttempt
//   const handleAnswerSelect = async (questionId, answer) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: answer
//     }));

//     // Save the attempt immediately when answer is selected
//     try {
//       // For EQ questions, we'll assume all answers are "correct" since it's assessment-based
//       // You can modify this logic based on your specific scoring system
//       const isCorrect = true; // EQ assessment doesn't have right/wrong answers
//       const score = 1; // Base score, can be modified based on your scoring logic
      
//       await saveAttempt("eq", parseInt(questionId), answer, isCorrect, score);
//       console.log(`✅ Saved attempt for question ${questionId}`);
//     } catch (error) {
//       console.error(`Error saving attempt for question ${questionId}:`, error);
//     }
//   };

//   // Navigate between questions
//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//     }
//   };

//   const handlePrevious = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//     }
//   };

//   // Submit answers for evaluation
//   const handleSubmit = async () => {
//     if (Object.keys(answers).length === 0) {
//       alert("Please answer at least one question before submitting.");
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       // Save all remaining attempts that might not have been saved individually
//       const savePromises = Object.entries(answers).map(async ([questionId, answer]) => {
//         try {
//           const isCorrect = true; // EQ assessment logic
//           const score = 1; // Base score
//           await saveAttempt("eq", parseInt(questionId), answer, isCorrect, score);
//         } catch (error) {
//           console.error(`Error saving final attempt for question ${questionId}:`, error);
//         }
//       });
      
//       // Wait for all saves to complete
//       await Promise.all(savePromises);
//       console.log("✅ All attempts saved successfully");

//       // First save the answers to your existing endpoint
//       await fetch('/api/eq', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           answers, 
//           sessionId,
//           metadata: {
//             ...metadata,
//             completedAt: new Date().toISOString(),
//             totalAnswered: Object.keys(answers).length,
//             totalQuestions: questions.length
//           }
//         })
//       });

//       // Then get evaluation feedback
//       const evalRes = await fetch('/api/eq/evaluate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ answers })
//       });
      
//       const evalData = await evalRes.json();
//       setFeedback(evalData.result || 'Evaluation completed successfully!');
      
//       setShowResults(true);
//       console.log("✅ Answers submitted and evaluated");
      
//     } catch (error) {
//       console.error("Error submitting answers:", error);
//       alert("Error submitting answers. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Refresh questions handler
//   const handleRefreshQuestions = () => {
//     if (window.confirm("This will load completely new random questions and reset your progress. Continue?")) {
//       fetchQuestions(true);
//     }
//   };

//   // Format time display
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const currentQuestion = questions[currentIndex];
//   const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
//   const answeredCount = Object.keys(answers).length;

//   if (loading) {
//     return (
//       <div className={`min-h-screen ${isDark 
//         ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' 
//         : 'bg-gradient-to-br from-purple-50 via-white to-purple-100'
//       } flex items-center justify-center`}>
//         <div className="text-center">
//           <div className="relative mb-8">
//             <div className="w-20 h-20 mx-auto">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-ping opacity-75"></div>
//               <div className="relative bg-gradient-to-r from-purple-700 to-indigo-700 rounded-full h-full flex items-center justify-center">
//                 <Brain className="h-10 w-10 text-white animate-pulse" />
//               </div>
//             </div>
//           </div>
//           <div className="space-y-3">
//             <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//               Preparing Your Assessment
//             </p>
//             <p className={`${isDark ? 'text-purple-300' : 'text-purple-600'} flex items-center justify-center gap-2`}>
//               <Sparkles className="h-4 w-4 animate-spin" />
//               Loading randomized questions...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-all duration-500 ${isDark 
//       ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' 
//       : 'bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-900'
//     }`}>
//       {/* Animated Background Elements */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className={`absolute -top-40 -right-40 w-80 h-80 ${isDark ? 'bg-purple-600' : 'bg-purple-200'} rounded-full opacity-20 animate-pulse`}></div>
//         <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${isDark ? 'bg-indigo-600' : 'bg-indigo-200'} rounded-full opacity-20 animate-pulse delay-1000`}></div>
//       </div>

//       {/* Header */}
//       <div className={`relative z-10 ${isDark 
//         ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-xl border-purple-700/50' 
//         : 'bg-white/80 backdrop-blur-xl border-purple-200'
//       } border-b shadow-xl`}>
//         <div className="max-w-6xl mx-auto px-6 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-6">
//               <div className="flex items-center gap-3">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-75"></div>
//                   <div className="relative bg-gradient-to-r from-purple-700 to-indigo-700 rounded-full p-3">
//                     <Brain className="h-7 w-7 text-white" />
//                   </div>
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
//                     Emotional Intelligence Assessment
//                   </h1>
//                   <p className={`text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
//                     Discover your emotional superpowers
//                   </p>
//                 </div>
//               </div>
              
//               {metadata && (
//                 <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full ${isDark 
//                   ? 'bg-purple-800/50 text-purple-200' 
//                   : 'bg-purple-100 text-purple-700'
//                 }`}>
//                   <Sparkles className="h-4 w-4" />
//                   <span className="text-sm font-medium">Session: {metadata.randomSeed}</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="flex items-center gap-4">
//               {/* Refresh Button */}
//               <button
//                 onClick={handleRefreshQuestions}
//                 disabled={isRefreshing || showResults}
//                 className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${isDark
//                   ? 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg'
//                   : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg'
//                 } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
//                 title="Get new random questions"
//               >
//                 <RefreshCw className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
//                 <span className="hidden sm:inline">New Questions</span>
//               </button>
              
//               {/* Timer */}
//               <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDark
//                 ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
//                 : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
//               } shadow-lg`}>
//                 <Clock className="h-4 w-4 animate-pulse" />
//                 <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
//               </div>
              
//               {/* Theme Toggle */}
//               <button
//                 onClick={() => setIsDark(!isDark)}
//                 className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${isDark 
//                   ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg' 
//                   : 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg'
//                 }`}
//               >
//                 {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>
          
//           {/* Progress Bar */}
//           <div className="mt-6">
//             <div className="flex justify-between items-center mb-3">
//               <div className="flex items-center gap-2">
//                 <User className="h-4 w-4 text-purple-600" />
//                 <span className="text-sm font-medium">Question {currentIndex + 1} of {questions.length}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Award className="h-4 w-4 text-indigo-600" />
//                 <span className="text-sm font-medium">{answeredCount} completed</span>
//               </div>
//             </div>
//             <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-purple-200'} overflow-hidden shadow-inner`}>
//               <div 
//                 className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 rounded-full transition-all duration-500 ease-out shadow-lg"
//                 style={{ width: `${progress}%` }}
//               >
//                 <div className="h-full bg-white/30 animate-pulse rounded-full"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
//         {!showResults ? (
//           currentQuestion && (
//             <div className={`${isDark 
//               ? 'bg-gradient-to-br from-gray-800/90 to-purple-900/90 backdrop-blur-xl border-purple-700/50' 
//               : 'bg-white/90 backdrop-blur-xl border-purple-200'
//             } rounded-3xl shadow-2xl p-8 border transition-all duration-500 hover:shadow-purple-500/20`}>
//               <div className="mb-8">
//                 {/* Question Header */}
//                 <div className="flex items-start gap-4 mb-6">
//                   <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
//                     {currentIndex + 1}
//                   </div>
//                   <div className="flex-1">
//                     <h2 className="text-xl font-bold leading-relaxed mb-2">
//                       {currentQuestion.question}
//                     </h2>
//                     <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
//                       <HelpCircle className="h-4 w-4" />
//                       <span>Choose the response that best reflects your approach</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 {currentQuestion.scenario && (
//                   <div className={`${isDark 
//                     ? 'bg-gradient-to-r from-purple-800/50 to-indigo-800/50 border-purple-600/30' 
//                     : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
//                   } p-6 rounded-2xl mb-6 border backdrop-blur-sm`}>
//                     <div className="flex items-start gap-3">
//                       <Star className={`h-5 w-5 mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
//                       <p className="text-sm leading-relaxed">{currentQuestion.scenario}</p>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="space-y-4">
//                   {currentQuestion.options?.map((option, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleAnswerSelect(currentQuestion.id, option)}
//                       className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group ${
//                         answers[currentQuestion.id] === option
//                           ? `${isDark 
//                               ? 'border-purple-500 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 shadow-purple-500/20' 
//                               : 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-purple-500/20'
//                             } shadow-xl`
//                           : `${isDark 
//                               ? 'border-gray-600 hover:border-purple-400 hover:bg-purple-800/20' 
//                               : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
//                             }`
//                       }`}
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
//                           answers[currentQuestion.id] === option
//                             ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg'
//                             : `${isDark ? 'border-gray-400 group-hover:border-purple-400' : 'border-purple-300 group-hover:border-purple-500'}`
//                         }`}>
//                           {answers[currentQuestion.id] === option && (
//                             <Check className="w-4 h-4 text-white" />
//                           )}
//                         </div>
//                         <span className="flex-1 leading-relaxed">{option}</span>
//                       </div>
//                     </button>
//                   )) || (
//                     <div className="relative">
//                       <textarea
//                         value={answers[currentQuestion.id] || ''}
//                         onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
//                         placeholder="Share your thoughts and approach here..."
//                         rows={4}
//                         className={`w-full p-6 border-2 rounded-2xl transition-all duration-300 focus:scale-[1.02] resize-none ${isDark 
//                           ? 'bg-gray-800/50 border-gray-600 focus:border-purple-500 text-white placeholder-gray-400' 
//                           : 'bg-white border-purple-200 focus:border-purple-500 text-gray-900 placeholder-gray-500'
//                         } focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:shadow-xl backdrop-blur-sm`}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               {/* Navigation */}
//               <div className="flex justify-between items-center pt-6 border-t border-purple-200/30">
//                 <button
//                   onClick={handlePrevious}
//                   disabled={currentIndex === 0}
//                   className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
//                     currentIndex === 0
//                       ? 'opacity-50 cursor-not-allowed'
//                       : `${isDark 
//                           ? 'bg-gray-700 hover:bg-gray-600 text-white' 
//                           : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//                         } shadow-lg hover:shadow-xl`
//                   }`}
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                   Previous
//                 </button>
                
//                 <div className="flex gap-4">
//                   <button
//                     onClick={handleSubmit}
//                     disabled={isSubmitting || answeredCount === 0}
//                     className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-xl ${
//                       isSubmitting || answeredCount === 0
//                         ? 'opacity-50 cursor-not-allowed bg-gray-500'
//                         : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/20'
//                     }`}
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                         Evaluating...
//                       </>
//                     ) : (
//                       <>
//                         <Trophy className="h-5 w-5" />
//                         Complete Assessment ({answeredCount})
//                       </>
//                     )}
//                   </button>
                  
//                   {currentIndex < questions.length - 1 && (
//                     <button
//                       onClick={handleNext}
//                       className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                     >
//                       Next
//                       <ChevronRight className="h-5 w-5" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )
//         ) : (
//           /* Results */
//           <div className={`${isDark 
//             ? 'bg-gradient-to-br from-gray-800/90 to-purple-900/90 backdrop-blur-xl border-purple-700/50' 
//             : 'bg-white/90 backdrop-blur-xl border-purple-200'
//           } rounded-3xl shadow-2xl p-8 border text-center`}>
//             <div className="mb-8">
//               <div className="relative mb-6">
//                 <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
//                 <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
//                   <CheckCircle className="h-12 w-12 text-white" />
//                 </div>
//               </div>
//               <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
//                 Assessment Complete!
//               </h2>
//               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark 
//                 ? 'bg-purple-800/50 text-purple-200' 
//                 : 'bg-purple-100 text-purple-700'
//               }`}>
//                 <Award className="h-5 w-5" />
//                 <span className="font-medium">
//                   {answeredCount} out of {questions.length} questions completed
//                 </span>
//               </div>
//             </div>
            
//             {feedback && (
//               <div className={`${isDark 
//                 ? 'bg-gradient-to-r from-purple-800/50 to-indigo-800/50 border-purple-600/30' 
//                 : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
//               } p-8 rounded-2xl mb-8 border text-left`}>
//                 <div className="flex items-center gap-3 mb-4">
//                   <Brain className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
//                   <h3 className="text-xl font-bold">Your Personalized Insights:</h3>
//                 </div>
//                 <div className="prose dark:prose-invert max-w-none">
//                   {feedback.split('\n').map((paragraph, index) => (
//                     paragraph.trim() && (
//                       <p key={index} className="mb-3 leading-relaxed">{paragraph}</p>
//                     )
//                   ))}
//                 </div>
//               </div>
//             )}
            
//             <div className="flex flex-col sm:flex-row justify-center gap-4">
//               <button
//                 onClick={() => handleRefreshQuestions()}
//                 className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/20"
//               >
//                 <RefreshCw className="h-5 w-5" />
//                 Take New Assessment
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { 
  Sun, 
  Moon, 
  Check, 
  HelpCircle, 
  Trophy, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  Brain, 
  Star, 
  Award, 
  AlertTriangle, 
  Loader2, 
  Users, 
  Target, 
  BookOpen, 
  TrendingUp,
  MessageSquare,
  Edit3
} from "lucide-react";

export default function EQClient() {
  const [isDark, setIsDark] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [sessionId, setSessionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [error, setError] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");

  // Generate unique session ID on component mount
  useEffect(() => {
    const newSessionId = `eq_session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults, questions.length]);

  // Load current answer when question changes
  useEffect(() => {
    if (questions[currentIndex]) {
      setCurrentAnswer(answers[questions[currentIndex].id] || "");
    }
  }, [currentIndex, questions, answers]);

  // Fetch questions
  const fetchQuestions = async (forceRefresh = false) => {
    if (forceRefresh) {
      setIsRefreshing(true);
      const newSessionId = `eq_session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      setSessionId(newSessionId);
    }

    try {
      setError("");
      const currentSessionId = forceRefresh
        ? `eq_session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`
        : sessionId;

      const queryParams = new URLSearchParams({
        session_id: currentSessionId,
        limit: "15",
        timestamp: Date.now().toString(),
      });

      const res = await fetch(`/api/eq?${queryParams}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        console.error("API Error:", data.error);
        return;
      }

      const receivedQuestions = data.questions || [];
      
      if (receivedQuestions.length === 0) {
        setError("No questions available. Please check your database setup.");
        return;
      }

      console.log(`📥 Loaded ${receivedQuestions.length} questions`);
      setQuestions(receivedQuestions);
      setMetadata(data.metadata || null);

      if (forceRefresh) {
        setSessionId(currentSessionId);
        setAnswers({});
        setCurrentIndex(0);
        setTimeLeft(1800);
        setShowResults(false);
        setFeedback("");
        setScore(0);
        setCurrentAnswer("");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError(`Failed to load questions: ${error.message}`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load questions on mount
  useEffect(() => {
    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId]);

  // Handle answer input
  const handleAnswerChange = (value) => {
    setCurrentAnswer(value);
    if (questions[currentIndex]) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentIndex].id]: value
      }));
    }
  };

  // Navigation
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit assessment
  const handleSubmit = async () => {
    const answeredQuestions = Object.keys(answers).filter(key => answers[key]?.trim());
    
    if (answeredQuestions.length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    const unansweredCount = questions.length - answeredQuestions.length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    
    try {
      // First save the answers
      await fetch("/api/eq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          sessionId,
          metadata: {
            ...metadata,
            completedAt: new Date().toISOString(),
            totalAnswered: answeredQuestions.length,
            totalQuestions: questions.length,
          },
        }),
      });

      // Then get the evaluation
      const evalRes = await fetch("/api/eq/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answers, 
          sessionId,
          userId: null,
          email: null 
        }),
      });

      if (!evalRes.ok) {
        throw new Error(`Evaluation failed: ${evalRes.status}`);
      }

      const evalData = await evalRes.json();
      
      setFeedback(evalData.result || "Evaluation completed!");
      setScore(evalData.score || 75);
      setShowResults(true);
      
      console.log("✅ Assessment completed successfully");
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error submitting assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-purple-600";
  };

  const getScoreLevel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 65) return "Fair";
    return "Developing";
  };

  // Current question and progress
  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(key => answers[key]?.trim()).length;
  const completionPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-purple-50 via-white to-purple-100"} flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-700 to-indigo-700 rounded-full h-full flex items-center justify-center">
                <Brain className="h-10 w-10 text-white animate-pulse" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
              Preparing Your Assessment
            </p>
            <p className={`${isDark ? "text-purple-300" : "text-purple-600"} flex items-center justify-center gap-2`}>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading 15 unique questions...
            </p>
            {isRefreshing && (
              <p className="text-sm text-gray-500">Refreshing questions...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-purple-50 via-white to-purple-100"} flex items-center justify-center`}>
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}>
            Unable to Load Assessment
          </h2>
          <p className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            {error}
          </p>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              fetchQuestions(true);
            }}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900 text-white" : "bg-gradient-to-br from-purple-50 via-white to-purple-100 text-gray-800"}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-purple-600" /> 
            EQ Assessment
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Emotional Intelligence Evaluation • {questions.length} Questions • Text Responses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{answeredCount}/{questions.length}</span>
            <span className="text-gray-500">({completionPercentage}%)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Results View */}
      {showResults ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your Emotional Intelligence Results</p>
            </div>

            {/* Score Display */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <Award className={`h-10 w-10 ${getScoreColor(score)}`} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your EQ Score</p>
                    <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}/100</p>
                    <p className={`text-sm font-medium ${getScoreColor(score)}`}>{getScoreLevel(score)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-green-600">{answeredCount}/15</p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Used</p>
                <p className="text-xl font-bold text-blue-600">{formatTime(1800 - timeLeft)}</p>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Your Detailed Results
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {feedback}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => fetchQuestions(true)}
                disabled={isRefreshing}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50"
              >
                {isRefreshing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                Take New Assessment
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-5 w-5" />
                Save Results
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>Session: {sessionId.split('_').pop().substring(0, 6)}...</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${progress}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Question Display */}
          {currentQuestion ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Question {currentIndex + 1} of {questions.length}
                      </span>
                      {currentQuestion.category && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          {currentQuestion.category}
                        </span>
                      )}
                    </div>
                    <p className="text-lg font-medium leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text Input Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="h-4 w-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Response:
                  </label>
                </div>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your response here... Share your thoughts, experiences, or perspective on this question."
                  className="w-full min-h-[120px] p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg 
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white 
                           focus:border-purple-500 focus:bg-white dark:focus:bg-gray-600 
                           focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800
                           resize-y transition-all duration-200"
                  rows="4"
                />
                
                {/* Character count and guidance */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{currentAnswer.length} characters</span>
                    {currentAnswer.length > 0 && currentAnswer.length < 50 && (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Consider adding more detail
                      </span>
                    )}
                    {currentAnswer.length >= 50 && (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Good response length
                      </span>
                    )}
                  </div>
                  <span className="text-xs">
                    {currentAnswer.trim() ? "Response saved" : "Type to save automatically"}
                  </span>
                </div>
              </div>

              {/* Question Status */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {currentAnswer.trim() ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Response saved
                      </span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Write your response
                      </span>
                    )}
                  </span>
                  <span>Question ID: {currentQuestion.id}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No question available</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{answeredCount} of {questions.length} answered</span>
              {answeredCount === questions.length && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  All complete!
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount === 0}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Submit Assessment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-2">
              <strong>Instructions:</strong> Provide thoughtful, detailed responses to each question. 
              There are no right or wrong answers - we're interested in your perspective and experiences.
            </p>
            <p>
              💡 <em>Tip: Aim for at least 2-3 sentences per response for better evaluation.</em>
            </p>
          </div>
        </>
      )}
    </div>
  );
}