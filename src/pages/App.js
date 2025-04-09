var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Documents from "./dashboard/Documents";
import Agents from "./dashboard/Agents";
import AgentSetup from "./dashboard/AgentSetup";
import Settings from "./dashboard/Settings";
import AuthCallback from "./auth/callback";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "./LandingPage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { authRecoveryMiddleware, tryRepairAuthIssues } from "@/lib/supabase-auth-recovery";
function App() {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const { toast } = useToast();
    const [authCheckComplete, setAuthCheckComplete] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);
    const isAuthenticated = !!user;
    // Run auth diagnostics on startup to detect and fix issues
    useEffect(() => {
        // Only run once on startup
        if (authCheckComplete)
            return;
        const runDiagnostics = () => __awaiter(this, void 0, void 0, function* () {
            try {
                setIsRepairing(true);
                console.log("App: Running auth diagnostics on startup");
                yield authRecoveryMiddleware();
                // Mark the check as complete
                setAuthCheckComplete(true);
            }
            catch (error) {
                console.error("App: Error during auth diagnostics:", error);
            }
            finally {
                setIsRepairing(false);
            }
        });
        runDiagnostics();
    }, [authCheckComplete]);
    // Listen for auth state changes and handle redirects from Supabase auth
    useEffect(() => {
        // Check if the URL contains hash parameters from auth redirect
        if (location.hash &&
            (location.hash.includes("access_token") ||
                location.hash.includes("error") ||
                location.hash.includes("type=recovery"))) {
            console.log("Auth redirect detected with hash params:", location.hash);
            // Log tokens for debugging
            const hashParams = new URLSearchParams(location.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            console.log("DEBUG - Tokens detected:", {
                accessToken: accessToken
                    ? `${accessToken.substring(0, 10)}...`
                    : "none",
                refreshToken: refreshToken ? "present" : "none",
                fullHash: location.hash,
            });
            // Store tokens in localStorage for debugging
            if (accessToken) {
                localStorage.setItem("debug-access-token", accessToken);
            }
            if (refreshToken) {
                localStorage.setItem("debug-refresh-token", refreshToken);
            }
            // Let the callback page handle it
            window.location.href = "/auth/callback" + location.search + location.hash;
            return;
        }
        // Check if we have auth code in URL query params
        const query = new URLSearchParams(location.search);
        if (query.has("code") || query.has("error") || query.has("provider")) {
            console.log("Auth redirect detected with query params:", location.search);
            // Log code for debugging
            const code = query.get("code");
            console.log("DEBUG - Auth code detected:", code ? `${code.substring(0, 10)}...` : "none");
            // Store code in localStorage for debugging
            if (code) {
                localStorage.setItem("debug-auth-code", code);
            }
            // Let the callback page handle it
            if (location.pathname !== "/auth/callback") {
                window.location.href =
                    "/auth/callback" + location.search + location.hash;
                return;
            }
        }
        // Setup Supabase auth listener
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((event, session) => __awaiter(this, void 0, void 0, function* () {
            console.log("App: Auth state change:", event, session ? "Session exists" : "No session");
            // When signing in, ensure profiles exist and auth state is recoverable
            if (event === 'SIGNED_IN' && session) {
                console.log("App: User signed in, ensuring auth state is recoverable");
                try {
                    // Save emergency auth data to localStorage for recovery
                    localStorage.setItem('akii-auth-emergency', 'true');
                    localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
                    // Try to fix any auth issues that might exist
                    yield authRecoveryMiddleware();
                }
                catch (error) {
                    console.error("App: Error ensuring auth recovery:", error);
                }
            }
        }));
        return () => {
            subscription.unsubscribe();
        };
    }, [location]);
    // Handle deep-linking magic links for password reset
    useEffect(() => {
        if (location.hash && location.hash.includes("type=recovery")) {
            console.log("Password reset detected");
            toast({
                title: "Password Reset Link Detected",
                description: "Please enter your new password.",
            });
        }
    }, [location.hash, toast]);
    // Private routes that require authentication
    const renderPrivateRoutes = () => {
        if (isLoading || isRepairing) {
            // Show a loading indicator while checking auth status or repairing
            return (_jsxs("div", { className: "flex items-center justify-center min-h-screen", children: [_jsx("div", { className: "animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" }), _jsx("p", { className: "ml-2 text-primary", children: isRepairing ? "Repairing authentication..." : "Loading..." })] }));
        }
        if (!isAuthenticated) {
            // If not authenticated and not handling an auth redirect, try to repair auth issues
            const checkEmergencyAuth = () => {
                try {
                    console.log("App: Performing emergency auth check");
                    // Check for emergency auth flag first - highest priority
                    if (localStorage.getItem('akii-auth-emergency') === 'true') {
                        const timestamp = parseInt(localStorage.getItem('akii-auth-emergency-time') || '0');
                        // Extend validity to 60 minutes for production
                        if (Date.now() - timestamp < 60 * 60 * 1000) {
                            console.log("App: Using emergency auth override from localStorage (valid emergency flag)");
                            return true;
                        }
                        else {
                            console.log("App: Emergency auth expired, timestamp:", new Date(timestamp).toISOString());
                        }
                    }
                    // Check for auth tokens directly - second priority
                    let foundTokens = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.includes('supabase.auth.token') ||
                            key.includes('sb-') ||
                            key.includes('akii-auth'))) {
                            foundTokens.push(key);
                        }
                    }
                    if (foundTokens.length > 0) {
                        console.log("App: Found auth tokens in emergency check:", foundTokens);
                        // Set emergency auth as a fallback
                        localStorage.setItem('akii-auth-emergency', 'true');
                        localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
                        // Try to extract email from existing data
                        const userId = localStorage.getItem('akii-auth-user-id');
                        const fallbackUserStr = localStorage.getItem('akii-auth-fallback-user');
                        if (fallbackUserStr) {
                            try {
                                const fallbackUser = JSON.parse(fallbackUserStr);
                                if (fallbackUser && fallbackUser.email) {
                                    localStorage.setItem('akii-auth-emergency-email', fallbackUser.email);
                                }
                            }
                            catch (e) {
                                console.error("App: Failed to parse fallback user", e);
                            }
                        }
                        return true;
                    }
                    // Check if we're on production and simply force access
                    const isProduction = window.location.hostname === 'www.akii.com' ||
                        window.location.hostname === 'akii.com';
                    if (isProduction) {
                        console.log("App: Production environment detected, allowing emergency access");
                        // Set emergency auth as absolute last resort on production
                        localStorage.setItem('akii-auth-emergency', 'true');
                        localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
                        // Try to recover in background
                        setTimeout(() => {
                            tryRepairAuthIssues().catch(err => {
                                console.error("App: Error during production auth repair:", err);
                            });
                        }, 500);
                        return true;
                    }
                    return false;
                }
                catch (e) {
                    console.error("App: Error in emergency auth check:", e);
                    // On error, allow access in production for better resilience
                    if (window.location.hostname === 'www.akii.com' ||
                        window.location.hostname === 'akii.com') {
                        return true;
                    }
                    return false;
                }
            };
            // If emergency auth check passes, allow access
            if (checkEmergencyAuth()) {
                console.log("App: Using emergency auth - proceeding to dashboard");
                // Try to repair auth issues in the background
                setTimeout(() => {
                    tryRepairAuthIssues().catch(err => {
                        console.error("App: Error during background auth repair:", err);
                    });
                }, 1000);
                // Let the user proceed to dashboard even without auth
                return (_jsx(MainLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/documents", element: _jsx(Documents, {}) }), _jsx(Route, { path: "/agents", element: _jsx(Agents, {}) }), _jsx(Route, { path: "/agent-setup", element: _jsx(AgentSetup, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard" }) })] }) }));
            }
            // If not authenticated and emergency check failed, redirect to landing page
            return _jsx(Navigate, { to: "/", state: { from: location }, replace: true });
        }
        // User is authenticated, render the private routes
        return (_jsx(MainLayout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/documents", element: _jsx(Documents, {}) }), _jsx(Route, { path: "/agents", element: _jsx(Agents, {}) }), _jsx(Route, { path: "/agent-setup", element: _jsx(AgentSetup, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard" }) })] }) }));
    };
    console.log("App: Using standard Supabase authentication - no cleanup needed");
    return (_jsxs(_Fragment, { children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallback, {}) }), _jsx(Route, { path: "/*", element: renderPrivateRoutes() })] }), _jsx(Toaster, {})] }));
}
export default App;
