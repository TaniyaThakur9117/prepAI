'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Sign up container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join PrepAI</h1>
          <p className="text-gray-600">Create your account to start your preparation journey</p>
        </div>

        {/* Sign up component wrapper */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
          <SignUp 
            routing="hash"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-transparent shadow-none",
                headerTitle: "text-gray-800 text-xl font-semibold",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "bg-white/90 border border-gray-200 hover:bg-white text-gray-700 transition-colors",
                socialButtonsBlockButtonText: "text-gray-700 font-medium",
                dividerLine: "bg-gray-200",
                dividerText: "text-gray-500",
                formFieldLabel: "text-gray-700 font-medium",
                formFieldInput: "bg-white/90 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 text-gray-800",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg",
                footerActionLink: "text-purple-600 hover:text-purple-700 font-medium",
                identityPreviewText: "text-gray-700",
                formResendCodeLink: "text-purple-600 hover:text-purple-700",
                otpCodeFieldInput: "bg-white/90 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100",
                alertText: "text-red-600",
                formFieldSuccessText: "text-green-600",
                formFieldWarningText: "text-orange-600"
              },
              layout: {
                socialButtonsPlacement: "top"
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            By signing up, you agree to our{" "}
            <span className="text-purple-600 font-medium cursor-pointer hover:text-purple-700">Terms of Service</span>
            {" "}and{" "}
            <span className="text-purple-600 font-medium cursor-pointer hover:text-purple-700">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}