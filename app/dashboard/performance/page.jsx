//app\dashboard\performance\page.jsx

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, TrendingUp, Award, Calendar, Target } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function StudentReportDashboard() {
  const { user } = useUser();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  async function fetchResults() {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("test_results")
      .select("clerk_id, round_type, total_score, completed_at")
      .eq("clerk_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching results:", error.message);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  }

  async function downloadCSV() {
    if (!user) return;
    
    setDownloading(true);
    try {
      // Create CSV from student's own results
      const headers = ["Round Type", "Score", "Completed At"];
      const csvContent = [
        headers.join(","),
        ...results.map(r => 
          `${r.round_type},${r.total_score},${new Date(r.completed_at).toLocaleString()}`
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `my-performance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("CSV downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert(`Failed to download CSV: ${error.message}\n\nPlease check the console for more details.`);
    } finally {
      setDownloading(false);
    }
  }

  // Calculate student statistics
  const aptitudeAttempts = results.filter(r => r.round_type.toLowerCase() === 'aptitude').length;
  const technicalAttempts = results.filter(r => r.round_type.toLowerCase() === 'technical-round' || r.round_type.toLowerCase() === 'technical').length;
  const iqAttempts = results.filter(r => r.round_type.toLowerCase() === 'iq').length;
  const avgScore = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.total_score, 0) / results.length).toFixed(1)
    : 0;
  const highestScore = results.length > 0 
    ? Math.max(...results.map(r => r.total_score))
    : 0;
  const latestScore = results.length > 0 ? results[0].total_score : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📈 My Performance Report
            </h1>
            <p className="text-gray-600 mt-2">Track your progress and test results</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchResults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={downloadCSV}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'Downloading...' : 'Download Report'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your performance data...</p>
            </div>
          </div>
        ) : !user ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-gray-600 text-lg">Please log in to view your performance report</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-medium mb-1">Aptitude Attempts</p>
                      <p className="text-2xl font-bold">{aptitudeAttempts}</p>
                    </div>
                    <Target className="w-10 h-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs font-medium mb-1">Technical Attempts</p>
                      <p className="text-2xl font-bold">{technicalAttempts}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-100 text-xs font-medium mb-1">IQ Attempts</p>
                      <p className="text-2xl font-bold">{iqAttempts}</p>
                    </div>
                    <Award className="w-10 h-10 text-cyan-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-medium mb-1">Highest Score</p>
                      <p className="text-2xl font-bold">{highestScore}</p>
                    </div>
                    <Award className="w-10 h-10 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-xs font-medium mb-1">Latest Score</p>
                      <p className="text-2xl font-bold">{latestScore}</p>
                    </div>
                    <Calendar className="w-10 h-10 text-indigo-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Test Results Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Test History</h2>
                    <p className="text-gray-600 text-sm">Complete record of all your test attempts</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {results.length} records found
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-blue-50 to-purple-50">User ID</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-blue-50 to-purple-50">Round Type</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-blue-50 to-purple-50">Score</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-blue-50 to-purple-50">Performance</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-blue-50 to-purple-50">Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, index) => (
                        <tr 
                          key={`${r.clerk_id}-${index}`} 
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-25 hover:to-purple-25 transition-colors duration-200"
                        >
                          <td className="p-4 text-gray-700 font-medium">{r.clerk_id}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 capitalize">
                              {r.round_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold ${
                              r.total_score >= 8 ? 'text-green-600' :
                              r.total_score >= 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {r.total_score}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              r.total_score >= 8 ? 'bg-green-100 text-green-700' :
                              r.total_score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {r.total_score >= 8 ? '🌟 Excellent' :
                               r.total_score >= 6 ? '👍 Good' : '📚 Needs Improvement'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">
                            {new Date(r.completed_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}