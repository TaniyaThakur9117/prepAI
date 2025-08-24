// // app/dashboard/page.jsx
// import { auth } from '@clerk/nextjs/server';
// import { redirect } from 'next/navigation';
// import Link from "next/link";
// import {
//   ClipboardList,
//   Brain,
//   Smile,
//   FileText,
//   MessageSquare,
//   Cpu,
//   Target,
// } from "lucide-react";

// const sections = [
//   {
//     title: "Aptitude",
//     desc: "Practice aptitude tests and improve problem solving skills.",
//     href: "/dashboard/aptitude",
//     icon: ClipboardList,
//     gradient: "from-blue-500 to-blue-600",
//     bgGradient: "from-blue-50 to-blue-100",
//   },
//   {
//     title: "IQ Questions",
//     desc: "Boost logical thinking with IQ-based questions.",
//     href: "/dashboard/iq",
//     icon: Brain,
//     gradient: "from-purple-500 to-purple-600",
//     bgGradient: "from-purple-50 to-purple-100",
//   },
//   {
//     title: "EQ Questions",
//     desc: "Work on emotional intelligence through scenario-based EQ tests.",
//     href: "/dashboard/eq",
//     icon: Smile,
//     gradient: "from-pink-500 to-pink-600",
//     bgGradient: "from-pink-50 to-pink-100",
//   },
//   {
//     title: "Case Studies",
//     desc: "Analyze case studies and provide creative solutions.",
//     href: "/dashboard/case-studies",
//     icon: FileText,
//     gradient: "from-green-500 to-green-600",
//     bgGradient: "from-green-50 to-green-100",
//   },
//   {
//     title: "Interview Questions",
//     desc: "Prepare with common and technical interview questions.",
//     href: "/dashboard/interview",
//     icon: MessageSquare,
//     gradient: "from-orange-500 to-orange-600",
//     bgGradient: "from-orange-50 to-orange-100",
//   },
//   {
//     title: "Technical Round",
//     desc: "Answer coding and technical MCQs for final prep.",
//     href: "/dashboard/technical-round",
//     icon: Cpu,
//     gradient: "from-indigo-500 to-indigo-600",
//     bgGradient: "from-indigo-50 to-indigo-100",
//   },
// ];

// export default async function DashboardPage() {
//   const { userId } = await auth();

//   console.log('Dashboard - User ID:', userId); // Debug log

//   if (!userId) {
//     redirect('/auth/SignIn');
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
//       <div className="p-6 space-y-8">
//         {/* Welcome Section */}
//         <div className="text-center space-y-4">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
//             <Target className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
//             Welcome to PrepAI Dashboard
//           </h1>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Select a section below to start practicing and tracking your progress. 
//             Master your skills with our comprehensive preparation tools.
//           </p>
//         </div>



//         {/* Section Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {sections.map((section) => {
//             const Icon = section.icon;
//             return (
//               <Link
//                 key={section.title}
//                 href={section.href}
//                 className="group relative overflow-hidden"
//               >
//                 <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
//                 <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group-hover:border-white/40 group-hover:-translate-y-2">
//                   {/* Icon Container */}
//                   <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${section.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
//                     <Icon className="text-white" size={28} />
//                   </div>
                  
//                   {/* Content */}
//                   <div className="space-y-3">
//                     <h2 className="text-xl font-bold text-gray-800 group-hover:text-gray-900">
//                       {section.title}
//                     </h2>
//                     <p className="text-gray-600 text-sm leading-relaxed">
//                       {section.desc}
//                     </p>
//                   </div>
                  
//                   {/* Hover Arrow */}
//                   <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
//                       <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
              
//             );
//           })}
//         </div>
        


//       </div>
//     </div>
//   );
// }

// app/dashboard/page.jsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from "next/link";
import {
  ClipboardList,
  Brain,
  Smile,
  FileText,
  MessageSquare,
  Cpu,
  Target,
  Home,
} from "lucide-react";

const sections = [
  {
    title: "Aptitude",
    desc: "Practice aptitude tests and improve problem solving skills.",
    href: "/dashboard/aptitude",
    icon: ClipboardList,
    gradient: "from-blue-500 to-blue-600",
    bgGradient: "from-blue-50 to-blue-100",
  },
  {
    title: "IQ Questions",
    desc: "Boost logical thinking with IQ-based questions.",
    href: "/dashboard/iq",
    icon: Brain,
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "from-purple-50 to-purple-100",
  },
  {
    title: "EQ Questions",
    desc: "Work on emotional intelligence through scenario-based EQ tests.",
    href: "/dashboard/eq",
    icon: Smile,
    gradient: "from-pink-500 to-pink-600",
    bgGradient: "from-pink-50 to-pink-100",
  },
  {
    title: "Case Studies",
    desc: "Analyze case studies and provide creative solutions.",
    href: "/dashboard/case-studies",
    icon: FileText,
    gradient: "from-green-500 to-green-600",
    bgGradient: "from-green-50 to-green-100",
  },
  {
    title: "Interview Questions",
    desc: "Prepare with common and technical interview questions.",
    href: "/dashboard/interview",
    icon: MessageSquare,
    gradient: "from-orange-500 to-orange-600",
    bgGradient: "from-orange-50 to-orange-100",
  },
  {
    title: "Technical Round",
    desc: "Answer coding and technical MCQs for final prep.",
    href: "/dashboard/technical-round",
    icon: Cpu,
    gradient: "from-indigo-500 to-indigo-600",
    bgGradient: "from-indigo-50 to-indigo-100",
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();

  console.log('Dashboard - User ID:', userId); // Debug log

  if (!userId) {
    redirect('/auth/SignIn');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to PrepAI Dashboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Select a section below to start practicing and tracking your progress. 
            Master your skills with our comprehensive preparation tools.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.title}
                href={section.href}
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group-hover:border-white/40 group-hover:-translate-y-2">
                  {/* Icon Container */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${section.gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-3">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-gray-900">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {section.desc}
                    </p>
                  </div>
                  
                  {/* Hover Arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Home Button - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-20">
        <Link 
          href="/"
          className="group bg-white hover:bg-gray-50 text-purple-600 border border-purple-200 hover:border-purple-300 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
          title="Go to Home"
        >
          <Home className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Home
        </Link>
      </div>
    </div>
  );
}