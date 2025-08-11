"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function IQClient({ initialQuestions }) {
  const { user } = useUser();
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  useEffect(() => {
    setQuestions(initialQuestions || []);
  }, [initialQuestions]);

  const choose = (qid, chosen) => {
    const q = questions.find((x) => x.id === qid);
    const correct = q.correct_option === chosen;

    setAnswers((a) => [...a, { qid, chosen, correct }]);
    if (correct) setScore((s) => s + 1);

    const lastTwo = [...answers, { qid, chosen, correct }].slice(-2);
    if (lastTwo.length === 2) {
      if (lastTwo.every((r) => r.correct) && difficulty < 3) {
        setDifficulty((d) => d + 1);
        fetchNewQuestions(difficulty + 1);
      } else if (lastTwo.every((r) => !r.correct) && difficulty > 1) {
        setDifficulty((d) => d - 1);
        fetchNewQuestions(difficulty - 1);
      }
    }

    setIndex((i) => i + 1);
  };

  const fetchNewQuestions = async (diff) => {
    try {
      const res = await fetch(`/api/iq/questions?difficulty=${diff}&limit=10`);
      if (!res.ok) {
        console.error(`Failed to fetch questions: ${res.status} ${res.statusText}`);
        return;
      }
      const text = await res.text();
      if (!text) {
        console.error("Empty API response for new IQ questions");
        return;
      }
      const json = JSON.parse(text);
      setQuestions(json.questions || []);
      setIndex(0);
      setAnswers([]);
      setScore(0);
    } catch (err) {
      console.error("Error fetching new IQ questions:", err);
    }
  };

  const finish = async () => {
    const body = {
      clerkId: user?.id || null,
      round: "iq",
      score,
      total: questions.length,
      details: answers,
      difficulty_summary: { difficulty },
    };
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    alert(`Test completed. Score: ${score}/${questions.length}`);
  };

  if (!questions || questions.length === 0) {
    return <div>No IQ questions available.</div>;
  }

  if (index >= questions.length) {
    return (
      <div>
        <h2>Your score: {score}/{questions.length}</h2>
        <button
          onClick={finish}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit & Save
        </button>
      </div>
    );
  }

  const q = questions[index];
  return (
    <div>
      <div className="mb-3 text-lg font-semibold">
        Q{index + 1}: {q.question}
      </div>
      <div className="space-y-2">
        {q.options.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(q.id, o.id)}
            className="block w-full text-left px-4 py-2 border rounded"
          >
            {o.id}. {o.text}
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Difficulty: {difficulty}
      </div>
    </div>
  );
}
