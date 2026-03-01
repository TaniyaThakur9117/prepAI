// import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Inter } from "next/font/google";
// import Navbar from "@/components/Navbar";
// import ProfileSync from "@/components/ProfileSync";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "PrepAI",
//   description: "AI-powered placement training platform",
// };

// export default function RootLayout({ children }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body className={`min-h-screen bg-gray-100 text-gray-900 ${inter.className}`}>
//           <Navbar />
//           <ProfileSync /> 
//           {children}
          
//           <footer className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-black py-16">
//             <div className="container mx-auto px-6 max-w-7xl">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                
//                 {/* Column 1 */}
//                 <div className="space-y-4">
//                   <h3 className="text-xl font-bold mb-4 text-gray-900">Skill Assessment</h3>
                  
//                   <div className="space-y-3">
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📘 EQ Round</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Enhance emotional awareness with scenario-based questions assessing empathy and teamwork.</p>
//                     </div>
                    
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🧠 IQ Round</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Test logical reasoning and problem-solving through quick analytical challenges.</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column 2 */}
//                 <div className="space-y-4">
//                   <h3 className="text-xl font-bold mb-4 text-gray-900">Core Preparation</h3>
                  
//                   <div className="space-y-3">
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📐 Aptitude Round</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Practice quantitative, verbal, and logical questions for placement exams.</p>
//                     </div>
                    
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📊 Case Study Round</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Solve real-world business problems with strategic, structured approaches.</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column 3 */}
//                 <div className="space-y-4">
//                   <h3 className="text-xl font-bold mb-4 text-gray-900">Technical Excellence</h3>
                  
//                   <div className="space-y-3">
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">💻 Technical Round</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Master programming, databases, networking, and domain-specific concepts.</p>
//                     </div>
                    
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">❓ Interview Questions</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Access company-specific questions with expert sample answers.</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Column 4 */}
//                 <div className="space-y-4">
//                   <h3 className="text-xl font-bold mb-4 text-gray-900">AI-Powered Tools</h3>
                  
//                   <div className="space-y-3">
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🎤 HR Simulation</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">AI-powered mock interviews with real-time confidence and clarity analysis.</p>
//                     </div>
                    
//                     <div className="group">
//                       <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🤖 Chatbot Assistant</h4>
//                       <p className="text-sm text-gray-700 leading-relaxed">Get instant AI guidance for doubts and career queries, available 24/7.</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-gray-300 mb-8"></div>

//               {/* Bottom Footer */}
//               <div className="text-center space-y-4">
                
//                 <p className="text-gray-800 text-sm font-medium">
//                   © 2025 PrepAI. All rights reserved.
//                 </p>
                
//                 <p className="text-gray-600 text-xs italic">
//                   Empowering students with AI-driven placement preparation
//                 </p>
//               </div>
//             </div>
//           </footer>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }


import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import ProfileSync from "@/components/ProfileSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PrepAI",
  description: "AI-powered placement training platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`min-h-screen bg-gray-100 text-gray-900 ${inter.className}`}>
          <Navbar />
          <ProfileSync />
          {children}

          <footer className="bg-white border-t border-gray-200 text-gray-700 pt-14 pb-8">
            <div className="container mx-auto px-6 max-w-7xl">

              {/* Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

                {/* Brand Column */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex items-center gap-2">
                    {/* Concentric circle icon like the uploaded image */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="12" cy="12" r="6"/>
                        <circle cx="12" cy="12" r="2"/>
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-gray-900 tracking-tight">PrepAI</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    AI-powered placement preparation platform for students ready to land their dream roles.
                  </p>
                </div>

                {/* Column 1 — Skill Assessment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Skill Assessment</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 8v4l3 3"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">EQ Round</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Scenario-based questions assessing empathy, self-awareness, and teamwork under pressure.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">IQ Round</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Logical reasoning and analytical problem-solving through timed challenge sets.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2 — Core Preparation */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Core Preparation</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <path d="M3 9h18M9 21V9"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">Aptitude Round</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Quantitative, verbal, and logical reasoning practice tuned for placement exams.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">Case Study Round</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Real-world business scenarios requiring structured, data-driven strategic thinking.</p>
                    </div>
                  </div>
                </div>

                {/* Column 3 — Technical Excellence */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Technical Excellence</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="16 18 22 12 16 6"/>
                          <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">Technical Round</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Programming, databases, networking, and domain-specific concepts for tech roles.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">Interview Questions</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Company-specific questions curated with expert-crafted model answers.</p>
                    </div>
                  </div>
                </div>

                {/* Column 4 — AI Tools */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">AI-Powered Tools</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                          <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">HR Simulation</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">AI mock interviews with real-time confidence, tone, and clarity analysis.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-800">Chatbot Assistant</h4>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed pl-5">Instant AI guidance for career doubts and queries, available around the clock.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Divider + Bottom Bar */}
              <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  © 2025 PrepAI. All rights reserved.
                </p>
                <p className="text-xs text-gray-400 italic">
                  Empowering students with AI-driven placement preparation
                </p>
              </div>

            </div>
          </footer>

        </body>
      </html>
    </ClerkProvider>
  );
}