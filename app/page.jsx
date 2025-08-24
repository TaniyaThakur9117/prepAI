import React from 'react';
import { ChevronRight, Shield } from 'lucide-react';
import {
   BarChart, Bar, PieChart, Pie, Cell,
   XAxis, YAxis, Tooltip, ResponsiveContainer,
   LineChart, Line
 } from "recharts";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20">
        <div className="grid grid-cols-20 gap-6 p-8">
          {Array.from({length: 400}).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
          ))}
        </div>
      </div>
               
      <div className="container mx-auto px-6 py-12 relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-12">
          <span className="text-white font-medium text-lg">PrepAI Platform</span>
          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
                 
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            PrepAI
          </span>{' '}
          🚀
        </h1>
                 
        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed">
          AI-powered interview preparation platform that analyzes your responses, 
          provides personalized feedback, and helps you practice with realistic 
          interview scenarios. Boost your confidence and land your dream job with 
          PrepAI.
        </p>

        {/* Dashboard Button */}
        <a 
          href="/dashboard"
          className="bg-white text-purple-600 px-12 py-5 rounded-full font-semibold text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
        >
          Go to Dashboard
          <ChevronRight className="ml-3 w-6 h-6" />
        </a>

        {/* sign Up button */} 
        <br></br>
        <a 
          href="/auth/SignUp"
          className="bg-white text-purple-600 px-12 py-3 rounded-full font-semibold text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
        >
          Sign Up
          <ChevronRight className="ml-3 w-6 h-6" />
        </a>

        {/* sign in button */} 
        <br></br>
        <a 
          href="/auth/SignIn"
          className="bg-white text-purple-600 px-12 py-3 rounded-full font-semibold text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
        >
          Sign In
          <ChevronRight className="ml-3 w-6 h-6" />
        </a>
      </div>

      {/* Admin Link - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-20">
        <a 
          href="/admin"
          className="group bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 hover:border-white/50 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 shadow-xl inline-flex items-center"
          title="Admin Access"
        >
          <Shield className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          Admin
        </a>
      </div>
    </main>
  );
}