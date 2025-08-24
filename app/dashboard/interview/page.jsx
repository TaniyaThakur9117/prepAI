//*1*/
// 'use client';

// import { useState, useEffect } from 'react';
// import { Search, BookOpen, Star, Filter } from 'lucide-react';
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export default function InterviewPage() {
//   const [questions, setQuestions] = useState([]);
//   const [filteredQuestions, setFilteredQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [selectedDifficulty, setSelectedDifficulty] = useState('All');
//   const [isClient, setIsClient] = useState(false);

//   // Ensure client-side only rendering
//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const categories = ['All', ...new Set(questions.map(q => q.category))];
//   const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

//   // Fetch questions from Supabase
//   useEffect(() => {
//     if (!isClient) return;
    
//     async function fetchQuestions() {
//       try {
//         const { data, error } = await supabase
//           .from("interview_questions")
//           .select("*")
//           .order("id", { ascending: true });

//         if (error) {
//           console.error("Error fetching questions:", error.message);
//         } else {
//           setQuestions(data || []);
//           setFilteredQuestions(data || []);
//         }
//       } catch (err) {
//         console.error("Failed to fetch questions:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchQuestions();
//   }, [isClient]);

//   // Filter questions based on search and filters
//   useEffect(() => {
//     let filtered = questions;

//     if (searchTerm) {
//       filtered = filtered.filter(q => 
//         q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         q.category.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter(q => q.category === selectedCategory);
//     }

//     if (selectedDifficulty !== 'All') {
//       filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
//     }

//     setFilteredQuestions(filtered);
//   }, [searchTerm, selectedCategory, selectedDifficulty, questions]);

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
//       case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
//       case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
//       default: return 'bg-purple-100 text-purple-700 border-purple-200';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300">
//       {/* Header */}
//       <div className="relative overflow-hidden bg-gradient-to-r from-blue-300 to-purple-300">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/30"></div>
//         <div className="relative max-w-6xl mx-auto px-6 py-16">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-purple-100">
//               <BookOpen className="w-8 h-8 text-purple-600" />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold mb-4 text-purple-800">
//               Interview Questions
//             </h1>
//             <p className="text-lg text-purple-700 max-w-2xl mx-auto">
//               Master your technical interviews with our curated collection of programming questions
//             </p>
//             <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-purple-600">
//               <div className="flex items-center">
//                 <Star className="w-4 h-4 mr-2 text-blue-500" />
//                 <span>{/*{questions.length}*/}Interview Questions</span>
//               </div>
//               <div className="flex items-center">
//                 <Filter className="w-4 h-4 mr-2 text-blue-500" />
//                 <span>Multiple Categories</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-blue-200/50 mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search questions..."
//                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-50 outline-none transition-all bg-white/80"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 suppressHydrationWarning={true}
//               />
//             </div>

//             {/* Category Filter */}
//             <select
//               className="px-4 py-3 rounded-lg border border-blue-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-50 outline-none bg-white/80 transition-all"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               suppressHydrationWarning={true}
//             >
//               {categories.map(category => (
//                 <option key={category} value={category}>
//                   {category === 'All' ? 'All Categories' : category}
//                 </option>
//               ))}
//             </select>

//             {/* Difficulty Filter */}
//             <select
//               className="px-4 py-3 rounded-lg border border-blue-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-50 outline-none bg-white/80 transition-all"
//               value={selectedDifficulty}
//               onChange={(e) => setSelectedDifficulty(e.target.value)}
//               suppressHydrationWarning={true}
//             >
//               {difficulties.map(difficulty => (
//                 <option key={difficulty} value={difficulty}>
//                   {difficulty === 'All' ? 'All Difficulties' : difficulty}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Questions List */}
//         <div className="space-y-4">
//           {filteredQuestions.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
//                 <Search className="w-8 h-8 text-purple-300" />
//               </div>
//               <h3 className="text-xl font-semibold text-purple-700 mb-2">No questions found</h3>
//               <p className="text-purple-500">Try adjusting your search or filters</p>
//             </div>
//           ) : (
//             filteredQuestions.map((question, index) => (
//               <div
//                 key={question.id}
//                 className="group bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-blue-200/50 hover:shadow-md hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
//               >
//                 <div className="flex items-start space-x-4">
//                   <div className="flex-shrink-0">
//                     <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-purple-600 bg-purple-100">
//                       {index + 1}
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg font-semibold text-purple-700 mb-3 group-hover:text-blue-600 transition-colors">
//                       {question.question}
//                     </h3>
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
//                         {question.category}
//                       </span>
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
//                         {question.difficulty}
//                       </span>
//                       <span className="text-xs text-purple-400">
//                         Added {new Date(question.created_at).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Results Summary */}
//         {filteredQuestions.length > 0 && (
//           <div className="mt-8 text-center">
//             <p className="text-purple-600 text-sm">
//               Showing {filteredQuestions.length} of {questions.length} questions
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

/*2*/
// 'use client';

// import { useState, useEffect } from 'react';
// import { Search, BookOpen, Star, Filter } from 'lucide-react';
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export default function InterviewPage() {
//   const [questions, setQuestions] = useState([]);
//   const [filteredQuestions, setFilteredQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [selectedDifficulty, setSelectedDifficulty] = useState('All');

//   const categories = ['All', ...new Set(questions.map(q => q.category))];
//   const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

//   // Fetch questions from Supabase
//   useEffect(() => {
//     async function fetchQuestions() {
//       try {
//         const { data, error } = await supabase
//           .from("interview_questions")
//           .select("*")
//           .order("id", { ascending: true });

//         if (error) {
//           console.error("Error fetching questions:", error.message);
//         } else {
//           setQuestions(data || []);
//           setFilteredQuestions(data || []);
//         }
//       } catch (err) {
//         console.error("Failed to fetch questions:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchQuestions();
//   }, []);

//   // Filter questions based on search and filters
//   useEffect(() => {
//     let filtered = questions;

//     if (searchTerm) {
//       filtered = filtered.filter(q => 
//         q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         q.category.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter(q => q.category === selectedCategory);
//     }

//     if (selectedDifficulty !== 'All') {
//       filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
//     }

//     setFilteredQuestions(filtered);
//   }, [searchTerm, selectedCategory, selectedDifficulty, questions]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-stone-600">Loading questions...</p>
//         </div>
//       </div>
//     );
//   }

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
//       case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
//       case 'Hard': return 'bg-rose-100 text-rose-700 border-rose-200';
//       default: return 'bg-stone-100 text-stone-700 border-stone-200';
//     }
//   };

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
//       {/* Header */}
//       <div className="relative overflow-hidden" style={{ backgroundColor: '#E8DDD4' }}>
//         <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-stone-100/30"></div>
//         <div className="relative max-w-6xl mx-auto px-6 py-16">
//           <div className="text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#D4C4B0' }}>
//               <BookOpen className="w-8 h-8 text-amber-800" />
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold mb-4 text-stone-800">
//               Interview Questions
//             </h1>
//             <p className="text-lg text-stone-600 max-w-2xl mx-auto">
//               Master your technical interviews with our curated collection of programming questions
//             </p>
//             <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-stone-500">
//               <div className="flex items-center">
//                 <Star className="w-4 h-4 mr-2 text-amber-600" />
//                 <span>{questions.length} Questions</span>
//               </div>
//               <div className="flex items-center">
//                 <Filter className="w-4 h-4 mr-2 text-amber-600" />
//                 <span>Multiple Categories</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-stone-200/50 mb-8">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search questions..."
//                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all bg-white/80"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Category Filter */}
//             <select
//               className="px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none bg-white/80 transition-all"
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//             >
//               {categories.map(category => (
//                 <option key={category} value={category}>
//                   {category === 'All' ? 'All Categories' : category}
//                 </option>
//               ))}
//             </select>

//             {/* Difficulty Filter */}
//             <select
//               className="px-4 py-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none bg-white/80 transition-all"
//               value={selectedDifficulty}
//               onChange={(e) => setSelectedDifficulty(e.target.value)}
//             >
//               {difficulties.map(difficulty => (
//                 <option key={difficulty} value={difficulty}>
//                   {difficulty === 'All' ? 'All Difficulties' : difficulty}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Questions List */}
//         <div className="space-y-4">
//           {filteredQuestions.length === 0 ? (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
//                 <Search className="w-8 h-8 text-stone-400" />
//               </div>
//               <h3 className="text-xl font-semibold text-stone-700 mb-2">No questions found</h3>
//               <p className="text-stone-500">Try adjusting your search or filters</p>
//             </div>
//           ) : (
//             filteredQuestions.map((question, index) => (
//               <div
//                 key={question.id}
//                 className="group bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-stone-200/50 hover:shadow-md hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
//               >
//                 <div className="flex items-start space-x-4">
//                   <div className="flex-shrink-0">
//                     <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-amber-800" style={{ backgroundColor: '#E8DDD4' }}>
//                       {index + 1}
//                     </div>
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg font-semibold text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">
//                       {question.question}
//                     </h3>
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
//                         {question.category}
//                       </span>
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
//                         {question.difficulty}
//                       </span>
//                       <span className="text-xs text-stone-500">
//                         Added {new Date(question.created_at).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Results Summary */}
//         {filteredQuestions.length > 0 && (
//           <div className="mt-8 text-center">
//             <p className="text-stone-500 text-sm">
//               Showing {filteredQuestions.length} of {questions.length} questions
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Star, Filter } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function InterviewPage() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', ...new Set(questions.map(q => q.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Fetch questions from Supabase
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { data, error } = await supabase
          .from("interview_questions")
          .select("*")
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching questions:", error.message);
        } else {
          setQuestions(data || []);
          setFilteredQuestions(data || []);
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, []);

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }

    setFilteredQuestions(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, questions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-white/20 backdrop-blur-sm border border-white/30">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Interview Questions
            </h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Master your technical interviews with our curated collection of programming questions
            </p>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-purple-200">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-300" />
                <span>{questions.length} Questions</span>
              </div>
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2 text-yellow-300" />
                <span>Multiple Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-white/90"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white/90 transition-all"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white/90 transition-all"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty === 'All' ? 'All Difficulties' : difficulty}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No questions found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="group bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-lg hover:bg-white/90 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors">
                      {question.question}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200">
                        {question.category}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">
                        Added {new Date(question.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredQuestions.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Showing {filteredQuestions.length} of {questions.length} questions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}