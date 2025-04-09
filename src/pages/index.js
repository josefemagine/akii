import { jsx as _jsx } from "react/jsx-runtime";
import { debugSupabaseInstances } from "@/lib/supabase";
const SupabaseDebugButton = () => {
    const handleDebugClick = () => {
        const debugInfo = debugSupabaseInstances();
        console.log("Supabase Debug Info:", debugInfo);
        alert("Supabase debug info logged to console");
    };
    return (_jsx("button", { onClick: handleDebugClick, className: "text-xs text-gray-500 mt-4 hover:text-gray-700", children: "Debug Supabase" }));
};
