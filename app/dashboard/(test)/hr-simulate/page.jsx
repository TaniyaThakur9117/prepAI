// // app/hr-simulate/page.jsx
// 'use client';

// import { useState, useRef, useEffect } from 'react';

// export default function HRSimulationRealTime() {
//   const [question, setQuestion] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [realtimeFeedback, setRealtimeFeedback] = useState({
//     confidence: 0,
//     clarity: 0,
//     pacing: '',
//     fillerWords: 0
//   });
//   const [finalFeedback, setFinalFeedback] = useState(null);
//   const [transcription, setTranscription] = useState('');
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const timerRef = useRef(null);
//   const analysisIntervalRef = useRef(null);

//   useEffect(() => {
//     fetchQuestion();
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
//     };
//   }, []);

//   const fetchQuestion = async () => {
//     try {
//       const response = await fetch('/api/hr-simulate/get-question');
//       const data = await response.json();
//       setQuestion(data);
//       setFinalFeedback(null);
//       setTranscription('');
//       setRealtimeFeedback({
//         confidence: 0,
//         clarity: 0,
//         pacing: '',
//         fillerWords: 0
//       });
//     } catch (error) {
//       console.error('Error fetching question:', error);
//     }
//   };

//   const analyzeAudioChunk = async (audioBlob) => {
//     try {
//       const formData = new FormData();
//       formData.append('audio', audioBlob, 'chunk.webm');
      
//       const response = await fetch('/api/hr-simulate/analyze-chunk', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.metrics) {
//         setRealtimeFeedback(prev => ({
//           confidence: data.metrics.confidence,
//           clarity: data.metrics.clarity,
//           pacing: data.metrics.pacing,
//           fillerWords: prev.fillerWords + (data.metrics.fillerWordsCount || 0)
//         }));
//       }
//     } catch (error) {
//       console.error('Error analyzing chunk:', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100
//         } 
//       });
      
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: 'audio/webm'
//       });
      
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];
//       let chunkAudioData = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//           chunkAudioData.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         stream.getTracks().forEach(track => track.stop());
//       };

//       // Request data every 3 seconds for real-time analysis
//       mediaRecorder.start(3000);
//       setIsRecording(true);
//       setRecordingTime(0);

//       // Timer for display
//       timerRef.current = setInterval(() => {
//         setRecordingTime(prev => prev + 1);
//       }, 1000);

//       // Real-time analysis every 3 seconds
//       analysisIntervalRef.current = setInterval(() => {
//         if (chunkAudioData.length > 0) {
//           const chunkBlob = new Blob(chunkAudioData, { type: 'audio/webm' });
//           analyzeAudioChunk(chunkBlob);
//           chunkAudioData = [];
//         }
//       }, 3000);

//     } catch (error) {
//       console.error('Error starting recording:', error);
//       alert('Could not access microphone. Please grant permission.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
      
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      
//       // Analyze complete response
//       setTimeout(() => {
//         analyzeFinalResponse();
//       }, 500);
//     }
//   };

//   const analyzeFinalResponse = async () => {
//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
//     setIsAnalyzing(true);
//     try {
//       const formData = new FormData();
//       formData.append('audio', audioBlob, 'recording.webm');
//       formData.append('question', question.question_text);

//       const response = await fetch('/api/hr-simulate/analyze-response', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
//       setTranscription(data.transcription);
//       setFinalFeedback(data.feedback);
//     } catch (error) {
//       console.error('Error analyzing response:', error);
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="max-w-5xl mx-auto">
//         <h1 className="text-4xl font-bold text-gray-800 mb-8">HR Interview Simulation</h1>

//         {question && (
//           <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
//             <div className="mb-6">
//               <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
//                 {question.category || 'General'}
//               </span>
//               <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//                 {question.question_text}
//               </h2>
//             </div>

//             {/* Real-time Feedback Display */}
//             {isRecording && (
//               <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
//                 <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 Live Feedback</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Confidence</p>
//                     <div className="text-2xl font-bold text-blue-600">
//                       {realtimeFeedback.confidence}/10
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Clarity</p>
//                     <div className="text-2xl font-bold text-green-600">
//                       {realtimeFeedback.clarity}/10
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Pacing</p>
//                     <div className="text-lg font-semibold text-purple-600">
//                       {realtimeFeedback.pacing || 'Analyzing...'}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Filler Words</p>
//                     <div className="text-2xl font-bold text-orange-600">
//                       {realtimeFeedback.fillerWords}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col items-center space-y-4">
//               {isRecording && (
//                 <div className="text-center">
//                   <div className="animate-pulse mb-2">
//                     <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
//                       <div className="w-8 h-8 bg-white rounded-full"></div>
//                     </div>
//                   </div>
//                   <p className="text-3xl font-mono font-bold text-gray-700">
//                     {formatTime(recordingTime)}
//                   </p>
//                   <p className="text-sm text-gray-500 mt-2">🎤 Recording & analyzing in real-time...</p>
//                 </div>
//               )}

