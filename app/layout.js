// import "./globals.css";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Inter } from "next/font/google";
// import Navbar from "@/components/Navbar"; // or your navigation component
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
//            <ProfileSync /> 
//           {children}
//           <footer className="bg-blue-50 py-12">
//             <div className="container mx-auto px-4 text-center text-grey-600">
//               <p>© 2025 The Rebels. All rights reserved. </p>
//               <p>✅ Footer Descriptions for PrepAI

// 📘 EQ Round
// Enhance your emotional awareness with scenario-based questions that assess empathy, teamwork, and decision-making under pressure.
// 🧠 IQ Round
// Test your logical reasoning and problem-solving skills through quick, analytical questions designed to sharpen your thinking.

// 📐 Aptitude Round
// Practice quantitative, verbal, and logical aptitude questions commonly asked in placement exams and competitive tests.

// 📊 Case Study Round
// Solve real-world business problems to showcase your analytical thinking, strategic approach, and structured problem-solving.

// 💻 Technical Round
// Master core technical concepts with curated questions across programming, databases, networking, OS, and domain-specific topics.

// 🎤 HR Simulation
// Experience AI-powered mock HR interviews with real-time analysis on confidence, clarity, eye contact, and communication.

// 🤖 Chatbot Assistant
// Get instant AI guidance for doubts, career queries, learning support, and preparation tips — available 24/7.

// ❓ Interview Questions
// Access a vast collection of company-specific and topic-wise interview questions with expert sample answers.</p>
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
          
          <footer className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-black py-16">
            <div className="container mx-auto px-6 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                
                {/* Column 1 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Skill Assessment</h3>
                  
                  <div className="space-y-3">
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📘 EQ Round</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Enhance emotional awareness with scenario-based questions assessing empathy and teamwork.</p>
                    </div>
                    
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🧠 IQ Round</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Test logical reasoning and problem-solving through quick analytical challenges.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Core Preparation</h3>
                  
                  <div className="space-y-3">
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📐 Aptitude Round</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Practice quantitative, verbal, and logical questions for placement exams.</p>
                    </div>
                    
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">📊 Case Study Round</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Solve real-world business problems with strategic, structured approaches.</p>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Technical Excellence</h3>
                  
                  <div className="space-y-3">
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">💻 Technical Round</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Master programming, databases, networking, and domain-specific concepts.</p>
                    </div>
                    
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">❓ Interview Questions</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Access company-specific questions with expert sample answers.</p>
                    </div>
                  </div>
                </div>

                {/* Column 4 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">AI-Powered Tools</h3>
                  
                  <div className="space-y-3">
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🎤 HR Simulation</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">AI-powered mock interviews with real-time confidence and clarity analysis.</p>
                    </div>
                    
                    <div className="group">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">🤖 Chatbot Assistant</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">Get instant AI guidance for doubts and career queries, available 24/7.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-300 mb-8"></div>

              {/* Bottom Footer */}
              <div className="text-center space-y-4">
                
                <p className="text-gray-800 text-sm font-medium">
                  © 2025 The Rebels. All rights reserved.
                </p>
                
                <p className="text-gray-600 text-xs italic">
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