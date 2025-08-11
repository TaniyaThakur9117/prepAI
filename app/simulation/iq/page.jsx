import { createClient } from "@supabase/supabase-js";
import IQClient from "@/components/iq/IQClient";

export default async function IQPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from("iq_questions")
    .select("*");

  if (error) {
    console.error("Error fetching IQ questions:", error);
    return <div>Error loading data</div>;
  }

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
      <h1 className="text-2xl font-bold mb-4">IQ Test</h1>
      <IQClient initialQuestions={formattedQuestions} />
    </div>
  );
}
