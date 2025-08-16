//app\case-study\page.jsx
"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CaseSubmissionForm from "./CaseSubmissionForm";

export default function CaseStudyPage() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClientComponentClient();
  
  // For now, using a hardcoded student ID - replace with your auth system
  const studentId = "student_123";

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

    fetchCaseStudies();
  }, [supabase]);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
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
    );
  }

  if (caseStudies.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
            <h2 className="text-yellow-800 font-semibold mb-2">No Case Studies Available</h2>
            <p className="text-yellow-600 mb-4">
              Please run the database setup script to create sample case studies.
            </p>
            <div className="text-left bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
              <p>Run this SQL in Supabase:</p>
              <p className="mt-2">INSERT INTO case_studies (title, description) VALUES (...)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
          studentId={studentId} 
        />
      )}
    </div>
  );
}