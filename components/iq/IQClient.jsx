// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { CheckCircle, Trophy, Brain } from "lucide-react";

// export default function IQClient({ initialQuestions }) {
//   const { user } = useUser();
//   const [questions, setQuestions] = useState(initialQuestions || []);
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState([]);
//   const [score, setScore] = useState(0);
//   const [difficulty, setDifficulty] = useState(1);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     setQuestions(initialQuestions || []);
//   }, [initialQuestions]);

//   const choose = (qid, chosen) => {
//     const q = questions.find((x) => x.id === qid);
//     const correct = q.correct_option === chosen;

//     setAnswers((a) => [...a, { qid, chosen, correct }]);
//     if (correct) setScore((s) => s + 1);

//     const lastTwo = [...answers, { qid, chosen, correct }].slice(-2);
//     if (lastTwo.length === 2) {
//       if (lastTwo.every((r) => r.correct) && difficulty < 3) {
//         setDifficulty((d) => d + 1);
//         fetchNewQuestions(difficulty + 1);
//       } else if (lastTwo.every((r) => !r.correct) && difficulty > 1) {
//         setDifficulty((d) => d - 1);
//         fetchNewQuestions(difficulty - 1);
//       }
//     }

//     setIndex((i) => i + 1);
//   };

//   const fetchNewQuestions = async (diff) => {
//     try {
//       const res = await fetch(`/api/iq/questions?difficulty=${diff}&limit=10`);
//       if (!res.ok) {
//         console.error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
//         return;
//       }
//       const text = await res.text();
//       if (!text) {
//         console.error("Empty API response for new IQ questions");
//         return;
//       }
//       const json = JSON.parse(text);
//       setQuestions(json.questions || []);
//       setIndex(0);
//       setAnswers([]);
//       setScore(0);
//     } catch (err) {
//       console.error("Error fetching new IQ questions:", err);
//     }
//   };

//   const finish = async () => {
//     setIsSubmitting(true);
//     try {
//       const body = {
//         clerkId: user?.id || null,
//         round: "iq",
//         score,
//         total: questions.length,
//         details: answers,
//         difficulty_summary: { difficulty },
//       };
//       await fetch("/api/attempts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//     } catch (error) {
//       console.error("Error submitting results:", error);
//     }
//     setIsSubmitting(false);
//   };

//   const getDifficultyColor = (level) => {
//     switch (level) {
//       case 1: return "bg-green-100 text-green-800 border-green-200";
//       case 2: return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case 3: return "bg-red-100 text-red-800 border-red-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getDifficultyLabel = (level) => {
//     switch (level) {
//       case 1: return "Easy";
//       case 2: return "Medium";
//       case 3: return "Hard";
//       default: return "Unknown";
//     }
//   };

//   const getScoreMessage = () => {
//     const percentage = (score / questions.length) * 100;
//     if (percentage >= 90) return "Outstanding! 🏆";
//     if (percentage >= 80) return "Excellent work! 🌟";
//     if (percentage >= 70) return "Great job! 👏";
//     if (percentage >= 60) return "Good effort! 👍";
//     return "Keep practicing! 💪";
//   };

//   if (!questions || questions.length === 0) {
//     return (
//       <Card className="max-w-2xl mx-auto">
//         <CardContent className="pt-6">
//           <div className="text-center py-8">
//             <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
//             <p className="text-lg text-gray-600">No IQ questions available.</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (index >= questions.length) {
//     const percentage = Math.round((score / questions.length) * 100);
    
//     return (
//       <div className="max-w-2xl mx-auto space-y-6">
//         <Card>
//           <CardHeader className="text-center">
//             <div className="flex justify-center mb-4">
//               <Trophy className="h-16 w-16 text-yellow-500" />
//             </div>
//             <CardTitle className="text-2xl">Test Completed!</CardTitle>
//             <CardDescription>Here's how you performed</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <Alert>
//               <CheckCircle className="h-4 w-4" />
//               <AlertDescription className="text-lg font-medium">
//                 {getScoreMessage()}
//               </AlertDescription>
//             </Alert>
            