//               <div className="flex space-x-4">
//                 {!isRecording && !finalFeedback ? (
//                   <button
//                     onClick={startRecording}
//                     className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
//                   >
//                     🎤 Start Recording
//                   </button>
//                 ) : isRecording ? (
//                   <button
//                     onClick={stopRecording}
//                     className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
//                   >
//                     ⏹ Stop & Analyze
//                   </button>
//                 ) : null}
//               </div>

//               {isAnalyzing && (
//                 <div className="flex items-center space-x-2">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
//                   <span className="text-gray-600">Analyzing your complete response...</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {transcription && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//             <h3 className="text-xl font-semibold mb-3 flex items-center">
//               <span className="mr-2">💬</span> Your Response Transcription:
//             </h3>
//             <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
//               <p className="text-gray-700 italic leading-relaxed">&quot;{transcription}&quot;</p>
//             </div>
//           </div>
//         )}

//         {finalFeedback && (
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <h3 className="text-2xl font-bold mb-6 flex items-center">
//               <span className="mr-2">🤖</span> AI Detailed Feedback
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <ScoreCard 
//                 title="Confidence" 
//                 score={finalFeedback.confidence.score}
//                 feedback={finalFeedback.confidence.feedback}
//                 icon="💪"
//               />
//               <ScoreCard 
//                 title="Content" 
//                 score={finalFeedback.content.score}
//                 feedback={finalFeedback.content.feedback}
//                 icon="📝"
//               />
//               <ScoreCard 
//                 title="Clarity" 
//                 score={finalFeedback.clarity.score}
//                 feedback={finalFeedback.clarity.feedback}
//                 icon="🎯"
//               />
//             </div>

//             <div className="mb-6 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
//               <h4 className="font-semibold text-lg mb-2 flex items-center">
//                 <span className="mr-2">💡</span> Overall Feedback:
//               </h4>
//               <p className="text-gray-700 leading-relaxed">{finalFeedback.overall_feedback}</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
//                 <h4 className="font-semibold text-lg mb-3 text-green-700 flex items-center">
//                   <span className="mr-2">✨</span> Strengths:
//                 </h4>
//                 <ul className="space-y-2">
//                   {finalFeedback.strengths?.map((strength, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="mr-2 text-green-600">✓</span>
//                       <span className="text-gray-700">{strength}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="p-5 bg-orange-50 rounded-lg border-l-4 border-orange-500">
//                 <h4 className="font-semibold text-lg mb-3 text-orange-700 flex items-center">
//                   <span className="mr-2">📈</span> Areas to Improve:
//                 </h4>
//                 <ul className="space-y-2">
//                   {finalFeedback.improvements?.map((improvement, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="mr-2 text-orange-600">→</span>
//                       <span className="text-gray-700">{improvement}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {finalFeedback && (
//           <button
//             onClick={() => {
//               fetchQuestion();
//               setTranscription('');
//               setFinalFeedback(null);
//               audioChunksRef.current = [];
//             }}
//             className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
//           >
//             Next Question →
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// function ScoreCard({ title, score, feedback, icon }) {
//   const getColor = (score) => {
//     if (score >= 8) return 'text-green-600 border-green-200 bg-green-50';
//     if (score >= 6) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
//     return 'text-red-600 border-red-200 bg-red-50';
//   };

//   const getBgColor = (score) => {
//     if (score >= 8) return 'bg-green-500';
//     if (score >= 6) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   return (
//     <div className={`border-2 rounded-lg p-5 text-center ${getColor(score)}`}>
//       <div className="text-3xl mb-2">{icon}</div>
//       <h4 className="font-semibold mb-3 text-lg">{title}</h4>
//       <div className="relative mb-3">
//         <div className="text-4xl font-bold">
//           {score}<span className="text-2xl">/10</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//           <div 
//             className={`${getBgColor(score)} h-2 rounded-full transition-all duration-500`}
//             style={{ width: `${score * 10}%` }}
//           ></div>
//         </div>
//       </div>
//       <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
//     </div>
//   );
// }









