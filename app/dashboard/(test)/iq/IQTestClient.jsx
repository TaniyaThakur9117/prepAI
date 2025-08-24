"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw, Shuffle, Trophy, Zap, Clock } from "lucide-react";
import { saveAttempt } from "@/lib/saveAttempt";
import { saveFinalScore } from "@/lib/saveFinalScore";

// Simple shuffle function
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function IQTestClient({ questions: initialQuestions = [] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [finalScoreSaved, setFinalScoreSaved] = useState(false);
  
  // Timer states
  const [timePerQuestion] = useState(60); // 60 seconds per question
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [timerActive, setTimerActive] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Timer effect
  useEffect(() => {
    let intervalId;
    
    if (timerActive && timeRemaining > 0 && !testCompleted && !showResult) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto-submit with no answer
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerActive, timeRemaining, testCompleted, showResult]);

  // Reset timer when moving to next question
  useEffect(() => {
    if (!testCompleted && !showResult) {
      setTimeRemaining(timePerQuestion);
      setTimerActive(true);
    }
  }, [currentQuestionIndex, testCompleted, showResult, timePerQuestion]);

  // Function to handle time up
  const handleTimeUp = async () => {
    setTimerActive(false);
    
    const newAnswers = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        selectedAnswer: null, // No answer selected
        isCorrect: false,
      },
    ];
    setUserAnswers(newAnswers);

    // Calculate current score
    const correctAnswers = newAnswers.filter(answer => answer.isCorrect).length;
    const currentScore = Math.round((correctAnswers / (currentQuestionIndex + 1)) * 100);

    // Save the attempt
    await handleSubmit(currentQuestionIndex + 1, null, false, currentScore);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerLocked(false);
    } else {
      // Test completed
      const finalScore = correctAnswers;
      setTestCompleted(true);
      await handleTestCompletion(finalScore);
    }
  };

  // Function to handle saving attempt data
  const handleSubmit = async (questionId, answer, isCorrect, score) => {
    try {
      await saveAttempt("iq", questionId, answer, isCorrect, score);
    } catch (error) {
      console.error("Failed to save attempt:", error);
    }
  };

  // Function to handle test completion and save final score
  const handleTestCompletion = async (totalScore) => {
    try {
      await saveFinalScore("iq", totalScore);
      setFinalScoreSaved(true);
      alert("IQ Test completed! Score saved.");
    } catch (error) {
      console.error("Failed to save final score:", error);
      alert("Test completed, but there was an error saving your score.");
    }
  };

  const handleAnswerSelect = (optionId) => {
    if (!answerLocked) {
      setSelectedAnswer(optionId);
    }
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) return;

    setTimerActive(false); // Stop timer

    const isCorrect = selectedAnswer === currentQuestion.correct_option;
    const newAnswers = [
      ...userAnswers,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      },
    ];
    setUserAnswers(newAnswers);

    // Calculate current score for this attempt
    const correctAnswers = newAnswers.filter(answer => answer.isCorrect).length;
    const currentScore = Math.round((correctAnswers / (currentQuestionIndex + 1)) * 100);

    // Save the attempt for this question using the question index as integer ID
    await handleSubmit(currentQuestionIndex + 1, selectedAnswer, isCorrect, currentScore);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAnswerLocked(false);
    } else {
      // Test completed - calculate final score and save it
      const finalScore = correctAnswers; // Store actual number of correct answers, not percentage
      setTestCompleted(true);
      await handleTestCompletion(finalScore);
    }
  };

  const handleShowResult = () => {
    setShowResult(true);
    setAnswerLocked(true);
    setTimerActive(false); // Stop timer when showing result
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResult(false);
    setTestCompleted(false);
    setAnswerLocked(false);
    setFinalScoreSaved(false);
    setTimeRemaining(timePerQuestion);
    setTimerActive(true);
  };

  const handleNewRandomTest = () => {
    const shuffledQuestions = shuffleArray(initialQuestions);
    setQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResult(false);
    setTestCompleted(false);
    setAnswerLocked(false);
    setFinalScoreSaved(false);
    setTimeRemaining(timePerQuestion);
    setTimerActive(true);
  };

  const calculateScore = () => {
    if (userAnswers.length === 0) return 0;
    const correctAnswers = userAnswers.filter((answer) => answer.isCorrect).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const getPerformanceFeedback = (score) => {
    if (score >= 90)
      return {
        level: "Exceptional",
        message:
          "Outstanding performance! You demonstrate exceptional analytical and problem-solving abilities.",
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300"
      };
    if (score >= 80)
      return {
        level: "Excellent",
        message:
          "Excellent performance! You have strong analytical skills and cognitive abilities.",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300"
      };
    if (score >= 70)
      return {
        level: "Good",
        message:
          "Good job! You demonstrated solid problem-solving abilities with room for growth.",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300"
      };
    if (score >= 60)
      return {
        level: "Fair",
        message:
          "Fair performance! With practice, you can improve your analytical thinking skills.",
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-300"
      };
    return {
      level: "Needs Improvement",
      message:
        "Keep practicing! IQ tests require specific problem-solving strategies and familiarity with question types.",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300"
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-purple-200 bg-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-purple-600 mb-4">
              No Questions Available
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to load test questions.
            </p>
            <p className="text-sm text-gray-500">
              Please check your database connection and try refreshing the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all duration-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (testCompleted) {
    const score = calculateScore();
    const correctAnswers = userAnswers.filter((answer) => answer.isCorrect).length;
    const feedback = getPerformanceFeedback(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-8">
        <div className="w-full max-w-4xl mx-auto px-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-md border border-purple-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-purple-500 mb-2">Question Progress</h3>
                <p className="text-2xl font-bold text-purple-900">{totalQuestions} of {totalQuestions}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md border border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-blue-500 mb-2">Current Score</h3>
                <p className="text-2xl font-bold text-blue-600">{correctAnswers}/{totalQuestions}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-md border border-purple-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-purple-500 mb-2">Overall Progress</h3>
                <p className="text-2xl font-bold text-purple-900">100%</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white shadow-lg border border-purple-200">
            <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-purple-200">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Trophy className="w-12 h-12 text-purple-500" />
                  {finalScoreSaved && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Test Completed!
              </CardTitle>
              {finalScoreSaved && (
                <p className="text-sm text-blue-600 font-medium mt-2">
                  ✓ Score successfully saved
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="text-center">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {score}%
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  You got {correctAnswers} out of {totalQuestions} questions correct
                </p>
                <div className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${feedback.color} ${feedback.bgColor} border ${feedback.borderColor}`}>
                  {feedback.level} Performance
                </div>
              </div>

              <Alert className={`${feedback.borderColor} ${feedback.bgColor} border`}>
                <CheckCircle className={`h-5 w-5 ${feedback.color}`} />
                <AlertDescription className={`${feedback.color} font-medium`}>
                  {feedback.message}
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button 
                  onClick={handleRestart} 
                  variant="outline" 
                  className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Same Questions
                </Button>
                <Button 
                  onClick={handleNewRandomTest} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                  size="lg"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle Questions
                </Button>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="ghost"
                  className="text-sm text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                >
                  Get New Random Questions
                </Button>
              </div>

              <div className="text-center text-xs text-gray-400 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                <p>Your answers: {userAnswers.map((a) => a.selectedAnswer || "No Answer").join(", ")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentScore = userAnswers.filter(answer => answer.isCorrect).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 py-8">
      <div className="w-full max-w-4xl mx-auto px-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-md border border-purple-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-purple-500 mb-2">Question Progress</h3>
              <p className="text-2xl font-bold text-purple-900">{currentQuestionIndex + 1} of {totalQuestions}</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md border border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-blue-500 mb-2">Time Remaining</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 14}`}
                      strokeDashoffset={`${2 * Math.PI * 14 * (1 - timeRemaining / timePerQuestion)}`}
                      className={timeRemaining <= 10 ? "text-red-500" : "text-blue-500"}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Clock className={`w-4 h-4 ${timeRemaining <= 10 ? "text-red-500" : "text-blue-500"} mb-1`} />
                    <span className={`text-sm font-bold ${timeRemaining <= 10 ? "text-red-600" : "text-blue-600"}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md border border-purple-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-sm font-medium text-purple-500 mb-2">Current Score</h3>
              <p className="text-2xl font-bold text-purple-600">{currentScore}/{currentQuestionIndex}</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-600">Overall Progress</span>
            <span className="text-sm font-medium text-purple-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-white shadow-lg border border-purple-200 mb-6">
          <CardContent className="p-8">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg mr-4">
                  Q{currentQuestionIndex + 1}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 flex-1">
                  {currentQuestion.question}
                </h2>
              </div>
              {currentQuestion.difficulty && (
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                    currentQuestion.difficulty === "easy"
                      ? "bg-blue-100 text-blue-700"
                      : currentQuestion.difficulty === "medium"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options &&
                currentQuestion.options.map((option) => {
                  let buttonClass = "";
                  let isClickable = !answerLocked;
                  
                  if (showResult) {
                    if (option.id === currentQuestion.correct_option) {
                      buttonClass = "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100";
                    } else if (option.id === selectedAnswer && selectedAnswer !== currentQuestion.correct_option) {
                      buttonClass = "bg-red-100 text-red-800 border-red-300 hover:bg-red-100";
                    } else {
                      buttonClass = "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50";
                    }
                  } else if (selectedAnswer === option.id) {
                    buttonClass = "bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-200";
                  } else {
                    buttonClass = answerLocked 
                      ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                      : "bg-white text-gray-700 border-purple-300 hover:bg-purple-50 hover:border-purple-400";
                  }

                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={`w-full p-4 h-auto text-left justify-start text-wrap whitespace-normal min-h-[3rem] transition-all duration-200 ${buttonClass}`}
                      onClick={() => isClickable && handleAnswerSelect(option.id)}
                      disabled={answerLocked && !showResult}
                    >
                      <span className="font-semibold mr-3 flex-shrink-0 text-sm">
                        {option.id}
                      </span>
                      <span className="text-sm leading-relaxed">{option.text}</span>
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Lock indicator */}
        {answerLocked && !showResult && (
          <Alert className="border-purple-200 bg-purple-50 mb-6">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 font-medium">
              Answer locked after viewing the correct answer. You can now proceed to the next question.
            </AlertDescription>
          </Alert>
        )}

        {/* Time warning */}
        {timeRemaining <= 10 && timeRemaining > 0 && !showResult && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <Clock className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              Time is running out! Only {timeRemaining} seconds remaining.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleShowResult}
            variant="outline"
            disabled={selectedAnswer === null || showResult}
            className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-50"
          >
            {showResult ? "Answer Shown" : "Show Answer"}
          </Button>
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
            size="lg"
          >
            {currentQuestionIndex === totalQuestions - 1
              ? "Finish Test"
              : "Next Question"}
          </Button>
        </div>

        {/* Result Alert */}
        {showResult && selectedAnswer && (
          <Alert
            className={`border ${
              selectedAnswer === currentQuestion.correct_option
                ? "border-blue-300 bg-blue-50"
                : "border-red-300 bg-red-50"
            }`}
          >
            {selectedAnswer === currentQuestion.correct_option ? (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription
              className={`font-medium ${
                selectedAnswer === currentQuestion.correct_option
                  ? "text-blue-800"
                  : "text-red-800"
              }`}
            >
              {selectedAnswer === currentQuestion.correct_option
                ? "Correct! Well done."
                : `Incorrect. The correct answer is ${currentQuestion.correct_option}.`}
              {currentQuestion.explanation && (
                <div className="mt-3 p-3 rounded-md bg-white/70 text-sm">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}