//             <div className="text-center space-y-4">
//               <div className="text-6xl font-bold text-blue-600">
//                 {score}<span className="text-2xl text-gray-400">/{questions.length}</span>
//               </div>
//               <div className="text-xl text-gray-600">
//                 {percentage}% Correct
//               </div>
//               <Progress value={percentage} className="h-3" />
//             </div>

//             <div className="flex justify-center">
//               <Badge className={getDifficultyColor(difficulty)}>
//                 Final Difficulty: {getDifficultyLabel(difficulty)}
//               </Badge>
//             </div>

//             <Button 
//               onClick={finish} 
//               className="w-full h-12 text-lg"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Saving Results..." : "Submit & Save Results"}
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const q = questions[index];
//   const progress = ((index) / questions.length) * 100;

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       {/* Progress Header */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex justify-between items-center mb-4">
//             <div className="flex items-center space-x-4">
//               <Brain className="h-6 w-6 text-blue-600" />
//               <span className="text-lg font-semibold">
//                 Question {index + 1} of {questions.length}
//               </span>
//             </div>
//             <Badge className={getDifficultyColor(difficulty)}>
//               {getDifficultyLabel(difficulty)}
//             </Badge>
//           </div>
//           <Progress value={progress} className="h-2" />
//         </CardContent>
//       </Card>

//       {/* Question Card */}
//       <Card className="shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-xl leading-relaxed">
//             {q.question}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {q.options.map((option, optionIndex) => (
//             <Button
//               key={option.id}
//               variant="outline"
//               size="lg"
//               onClick={() => choose(q.id, option.id)}
//               className="w-full h-auto p-4 text-left justify-start hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group"
//             >
//               <div className="flex items-start space-x-3 w-full">
//                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center font-semibold text-sm transition-colors duration-200">
//                   {option.id}
//                 </div>
//                 <div className="text-sm leading-relaxed text-left">
//                   {option.text}
//                 </div>
//               </div>
//             </Button>
//           ))}
//         </CardContent>
//       </Card>

//       {/* Stats Card */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex justify-between items-center text-sm text-gray-600">
//             <div>Current Score: <span className="font-semibold text-blue-600">{score}/{index}</span></div>
//             <div>Progress: <span className="font-semibold">{Math.round(progress)}%</span></div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, Brain, Clock, AlertTriangle, ArrowRight, Zap } from "lucide-react";

export default function IQClient({ initialQuestions }) {
  const { user } = useUser();
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [timeoutAnswers, setTimeoutAnswers] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [apiError, setApiError] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuestions(initialQuestions || []);
  }, [initialQuestions]);

  // Timer management
  useEffect(() => {
    if (questions.length > 0 && index < questions.length && !isAnswered) {
      const timeLimit = getTimeLimit(difficulty);
      setTimeLeft(timeLimit);
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [index, questions, difficulty]);

  const getTimeLimit = (diff) => {
    switch (diff) {
      case 1: return 45; // Easy: 45 seconds
      case 2: return 30; // Medium: 30 seconds  
      case 3: return 20; // Hard: 20 seconds
      default: return 30;
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!isAnswered && index < questions.length) {
      const q = questions[index];
      const timeoutAnswer = { 
        qid: q.id, 
        chosen: null, 
        correct: false, 
        timeout: true,
        timeTaken: getTimeLimit(difficulty)
      };
      
      setAnswers((a) => [...a, timeoutAnswer]);
      setTimeoutAnswers((prev) => prev + 1);
      setTotalTimeTaken((prev) => prev + getTimeLimit(difficulty));
      setIsAnswered(true);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    }
  };

  const choose = (qid, chosen) => {
    if (isAnswered) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsAnswered(true);
    setSelectedOption(chosen);
    
    const q = questions.find((x) => x.id === qid);
    const correct = q.correct_option === chosen;
    const timeTaken = getTimeLimit(difficulty) - timeLeft;
    
    setAnswers((a) => [...a, { qid, chosen, correct, timeTaken, timeout: false }]);
    setTotalTimeTaken((prev) => prev + timeTaken);
    
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setShowCorrectAnswer(true);
    }

    // Adaptive difficulty logic - with fallback behavior
    const lastTwo = [...answers, { qid, chosen, correct, timeTaken, timeout: false }].slice(-2);
    if (lastTwo.length === 2) {
      if (lastTwo.every((r) => r.correct) && difficulty < 3) {
        setDifficulty((d) => d + 1);
        // Try to fetch new questions, but continue if it fails
        fetchNewQuestions(difficulty + 1);
        return;
      } else if (lastTwo.every((r) => !r.correct) && difficulty > 1) {
        setDifficulty((d) => d - 1);
        // Try to fetch new questions, but continue if it fails
        fetchNewQuestions(difficulty - 1);
        return;
      }
    }

    setTimeout(() => {
      moveToNextQuestion();
    }, correct ? 1200 : 2000); // Show correct answer longer for wrong answers
  };

  const moveToNextQuestion = () => {
    setIndex((i) => i + 1);
    setIsAnswered(false);
    setSelectedOption(null);
    setShowCorrectAnswer(false);
  };

  const fetchNewQuestions = async (diff) => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const res = await fetch(`/api/iq/questions?difficulty=${diff}&limit=10`);
      if (!res.ok) {
        console.error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
        setApiError(true);
        // Fallback: Continue with current questions instead of stopping
        setTimeout(() => {
          setApiError(false);
          moveToNextQuestion();
        }, 2000);
        return;
      }
      const text = await res.text();
      if (!text) {
        console.error("Empty API response for new IQ questions");
        setApiError(true);
        // Fallback: Continue with current questions
        setTimeout(() => {
          setApiError(false);
          moveToNextQuestion();
        }, 2000);
        return;
      }
      const json = JSON.parse(text);
      
      if (!json.questions || json.questions.length === 0) {
        console.error("No questions returned from API");
        setApiError(true);
        // Fallback: Continue with current questions
        setTimeout(() => {
          setApiError(false);
          moveToNextQuestion();
        }, 2000);
        return;
      }
      
      setQuestions(json.questions);
      setIndex(0);
      setAnswers([]);
      setScore(0);
      setTimeoutAnswers(0);
      setTotalTimeTaken(0);
      setIsAnswered(false);
      setSelectedOption(null);
      setShowCorrectAnswer(false);
      setApiError(false);
    } catch (err) {
      console.error("Error fetching new IQ questions:", err);
      setApiError(true);
      // Fallback: Continue with current questions instead of stopping
      setTimeout(() => {
        setApiError(false);
        moveToNextQuestion();
      }, 2000);
    }
  };

  const finish = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsSubmitting(true);
    try {
      const avgTimePerQuestion = totalTimeTaken / questions.length;
      const body = {
        clerkId: user?.id || null,
        round: "iq",
        score,
        total: questions.length,
        details: answers,
        difficulty_summary: { 
          difficulty, 
          timeoutAnswers, 
          totalTimeTaken,
          avgTimePerQuestion: Math.round(avgTimePerQuestion)
        },
      };
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error("Error submitting results:", error);
    }
    setIsSubmitting(false);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 1: return "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg";
      case 2: return "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg";
      case 3: return "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg";
      default: return "bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg";
    }
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 1: return "Easy";
      case 2: return "Medium";
      case 3: return "Hard";
      default: return "Unknown";
    }
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return { message: "Outstanding Performance! 🏆", color: "text-yellow-600" };
    if (percentage >= 80) return { message: "Excellent Work! 🌟", color: "text-green-600" };
    if (percentage >= 70) return { message: "Great Job! 👏", color: "text-blue-600" };
    if (percentage >= 60) return { message: "Good Effort! 👍", color: "text-purple-600" };
    return { message: "Keep Practicing! 💪", color: "text-gray-600" };
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / getTimeLimit(difficulty)) * 100;
    if (percentage > 50) return "text-emerald-600";
    if (percentage > 25) return "text-amber-600";
    return "text-red-600";
  };

  const getTimerBgColor = () => {
    const percentage = (timeLeft / getTimeLimit(difficulty)) * 100;
    if (percentage > 50) return "from-emerald-500 to-green-500";
    if (percentage > 25) return "from-amber-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  // No questions available
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-6">
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardContent className="pt-8">
            <div className="text-center py-8">
              <Brain className="h-20 w-20 mx-auto text-purple-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Questions Available</h2>
              <p className="text-gray-600">Please check back later for new questions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test completed
  if (index >= questions.length) {
    const percentage = Math.round((score / questions.length) * 100);
    const scoreMessage = getScoreMessage();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-6">
        <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-30 animate-ping"></div>
                <Trophy className="relative h-20 w-20 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Test Completed!
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Here's your detailed performance analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <AlertDescription className={`text-xl font-semibold ${scoreMessage.color}`}>
                {scoreMessage.message}
              </AlertDescription>
            </Alert>
            
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {score}
                </div>
                <div className="text-2xl text-gray-500 mt-2">
                  out of {questions.length} questions
                </div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {percentage}% Accuracy
                </div>
              </div>
              
              <div className="relative">
                <Progress value={percentage} className="h-4 bg-gradient-to-r from-blue-100 to-purple-100" />
                <div className="text-xs text-gray-500 mt-2">Performance Score</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{formatTotalTime(totalTimeTaken)}</div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{Math.round(totalTimeTaken / questions.length)}s</div>
                <div className="text-sm text-gray-600">Avg per Question</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 flex-wrap gap-2">
              <Badge className={`${getDifficultyColor(difficulty)} px-4 py-2 text-lg`}>
                Final Level: {getDifficultyLabel(difficulty)}
              </Badge>
              {timeoutAnswers > 0 && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-lg shadow-lg">
                  ⏰ {timeoutAnswers} Timeouts
                </Badge>
              )}
            </div>

            <Button 
              onClick={finish} 
              className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transform transition-transform hover:scale-105"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Saving Results...</span>
                </div>
              ) : (
                "Submit & Save Results"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[index];
  const progress = ((index) / questions.length) * 100;
  const timerProgress = (timeLeft / getTimeLimit(difficulty)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Animated Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Aptitude Challenge
          </h1>
          <div className="flex justify-center items-center space-x-6 text-lg">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-700">Score: {score}/{index}</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-gray-700">Progress: {Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Progress & Timer Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-semibold text-gray-800">
                Question {index + 1} of {questions.length}
              </span>
              <div className="flex items-center space-x-4">
                <Badge className={getDifficultyColor(difficulty)}>
                  <Zap className="h-4 w-4 mr-1" />
                  {getDifficultyLabel(difficulty)}
                </Badge>
                <div className={`flex items-center space-x-3 ${getTimerColor()}`}>
                  <Clock className="h-6 w-6" />
                  <span className="text-2xl font-bold tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Question Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-gradient-to-r from-blue-100 to-purple-100" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Time Remaining</span>
                  <span>{Math.round(timerProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getTimerBgColor()}`}
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className={`bg-white/95 backdrop-blur-sm shadow-2xl border-0 transition-all duration-300 ${
          timeLeft <= 5 && !isAnswered ? 'ring-4 ring-red-500 ring-opacity-50 animate-pulse' : ''
        }`}>
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800 leading-relaxed">
              {q.question}
            </CardTitle>
            
            {/* API Error Alert */}
            {apiError && (
              <Alert className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <AlertDescription className="font-medium text-orange-800">
                  🔄 Difficulty adjustment failed. Continuing with current questions...
                </AlertDescription>
              </Alert>
            )}

            {/* Time Warning */}
            {timeLeft <= 10 && !isAnswered && (
              <Alert className={`border-0 shadow-lg ${
                timeLeft <= 5 
                  ? 'bg-gradient-to-r from-red-50 to-pink-50' 
                  : 'bg-gradient-to-r from-orange-50 to-yellow-50'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${timeLeft <= 5 ? 'text-red-600' : 'text-orange-600'}`} />
                <AlertDescription className={`font-medium ${timeLeft <= 5 ? 'text-red-800' : 'text-orange-800'}`}>
                  {timeLeft <= 5 ? '🚨 Time running out!' : '⚠️ Less than 10 seconds remaining'}
                </AlertDescription>
              </Alert>
            )}

            {/* Answer Feedback */}
            {isAnswered && (
              <Alert className={`border-0 shadow-lg ${
                selectedOption && q.correct_option === selectedOption
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'bg-gradient-to-r from-red-50 to-pink-50'
              }`}>
                <CheckCircle className={`h-5 w-5 ${
                  selectedOption && q.correct_option === selectedOption ? 'text-green-600' : 'text-red-600'
                }`} />
                <AlertDescription className={`font-medium ${
                  selectedOption && q.correct_option === selectedOption ? 'text-green-800' : 'text-red-800'
                }`}>
                  {selectedOption && q.correct_option === selectedOption 
                    ? '✅ Correct! Well done!' 
                    : `❌ Incorrect. The correct answer was ${q.correct_option}.`
                  }
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4 pb-8">
            {q.options.map((option, optionIndex) => {
              const optionColors = [
                'hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-300 hover:shadow-lg',
                'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 hover:shadow-lg', 
                'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:border-green-300 hover:shadow-lg',
                'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 hover:shadow-lg'
              ];
              
              const letterBg = [
                'bg-gradient-to-r from-red-500 to-pink-500',
                'bg-gradient-to-r from-blue-500 to-cyan-500',
                'bg-gradient-to-r from-green-500 to-emerald-500', 
                'bg-gradient-to-r from-purple-500 to-indigo-500'
              ];

              // Determine button state styling
              let buttonStyle = optionColors[optionIndex];
              let letterStyle = letterBg[optionIndex];

              if (isAnswered) {
                if (option.id === selectedOption) {
                  if (q.correct_option === selectedOption) {
                    buttonStyle = 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-lg';
                    letterStyle = 'bg-gradient-to-r from-green-600 to-emerald-600';
                  } else {
                    buttonStyle = 'bg-gradient-to-r from-red-100 to-pink-100 border-red-300 shadow-lg';
                    letterStyle = 'bg-gradient-to-r from-red-600 to-pink-600';
                  }
                } else if (option.id === q.correct_option && showCorrectAnswer) {
                  buttonStyle = 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md';
                  letterStyle = 'bg-gradient-to-r from-green-500 to-emerald-500';
                } else {
                  buttonStyle = 'opacity-60 cursor-not-allowed';
                  letterStyle = letterBg[optionIndex] + ' opacity-60';
                }
              }
              
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  size="lg"
                  onClick={() => choose(q.id, option.id)}
                  disabled={isAnswered}
                  className={`w-full h-auto p-6 text-left justify-start transition-all duration-300 group border-2 ${buttonStyle} transform hover:scale-[1.02]`}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg transition-all duration-300 ${letterStyle}`}>
                      {option.id}
                    </div>
                    <div className="text-lg leading-relaxed text-left font-medium text-gray-800 flex-grow">
                      {option.text}
                    </div>
                    {!isAnswered && (
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    )}
                    {isAnswered && option.id === selectedOption && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        q.correct_option === selectedOption ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <span className="text-white text-sm font-bold">
                          {q.correct_option === selectedOption ? '✓' : '✗'}
                        </span>
                      </div>
                    )}
                    {isAnswered && option.id === q.correct_option && option.id !== selectedOption && showCorrectAnswer && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}