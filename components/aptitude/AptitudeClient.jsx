// "use client";

// import { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";

// export default function AptitudeClient({ initialQuestions }) {
//   const { user } = useUser();
//   const [questions, setQuestions] = useState(initialQuestions || []);
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState([]); // {qid, chosen, correct}
//   const [score, setScore] = useState(0);
//   const [difficulty, setDifficulty] = useState(1);

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
//       const res = await fetch(`/api/questions?difficulty=${diff}&limit=10`);
//       if (!res.ok) {
//         console.error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
//         return;
//       }
//       const text = await res.text();
//       if (!text) {
//         console.error("Empty API response for new questions");
//         return;
//       }
//       const json = JSON.parse(text);
//       setQuestions(json.questions || []);
//       setIndex(0);
//       setAnswers([]);
//       setScore(0);
//     } catch (err) {
//       console.error("Error fetching new questions:", err);
//     }
//   };

//   const finish = async () => {
//     const body = {
//       clerkId: user?.id || null,
//       round: "aptitude",
//       score,
//       total: questions.length,
//       details: answers,
//       difficulty_summary: { difficulty },
//     };
//     await fetch("/api/attempts", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });
//     alert(`Test completed. Score: ${score}/${questions.length}`);
//   };

//   if (!questions || questions.length === 0) {
//     return <div>No questions available.</div>;
//   }

//   if (index >= questions.length) {
//     return (
//       <div>
//         <h2>Your score: {score}/{questions.length}</h2>
//         <button
//           onClick={finish}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Submit & Save
//         </button>
//       </div>
//     );
//   }

//   const q = questions[index];
//   return (
//     <div>
//       <div className="mb-3 text-lg font-semibold">
//         Q{index + 1}: {q.question}
//       </div>
//       <div className="space-y-2">
//         {q.options.map((o) => (
//           <button
//             key={o.id}
//             onClick={() => choose(q.id, o.id)}
//             className="block w-full text-left px-4 py-2 border rounded"
//           >
//             {o.id}. {o.text}
//           </button>
//         ))}
//       </div>
//       <div className="mt-4 text-sm text-gray-600">
//         Difficulty: {difficulty}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Trophy, RotateCcw, Clock, Zap, Star } from "lucide-react";

