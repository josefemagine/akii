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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/UnifiedAuthContext";
const LoginForm = ({ signInWithGoogle }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useAuth();
    const { toast } = useToast();
    const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        console.log("Starting login process for:", email);
        if (!email || !password) {
            setError("Email and password are required");
            setIsLoading(false);
            return;
        }
        try {
            // Store login attempt in localStorage to track state
            localStorage.setItem("login-attempt", "true");
            localStorage.setItem("login-attempt-time", Date.now().toString());
            localStorage.setItem("login-attempt-email", email);
            yield signIn(email, password);
            // If we get here, login was successful
            console.log("Login successful");
            // Store user email for backup recovery
            localStorage.setItem("akii-auth-user-email", email);
            localStorage.setItem("akii-auth-timestamp", Date.now().toString());
            // Clear login attempt tracking
            localStorage.removeItem("login-attempt");
            localStorage.removeItem("login-attempt-time");
            localStorage.removeItem("login-attempt-email");
            toast({
                title: "Success",
                description: "You have been logged in successfully.",
            });
            // Force redirect to dashboard if not automatically redirected
            setTimeout(() => {
                if (window.location.pathname !== "/dashboard") {
                    console.log("Manual redirect to dashboard after login");
                    window.location.href = "/dashboard";
                }
            }, 1000);
        }
        catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred. Please try again.");
            localStorage.removeItem("login-attempt");
            localStorage.removeItem("login-attempt-time");
            localStorage.removeItem("login-attempt-email");
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleGoogleSignIn = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        try {
            console.log("Starting Google sign-in process");
            yield signInWithGoogle();
        }
        catch (error) {
            console.error("Error signing in with Google:", error);
            toast({
                title: "Sign In Error",
                description: "There was a problem signing in with Google. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: "Login to Akii" }), _jsx(CardDescription, { children: "Enter your credentials to access your dashboard" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "name@example.com", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx("a", { href: "/forgot-password", className: "text-sm font-medium text-primary hover:underline", children: "Forgot password?" })] }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, onClick: (e) => {
                                    if (!isLoading) {
                                        console.log("Login button clicked");
                                        handleSubmit(e);
                                    }
                                }, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Logging in..."] })) : ("Login") })] }), _jsxs("div", { className: "relative mt-6", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx(Separator, { className: "w-full" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with" }) })] }), _jsx("div", { className: "mt-6", children: _jsxs(Button, { variant: "outline", type: "button", onClick: handleGoogleSignIn, disabled: isLoading, className: "w-full", children: [_jsx("svg", { className: "mr-2 h-4 w-4", "aria-hidden": "true", focusable: "false", "data-prefix": "fab", "data-icon": "google", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 488 512", children: _jsx("path", { fill: "currentColor", d: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" }) }), "Google"] }) })] }), _jsx(CardFooter, { className: "flex flex-col space-y-4", children: _jsxs("div", { className: "text-center text-sm", children: ["Don't have an account?", " ", _jsx("a", { href: "/signup", className: "font-medium text-primary hover:underline", children: "Sign up" })] }) })] }));
};
export default LoginForm;
