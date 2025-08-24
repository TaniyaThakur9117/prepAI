// //app\case-study\page.jsx
// "use client";

// import { useState, useEffect } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import CaseSubmissionForm from "./CaseSubmissionForm";


// export default function CaseStudyPage() {
//   const [caseStudies, setCaseStudies] = useState([]);
//   const [selectedCaseId, setSelectedCaseId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const supabase = createClientComponentClient();
  
//   // For now, using a hardcoded student ID - replace with your auth system
//   const studentId = "student_123";

//   useEffect(() => {
//     const fetchCaseStudies = async () => {
//       try {
//         setLoading(true);
//         const { data, error } = await supabase
//           .from('case_studies')
//           .select('*')
//           .order('created_at', { ascending: false });

//         if (error) {
//           console.error('Error fetching case studies:', error);
//           setError('Failed to load case studies');
//           return;
//         }

//         setCaseStudies(data || []);
        
//         // Auto-select the first case study if available
//         if (data && data.length > 0) {
//           setSelectedCaseId(data[0].id);
//         }
//       } catch (err) {
//         console.error('Unexpected error:', err);
//         setError('An unexpected error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCaseStudies();
//   }, [supabase]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading case studies...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
//             <h2 className="text-red-800 font-semibold mb-2">Error Loading Case Studies</h2>
//             <p className="text-red-600 mb-4">{error}</p>
//             <button 
//               onClick={() => window.location.reload()} 
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (caseStudies.length === 0) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
//             <h2 className="text-yellow-800 font-semibold mb-2">No Case Studies Available</h2>
//             <p className="text-yellow-600 mb-4">
//               Please run the database setup script to create sample case studies.
//             </p>
//             <div className="text-left bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
//               <p>Run this SQL in Supabase:</p>
//               <p className="mt-2">INSERT INTO case_studies (title, description) VALUES (...)</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       {/* Case Study Selection (if multiple exist) */}
//       {caseStudies.length > 1 && (
//         <div className="max-w-4xl mx-auto p-6">
//           <div className="bg-white rounded-lg shadow-md p-4 mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Select Case Study:
//             </label>
//             <select
//               value={selectedCaseId || ''}
//               onChange={(e) => setSelectedCaseId(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               {caseStudies.map((caseStudy) => (
//                 <option key={caseStudy.id} value={caseStudy.id}>
//                   {caseStudy.title}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       )}

//       {/* Case Submission Form */}
//       {selectedCaseId && (
//         <CaseSubmissionForm 
//           caseId={selectedCaseId} 
//           studentId={studentId} 
//         />
//       )}
//     </div>
//   );
// }

//app/case-study/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import CaseSubmissionForm from "./CaseSubmissionForm";

export default function CaseStudyPage() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isLoaded, isSignedIn, user } = useUser();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('case_studies')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching case studies:', error);
          setError('Failed to load case studies');
          return;
        }

        setCaseStudies(data || []);
        
        // Auto-select the first case study if available
        if (data && data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch case studies if user is loaded and signed in
    if (isLoaded && isSignedIn) {
      fetchCaseStudies();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [supabase, isLoaded, isSignedIn]);

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in page if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access the case study platform
            </p>
            <SignInButton mode="modal">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case studies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header with user info */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Case Study Platform</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h2 className="text-red-800 font-semibold mb-2">Error Loading Case Studies</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (caseStudies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header with user info */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Case Study Platform</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!</span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
              <h2 className="text-yellow-800 font-semibold mb-2">No Case Studies Available</h2>
              <p className="text-yellow-600 mb-4">
                Please contact your administrator to create case studies.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with user info */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Case Study Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.firstName || user.emailAddresses[0].emailAddress}!</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Case Study Selection (if multiple exist) */}
      {caseStudies.length > 1 && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Case Study:
            </label>
            <select
              value={selectedCaseId || ''}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {caseStudies.map((caseStudy) => (
                <option key={caseStudy.id} value={caseStudy.id}>
                  {caseStudy.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Case Submission Form */}
      {selectedCaseId && (
        <CaseSubmissionForm 
          caseId={selectedCaseId} 
          userId={user.id} // Pass the actual Clerk user ID
          userEmail={user.emailAddresses[0].emailAddress}
          userName={user.firstName || user.emailAddresses[0].emailAddress}
        />
      )}
    </div>
  );
}