//working..but  not properly
// app/hr-simulate/page.jsx
// 'use client';

// import { useState, useRef, useEffect } from 'react';

// export default function HRSimulationRealTime() {
//   const [question, setQuestion] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [realtimeFeedback, setRealtimeFeedback] = useState({
//     confidence: 0,
//     clarity: 0,
//     pacing: '',
//     fillerWords: 0
//   });
//   const [facialMetrics, setFacialMetrics] = useState({
//     eyeContact: 0,
//     smileIntensity: 0,
//     headPose: 'Analyzing...',
//     overallConfidence: 0
//   });
//   const facialHistoryRef = useRef([]);
//   const [finalFeedback, setFinalFeedback] = useState(null);
//   const [transcription, setTranscription] = useState('');
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const timerRef = useRef(null);
//   const analysisIntervalRef = useRef(null);
//   const facialAnalysisIntervalRef = useRef(null);
//   const videoStreamRef = useRef(null);

//   useEffect(() => {
//     fetchQuestion();
//     initializeCamera();
    
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
//       if (facialAnalysisIntervalRef.current) clearInterval(facialAnalysisIntervalRef.current);
//       if (videoStreamRef.current) {
//         videoStreamRef.current.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, []);

//   const initializeCamera = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         video: { 
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           facingMode: 'user'
//         } 
//       });
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoStreamRef.current = stream;
//         setIsCameraReady(true);
//       }
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       alert('Could not access camera. Please grant permission.');
//     }
//   };

//   const fetchQuestion = async () => {
//     try {
//       const response = await fetch('/api/hr-simulate/get-question');
//       const data = await response.json();
//       setQuestion(data);
//       setFinalFeedback(null);
//       setTranscription('');
//       setRealtimeFeedback({
//         confidence: 0,
//         clarity: 0,
//         pacing: '',
//         fillerWords: 0
//       });
//       setFacialMetrics({
//         eyeContact: 0,
//         smileIntensity: 0,
//         headPose: 'Analyzing...',
//         overallConfidence: 0
//       });
//     } catch (error) {
//       console.error('Error fetching question:', error);
//     }
//   };

//   const analyzeFacialExpression = async () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     const ctx = canvas.getContext('2d');

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     try {
//       const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
//       const formData = new FormData();
//       formData.append('image', blob, 'frame.jpg');

//       const response = await fetch('/api/hr-simulate/analyze-facial', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.metrics) {
//         setFacialMetrics(prev => ({
//           eyeContact: data.metrics.eyeContact,
//           smileIntensity: data.metrics.smileIntensity,
//           headPose: data.metrics.headPose,
//           overallConfidence: data.metrics.overallConfidence
//         }));
        
//         // Store in history for aggregation
//         facialHistoryRef.current.push(data.metrics);
//       }
//     } catch (error) {
//       console.error('Error analyzing facial expression:', error);
//     }
//   };

//   const analyzeAudioChunk = async (audioBlob) => {
//     try {
//       const formData = new FormData();
//       formData.append('audio', audioBlob, 'chunk.webm');
      
//       const response = await fetch('/api/hr-simulate/analyze-chunk', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
      
//       if (data.metrics) {
//         setRealtimeFeedback(prev => ({
//           confidence: data.metrics.confidence,
//           clarity: data.metrics.clarity,
//           pacing: data.metrics.pacing,
//           fillerWords: prev.fillerWords + (data.metrics.fillerWordsCount || 0)
//         }));
//       }
//     } catch (error) {
//       console.error('Error analyzing chunk:', error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100
//         } 
//       });
      
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: 'audio/webm'
//       });
      
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];
//       let chunkAudioData = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//           chunkAudioData.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start(3000);
//       setIsRecording(true);
//       setRecordingTime(0);

//       // Timer for display
//       timerRef.current = setInterval(() => {
//         setRecordingTime(prev => prev + 1);
//       }, 1000);

//       // Real-time audio analysis every 3 seconds
//       analysisIntervalRef.current = setInterval(() => {
//         if (chunkAudioData.length > 0) {
//           const chunkBlob = new Blob(chunkAudioData, { type: 'audio/webm' });
//           analyzeAudioChunk(chunkBlob);
//           chunkAudioData = [];
//         }
//       }, 3000);

//       // Real-time facial analysis every 2 seconds
//       facialAnalysisIntervalRef.current = setInterval(() => {
//         analyzeFacialExpression();
//       }, 2000);

