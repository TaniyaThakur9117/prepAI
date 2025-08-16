import { createClient } from "@supabase/supabase-js";
import IQClient from "@/components/iq/IQClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Test
                </h2>
                <p className="text-gray-600">
                  We encountered an error while loading the IQ test. Please try again later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              IQ Aptitude Test
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Challenge your cognitive abilities with our adaptive intelligence test. 
              The difficulty adjusts based on your performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-blue-600">Adaptive</div>
                <div>Difficulty</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">Real-time</div>
                <div>Feedback</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">Progress</div>
                <div>Tracking</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Component */}
        <IQClient initialQuestions={formattedQuestions} />
      </div>
    </div>
  );
}

// import { createClient } from "@supabase/supabase-js";
// import IQClient from "@/components/iq/IQClient";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Brain, AlertCircle, Clock, Trophy } from "lucide-react";

// export default async function IQPage() {
//   const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   );

//   const { data, error } = await supabase
//     .from("iq_questions")
//     .select("*");

//   if (error) {
//     console.error("Error fetching IQ questions:", error);
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//         <div className="max-w-2xl mx-auto">
//           <Card className="shadow-lg">
//             <CardContent className="pt-6">
//               <div className="text-center py-8">
//                 <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
//                 <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                   Error Loading Test
//                 </h2>
//                 <p className="text-gray-600">
//                   We encountered an error while loading the IQ test. Please try again later.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

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
//     <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
//           <CardHeader className="text-center py-12">
//             <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
//                 <Brain className="relative h-20 w-20 text-purple-600" />
//               </div>
//             </div>
//             <CardTitle className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
//               IQ Aptitude Test
//             </CardTitle>
//             <CardDescription className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
//               Challenge your cognitive abilities with our adaptive intelligence test. 
//               The difficulty adjusts based on your performance.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="pb-12">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
//               <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg">
//                 <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//                   <Brain className="h-8 w-8 text-white" />
//                 </div>
//                 <div className="font-bold text-blue-600 text-lg mb-2">Adaptive</div>
//                 <div className="text-gray-600">Difficulty adjusts to your performance</div>
//               </div>
//               <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg">
//                 <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//                   <Clock className="h-8 w-8 text-white" />
//                 </div>
//                 <div className="font-bold text-green-600 text-lg mb-2">Timed</div>
//                 <div className="text-gray-600">Real-time pressure testing</div>
//               </div>
//               <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg">
//                 <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
//                   <Trophy className="h-8 w-8 text-white" />
//                 </div>
//                 <div className="font-bold text-purple-600 text-lg mb-2">Progress</div>
//                 <div className="text-gray-600">Track your improvement</div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Test Component */}
//         <IQClient initialQuestions={formattedQuestions} />
//       </div>
//     </div>
//   );
// }