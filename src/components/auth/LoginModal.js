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
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AUTH_STATE_CHANGE_EVENT } from '@/types/auth';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useNavigate } from "react-router-dom";
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
// Add a new utility function at the beginning of the file after the imports
// This function handles redirection to the dashboard using standard navigation
const forceRedirectToDashboard = () => {
    console.log("[Login Modal] Redirecting to dashboard");
    // Always use a literal dashboard path to avoid concatenation issues
    const DASHBOARD_PATH = "/dashboard";
    // Use window.location for direct navigation
    window.location.href = DASHBOARD_PATH;
};
const LoginModal = ({ isOpen, onClose, onOpenJoin, onOpenPasswordReset, }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    // Try to use the auth hook safely
    let auth;
    try {
        auth = useAuth();
    }
    catch (error) {
        console.error("Error using auth in LoginModal:", error);
        // Create a fallback auth object with minimal needed functionality
        auth = {
            user: null,
            session: null,
            signIn: () => __awaiter(void 0, void 0, void 0, function* () { return ({ data: null, error: new Error("Auth not initialized") }); }),
            signInWithGoogle: () => __awaiter(void 0, void 0, void 0, function* () { return ({ data: null, error: new Error("Auth not initialized") }); })
        };
    }
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        resolver: zodResolver(loginSchema),
    });
    // Debug function to check auth state
    const checkAuthState = () => {
        var _a, _b;
        console.log("[Login Modal] Current auth state:", {
            user: auth.user ? "Logged in" : "Not logged in",
            userId: (_a = auth.user) === null || _a === void 0 ? void 0 : _a.id,
            email: (_b = auth.user) === null || _b === void 0 ? void 0 : _b.email,
            hasSession: !!auth.session,
            isModalOpen: isOpen,
        });
        return !!auth.user;
    };
    // Call on mount and when auth state changes
    useEffect(() => {
        if (isOpen) {
            const isAuthenticated = checkAuthState();
            console.log("[Login Modal] Authentication check:", isAuthenticated);
            // Also check Supabase session directly
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    console.log("[Login Modal] Valid Supabase session found, closing modal");
                    onClose();
                }
            });
        }
    }, [auth.user, auth.session, isOpen, onClose]);
    // Enhanced auto-close if user is logged in
    useEffect(() => {
        if ((auth.user || auth.session) && isOpen) {
            console.log("[Login Modal] User authenticated, closing modal automatically");
            // Try to close modal immediately
            onClose();
        }
    }, [auth.user, auth.session, isOpen, onClose]);
    // Listen for global auth state changes
    useEffect(() => {
        const handleAuthStateChange = (e) => {
            if (e.detail.authenticated && isOpen) {
                console.log('[LoginModal] Detected authenticated state from event, closing modal');
                onClose();
            }
        };
        // Add event listener
        document.addEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
        // Clean up
        return () => {
            document.removeEventListener(AUTH_STATE_CHANGE_EVENT, handleAuthStateChange);
        };
    }, [isOpen, onClose]);
    // Listen for Supabase auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("[Login Modal] Supabase auth event:", event);
            if (event === 'SIGNED_IN' && session && isOpen) {
                console.log("[Login Modal] User signed in via Supabase, closing modal");
                onClose();
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    forceRedirectToDashboard();
                }, 100);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [isOpen, onClose]);
    // Force close the modal on component mount if already authenticated
    useEffect(() => {
        // Direct DOM-based solution that will forcibly close the modal
        const forceCloseModal = () => {
            console.log('[LoginModal] Force closing modal...');
            // First try using the onClose prop
            onClose();
        };
        // Force close if already authenticated
        if (auth.session || auth.user) {
            console.log('[LoginModal] Session or user detected, force closing modal');
            forceCloseModal();
        }
        // Also check Supabase session directly
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                console.log('[LoginModal] Valid Supabase session found, force closing modal');
                forceCloseModal();
            }
        });
        // Directly listen for storage events to detect auth changes
        const handleStorageChange = (e) => {
            if (e.key && (e.key.includes('supabase.auth.token') || e.key.includes('supabase.auth.refreshToken'))) {
                console.log('[LoginModal] Auth storage changed, likely authenticated');
                forceCloseModal();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [onClose, auth.session, auth.user]);
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        setIsLoading(true);
        setError(null);
        // Set login in progress flag
        localStorage.setItem("akii-login-in-progress", "true");
        localStorage.setItem("akii-login-time", Date.now().toString());
        localStorage.setItem("akii-login-email", data.email);
        console.log("[Login Modal] Starting email sign-in process for:", data.email);
        try {
            // Try to close the modal BEFORE the signIn attempt
            // This ensures the modal won't block the redirect
            onClose();
            // Use Supabase directly for the most reliable login
            const { data: authData, error: authError } = yield supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });
            if (authError) {
                console.error("[Login Modal] Supabase sign-in error:", authError);
                setError(authError.message);
                setIsLoading(false);
                return;
            }
            console.log("[Login Modal] Supabase sign-in successful:", authData.session ? "Has session" : "No session");
            // Set emergency auth data for backup
            localStorage.setItem("akii-auth-emergency", "true");
            localStorage.setItem("akii-auth-emergency-time", Date.now().toString());
            localStorage.setItem("akii-auth-emergency-email", data.email);
            localStorage.setItem("akii-is-logged-in", "true");
            if ((_a = authData.user) === null || _a === void 0 ? void 0 : _a.id) {
                localStorage.setItem("akii-auth-user-id", authData.user.id);
            }
            // Store session data
            try {
                const sessionData = {
                    timestamp: Date.now(),
                    email: data.email,
                    hasSession: !!authData.session,
                    userId: (_b = authData.user) === null || _b === void 0 ? void 0 : _b.id
                };
                localStorage.setItem("akii-session-data", JSON.stringify(sessionData));
            }
            catch (storageError) {
                console.warn("[Login Modal] Failed to store session data:", storageError);
            }
            // Trigger auth events with delays to ensure UI updates properly
            window.dispatchEvent(new CustomEvent('akii-login-state-changed', {
                detail: {
                    isLoggedIn: true,
                    email: data.email,
                    userId: (_c = authData.user) === null || _c === void 0 ? void 0 : _c.id,
                    timestamp: Date.now()
                }
            }));
            // Add a delayed second event to ensure all components update
            setTimeout(() => {
                var _a;
                window.dispatchEvent(new CustomEvent('akii-auth-changed', {
                    detail: {
                        isLoggedIn: true,
                        email: data.email,
                        userId: (_a = authData.user) === null || _a === void 0 ? void 0 : _a.id,
                        timestamp: Date.now(),
                        delayed: true
                    }
                }));
            }, 500);
            // Force navigation to dashboard
            setTimeout(() => {
                forceRedirectToDashboard();
            }, 100);
            // Reset form after successful login
            reset();
        }
        catch (error) {
            console.error("[Login Modal] Unexpected sign-in error:", error);
            setError(error instanceof Error
                ? error.message
                : "An unexpected error occurred");
        }
        finally {
            setIsLoading(false);
            // Check if we're logged in but still on the homepage after a delay
            // This catches cases where the earlier redirects failed
            setTimeout(() => {
                supabase.auth.getSession().then(({ data }) => {
                    if (data.session && window.location.pathname === "/") {
                        console.log("[Login Modal] Detected session but still on homepage, forcing redirect");
                        forceRedirectToDashboard();
                    }
                });
                // Also check the emergency auth
                if (window.location.pathname === "/" && localStorage.getItem("akii-is-logged-in") === "true") {
                    console.log("[Login Modal] Detected login flag but still on homepage, forcing redirect");
                    forceRedirectToDashboard();
                }
                // Remove login-in-progress flag
                localStorage.removeItem("akii-login-in-progress");
            }, 2000); // 2 second fallback timeout
        }
    });
    const handleGoogleSignIn = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        setError(null);
        try {
            console.log("[Login Modal] Starting Google sign-in process");
            // Close modal first
            onClose();
            // Use Supabase client directly for Google sign-in
            const { error } = yield supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) {
                console.error("[Login Modal] Error signing in with Google:", error);
                setError("There was a problem signing in with Google. Please try again.");
                return;
            }
            console.log("[Login Modal] Started Google authentication flow");
            // The redirect will be handled by the auth callback
        }
        catch (error) {
            console.error("[Login Modal] Error signing in with Google:", error);
            setError("There was a problem signing in with Google. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleOpenJoin = () => {
        reset();
        onClose();
        onOpenJoin();
    };
    const handleOpenPasswordReset = () => {
        reset();
        onClose();
        onOpenPasswordReset();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-2xl font-bold", children: "Sign In" }), _jsx(DialogDescription, { children: "Sign in to your Akii account to access your dashboard" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4 py-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, Object.assign({ id: "email", type: "email", placeholder: "example@domain.com" }, register("email"), { autoComplete: "email", disabled: isLoading })), errors.email && (_jsx("p", { className: "text-sm text-red-500", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Button, { variant: "link", className: "px-0 font-normal", type: "button", onClick: handleOpenPasswordReset, disabled: isLoading, children: "Forgot password?" })] }), _jsx(Input, Object.assign({ id: "password", type: "password" }, register("password"), { autoComplete: "current-password", disabled: isLoading })), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Signing in..."] })) : ("Sign In") })] }), _jsx(Separator, { className: "my-4" }), _jsx("div", { className: "grid gap-2", children: _jsxs(Button, { variant: "outline", type: "button", onClick: handleGoogleSignIn, disabled: isLoading, className: "w-full", children: [_jsx("svg", { className: "mr-2 h-4 w-4", "aria-hidden": "true", focusable: "false", "data-prefix": "fab", "data-icon": "google", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 488 512", children: _jsx("path", { fill: "currentColor", d: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" }) }), "Google"] }) }), _jsxs(DialogFooter, { className: "flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2", children: [_jsx(Button, { variant: "ghost", onClick: handleOpenJoin, className: "w-full sm:w-auto", disabled: isLoading, type: "button", children: "Don't have an account? Sign up" }), _jsx(Button, { variant: "outline", onClick: handleOpenPasswordReset, className: "w-full sm:w-auto", disabled: isLoading, type: "button", children: "Forgot password?" })] })] }) }));
};
export default LoginModal;