//     } catch (error) {
//       console.error('Error starting recording:', error);
//       alert('Could not access microphone. Please grant permission.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
      
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
//       if (facialAnalysisIntervalRef.current) clearInterval(facialAnalysisIntervalRef.current);
      
//       setTimeout(() => {
//         analyzeFinalResponse();
//       }, 500);
//     }
//   };

//   const analyzeFinalResponse = async () => {
//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
//     setIsAnalyzing(true);
//     try {
//       const formData = new FormData();
//       formData.append('audio', audioBlob, 'recording.webm');
//       formData.append('question', question.question_text);

//       // Calculate aggregated facial metrics
//       if (facialHistoryRef.current.length > 0) {
//         const avgEyeContact = facialHistoryRef.current.reduce((sum, m) => sum + m.eyeContact, 0) / facialHistoryRef.current.length;
//         const avgSmile = facialHistoryRef.current.reduce((sum, m) => sum + m.smileIntensity, 0) / facialHistoryRef.current.length;
//         const avgConfidence = facialHistoryRef.current.reduce((sum, m) => sum + m.overallConfidence, 0) / facialHistoryRef.current.length;
        
//         // Find most common head pose
//         const poses = facialHistoryRef.current.map(m => m.headPose);
//         const dominantPose = poses.sort((a,b) =>
//           poses.filter(v => v === a).length - poses.filter(v => v === b).length
//         ).pop();

//         const aggregatedMetrics = {
//           avgEyeContact: Math.round(avgEyeContact * 10) / 10,
//           avgSmile: Math.round(avgSmile * 10) / 10,
//           avgConfidence: Math.round(avgConfidence * 10) / 10,
//           dominantPose
//         };

//         formData.append('facialMetrics', JSON.stringify(aggregatedMetrics));
//       }

//       const response = await fetch('/api/hr-simulate/analyze-response-enhanced', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
//       setTranscription(data.transcription);
//       setFinalFeedback(data.feedback);
//     } catch (error) {
//       console.error('Error analyzing response:', error);
//     } finally {
//       setIsAnalyzing(false);
//       facialHistoryRef.current = []; // Reset history
//     }
//   };

//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-4xl font-bold text-gray-800 mb-8">🎯 HR Interview Simulation</h1>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//           {/* Video Feed */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <span className="mr-2">📹</span> Video Feed
//               </h3>
//               <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
//                 <video 
//                   ref={videoRef} 
//                   autoPlay 
//                   playsInline 
//                   muted
//                   className="w-full h-full object-cover"
//                 />
//                 {isRecording && (
//                   <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
//                     <div className="w-3 h-3 bg-white rounded-full"></div>
//                     <span className="text-sm font-semibold">REC</span>
//                   </div>
//                 )}
//                 {!isCameraReady && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
//                     <div className="text-white text-center">
//                       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
//                       <p>Initializing camera...</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//               <canvas ref={canvasRef} style={{ display: 'none' }} />
//             </div>
//           </div>

//           {/* Facial Metrics */}
//           <div className="space-y-4">
//             {isRecording && (
//               <div className="bg-white rounded-lg shadow-lg p-6">
//                 <h3 className="text-lg font-semibold mb-4 flex items-center">
//                   <span className="mr-2">😊</span> Facial Analysis
//                 </h3>
//                 <div className="space-y-4">
//                   <MetricBar 
//                     label="Eye Contact" 
//                     value={facialMetrics.eyeContact} 
//                     max={10}
//                     color="blue"
//                   />
//                   <MetricBar 
//                     label="Smile Intensity" 
//                     value={facialMetrics.smileIntensity} 
//                     max={10}
//                     color="green"
//                   />
//                   <div className="pt-2">
//                     <p className="text-sm text-gray-600 mb-1">Head Pose</p>
//                     <div className="text-lg font-semibold text-purple-600">
//                       {facialMetrics.headPose}
//                     </div>
//                   </div>
//                   <MetricBar 
//                     label="Overall Confidence" 
//                     value={facialMetrics.overallConfidence} 
//                     max={10}
//                     color="indigo"
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <h3 className="text-lg font-semibold mb-4 flex items-center">
//                 <span className="mr-2">🎤</span> Recording Timer
//               </h3>
//               <div className="text-center">
//                 <div className="text-5xl font-mono font-bold text-gray-700 mb-2">
//                   {formatTime(recordingTime)}
//                 </div>
//                 {isRecording && (
//                   <p className="text-sm text-gray-500">Recording in progress...</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {question && (
//           <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
//             <div className="mb-6">
//               <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
//                 {question.category || 'General'}
//               </span>
//               <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//                 {question.question_text}
//               </h2>
//             </div>

