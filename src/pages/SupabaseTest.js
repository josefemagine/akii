var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Implement verifySupabaseConnection directly in this file to avoid dependency issues
function verifySupabaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const start = Date.now();
            const { data, error } = yield supabase.auth.getSession();
            const latency = Date.now() - start;
            return {
                success: !error,
                latency,
                sessionExists: !!(data === null || data === void 0 ? void 0 : data.session),
                error: error ? error.message : null
            };
        }
        catch (error) {
            return {
                success: false,
                latency: 0,
                sessionExists: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
export default function SupabaseTest() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const testConnection = () => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        setError(null);
        try {
            const result = yield verifySupabaseConnection();
            // Transform the result to match the expected status type
            setStatus({
                success: result.success,
                message: result.error ? `Error: ${result.error}` : `Connection successful! Latency: ${result.latency}ms`,
                details: {
                    connection: result.success,
                    profile: result.sessionExists,
                    service: !result.error
                }
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
            setStatus(null);
        }
        finally {
            setLoading(false);
        }
    });
    // Run the test on initial load
    useEffect(() => {
        testConnection();
    }, []);
    return (_jsx("div", { className: "container mx-auto py-10", children: _jsxs(Card, { className: "w-full max-w-lg mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Supabase Connection Test" }), _jsx(CardDescription, { children: "Verify your Supabase connection and auth configuration" })] }), _jsx(CardContent, { children: loading ? (_jsxs("div", { className: "flex items-center justify-center p-6", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" }), _jsx("span", { className: "ml-3", children: "Testing connection..." })] })) : error ? (_jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", children: [_jsx("strong", { className: "font-bold", children: "Error:" }), _jsxs("span", { className: "block sm:inline", children: [" ", error] })] })) : status ? (_jsxs("div", { children: [_jsx("div", { className: `mb-4 p-3 rounded ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: _jsx("p", { className: "font-semibold", children: status.message }) }), _jsxs("div", { className: "space-y-3 mt-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: `inline-block w-4 h-4 rounded-full mr-2 ${status.details.connection ? 'bg-green-500' : 'bg-red-500'}` }), _jsxs("span", { children: ["Supabase connection: ", status.details.connection ? 'OK' : 'Failed'] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: `inline-block w-4 h-4 rounded-full mr-2 ${status.details.profile ? 'bg-green-500' : 'bg-red-500'}` }), _jsxs("span", { children: ["Profiles table: ", status.details.profile ? 'OK' : 'Failed'] })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: `inline-block w-4 h-4 rounded-full mr-2 ${status.details.service ? 'bg-green-500' : 'bg-red-500'}` }), _jsxs("span", { children: ["Service role access: ", status.details.service ? 'OK' : 'Failed'] })] })] }), _jsxs("div", { className: "mt-6 text-sm", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Next steps:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1", children: [!status.details.connection && (_jsx("li", { children: "Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env" })), !status.details.profile && (_jsxs("li", { children: ["Run the migrations to create the profiles table: ", _jsx("code", { className: "bg-gray-100 px-1 py-0.5 rounded", children: "npm run run-migrations" })] })), !status.details.service && (_jsx("li", { children: "Verify your VITE_SUPABASE_SERVICE_KEY in .env" })), status.success && (_jsxs("li", { children: ["Setup an admin user: ", _jsx("code", { className: "bg-gray-100 px-1 py-0.5 rounded", children: "npm run setup-admin" })] }))] })] })] })) : null }), _jsx(CardFooter, { children: _jsx(Button, { onClick: testConnection, disabled: loading, className: "w-full", children: loading ? 'Testing...' : 'Test Connection Again' }) })] }) }));
}
