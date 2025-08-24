// //app\simulation\aptitude\page.jsx
// import { createClient } from "@supabase/supabase-js";
// import AptitudeClient from "./AptitudeClient";

// // Utility function to shuffle array using Fisher-Yates algorithm
// function shuffleArray(array) {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// // Function to get random questions
// function getRandomQuestions(questions, count = 10) {
//   const shuffled = shuffleArray(questions);
//   return shuffled.slice(0, Math.min(count, shuffled.length));
// }

// export default async function AptitudePage({ searchParams }) {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   );

//   // Get parameters for customization
//   const questionCount = parseInt(searchParams?.count || "10", 10);
  
//   // Fetch ALL questions from database
//   const { data, error } = await supabase
//     .from("aptitude_questions")
//     .select("*");

//   if (error) {
//     console.error("Error fetching aptitude questions:", error);
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="bg-white p-8 rounded-lg shadow-lg">
//           <div className="text-red-500 text-center">
//             <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
//             <p className="text-gray-600">Unable to fetch aptitude questions. Please try again later.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="bg-white p-8 rounded-lg shadow-lg">
//           <div className="text-yellow-500 text-center">
//             <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
//             <p className="text-gray-600">Please add some questions to the database first.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Map DB rows to expected format
//   const allQuestions = data.map((q) => ({
//     id: q.id,
//     question: q.question,
//     options: [
//       { id: "A", text: q.option_a },
//       { id: "B", text: q.option_b },
//       { id: "C", text: q.option_c },
//       { id: "D", text: q.option_d },
//     ],
//     correct_option:
//       typeof q.correct_option === "number"
//         ? ["A", "B", "C", "D"][q.correct_option - 1]
//         : q.correct_option
//   }));

//   // Get random subset of questions
//   const randomQuestions = getRandomQuestions(allQuestions, questionCount);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-gray-800 mb-2">Aptitude Test</h1>
//             <p className="text-gray-600 text-lg">
//               Test your knowledge and skills - {randomQuestions.length} random questions
//             </p>
//             <p className="text-sm text-gray-500 mt-2">
//               You'll get different questions each time you take the test!
//             </p>
//           </div>
//           <AptitudeClient initialQuestions={randomQuestions} />
//         </div>
//       </div>
//     </div>
//   );
// }


// app/simulation/aptitude/page.jsx
import { createClient } from "@supabase/supabase-js";
import AptitudeClient from "./AptitudeClient";

// Utility function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Function to get random questions
function getRandomQuestions(questions, count = 10) {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default async function AptitudePage({ searchParams }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Get parameters for customization
  const questionCount = parseInt(searchParams?.count || "10", 10);

  // Fetch ALL questions from database
  const { data, error } = await supabase
    .from("aptitude_questions")
    .select("*");

  if (error) {
    console.error("❌ Error fetching aptitude questions:", error.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Error Loading Questions
          </h2>
          <p className="text-gray-600">
            Something went wrong while fetching aptitude questions.  
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-yellow-500 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600">
            Please add some questions to the database first.
          </p>
        </div>
      </div>
    );
  }

  // Map DB rows to expected format
  const allQuestions = data.map((q) => ({
    id: q.id,
    question: q.question,
    options: [
      { id: "A", text: q.option_a },
      { id: "B", text: q.option_b },
      { id: "C", text: q.option_c },
      { id: "D", text: q.option_d },
    ],
    correct_option:
      typeof q.correct_option === "number"
        ? ["A", "B", "C", "D"][q.correct_option - 1]
        : q.correct_option,
  }));

  // Get random subset of questions
  const randomQuestions = getRandomQuestions(allQuestions, questionCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Aptitude Test</h1>
            <p className="text-gray-600 text-lg">
              Test your knowledge and skills – {randomQuestions.length} random questions
            </p>
            <p className="text-sm text-gray-500 mt-2">
              You’ll get different questions each time you take the test!
            </p>
          </div>
          <AptitudeClient initialQuestions={randomQuestions} />
        </div>
      </div>
    </div>
  );
}