//             {/* Real-time Audio Feedback */}
//             {isRecording && (
//               <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
//                 <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 Audio Analysis</h3>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Confidence</p>
//                     <div className="text-2xl font-bold text-blue-600">
//                       {realtimeFeedback.confidence}/10
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Clarity</p>
//                     <div className="text-2xl font-bold text-green-600">
//                       {realtimeFeedback.clarity}/10
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Pacing</p>
//                     <div className="text-lg font-semibold text-purple-600">
//                       {realtimeFeedback.pacing || 'Analyzing...'}
//                     </div>
//                   </div>
//                   <div className="text-center">
//                     <p className="text-sm text-gray-600 mb-1">Filler Words</p>
//                     <div className="text-2xl font-bold text-orange-600">
//                       {realtimeFeedback.fillerWords}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="flex flex-col items-center space-y-4">
//               <div className="flex space-x-4">
//                 {!isRecording && !finalFeedback ? (
//                   <button
//                     onClick={startRecording}
//                     disabled={!isCameraReady}
//                     className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     🎤 Start Recording
//                   </button>
//                 ) : isRecording ? (
//                   <button
//                     onClick={stopRecording}
//                     className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
//                   >
//                     ⏹ Stop & Analyze
//                   </button>
//                 ) : null}
//               </div>

//               {isAnalyzing && (
//                 <div className="flex items-center space-x-2">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
//                   <span className="text-gray-600">Analyzing your complete response...</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {transcription && (
//           <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//             <h3 className="text-xl font-semibold mb-3 flex items-center">
//               <span className="mr-2">💬</span> Your Response Transcription:
//             </h3>
//             <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
//               <p className="text-gray-700 italic leading-relaxed">&quot;{transcription}&quot;</p>
//             </div>
//           </div>
//         )}

//         {finalFeedback && (
//           <div className="bg-white rounded-lg shadow-lg p-8">
//             <h3 className="text-2xl font-bold mb-6 flex items-center">
//               <span className="mr-2">🤖</span> AI Detailed Feedback
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <ScoreCard 
//                 title="Confidence" 
//                 score={finalFeedback.confidence.score}
//                 feedback={finalFeedback.confidence.feedback}
//                 icon="💪"
//               />
//               <ScoreCard 
//                 title="Content" 
//                 score={finalFeedback.content.score}
//                 feedback={finalFeedback.content.feedback}
//                 icon="📝"
//               />
//               <ScoreCard 
//                 title="Clarity" 
//                 score={finalFeedback.clarity.score}
//                 feedback={finalFeedback.clarity.feedback}
//                 icon="🎯"
//               />
//             </div>

//             <div className="mb-6 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
//               <h4 className="font-semibold text-lg mb-2 flex items-center">
//                 <span className="mr-2">💡</span> Overall Feedback:
//               </h4>
//               <p className="text-gray-700 leading-relaxed">{finalFeedback.overall_feedback}</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
//                 <h4 className="font-semibold text-lg mb-3 text-green-700 flex items-center">
//                   <span className="mr-2">✨</span> Strengths:
//                 </h4>
//                 <ul className="space-y-2">
//                   {finalFeedback.strengths?.map((strength, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="mr-2 text-green-600">✓</span>
//                       <span className="text-gray-700">{strength}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//               <div className="p-5 bg-orange-50 rounded-lg border-l-4 border-orange-500">
//                 <h4 className="font-semibold text-lg mb-3 text-orange-700 flex items-center">
//                   <span className="mr-2">📈</span> Areas to Improve:
//                 </h4>
//                 <ul className="space-y-2">
//                   {finalFeedback.improvements?.map((improvement, idx) => (
//                     <li key={idx} className="flex items-start">
//                       <span className="mr-2 text-orange-600">→</span>
//                       <span className="text-gray-700">{improvement}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </div>
//         )}

//         {finalFeedback && (
//           <button
//             onClick={() => {
//               fetchQuestion();
//               setTranscription('');
//               setFinalFeedback(null);
//               audioChunksRef.current = [];
//             }}
//             className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
//           >
//             Next Question →
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// function MetricBar({ label, value, max, color }) {
//   const colors = {
//     blue: 'bg-blue-500',
//     green: 'bg-green-500',
//     purple: 'bg-purple-500',
//     indigo: 'bg-indigo-500'
//   };

//   const percentage = (value / max) * 100;