export default function AptitudeClient({ initialQuestions = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [timePerQuestion] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [individualTimes, setIndividualTimes] = useState([]);

  const currentQuestion = initialQuestions[currentIndex];
  const totalQuestions = initialQuestions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || showResult || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, showResult, isComplete, currentIndex]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(timePerQuestion);
    setIsTimerActive(true);
    setQuestionStartTime(Date.now());
  }, [currentIndex, timePerQuestion]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    const questionTime = timePerQuestion;
    const newIndividualTimes = [...individualTimes, questionTime];
    setIndividualTimes(newIndividualTimes);
    
    const isCorrect = false;
    const newAnswers = [...answers, { 
      questionId: currentQuestion.id, 
      selectedAnswer: null, 
      isCorrect: false,
      timeUp: true,
      timeUsed: questionTime
    }];
    setAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / timePerQuestion) * 100;
    if (percentage <= 16) return "text-red-500";
    if (percentage <= 33) return "text-orange-500";
    if (percentage <= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const getTimerBgColor = () => {
    const percentage = (timeLeft / timePerQuestion) * 100;
    if (percentage <= 16) return "from-red-500 to-red-600";
    if (percentage <= 33) return "from-orange-500 to-orange-600";
    if (percentage <= 50) return "from-yellow-500 to-yellow-600";
    return "from-green-500 to-green-600";
  };

  const getTimerProgress = () => {
    return (timeLeft / timePerQuestion) * 100;
  };

  const getQuestionTimeRating = (timeUsed) => {
    if (timeUsed <= 10) return { rating: "Lightning ⚡", color: "text-yellow-500" };
    if (timeUsed <= 15) return { rating: "Fast 🚀", color: "text-green-500" };
    if (timeUsed <= 20) return { rating: "Good ⏱️", color: "text-blue-500" };
    if (timeUsed <= 25) return { rating: "Steady 🐢", color: "text-gray-500" };
    return { rating: "Slow 🕐", color: "text-red-500" };
  };

  const handleOptionSelect = (optionId) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    setIsTimerActive(false);
    const questionTime = timePerQuestion - timeLeft;
    const newIndividualTimes = [...individualTimes, questionTime];
    setIndividualTimes(newIndividualTimes);
    
    const isCorrect = selectedAnswer === currentQuestion.correct_option;
    const newAnswers = [...answers, { 
      questionId: currentQuestion.id, 
      selectedAnswer, 
      isCorrect,
      timeUsed: questionTime
    }];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setIsComplete(true);
      }
    }, 1500);
  };

  const resetTest = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsComplete(false);
    setShowResult(false);
    setAnswers([]);
    setTimeLeft(timePerQuestion);
    setTotalTime(0);
    setIsTimerActive(true);
    setQuestionStartTime(Date.now());
    setIndividualTimes([]);
  };

  const getScoreColor = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return "Outstanding! 🌟";
    if (percentage >= 80) return "Excellent work! 👏";
    if (percentage >= 70) return "Good job! 👍";
    if (percentage >= 60) return "Not bad! Keep practicing 📚";
    return "Keep studying and try again! 💪";
  };

  const getSpeedBonus = () => {
    const avgTimePerQuestion = totalTime / totalQuestions;
    if (avgTimePerQuestion < 15) return "Lightning Fast! ⚡";
    if (avgTimePerQuestion < 20) return "Quick Thinker! 🚀";
    if (avgTimePerQuestion < 25) return "Good Pace! ⏱️";
    return "Steady & Thoughtful! 🤔";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (totalQuestions === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No questions available.</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-32 left-1/3 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-16 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
        </div>

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-20 transform -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 transform translate-y-12 -translate-x-12"></div>
          
          <CardHeader className="text-center pb-4 relative z-10">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Test Complete!
            </h2>
            <div className="flex items-center justify-center mt-2 space-x-1">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-8 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20">
              <div className="text-6xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {score}/{totalQuestions}
              </div>
              <div className="text-2xl text-gray-700 mb-3 font-semibold">
                {Math.round((score / totalQuestions) * 100)}% Correct
              </div>
              <div className="text-lg font-medium text-gray-600 mb-4">
                {getScoreMessage()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Total Time</div>
                  <div className="text-xl font-bold text-blue-600">{formatTime(totalTime)}</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Speed Rating</div>
                  <div className="text-lg font-bold text-green-600">{getSpeedBonus()}</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-600 mb-1">Avg per Question</div>
                  <div className="text-xl font-bold text-purple-600">
                    {Math.round(totalTime / totalQuestions)}s
                  </div>
                </div>
              </div>
              
              {individualTimes.length > 0 && (
                <div className="mt-6 bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-white/30">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {individualTimes.map((time, idx) => {
                      const rating = getQuestionTimeRating(time);
                      const wasCorrect = answers[idx]?.isCorrect;
                      return (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border-2 ${
                            wasCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="text-xs text-gray-600">Q{idx + 1}</div>
                          <div className="font-bold text-sm flex items-center">
                            {time}s
                            {wasCorrect ? (
                              <CheckCircle className="w-3 h-3 text-green-600 ml-1" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-600 ml-1" />
                            )}
                          </div>
                          <div className={`text-xs ${rating.color}`}>{rating.rating}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Alert className="text-left bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Performance Summary:</strong> You answered {score} out of {totalQuestions} questions correctly in {formatTime(totalTime)}. 
                Average time per question: {Math.round(totalTime / totalQuestions)} seconds.
                {score === totalQuestions && " Perfect score! 🎉"}
              </AlertDescription>
            </Alert>

            <Button 
              onClick={resetTest}
              className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12 -translate-x-full transition-transform duration-1000"></div>
              <RotateCcw className="w-6 h-6 mr-3" />
              Take Test Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 transform -translate-y-10 translate-x-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 transform translate-y-8 -translate-x-8 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <CardContent className="p-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center md:text-left">
              <div className="text-sm font-medium text-gray-600 mb-1">Question Progress</div>
              <div className="text-lg font-bold text-gray-800">
                {currentIndex + 1} of {totalQuestions}
              </div>
            </div>
            
            <div className="text-center relative">
              <div className="text-sm font-medium text-gray-600 mb-2">Time Remaining</div>
              
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="100, 100"
                    className="text-gray-200"
                  />
                  <path
                    d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${getTimerProgress()}, 100`}
                    className={`transition-all duration-1000 ${
                      timeLeft <= 5 ? 'text-red-500' : 
                      timeLeft <= 10 ? 'text-orange-500' : 
                      timeLeft <= 15 ? 'text-yellow-500' : 'text-green-500'
                    } ${timeLeft <= 10 ? 'animate-pulse' : ''}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-2xl font-bold ${getTimerColor()} ${timeLeft <= 5 ? 'animate-bounce' : ''}`}>
                    {timeLeft}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 w-full max-w-xs mx-auto">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>0s</span>
                  <span>30s</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getTimerBgColor()} transition-all duration-1000 ${
                      timeLeft <= 10 ? 'animate-pulse' : ''
                    }`}
                    style={{ width: `${getTimerProgress()}%` }}
                  ></div>
                </div>
              </div>
              
              {timeLeft <= 10 && (
                <div className="mt-2 text-xs font-semibold text-red-500 animate-pulse">
                  ⚠️ Hurry up!
                </div>
              )}
            </div>
            
            <div className="text-center md:text-right">
              <div className="text-sm font-medium text-gray-600 mb-1">Current Score</div>
              <div className="text-lg font-bold text-green-600">
                {score}/{currentIndex + (showResult ? 1 : 0)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-2xl border-0 bg-white relative overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <CardHeader className="pb-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              Q{currentIndex + 1}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 leading-relaxed flex-1">
              {currentQuestion.question}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          {currentQuestion.options.map((option) => {
            let buttonClass = "w-full p-5 text-left border-2 rounded-2xl font-medium transition-all duration-300 transform ";
            
            if (showResult) {
              if (option.id === currentQuestion.correct_option) {
                buttonClass += "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-lg scale-105";
              } else if (option.id === selectedAnswer && option.id !== currentQuestion.correct_option) {
                buttonClass += "border-red-500 bg-gradient-to-r from-red-50 to-rose-50 text-red-800 shadow-lg";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-500 opacity-60";
              }
            } else if (selectedAnswer === option.id) {
              buttonClass += "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 shadow-lg ring-4 ring-blue-200 scale-105";
            } else {
              buttonClass += "border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-102 text-gray-700";
            }

            return (
              <Button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={buttonClass}
                disabled={showResult}
                variant="ghost"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    showResult && option.id === currentQuestion.correct_option 
                      ? "bg-green-500 text-white shadow-lg" 
                      : showResult && option.id === selectedAnswer && option.id !== currentQuestion.correct_option
                      ? "bg-red-500 text-white shadow-lg"
                      : selectedAnswer === option.id 
                      ? "bg-blue-500 text-white shadow-lg" 
                      : "bg-gray-200 text-gray-600 group-hover:bg-blue-100"
                  }`}>
                    {option.id}
                  </div>
                  <span className="flex-1 text-left">{option.text}</span>
                  {showResult && option.id === currentQuestion.correct_option && (
                    <CheckCircle className="w-6 h-6 text-green-600 animate-bounce" />
                  )}
                  {showResult && option.id === selectedAnswer && option.id !== currentQuestion.correct_option && (
                    <XCircle className="w-6 h-6 text-red-600 animate-pulse" />
                  )}
                </div>
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {showResult && (
        <Alert className={`transform transition-all duration-500 animate-in slide-in-from-bottom-4 ${
          selectedAnswer === currentQuestion.correct_option || (selectedAnswer === null && answers[answers.length - 1]?.timeUp)
            ? selectedAnswer === currentQuestion.correct_option 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg" 
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-lg"
            : "bg-gradient-to-r from-red-50 to-rose-50 border-red-300 shadow-lg"
        }`}>
          {selectedAnswer === currentQuestion.correct_option ? (
            <CheckCircle className="w-6 h-6 text-green-600 animate-bounce" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 animate-pulse" />
          )}
          <AlertDescription className={`font-semibold text-lg ${
            selectedAnswer === currentQuestion.correct_option 
              ? "text-green-800" 
              : "text-red-800"
          }`}>
            {selectedAnswer === currentQuestion.correct_option 
              ? "🎉 Correct! Excellent work!" 
              : selectedAnswer === null && answers[answers.length - 1]?.timeUp
              ? `⏰ Time's up! The correct answer was ${currentQuestion.correct_option}.`
              : `❌ Incorrect. The correct answer was ${currentQuestion.correct_option}.`
            }
          </AlertDescription>
        </Alert>
      )}

      {!showResult && (
        <div className="flex justify-center">
          <Button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-12 py-8 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:shadow-none disabled:scale-100 relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex items-center">
              {currentIndex === totalQuestions - 1 ? (
                <>
                  <Trophy className="w-6 h-6 mr-3" />
                  Finish Test
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 mr-3" />
                  Next Question
                </>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}