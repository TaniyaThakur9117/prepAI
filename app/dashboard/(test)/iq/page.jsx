import { createClient } from "@supabase/supabase-js";
import IQTestClient from "./IQTestClient";

// Function to shuffle array
function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function IQPage() {
  let questions = [];
  let error = null;

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch questions from database
    const { data, error: supabaseError } = await supabase
      .from("iq_questions")
      .select("*");

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      error = `Database error: ${supabaseError.message}`;
    } else if (data && data.length > 0) {
      // Shuffle questions and take first 10
      const shuffledData = shuffleArray(data);
      const selectedQuestions = shuffledData.slice(0, 10);

      // Format questions - NO EVENT HANDLERS HERE
      questions = selectedQuestions.map((q) => ({
        id: q.id || Math.random().toString(36),
        question: q.question || "Question text missing",
        options: [
          { id: "A", text: q.option_a || q.optionA || "Option A" },
          { id: "B", text: q.option_b || q.optionB || "Option B" },
          { id: "C", text: q.option_c || q.optionC || "Option C" },
          { id: "D", text: q.option_d || q.optionD || "Option D" },
        ],
        correct_option: typeof q.correct_option === "number" 
          ? ["A", "B", "C", "D"][q.correct_option - 1] || "A"
          : (q.correct_option || "A").toString().toUpperCase(),
        difficulty: q.difficulty || "medium"
      })).filter(q => q.id);
    } else {
      error = "No questions found in the database";
    }
  } catch (err) {
    console.error("Error in IQ page:", err);
    error = `Failed to load questions: ${err.message}`;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Test</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Please check:</p>
            <ul className="list-disc list-inside text-left">
              <li>Database connection is working</li>
              <li>Environment variables are set correctly</li>
              <li>The 'iq_questions' table exists</li>
              <li>Table has data in it</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Success state - only pass serializable data to client component
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">IQ Test</h1>
          {/* <p className="text-lg text-gray-600">
            Test your cognitive abilities with our comprehensive IQ assessment
          </p> */}
          <div className="mt-4 space-y-2">
            <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm mx-2">
              <span className="text-sm font-medium text-gray-700">
                {/*{questions.length}*/} Test your cognitive abilities with our comprehensive IQ assessment
              </span>
            </div>
            {/* <div className="inline-block bg-green-100 px-3 py-1 rounded-full shadow-sm mx-2">
              <span className="text-xs font-medium text-green-700">
                
              </span>
            </div> */}
          </div>
        </div>

        {/* Pass only serializable props to client component */}
        <IQTestClient questions={questions} />

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-2">
            This test is designed to measure various cognitive abilities including logical reasoning,
            pattern recognition, and problem-solving skills.
          </p>
          <p className="text-xs text-gray-400">
            Questions are randomly selected and shuffled for each session.
          </p>
        </div>
      </div>
    </div>
  );
}