//   return (
//     <div>
//       <div className="flex justify-between mb-1">
//         <span className="text-sm text-gray-600">{label}</span>
//         <span className="text-sm font-semibold text-gray-700">{value}/{max}</span>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2.5">
//         <div 
//           className={`${colors[color]} h-2.5 rounded-full transition-all duration-500`}
//           style={{ width: `${percentage}%` }}
//         ></div>
//       </div>
//     </div>
//   );
// }

// function ScoreCard({ title, score, feedback, icon }) {
//   const getColor = (score) => {
//     if (score >= 8) return 'text-green-600 border-green-200 bg-green-50';
//     if (score >= 6) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
//     return 'text-red-600 border-red-200 bg-red-50';
//   };

//   const getBgColor = (score) => {
//     if (score >= 8) return 'bg-green-500';
//     if (score >= 6) return 'bg-yellow-500';
//     return 'bg-red-500';
//   };

//   return (
//     <div className={`border-2 rounded-lg p-5 text-center ${getColor(score)}`}>
//       <div className="text-3xl mb-2">{icon}</div>
//       <h4 className="font-semibold mb-3 text-lg">{title}</h4>
//       <div className="relative mb-3">
//         <div className="text-4xl font-bold">
//           {score}<span className="text-2xl">/10</span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
//           <div 
//             className={`${getBgColor(score)} h-2 rounded-full transition-all duration-500`}
//             style={{ width: `${score * 10}%` }}
//           ></div>
//         </div>
//       </div>
//       <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
//     </div>
//   );
// }






// app/hr-simulate/page.jsx
'use client';

import { useState, useRef, useEffect } from 'react';

