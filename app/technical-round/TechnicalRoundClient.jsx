"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Play, Check, X, Code, Bug, HelpCircle, Trophy, Clock, ChevronRight, ChevronLeft, Save } from "lucide-react";

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

  const handleMcqAnswer = (questionId, answerIndex) => {
    setMcqAnswers({ ...mcqAnswers, [questionId]: answerIndex });
  };

  const handleDebugAnswer = (questionId, code) => {
    setDebugAnswers({ ...debugAnswers, [questionId]: code });
  };

  const handleCodingAnswer = (questionId, code) => {
    setCodingAnswers({ ...codingAnswers, [questionId]: code });
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

  const handleFinishAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate final score
      const score = calculateScore();
      
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

  const themeClasses = {
    bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDark ? 'bg-gray-800' : 'bg-white',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    buttonPrimary: isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
    input: isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300',
    code: isDark ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-gray-800'
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-lg font-semibold ${themeClasses.text}`}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className={`${themeClasses.cardBg} rounded-xl shadow-xl p-8 text-center`}>
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Assessment Complete!</h1>
            <div className="text-6xl font-bold text-blue-500 mb-4">{score.percentage}%</div>
            <p className="text-xl mb-6">{score.totalScore} out of {score.maxScore} points</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
                <HelpCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold">MCQs</h3>
                <p className={themeClasses.textSecondary}>{Object.keys(mcqAnswers).length}/{mcqs.length}</p>
              </div>
              <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
                <Bug className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold">Debug</h3>
                <p className={themeClasses.textSecondary}>{Object.keys(debugAnswers).length}/{debugQs.length}</p>
              </div>
              <div className={`${themeClasses.cardBg} ${themeClasses.border} border rounded-lg p-4`}>
                <Code className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold">Coding</h3>
                <p className={themeClasses.textSecondary}>{Object.keys(codingAnswers).length}/{codingQs.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Performance Breakdown</h3>
              <div className="space-y-3">
                {mcqs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>MCQs Correct:</span>
                    <span className="font-semibold">
                      {mcqs.filter(q => mcqAnswers[q.id] === q.correct_option).length}/{mcqs.length}
                    </span>
                  </div>
                )}
                {debugQs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Debug Problems Attempted:</span>
                    <span className="font-semibold">
                      {Object.keys(debugAnswers).length}/{debugQs.length}
                    </span>
                  </div>
                )}
                {codingQs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Coding Challenges Attempted:</span>
                    <span className="font-semibold">
                      {Object.keys(codingAnswers).length}/{codingQs.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={`${themeClasses.buttonPrimary} text-white px-8 py-3 rounded-lg font-semibold transition-colors`}
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
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className={`${themeClasses.cardBg} rounded-xl shadow-xl p-8 text-center`}>
          <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text}`}>No Questions Available</h2>
          <p className={`${themeClasses.textSecondary} mb-6`}>
            There are no questions loaded from the database. Please check your database connection and ensure questions are properly seeded.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`${themeClasses.buttonPrimary} text-white px-6 py-3 rounded-lg font-semibold transition-colors`}
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${themeClasses.cardBg} shadow-lg border-b ${themeClasses.border}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Technical Assessment</h1>
          
          <div className="flex items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="font-mono text-lg font-semibold text-red-500">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Progress */}
            <div className="text-sm">
              Section: <span className="font-semibold capitalize">{currentSection}</span>
              {' '}({currentIndex + 1}/{getSectionData().length})
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-lg ${themeClasses.buttonSecondary} transition-colors`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className={`${themeClasses.cardBg} rounded-xl shadow-lg p-6 h-fit`}>
            <h3 className="font-semibold mb-4">Sections</h3>
            <div className="space-y-2">
              {[
                { key: 'mcq', label: 'MCQs', icon: HelpCircle, count: mcqs.length, data: mcqs },
                { key: 'debug', label: 'Debug', icon: Bug, count: debugQs.length, data: debugQs },
                { key: 'coding', label: 'Coding', icon: Code, count: codingQs.length, data: codingQs }
              ].filter(section => section.count > 0).map(section => (
                <button
                  key={section.key}
                  onClick={() => {
                    setCurrentSection(section.key);
                    setCurrentIndex(0);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    currentSection === section.key 
                      ? themeClasses.buttonPrimary + ' text-white'
                      : themeClasses.buttonSecondary
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span>{section.label}</span>
                  <span className="ml-auto text-sm opacity-75">({section.count})</span>
                </button>
              ))}
            </div>

            {/* Progress Overview */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-semibold mb-3">Progress</h4>
              <div className="space-y-2 text-sm">
                {mcqs.length > 0 && (
                  <div className="flex justify-between">
                    <span>MCQs:</span>
                    <span>{Object.keys(mcqAnswers).length}/{mcqs.length}</span>
                  </div>
                )}
                {debugQs.length > 0 && (
                  <div className="flex justify-between">
                    <span>Debug:</span>
                    <span>{Object.keys(debugAnswers).length}/{debugQs.length}</span>
                  </div>
                )}
                {codingQs.length > 0 && (
                  <div className="flex justify-between">
                    <span>Coding:</span>
                    <span>{Object.keys(codingAnswers).length}/{codingQs.length}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500 mb-3">
                Session: {sessionId.slice(-8)}
              </div>
              <button
                onClick={handleFinishAssessment}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <Trophy className="w-5 h-5 inline mr-2" />
                {isSubmitting ? 'Submitting...' : 'Finish Assessment'}
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className={`${themeClasses.cardBg} rounded-xl shadow-lg p-8`}>
              {currentQuestion && (
                <>
                  {/* Question Header */}
                  <div className="flex items-center gap-3 mb-6">
                    {currentSection === 'mcq' && <HelpCircle className="w-6 h-6 text-blue-500" />}
                    {currentSection === 'debug' && <Bug className="w-6 h-6 text-orange-500" />}
                    {currentSection === 'coding' && <Code className="w-6 h-6 text-green-500" />}
                    <h2 className="text-xl font-semibold capitalize">{currentSection} Question {currentIndex + 1}</h2>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                      currentSection === 'mcq' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      currentSection === 'debug' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {currentSection === 'mcq' ? '10 pts' : currentSection === 'debug' ? '15 pts' : '20 pts'}
                    </span>
                  </div>

                  {/* Question Content */}
                  <div className="mb-8">
                    <p className="text-lg mb-4">{currentQuestion.question}</p>

                    {/* MCQ Options */}
                    {currentSection === 'mcq' && currentQuestion.options && (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <label
                            key={index}
                            className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                              mcqAnswers[currentQuestion.id] === index
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : themeClasses.border + ' hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`mcq-${currentQuestion.id}`}
                              value={index}
                              checked={mcqAnswers[currentQuestion.id] === index}
                              onChange={() => handleMcqAnswer(currentQuestion.id, index)}
                              className="mr-3"
                            />
                            {String.fromCharCode(65 + index)}. {option}
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Debug Code */}
                    {currentSection === 'debug' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Code to Debug:</h4>
                          <pre className={`${themeClasses.code} p-4 rounded-lg overflow-x-auto border ${themeClasses.border} text-sm`}>
                            <code>{currentQuestion.code}</code>
                          </pre>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Your Analysis & Fix:</h4>
                          <textarea
                            value={debugAnswers[currentQuestion.id] || ''}
                            onChange={(e) => handleDebugAnswer(currentQuestion.id, e.target.value)}
                            placeholder="Describe the bug and provide your fixed code..."
                            className={`w-full h-48 p-4 rounded-lg border font-mono text-sm ${themeClasses.input} ${themeClasses.border} resize-none`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Coding Challenge */}
                    {currentSection === 'coding' && (
                      <div className="space-y-4">
                        {currentQuestion.starter_code && (
                          <div>
                            <h4 className="font-semibold mb-2">Starter Code:</h4>
                            <pre className={`${themeClasses.code} p-4 rounded-lg overflow-x-auto border ${themeClasses.border} text-sm`}>
                              <code>{currentQuestion.starter_code}</code>
                            </pre>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Your Solution:</h4>
                            <button
                              onClick={() => runCode(codingAnswers[currentQuestion.id], currentQuestion.id)}
                              disabled={isRunningCode || !codingAnswers[currentQuestion.id]}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${themeClasses.buttonPrimary} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            >
                              <Play className="w-4 h-4" />
                              {isRunningCode ? 'Running...' : 'Run Code'}
                            </button>
                          </div>
                          <textarea
                            value={codingAnswers[currentQuestion.id] || ''}
                            onChange={(e) => handleCodingAnswer(currentQuestion.id, e.target.value)}
                            placeholder="Write your solution here..."
                            className={`w-full h-64 p-4 rounded-lg border font-mono text-sm ${themeClasses.input} ${themeClasses.border} resize-none`}
                          />
                        </div>

                        {/* Code Output */}
                        {codeOutput[currentQuestion.id] && (
                          <div>
                            <h4 className="font-semibold mb-2">Output:</h4>
                            <div className={`${themeClasses.code} p-4 rounded-lg border ${themeClasses.border}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  codeOutput[currentQuestion.id].status === 'Accepted' ? 
                                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {codeOutput[currentQuestion.id].status}
                                </span>
                              </div>
                              
                              {codeOutput[currentQuestion.id].stdout && (
                                <div className="mb-2">
                                  <strong>Output:</strong>
                                  <pre className="mt-1 text-green-600 dark:text-green-400 text-sm">
                                    {codeOutput[currentQuestion.id].stdout}
                                  </pre>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].stderr && (
                                <div className="mb-2">
                                  <strong>Error:</strong>
                                  <pre className="mt-1 text-red-600 dark:text-red-400 text-sm">
                                    {codeOutput[currentQuestion.id].stderr}
                                  </pre>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].execution_time && (
                                <div className="mb-2">
                                  <strong>Execution Time:</strong>
                                  <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">
                                    {codeOutput[currentQuestion.id].execution_time}s
                                  </span>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].memory_used && (
                                <div className="mb-2">
                                  <strong>Memory Used:</strong>
                                  <span className="ml-2 text-purple-600 dark:text-purple-400 text-sm">
                                    {codeOutput[currentQuestion.id].memory_used} KB
                                  </span>
                                </div>
                              )}
                              
                              {codeOutput[currentQuestion.id].compile_output && (
                                <div>
                                  <strong>Compilation:</strong>
                                  <pre className="mt-1 text-yellow-600 dark:text-yellow-400 text-sm">
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
                  <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                    <button
                      onClick={prevQuestion}
                      disabled={currentSection === 'mcq' && currentIndex === 0}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg ${themeClasses.buttonSecondary} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>

                    <div className="text-sm opacity-75">
                      Question {currentIndex + 1} of {getSectionData().length} 
                      ({Object.keys(mcqAnswers).length + Object.keys(debugAnswers).length + Object.keys(codingAnswers).length}/{totalQuestions} attempted)
                    </div>

                    <button
                      onClick={nextQuestion}
                      disabled={currentSection === 'coding' && currentIndex === codingQs.length - 1}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg ${themeClasses.buttonPrimary} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
