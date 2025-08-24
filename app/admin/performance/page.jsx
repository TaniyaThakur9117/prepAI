// app/admin/performance/page.jsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, RefreshCw, Users, BookOpen, TrendingUp } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminPerformancePage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    const { data, error } = await supabase
      .from("test_results")
      .select("clerk_id, round_type, total_score, completed_at")
      .order("completed_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching results:", error.message);
    } else {
      setResults(data);
    }
    setLoading(false);
  }

  async function downloadCSV() {
    setDownloading(true);
    try {
      const response = await fetch("/api/admin/attempts.csv");
      
      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.text();
        console.error("CSV Download Error:", errorData);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is actually CSV content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // Server returned JSON error instead of CSV
        const errorData = await response.json();
        throw new Error(errorData.details || 'Server error occurred');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-performance-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message
      console.log("CSV downloaded successfully");
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert(`Failed to download CSV: ${error.message}\n\nPlease check the console for more details.`);
    } finally {
      setDownloading(false);
    }
  }

  // Calculate statistics
  const totalStudents = new Set(results.map(r => r.clerk_id)).size;
  const totalTests = results.length;
  const avgScore = results.length > 0 
    ? (results.reduce((acc, r) => acc + r.total_score, 0) / results.length).toFixed(1)
    : 0;

  // Transform data for charts
  const scoresByRound = results.reduce((acc, row) => {
    if (!acc[row.round_type]) acc[row.round_type] = [];
    acc[row.round_type].push(row.total_score);
    return acc;
  }, {});

  const chartData = Object.entries(scoresByRound).map(([round, scores]) => ({
    round,
    average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
  }));

  // Prepare data for trend chart (last 30 days)
  const trendData = results
    .slice(0, 50) // Latest 50 records for trend
    .reverse()
    .map((r, index) => ({
      index: index + 1,
      score: r.total_score,
      date: new Date(r.completed_at).toLocaleDateString()
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              📊 Performance Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Monitor batch performance and analytics</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchResults}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={downloadCSV}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
              {downloading ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading performance data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold">{totalStudents}</p>
                    </div>
                    <Users className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Tests</p>
                      <p className="text-3xl font-bold">{totalTests}</p>
                    </div>
                    <BookOpen className="w-12 h-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Average Score</p>
                      <p className="text-3xl font-bold">{avgScore}%</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Score by Round */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Average Scores by Round</h2>
                  <p className="text-gray-600 text-sm">Performance breakdown across different test rounds</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <XAxis 
                        dataKey="round" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        gridLines={{ stroke: '#F3F4F6' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="average" 
                        fill="url(#purpleGradient)" 
                        radius={[6, 6, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Trends */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Score Trends</h2>
                  <p className="text-gray-600 text-sm">Latest test performance patterns</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <XAxis 
                        dataKey="index" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(value) => `Test #${value}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#8B5CF6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">All Test Attempts</h2>
                    <p className="text-gray-600 text-sm">Complete record of student performance</p>
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
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-purple-50 to-blue-50">User ID</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-purple-50 to-blue-50">Round Type</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-purple-50 to-blue-50">Score</th>
                        <th className="p-4 text-gray-700 font-semibold bg-gradient-to-r from-purple-50 to-blue-50">Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, index) => (
                        <tr 
                          key={`${r.clerk_id}-${index}`} 
                          className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-purple-25 hover:to-blue-25 transition-colors duration-200"
                        >
                          <td className="p-4 text-gray-700 font-medium">{r.clerk_id}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 capitalize">
                              {r.round_type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold ${
                              r.total_score >= 80 ? 'text-green-600' :
                              r.total_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {r.total_score}
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