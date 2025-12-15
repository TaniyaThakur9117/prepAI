"use client";

import { useState } from "react";

export default function HRSimulation({ question }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Speech Recognition
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    setUserAnswer(transcript);

    // Send to API for evaluation
    const res = await fetch("/api/hr-simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAnswer: transcript, question })
    });

    const data = await res.json();
    setFeedback(data);
  };

  const startRecording = () => {
    recognition.start();
  };

  const speakQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Question:</h2>
      <p className="mb-4">{question}</p>

      <button
        onClick={() => { speakQuestion(question); startRecording(); }}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
      >
        Listen & Speak
      </button>

      {userAnswer && (
        <div className="mt-4">
          <h3 className="font-semibold">Your Answer:</h3>
          <p>{userAnswer}</p>
        </div>
      )}

      {feedback && (
        <div className="mt-4 p-2 border rounded bg-gray-50">
          <h3 className="font-semibold">Feedback:</h3>
          <pre>{JSON.stringify(feedback, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}