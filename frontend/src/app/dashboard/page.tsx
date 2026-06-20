"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Detection {
  id: string;
  timestamp: string;
  vehicleType: string;
  licensePlate: string;
  speed: number;
  violation: string;
  confidence: number;
  bbox: number[];
}

interface MLResponse {
  message: string;
  frameId: string;
  detections: Detection[];
}

export default function Dashboard() {
  const [data, setData] = useState<MLResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Basic mock auth check (in a real app, this would use NextAuth or JWT)
  useEffect(() => {
    fetchDetectData();
    // Simulate real-time stream by fetching every 5 seconds
    const interval = setInterval(fetchDetectData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDetectData = async () => {
    try {
      const res = await fetch("/api/ml/detect");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Error fetching ML data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white font-sans p-6">
      {/* Header */}
      <header className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-8 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-inner">
            TV
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            TrafficVision AI
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Live Feed Active</span>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 border border-white/5 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Camera Feed Mock */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none z-10"></div>
          <h2 className="text-lg font-semibold mb-4 text-gray-200">Live Intersection Camera (Cam_01)</h2>
          
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-inner flex items-center justify-center">
            {/* Mock video placeholder */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
            
            {/* Draw mock bounding boxes */}
            {data?.detections.slice(0, 4).map((det, idx) => (
              <div 
                key={det.id}
                className="absolute border-2 rounded shadow-sm z-20 flex flex-col transition-all duration-500"
                style={{
                  left: `${(det.bbox[0] / 400) * 100}%`,
                  top: `${(det.bbox[1] / 400) * 100}%`,
                  width: `${((det.bbox[2] - det.bbox[0]) / 400) * 100}%`,
                  height: `${((det.bbox[3] - det.bbox[1]) / 400) * 100}%`,
                  borderColor: det.violation !== "None" ? "#ef4444" : "#22c55e",
                  boxShadow: det.violation !== "None" ? "0 0 15px rgba(239,68,68,0.5)" : "0 0 10px rgba(34,197,94,0.3)"
                }}
              >
                <div className={`text-[10px] px-1 py-0.5 whitespace-nowrap text-white font-bold inline-block self-start -mt-5 rounded-t ${det.violation !== "None" ? "bg-red-500" : "bg-green-500"}`}>
                  {det.vehicleType} | {det.licensePlate}
                </div>
              </div>
            ))}
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Real-time Detections List */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-200">Recent Violations</h2>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30">
              YOLOv11 Active
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
                Analyzing feed...
              </div>
            ) : (
              data?.detections
                .filter(d => d.violation !== "None")
                .map((det) => (
                <div 
                  key={det.id} 
                  className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/30 transition-all rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:shadow-[0_0_10px_#ef4444]"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-100">{det.violation}</h3>
                      <p className="text-xs text-gray-400">{new Date(det.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-1 rounded-md font-mono">
                      {det.licensePlate}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-gray-500 text-xs block">Type</span>
                      <span className="text-gray-200 font-medium">{det.vehicleType}</span>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <span className="text-gray-500 text-xs block">Speed</span>
                      <span className="text-orange-400 font-medium">{det.speed} km/h</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {data?.detections.filter(d => d.violation !== "None").length === 0 && !loading && (
              <div className="text-center text-gray-500 py-10">No violations detected currently.</div>
            )}
          </div>
        </div>

      </main>
      
      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { label: "Frames Processed", val: "14,205" },
          { label: "Vehicles Detected", val: "3,892" },
          { label: "Total Violations", val: "124" },
          { label: "System Accuracy", val: "99.4%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            <div className="text-2xl font-bold text-indigo-400 mt-1">{stat.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
