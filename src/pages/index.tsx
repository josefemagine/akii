import { debugSupabaseInstances } from "@/lib/supabase-singleton";

const SupabaseDebugButton = () => {
  const handleDebugClick = () => {
    const debugInfo = debugSupabaseInstances();
    console.log("Supabase Debug Info:", debugInfo);
    alert("Supabase debug info logged to console");
  };

  return (
    <button 
      onClick={handleDebugClick}
      className="text-xs text-gray-500 mt-4 hover:text-gray-700"
    >
      Debug Supabase
    </button>
  );
}; 