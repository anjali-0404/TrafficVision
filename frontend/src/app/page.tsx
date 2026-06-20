import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-3xl text-center space-y-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-4xl shadow-lg">
          TV
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          TrafficVision AI
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Intelligent Traffic Violation Detection, Hotspot Analytics & Enforcement Recommendation Platform powered by predictive AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          >
            Access Platform
          </Link>
          <Link 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
