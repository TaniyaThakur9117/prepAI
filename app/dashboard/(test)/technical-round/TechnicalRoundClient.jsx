//app\dashboard\(test)\technical-round\TechnicalRoundClient.jsx
'use client'
import { useEffect, useState } from "react";
import { Sun, Moon, Play, Check, X, Code, Bug, HelpCircle, Trophy, Clock, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { saveAttempt } from "@/lib/saveAttempt";
import { saveFinalScore } from "@/lib/saveFinalScore";

export default function TechnicalRoundClient() {
  const [isDark, setIsDark] = useState(false);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mcqs, setMcqs] = useState([]);
  const [debugQs, setDebugQs] = useState([]);
  const [codingQs, setCodingQs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [debugAnswers, setDebugAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState({});

  const [sessionId, setSessionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // Fetch questions on component mount
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchQuestions = async () => {
      try {
        // Add session ID and customize question counts
        const queryParams = new URLSearchParams({
          session_id: sessionId,
          mcq_count: '5',
          debug_count: '3', 
          coding_count: '2'
          // difficulty: 'medium' // Optional: filter by difficulty
        });
        
        const res = await fetch(`/api/technical-questions?${queryParams}`);
        const data = await res.json();

        console.log("Fetched Data for session:", sessionId, data);

        if (data.error) {
          console.error("API Error:", data.error);
          setMcqs([]);
          setDebugQs([]);
          setCodingQs([]);
        } else {
          setMcqs(data?.mcqs || []);
          setDebugQs(data?.debug || []);
          setCodingQs(data?.coding || []);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        // Set empty arrays to prevent infinite loading
        setMcqs([]);
        setDebugQs([]);
        setCodingQs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinishAssessment();
    }
  }, [timeLeft, showResults]);

  // Initialize coding answers with starter code
  useEffect(() => {
    if (codingQs.length > 0) {
      const initialAnswers = {};
      codingQs.forEach(q => {
        if (!codingAnswers[q.id]) {
          initialAnswers[q.id] = q.starter_code || '';
        }
      });
      if (Object.keys(initialAnswers).length > 0) {
        setCodingAnswers(prev => ({ ...prev, ...initialAnswers }));
      }
    }
  }, [codingQs]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced MCQ answer handler with saveAttempt
  const handleMcqAnswer = async (questionId, answerIndex) => {
    setMcqAnswers({ ...mcqAnswers, [questionId]: answerIndex });

    try {
      // Find the question to get correct answer and calculate score
      const question = mcqs.find(q => q.id === questionId);
      const isCorrect = question && question.correct_option === answerIndex;
      const score = isCorrect ? 10 : 0; // MCQ scoring: 10 points for correct, 0 for incorrect
      const selectedOption = question?.options?.[answerIndex] || `Option ${answerIndex}`;

      await saveAttempt("technical-mcq", parseInt(questionId), selectedOption, isCorrect, score);
      console.log(`✅ Saved MCQ attempt for question ${questionId}: ${isCorrect ? 'Correct' : 'Incorrect'} (${score} pts)`);
    } catch (error) {
      console.error(`Error saving MCQ attempt for question ${questionId}:`, error);
    }
  };

  // Enhanced debug answer handler with saveAttempt
  const handleDebugAnswer = async (questionId, code) => {
    setDebugAnswers({ ...debugAnswers, [questionId]: code });

    try {
      // For debug questions, we evaluate based on effort and content length
      const isCorrect = code && code.trim().length > 50; // Basic evaluation criteria
      const score = isCorrect ? 15 : (code && code.trim().length > 10 ? 5 : 0); // Partial credit system

      await saveAttempt("technical-debug", parseInt(questionId), code, isCorrect, score);
      console.log(`✅ Saved Debug attempt for question ${questionId}: ${score} pts`);
    } catch (error) {
      console.error(`Error saving Debug attempt for question ${questionId}:`, error);
    }
  };

  // Enhanced coding answer handler with saveAttempt
  const handleCodingAnswer = async (questionId, code) => {
    setCodingAnswers({ ...codingAnswers, [questionId]: code });

    try {
      // Find the question to get starter code
      const question = codingQs.find(q => q.id === questionId);
      const starterLength = question?.starter_code?.length || 0;
      
      // Evaluate based on code length and effort
      const hasSignificantCode = code && code.trim().length > starterLength + 20;
      const isCorrect = hasSignificantCode; // Basic evaluation - you can enhance this
      const score = isCorrect ? 20 : (code && code.trim().length > starterLength ? 10 : 0);

      await saveAttempt("technical-coding", parseInt(questionId), code, isCorrect, score);
      console.log(`✅ Saved Coding attempt for question ${questionId}: ${score} pts`);
    } catch (error) {
      console.error(`Error saving Coding attempt for question ${questionId}:`, error);
    }
  };

  const runCode = async (code, questionId) => {
    if (!code || !code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setIsRunningCode(true);
    try {
      // Enhanced error handling for code execution
      const response = await fetch('/api/code-runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language_id: 63, // JavaScript (Node.js)
          source_code: code,
          stdin: ""
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // Handle both Judge0 and fallback simulation responses
      setCodeOutput(prev => ({
        ...prev,
        [questionId]: {
          stdout: result.stdout || '',
          stderr: result.stderr || '',
          compile_output: result.compile_output || '',
          status: result.status?.description || result.status || 'Unknown',
          execution_time: result.time || null,
          memory_used: result.memory || null
        }
      }));

      // Save code execution result as additional attempt data
      try {
        const executionSuccess = result.status?.description === 'Accepted' || result.status === 'Accepted';
        const executionScore = executionSuccess ? 25 : 20; // Bonus points for successful execution
        
        await saveAttempt("technical-coding-execution", parseInt(questionId), 
          JSON.stringify({
            code: code,
            status: result.status?.description || result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            execution_time: result.time,
            memory_used: result.memory
          }), 
          executionSuccess, 
          executionScore
        );
        
        console.log(`✅ Saved Code Execution result for question ${questionId}: ${executionSuccess ? 'Success' : 'Failed'} (${executionScore} pts)`);
      } catch (saveError) {
        console.error(`Error saving code execution result:`, saveError);
      }

      // Show success message for successful execution
      if (result.status?.description === 'Accepted' || result.status === 'Accepted') {
        console.log('Code executed successfully!');
      }

    } catch (error) {
      console.error('Error running code:', error);
      setCodeOutput(prev => ({
        ...prev,
        [questionId]: {
          stdout: '',
          stderr: `Execution Error: ${error.message}`,
          compile_output: '',
          status: 'Error',
          execution_time: null,
          memory_used: null
        }
      }));
    } finally {
      setIsRunningCode(false);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    // MCQ scoring
    mcqs.forEach(q => {
      maxScore += 10;
      if (mcqAnswers[q.id] === q.correct_option) {
        totalScore += 10;
      }
    });

    // Debug scoring (basic implementation)
    debugQs.forEach(q => {
      maxScore += 15;
      if (debugAnswers[q.id] && debugAnswers[q.id].trim().length > 50) {
        totalScore += 10; // Partial credit for attempting
      }
    });

    // Coding scoring (basic implementation)
    codingQs.forEach(q => {
      maxScore += 20;
      if (codingAnswers[q.id] && codingAnswers[q.id].trim().length > q.starter_code?.length) {
        totalScore += 15; // Partial credit for attempting
      }
    });

    return { totalScore, maxScore, percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0 };
  };

  // NEW: Test completion handler with final score saving
  const handleTestCompletion = async (totalScore) => {
    try {
      await saveFinalScore("technical-round", totalScore);
      console.log(`✅ Technical Assessment completed! Final score ${totalScore} saved.`);
    } catch (error) {
      console.error("Error saving final score:", error);
      // Don't block completion even if final score save fails
    }
  };

  const handleFinishAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Save all remaining attempts that might not have been saved individually
      const savePromises = [];

      // Save MCQ attempts
      Object.entries(mcqAnswers).forEach(([questionId, answerIndex]) => {
        const question = mcqs.find(q => q.id.toString() === questionId.toString());
        if (question) {
          const isCorrect = question.correct_option === answerIndex;
          const score = isCorrect ? 10 : 0;
          const selectedOption = question.options?.[answerIndex] || `Option ${answerIndex}`;
          
          savePromises.push(
            saveAttempt("technical-mcq", parseInt(questionId), selectedOption, isCorrect, score)
              .catch(error => console.error(`Final save error for MCQ ${questionId}:`, error))
          );
        }
      });

      // Save Debug attempts
      Object.entries(debugAnswers).forEach(([questionId, code]) => {
        const isCorrect = code && code.trim().length > 50;
        const score = isCorrect ? 15 : (code && code.trim().length > 10 ? 5 : 0);
        
        savePromises.push(
          saveAttempt("technical-debug", parseInt(questionId), code, isCorrect, score)
            .catch(error => console.error(`Final save error for Debug ${questionId}:`, error))
        );
      });

      // Save Coding attempts
      Object.entries(codingAnswers).forEach(([questionId, code]) => {
        const question = codingQs.find(q => q.id.toString() === questionId.toString());
        const starterLength = question?.starter_code?.length || 0;
        const hasSignificantCode = code && code.trim().length > starterLength + 20;
        const isCorrect = hasSignificantCode;
        const score = isCorrect ? 20 : (code && code.trim().length > starterLength ? 10 : 0);

        savePromises.push(
          saveAttempt("technical-coding", parseInt(questionId), code, isCorrect, score)
            .catch(error => console.error(`Final save error for Coding ${questionId}:`, error))
        );
      });

      // Wait for all saves to complete
      await Promise.all(savePromises);
      console.log("✅ All technical assessment attempts saved successfully");

      // Calculate final score
      const score = calculateScore();
      
      // NEW: Save final score using the new function
      await handleTestCompletion(score.totalScore);
      
      // Prepare assessment data
      const assessmentData = {
        session_id: sessionId,
        user_answers: {
          mcq: mcqAnswers,
          debug: debugAnswers,
          coding: codingAnswers
        },
        score_data: score,
        completed_at: new Date().toISOString(),
        time_taken: 1800 - timeLeft // Calculate time taken
      };

      // Optional: Save to database
      try {
        const saveResponse = await fetch('/api/technical-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assessmentData),
        });
        
        if (saveResponse.ok) {
          console.log('Assessment saved successfully');
        } else {
          console.log('Assessment not saved to database');
        }
      } catch (saveError) {
        console.log('Could not save assessment:', saveError.message);
        // Continue anyway - don't block user from seeing results
      }

      setShowResults(true);
    } catch (error) {
      console.error('Error finishing assessment:', error);
      // Still show results even if saving fails
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionData = () => {
    switch (currentSection) {
      case 'mcq': return mcqs;
      case 'debug': return debugQs;
      case 'coding': return codingQs;
      default: return [];
    }
  };

  const getCurrentQuestion = () => {
    const data = getSectionData();
    return data[currentIndex];
  };

  const canGoNext = () => {
    const data = getSectionData();
    return currentIndex < data.length - 1;
  };

  const canGoPrev = () => {
    return currentIndex > 0;
  };

  const nextQuestion = () => {
    if (canGoNext()) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Move to next section
      if (currentSection === 'mcq' && debugQs.length > 0) {
        setCurrentSection('debug');
        setCurrentIndex(0);
      } else if (currentSection === 'debug' && codingQs.length > 0) {
        setCurrentSection('coding');
        setCurrentIndex(0);
      }
    }
  };

  const prevQuestion = () => {
    if (canGoPrev()) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Move to previous section
      if (currentSection === 'debug' && mcqs.length > 0) {
        setCurrentSection('mcq');
        setCurrentIndex(mcqs.length - 1);
      } else if (currentSection === 'coding' && debugQs.length > 0) {
        setCurrentSection('debug');
        setCurrentIndex(debugQs.length - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical Assessment Complete!</h1>
            <div className="text-6xl font-bold text-blue-500 mb-4">{score.percentage}%</div>
            <p className="text-xl text-gray-600 mb-6">{score.totalScore} out of {score.maxScore} points</p>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Save className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Final score automatically saved to system
                </span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">MCQs</h3>
                <p className="text-gray-600">{Object.keys(mcqAnswers).length}/{mcqs.length}</p>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <Bug className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Debug</h3>
                <p className="text-gray-600">{Object.keys(debugAnswers).length}/{debugQs.length}</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <Code className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Coding</h3>
                <p className="text-gray-600">{Object.keys(codingAnswers).length}/{codingQs.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
              <div className="space-y-3">
                {mcqs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">MCQs Correct:</span>
                    <span className="font-semibold text-gray-900">
                      {mcqs.filter(q => mcqAnswers[q.id] === q.correct_option).length}/{mcqs.length}
                    </span>
                  </div>
                )}
                {debugQs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Debug Problems Attempted:</span>
                    <span className="font-semibold text-gray-900">
                      {Object.keys(debugAnswers).length}/{debugQs.length}
                    </span>
                  </div>
                )}
                {codingQs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Coding Challenges Attempted:</span>
                    <span className="font-semibold text-gray-900">
                      {Object.keys(codingAnswers).length}/{codingQs.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              All attempts have been automatically saved and tracked. Your final score of <strong>{score.totalScore} points</strong> has been saved to the system.
            </div>

            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const totalQuestions = mcqs.length + debugQs.length + codingQs.length;

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            There are no questions loaded from the database. Please check your database connection and ensure questions are properly seeded.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Technical Assessment</h1>
                <p className="text-sm text-gray-500">Section: <span className="font-medium capitalize text-gray-700">{currentSection}</span> ({currentIndex + 1}/{getSectionData().length})</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="font-mono text-lg font-bold text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-600" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sections</h3>
              
              <div className="space-y-3 mb-8">
                {[
                  { key: 'mcq', label: 'MCQs', icon: HelpCircle, count: mcqs.length, data: mcqs, color: 'blue' },
                  { key: 'debug', label: 'Debug', icon: Bug, count: debugQs.length, data: debugQs, color: 'orange' },
                  { key: 'coding', label: 'Coding', icon: Code, count: codingQs.length, data: codingQs, color: 'green' }
                ].filter(section => section.count > 0).map(section => (
                  <button
                    key={section.key}
                    onClick={() => {
                      setCurrentSection(section.key);
                      setCurrentIndex(0);
                    }}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 ${
                      currentSection === section.key 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                    <span className="ml-auto text-sm opacity-80">({section.count})</span>
                  </button>
                ))}
              </div>

              {/* Progress Overview */}
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Progress</h4>
                <div className="space-y-3">
                  {mcqs.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">MCQs:</span>
                      <span className="text-sm font-medium text-gray-900">{Object.keys(mcqAnswers).length}/{mcqs.length}</span>
                    </div>
                  )}
                  {debugQs.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Debug:</span>
                      <span className="text-sm font-medium text-gray-900">{Object.keys(debugAnswers).length}/{debugQs.length}</span>
                    </div>
                  )}
                  {codingQs.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Coding:</span>
                      <span className="text-sm font-medium text-gray-900">{Object.keys(codingAnswers).length}/{codingQs.length}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="text-xs text-gray-500 mb-4">
                  Session: {sessionId.slice(-8)}
                </div>
                <button
                  onClick={handleFinishAssessment}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-green-300 disabled:to-emerald-300 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                >
                  <Trophy className="w-5 h-5 inline mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Finish Assessment'}
                </button>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {currentQuestion && (
                <>
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${
                        currentSection === 'mcq' ? 'bg-blue-100 text-blue-600' :
                        currentSection === 'debug' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {currentSection === 'mcq' && <HelpCircle className="w-6 h-6" />}
                        {currentSection === 'debug' && <Bug className="w-6 h-6" />}
                        {currentSection === 'coding' && <Code className="w-6 h-6" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">{currentSection} Question {currentIndex + 1}</h2>
                        <p className="text-gray-500">Practice technical interview questions and get instant feedback.</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      currentSection === 'mcq' ? 'bg-blue-100 text-blue-800' :
                      currentSection === 'debug' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {currentSection === 'mcq' ? '10 pts' : currentSection === 'debug' ? '15 pts' : '20 pts'}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-8">
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Question:</h3>
                      <p className="text-lg text-gray-800 leading-relaxed">{currentQuestion.question}</p>
                    </div>

                    {/* MCQ Options */}
                    {currentSection === 'mcq' && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              mcqAnswers[currentQuestion.id] === index
                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
                                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-25'
                            }`}
                          >
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`mcq-${currentQuestion.id}`}
                                value={index}
                                checked={mcqAnswers[currentQuestion.id] === index}
                                onChange={() => handleMcqAnswer(currentQuestion.id, index)}
                                className="w-5 h-5 text-blue-600 mr-4"
                              />
                              <div className="flex items-center">
                                <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="text-gray-800">{option}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Debug Code */}
                    {currentSection === 'debug' && (
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Code to Debug:</h4>
                          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                            <pre className="text-green-400 text-sm font-mono">
                              <code>{currentQuestion.code}</code>
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Your Analysis & Fix:</h4>
                          <textarea
                            value={debugAnswers[currentQuestion.id] || ''}
                            onChange={(e) => handleDebugAnswer(currentQuestion.id, e.target.value)}
                            placeholder="Describe the bug and provide your fixed code..."
                            className="w-full h-48 p-4 rounded-xl border border-gray-200 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}

                    {/* Coding Challenge */}
                    {currentSection === 'coding' && (
                      <div className="space-y-6">
                        {currentQuestion.starter_code && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Starter Code:</h4>
                            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
                              <pre className="text-green-400 text-sm font-mono">
                                <code>{currentQuestion.starter_code}</code>
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">Your Solution:</h4>
                            <button
                              onClick={() => runCode(codingAnswers[currentQuestion.id], currentQuestion.id)}
                              disabled={isRunningCode || !codingAnswers[currentQuestion.id]}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              <Play className="w-4 h-4" />
                              <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
                            </button>
                          </div>
                          <textarea
                            value={codingAnswers[currentQuestion.id] || ''}
                            onChange={(e) => handleCodingAnswer(currentQuestion.id, e.target.value)}
                            placeholder="Write your solution here..."
                            className="w-full h-64 p-4 rounded-xl border border-gray-200 font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Code Output */}
                        {codeOutput[currentQuestion.id] && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Output:</h4>
                            <div className="bg-gray-900 rounded-xl p-6">
                              <div className="flex items-center space-x-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  codeOutput[currentQuestion.id].status === 'Accepted' ? 
                                  'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {codeOutput[currentQuestion.id].status}
                                </span>
                              </div>
                              
                              {codeOutput[currentQuestion.id].stdout && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-300 mb-2">Output:</div>
                                  <pre className="text-green-400 text-sm font-mono bg-gray-800 p-3 rounded-lg">
                                    {codeOutput[currentQuestion.id].stdout}
                                  </pre>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].stderr && (
                                <div className="mb-4">
                                  <div className="text-sm font-medium text-gray-300 mb-2">Error:</div>
                                  <pre className="text-red-400 text-sm font-mono bg-gray-800 p-3 rounded-lg">
                                    {codeOutput[currentQuestion.id].stderr}
                                  </pre>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].execution_time && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-300">Execution Time:</span>
                                  <span className="ml-2 text-blue-400 text-sm">
                                    {codeOutput[currentQuestion.id].execution_time}s
                                  </span>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].memory_used && (
                                <div className="mb-2">
                                  <span className="text-sm font-medium text-gray-300">Memory Used:</span>
                                  <span className="ml-2 text-purple-400 text-sm">
                                    {codeOutput[currentQuestion.id].memory_used} KB
                                  </span>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].compile_output && (
                                <div>
                                  <div className="text-sm font-medium text-gray-300 mb-2">Compilation:</div>
                                  <pre className="text-yellow-400 text-sm font-mono bg-gray-800 p-3 rounded-lg">
                                    {codeOutput[currentQuestion.id].compile_output}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                    <button
                      onClick={prevQuestion}
                      disabled={currentSection === 'mcq' && currentIndex === 0}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Previous</span>
                    </button>

                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        Question {currentIndex + 1} of {getSectionData().length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.keys(mcqAnswers).length + Object.keys(debugAnswers).length + Object.keys(codingAnswers).length}/{totalQuestions} attempted
                      </div>
                    </div>

                    <button
                      onClick={nextQuestion}
                      disabled={currentSection === 'coding' && currentIndex === codingQs.length - 1}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
