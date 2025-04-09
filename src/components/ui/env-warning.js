import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
export function EnvWarning() {
    const missingVars = [];
    if (!import.meta.env.VITE_SUPABASE_URL)
        missingVars.push('VITE_SUPABASE_URL');
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY)
        missingVars.push('VITE_SUPABASE_ANON_KEY');
    if (missingVars.length === 0)
        return null;
    return (_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Missing Environment Variables" }), _jsxs(AlertDescription, { children: ["The following environment variables are missing:", _jsx("ul", { className: "list-disc list-inside mt-2", children: missingVars.map(variable => (_jsx("li", { children: variable }, variable))) }), _jsx("p", { className: "mt-2", children: "Some features may not work correctly. Please contact support if this persists." })] })] }));
}
