// import { createClient } from "@supabase/supabase-js";
// import AptitudeClient from "@/components/aptitude/AptitudeClient";

// export default async function AptitudePage() {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   );

//   const { data, error } = await supabase
//     .from("aptitude_questions")
//     .select("*");

//   if (error) {
//     console.error("Error fetching aptitude questions:", error);
//     return <div>Error loading data</div>;
//   }

//   // Map DB rows → expected format
//   const formattedQuestions = (data || []).map((q) => ({
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

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Aptitude Test</h1>
//       <AptitudeClient initialQuestions={formattedQuestions} />
//     </div>
//   );
// }


import { createClient } from "@supabase/supabase-js";
import AptitudeClient from "@/components/aptitude/AptitudeClient";

export default async function AptitudePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("aptitude_questions")
    .select("*");

  if (error) {
    console.error("Error fetching aptitude questions:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
            <p className="text-gray-600">Unable to fetch aptitude questions. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Map DB rows → expected format
  const formattedQuestions = (data || []).map((q) => ({
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
        : q.correct_option
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Aptitude Test</h1>
            <p className="text-gray-600 text-lg">Test your knowledge and skills</p>
          </div>
          <AptitudeClient initialQuestions={formattedQuestions} />
        </div>
      </div>
    </div>
  );
}