export default function HRSimulationRealTime() {
  const [question, setQuestion] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [realtimeFeedback, setRealtimeFeedback] = useState({
    confidence: 0,
    clarity: 0,
    pacing: '',
    fillerWords: 0
  });
  const [facialMetrics, setFacialMetrics] = useState({
    eyeContact: 0,
    smileIntensity: 0,
    headPose: 'Loading...',
    overallConfidence: 0
  });
  const [finalFeedback, setFinalFeedback] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const facialAnalysisIntervalRef = useRef(null);
  const videoStreamRef = useRef(null);
  const facialHistoryRef = useRef([]);
  const faceApiRef = useRef(null);

  useEffect(() => {
    fetchQuestion();
    loadFaceDetectionModels();
    initializeCamera();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (facialAnalysisIntervalRef.current) clearInterval(facialAnalysisIntervalRef.current);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadFaceDetectionModels = async () => {
    try {
      // Load face-api.js from CDN
      if (typeof window !== 'undefined' && !window.faceapi) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/dist/face-api.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const faceapi = window.faceapi;
      faceApiRef.current = faceapi;

      // Load models
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      setModelsLoaded(true);
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Error loading face detection models:', error);
    }
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoStreamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please grant permission.');
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await fetch('/api/hr-simulate/get-question');
      const data = await response.json();
      setQuestion(data);
      setFinalFeedback(null);
      setTranscription('');
      setRealtimeFeedback({
        confidence: 0,
        clarity: 0,
        pacing: '',
        fillerWords: 0
      });
      setFacialMetrics({
        eyeContact: 0,
        smileIntensity: 0,
        headPose: 'Ready',
        overallConfidence: 0
      });
      facialHistoryRef.current = [];
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const analyzeFacialExpression = async () => {
    if (!videoRef.current || !modelsLoaded || !faceApiRef.current) return;

    try {
      const faceapi = faceApiRef.current;
      const video = videoRef.current;

      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detections) {
        setFacialMetrics(prev => ({
          ...prev,
          headPose: 'No face detected'
        }));
        return;
      }

      // Extract facial metrics
      const expressions = detections.expressions;
      const landmarks = detections.landmarks;

      // Calculate smile intensity (0-10 scale)
      const happyScore = expressions.happy || 0;
      const smileIntensity = Math.round(happyScore * 10);

      // Calculate eye contact (based on face position and eye landmarks)
      const faceBox = detections.detection.box;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // Check if face is centered (indicates looking at camera)
      const faceCenterX = faceBox.x + faceBox.width / 2;
      const faceCenterY = faceBox.y + faceBox.height / 2;
      const videoCenterX = videoWidth / 2;
      const videoCenterY = videoHeight / 2;
      
      const xOffset = Math.abs(faceCenterX - videoCenterX) / videoWidth;
      const yOffset = Math.abs(faceCenterY - videoCenterY) / videoHeight;
      
      // Eye contact score: centered face = high score
      const eyeContactScore = Math.max(1, Math.round(10 - (xOffset + yOffset) * 20));

      // Determine head pose
      let headPose = 'Centered';
      if (xOffset > 0.15) {
        headPose = faceCenterX < videoCenterX ? 'Turned Left' : 'Turned Right';
      } else if (yOffset > 0.15) {
        headPose = faceCenterY < videoCenterY ? 'Looking Up' : 'Looking Down';
      }

      // Calculate overall confidence (combination of factors)
      const neutralScore = expressions.neutral || 0;
      const fearScore = expressions.fearful || 0;
      const sadScore = expressions.sad || 0;
      
      const confidenceScore = Math.round(
        (eyeContactScore * 0.4) + 
        (smileIntensity * 0.3) + 
        ((1 - fearScore) * 10 * 0.2) + 
        ((1 - sadScore) * 10 * 0.1)
      );

      const metrics = {
        eyeContact: Math.min(10, Math.max(1, eyeContactScore)),
        smileIntensity: Math.min(10, Math.max(0, smileIntensity)),
        headPose,
        overallConfidence: Math.min(10, Math.max(1, confidenceScore))
      };

      setFacialMetrics(metrics);
      
      // Store in history for aggregation
      if (isRecording) {
        facialHistoryRef.current.push(metrics);
      }

    } catch (error) {
      console.error('Error analyzing facial expression:', error);
    }
  };

  const analyzeAudioChunk = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'chunk.webm');
      
      const response = await fetch('/api/hr-simulate/analyze-chunk', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.metrics) {
        setRealtimeFeedback(prev => ({
          confidence: data.metrics.confidence,
          clarity: data.metrics.clarity,
          pacing: data.metrics.pacing,
          fillerWords: prev.fillerWords + (data.metrics.fillerWordsCount || 0)
        }));
      }
    } catch (error) {
      console.error('Error analyzing chunk:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      facialHistoryRef.current = [];
      let chunkAudioData = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          chunkAudioData.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(3000);
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for display
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Real-time audio analysis every 3 seconds
      analysisIntervalRef.current = setInterval(() => {
        if (chunkAudioData.length > 0) {
          const chunkBlob = new Blob(chunkAudioData, { type: 'audio/webm' });
          analyzeAudioChunk(chunkBlob);
          chunkAudioData = [];
        }
      }, 3000);

      // Real-time facial analysis every 1 second
      facialAnalysisIntervalRef.current = setInterval(() => {
        analyzeFacialExpression();
      }, 1000);

      // Start facial analysis immediately
      analyzeFacialExpression();

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) clearInterval(timerRef.current);
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (facialAnalysisIntervalRef.current) clearInterval(facialAnalysisIntervalRef.current);
      
      setTimeout(() => {
        analyzeFinalResponse();
      }, 500);
    }
  };

  const analyzeFinalResponse = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('question', question.question_text);

      // Calculate aggregated facial metrics
      if (facialHistoryRef.current.length > 0) {
        const avgEyeContact = facialHistoryRef.current.reduce((sum, m) => sum + m.eyeContact, 0) / facialHistoryRef.current.length;
        const avgSmile = facialHistoryRef.current.reduce((sum, m) => sum + m.smileIntensity, 0) / facialHistoryRef.current.length;
        const avgConfidence = facialHistoryRef.current.reduce((sum, m) => sum + m.overallConfidence, 0) / facialHistoryRef.current.length;
        
        // Find most common head pose
        const poses = facialHistoryRef.current.map(m => m.headPose);
        const poseCount = {};
        poses.forEach(pose => {
          poseCount[pose] = (poseCount[pose] || 0) + 1;
        });
        const dominantPose = Object.keys(poseCount).reduce((a, b) => 
          poseCount[a] > poseCount[b] ? a : b
        );

        const aggregatedMetrics = {
          avgEyeContact: Math.round(avgEyeContact * 10) / 10,
          avgSmile: Math.round(avgSmile * 10) / 10,
          avgConfidence: Math.round(avgConfidence * 10) / 10,
          dominantPose,
          sampleCount: facialHistoryRef.current.length
        };

        formData.append('facialMetrics', JSON.stringify(aggregatedMetrics));
      }

      const response = await fetch('/api/hr-simulate/analyze-response-enhanced', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setTranscription(data.transcription);
      setFinalFeedback(data.feedback);
    } catch (error) {
      console.error('Error analyzing response:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">🎯 HR Interview Simulation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">📹</span> Video Feed
                {modelsLoaded && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">✓ AI Ready</span>}
              </h3>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full animate-pulse">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <span className="text-sm font-semibold">REC</span>
                  </div>
                )}
                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Facial Metrics */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">😊</span> Facial Analysis
              </h3>
              <div className="space-y-4">
                <MetricBar 
                  label="Eye Contact" 
                  value={facialMetrics.eyeContact} 
                  max={10}
                  color="blue"
                />
                <MetricBar 
                  label="Smile Intensity" 
                  value={facialMetrics.smileIntensity} 
                  max={10}
                  color="green"
                />
                <div className="pt-2">
                  <p className="text-sm text-gray-600 mb-1">Head Pose</p>
                  <div className="text-lg font-semibold text-purple-600">
                    {facialMetrics.headPose}
                  </div>
                </div>
                <MetricBar 
                  label="Overall Confidence" 
                  value={facialMetrics.overallConfidence} 
                  max={10}
                  color="indigo"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🎤</span> Recording Timer
              </h3>
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-gray-700 mb-2">
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <p className="text-sm text-gray-500">Recording in progress...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {question && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {question.category || 'General'}
              </span>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {question.question_text}
              </h2>
            </div>

            {/* Real-time Audio Feedback */}
            {isRecording && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 Audio Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <div className="text-2xl font-bold text-blue-600">
                      {realtimeFeedback.confidence}/10
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Clarity</p>
                    <div className="text-2xl font-bold text-green-600">
                      {realtimeFeedback.clarity}/10
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Pacing</p>
                    <div className="text-lg font-semibold text-purple-600">
                      {realtimeFeedback.pacing || 'Analyzing...'}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Filler Words</p>
                    <div className="text-2xl font-bold text-orange-600">
                      {realtimeFeedback.fillerWords}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-4">
                {!isRecording && !finalFeedback ? (
                  <button
                    onClick={startRecording}
                    disabled={!isCameraReady || !modelsLoaded}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    🎤 Start Recording
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    ⏹ Stop & Analyze
                  </button>
                ) : null}
              </div>

              {!modelsLoaded && (
                <p className="text-sm text-gray-500">Loading face detection models...</p>
              )}

              {isAnalyzing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <span className="text-gray-600">Analyzing your complete response...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {transcription && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <span className="mr-2">💬</span> Your Response Transcription:
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
              <p className="text-gray-700 italic leading-relaxed">&quot;{transcription}&quot;</p>
            </div>
          </div>
        )}

        {finalFeedback && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center">
              <span className="mr-2">🤖</span> AI Detailed Feedback
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <ScoreCard 
                title="Confidence" 
                score={finalFeedback.confidence.score}
                feedback={finalFeedback.confidence.feedback}
                icon="💪"
              />
              <ScoreCard 
                title="Content" 
                score={finalFeedback.content.score}
                feedback={finalFeedback.content.feedback}
                icon="📝"
              />
              <ScoreCard 
                title="Clarity" 
                score={finalFeedback.clarity.score}
                feedback={finalFeedback.clarity.feedback}
                icon="🎯"
              />
            </div>

            <div className="mb-6 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-lg mb-2 flex items-center">
                <span className="mr-2">💡</span> Overall Feedback:
              </h4>
              <p className="text-gray-700 leading-relaxed">{finalFeedback.overall_feedback}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-lg mb-3 text-green-700 flex items-center">
                  <span className="mr-2">✨</span> Strengths:
                </h4>
                <ul className="space-y-2">
                  {finalFeedback.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-lg mb-3 text-orange-700 flex items-center">
                  <span className="mr-2">📈</span> Areas to Improve:
                </h4>
                <ul className="space-y-2">
                  {finalFeedback.improvements?.map((improvement, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2 text-orange-600">→</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {finalFeedback && (
          <button
            onClick={() => {
              fetchQuestion();
              setTranscription('');
              setFinalFeedback(null);
              audioChunksRef.current = [];
            }}
            className="mt-6 w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}

function MetricBar({ label, value, max, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-700">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${colors[color]} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function ScoreCard({ title, score, feedback, icon }) {
  const getColor = (score) => {
    if (score >= 8) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 6) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const getBgColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`border-2 rounded-lg p-5 text-center ${getColor(score)}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <h4 className="font-semibold mb-3 text-lg">{title}</h4>
      <div className="relative mb-3">
        <div className="text-4xl font-bold">
          {score}<span className="text-2xl">/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`${getBgColor(score)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
    </div>
  );
}