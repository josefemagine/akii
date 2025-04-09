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
import { useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
export function AdminSetter() {
    const { user, profile, refreshProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    // Get user information
    const userEmail = (user === null || user === void 0 ? void 0 : user.email) || (profile === null || profile === void 0 ? void 0 : profile.email) || '';
    const userId = (user === null || user === void 0 ? void 0 : user.id) || (profile === null || profile === void 0 ? void 0 : profile.id) || '';
    const currentRole = (profile === null || profile === void 0 ? void 0 : profile.role) || 'Unknown';
    // Check if Supabase environment variables are properly set
    const checkSupabaseConfig = () => {
        // Check if Supabase URL and anon key are available
        let supabaseUrl = '';
        let supabaseKey = '';
        // Try to access env vars safely
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
                supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';
            }
            // Check window.ENV as fallback
            if ((!supabaseUrl || !supabaseKey) && typeof window !== 'undefined' && window.ENV) {
                supabaseUrl = supabaseUrl || window.ENV.VITE_SUPABASE_URL || window.ENV.SUPABASE_URL || '';
                supabaseKey = supabaseKey || window.ENV.VITE_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY || '';
            }
            return {
                isConfigured: Boolean(supabaseUrl && supabaseKey),
                url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'missing',
            };
        }
        catch (error) {
            console.error('Error checking Supabase configuration:', error);
            return { isConfigured: false, error };
        }
    };
    const setAdminRole = () => __awaiter(this, void 0, void 0, function* () {
        if (!userId || !userEmail) {
            toast({
                title: "Error",
                description: "User information is missing",
                variant: "destructive"
            });
            return;
        }
        setIsLoading(true);
        setErrorDetails(null);
        setDebugInfo({});
        // Check Supabase configuration
        const supabaseConfig = checkSupabaseConfig();
        setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { supabaseConfig })));
        try {
            console.log('Setting admin role for:', { userId, userEmail });
            // Use the edge function first as it has service role permissions
            console.log('Attempting to use edge function...');
            const edgeFnResponse = yield supabase.functions.invoke('ensure_profile_exists', {
                body: {
                    user_id: userId,
                    email: userEmail,
                    role: 'admin',
                    status: 'active'
                }
            });
            if (edgeFnResponse.error) {
                console.error('Edge function error:', edgeFnResponse.error);
                setErrorDetails(`Edge function error: ${JSON.stringify(edgeFnResponse.error, null, 2)}`);
                setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { edgeFnError: edgeFnResponse.error, edgeFnErrorTime: new Date().toISOString() })));
                // Fall back to RPC call
                console.log('Edge function failed, falling back to RPC call...');
                const rpcResponse = yield supabase
                    .rpc('ensure_profile_exists', {
                    user_id: userId,
                    user_email: userEmail,
                    user_role: 'admin',
                    user_status: 'active'
                });
                if (rpcResponse.error) {
                    console.error('RPC error:', rpcResponse.error);
                    setErrorDetails(prev => `${prev}\n\nRPC Error: ${rpcResponse.error.message} (Code: ${rpcResponse.error.code})`);
                    setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { rpcError: rpcResponse.error, rpcErrorTime: new Date().toISOString() })));
                    // Last resort: direct update
                    console.log('RPC failed, attempting direct profile update as last resort...');
                    const { error: updateError } = yield supabase
                        .from('profiles')
                        .update({
                        role: 'admin',
                        updated_at: new Date().toISOString()
                    })
                        .eq('id', userId);
                    if (updateError) {
                        console.error('Direct update error:', updateError);
                        setErrorDetails(prev => `${prev}\n\nDirect update error: ${updateError.message} (Code: ${updateError.code})`);
                        setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { directUpdateError: updateError, directUpdateErrorTime: new Date().toISOString() })));
                        throw updateError;
                    }
                    else {
                        console.log('Direct update successful');
                        setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { directUpdateSuccess: true, directUpdateTime: new Date().toISOString() })));
                    }
                }
                else {
                    console.log('RPC call successful:', rpcResponse.data);
                    setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { rpcSuccess: true, rpcSuccessTime: new Date().toISOString() })));
                }
            }
            else {
                console.log('Edge function successful:', edgeFnResponse.data);
                setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { edgeFnSuccess: true, edgeFnSuccessTime: new Date().toISOString(), edgeFnResponse: edgeFnResponse.data })));
            }
            // Refresh the profile to get the latest changes
            yield refreshProfile();
            setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { profileRefreshed: true, profileRefreshTime: new Date().toISOString() })));
            toast({
                title: "Success",
                description: "Admin role set successfully",
                variant: "default"
            });
        }
        catch (error) {
            console.error('Failed to set admin role:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            setErrorDetails(prev => `${prev || ''}\n\nFinal error: ${errorMessage}`);
            setDebugInfo(prev => (Object.assign(Object.assign({}, prev), { finalError: error, finalErrorTime: new Date().toISOString() })));
            toast({
                title: "Error",
                description: "Failed to set admin role. See details below.",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsx("div", { className: "rounded-lg border border-slate-200 bg-slate-950 p-6 shadow-sm dark:border-slate-800", children: _jsxs("div", { className: "flex flex-col space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Shield, { className: "h-5 w-5 text-primary" }), _jsx("h3", { className: "text-lg font-semibold", children: "Admin Access Tool" })] }), _jsx("p", { className: "text-sm text-slate-400", children: "Set your account as admin for full access" }), _jsx("div", { className: "flex items-center space-x-2 text-sm", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-slate-400", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "h-4 w-4", children: [_jsx("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "12", cy: "7", r: "4" })] }) }), _jsx("span", { className: "font-medium", children: userEmail })] }) }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("span", { className: "text-sm font-medium", children: ["User ID: ", userId ? userId.substring(0, 8) + '...' : 'Unknown'] }) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-sm", children: "Current Role:" }), _jsx("span", { className: `rounded-full px-2 py-0.5 text-xs font-medium ${currentRole === 'admin'
                                ? 'bg-green-800 text-green-100'
                                : 'bg-slate-800 text-slate-100'}`, children: currentRole })] }), _jsx(Button, { onClick: setAdminRole, disabled: isLoading || currentRole === 'admin', className: "w-full", variant: currentRole === 'admin' ? "outline" : "default", children: isLoading ? 'Setting...' : currentRole === 'admin' ? 'Already Admin' : 'Set as Admin' }), errorDetails && (_jsxs("div", { className: "mt-4 rounded border border-red-400 bg-red-100 p-3 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-400", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx("strong", { children: "Error Details:" })] }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap overflow-auto max-h-40", children: errorDetails }), Object.keys(debugInfo).length > 0 && (_jsxs("details", { className: "mt-2", children: [_jsx("summary", { className: "text-xs cursor-pointer", children: "Debug Information" }), _jsx("pre", { className: "mt-1 text-xs whitespace-pre-wrap overflow-auto max-h-60", children: JSON.stringify(debugInfo, null, 2) })] }))] }))] }) }));
}
export default AdminSetter;
