export default function TestEndedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">🚨 Test Ended</h1>
        <p className="mt-4 text-gray-700">
          You switched tabs, so your test has been automatically ended.
        </p>
<br></br>
{/* addes code here */}
    <a href="/dashboard" 
          className="bg-white text-purple-600 px-12 py-5 rounded-full font-semibold text-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center"
        >
          Go to Dashboard
        </a>
{/* //add */}
      </div>
    </div>
  );
}