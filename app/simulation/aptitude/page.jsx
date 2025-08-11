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

//   // Transform DB rows → client expected format
//   const formattedQuestions = data.map((q) => ({
//     id: q.id,
//     question: q.question,
//     options: [
//       { id: "A", text: q.option_a },
//       { id: "B", text: q.option_b },
//       { id: "C", text: q.option_c },
//       { id: "D", text: q.option_d },
//     ],
//     correct_option: q.correct_option // already stored as A/B/C/D in DB
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
    return <div>Error loading data</div>;
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Aptitude Test</h1>
      <AptitudeClient initialQuestions={formattedQuestions} />
    </div>
  );
}
