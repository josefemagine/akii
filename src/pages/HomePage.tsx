import React from 'react';
import { debugSupabaseInstances } from "@/lib/supabase";

export default function HomePage() {
  const handleDebugClick = () => {
    const debugInfo = debugSupabaseInstances();
    console.log("Supabase Debug Info:", debugInfo);
    alert("Supabase debug info logged to console");
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Akii</h1>
      <p className="text-lg mb-4">Your Company's Own AI Platform</p>
      <div className="mt-8">
        <a href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors border-0">
          Go to Dashboard
        </a>
      </div>
      <div className="mt-8">
        <button 
          onClick={handleDebugClick}
          className="text-sm text-gray-500 hover:text-gray-700 p-2 border border-gray-300 rounded"
        >
          Debug Supabase Client
        </button>
      </div>
    </div>
  );
} 