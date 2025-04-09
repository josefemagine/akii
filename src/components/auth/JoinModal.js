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
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
const joinSchema = z
    .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
export default function JoinModal({ isOpen, onClose, onOpenLogin, }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [verificationStep, setVerificationStep] = useState(false);
    const [email, setEmail] = useState("");
    const { signUp, user } = useAuth();
    const { register, handleSubmit, formState: { errors }, reset, } = useForm({
        resolver: zodResolver(joinSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            company: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Attempting to create account with email:", data.email);
            // Add user metadata for first name, last name and company
            const metadata = {
                first_name: data.firstName,
                last_name: data.lastName,
                company: data.company || null,
            };
            // Use the supabase client directly to support metadata
            const { error } = yield supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: metadata
                }
            });
            if (error) {
                console.error("Signup error:", error.message);
                if (error.message.includes("rate limit") || error.message.includes("exceeded")) {
                    setError("Account creation rate limit reached. Please try again later or use a different email address.");
                }
                else if (error.message.includes("timeout") || error.message.includes("network") || error.message.includes("establish connection")) {
                    setError("Connection error. The server is currently unreachable. Please check your internet connection and try again later.");
                }
                else {
                    setError(error.message);
                }
            }
            else {
                setEmail(data.email);
                setVerificationStep(true);
            }
        }
        catch (err) {
            console.error("Sign up error:", err);
            // Handle specific error cases
            if (err instanceof Error) {
                if (err.message.includes("timeout") || err.message.includes("504") || err.message.includes("Gateway Timeout")) {
                    setError("Server timeout. The authentication service is not responding. Please try again later.");
                }
                else if (err.message.includes("network") || err.message.includes("establish connection")) {
                    setError("Network error. Please check your internet connection and try again.");
                }
                else {
                    setError(`Error: ${err.message}`);
                }
            }
            else {
                setError("An unexpected error occurred. Please try again.");
            }
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleGoogleSignIn = () => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        try {
            // Use Supabase directly for Google sign-in
            yield supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
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
    const handleOpenLogin = () => {
        reset();
        setVerificationStep(false);
        onClose();
        onOpenLogin();
    };
    // Force close the modal on component mount if already authenticated
    useEffect(() => {
        // Direct DOM-based solution that will forcibly close the modal
        const forceCloseModal = () => {
            console.log('[JoinModal] Force closing modal...');
            // First try using the onClose prop
            onClose();
            // As a fallback, find and click any close button in the modal
            setTimeout(() => {
                try {
                    // Try clicking the close button
                    const closeButton = document.querySelector('[data-dialog-close="true"]');
                    if (closeButton) {
                        console.log('[JoinModal] Found close button, clicking it');
                        closeButton.click();
                    }
                    // Try clicking the overlay as another fallback
                    const overlay = document.querySelector('[data-radix-dialog-overlay]');
                    if (overlay) {
                        console.log('[JoinModal] Found overlay, clicking it');
                        overlay.click();
                    }
                }
                catch (e) {
                    console.error('[JoinModal] Error in force close:', e);
                }
            }, 100);
        };
        // Force close if already authenticated
        if (user) {
            console.log('[JoinModal] User detected, force closing modal');
            forceCloseModal();
        }
        // Directly listen for storage events to detect auth changes
        const handleStorageChange = (e) => {
            if (e.key && (e.key.includes('supabase.auth.token') || e.key.includes('supabase.auth.refreshToken'))) {
                console.log('[JoinModal] Auth storage changed, likely authenticated');
                forceCloseModal();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        // Cleanup
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [onClose, user]);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-2xl font-bold", children: verificationStep ? "Verify Email" : "Create Account" }), _jsx(DialogDescription, { children: verificationStep
                                ? `We've sent a verification code to ${email}. Please enter it below.`
                                : "Join Akii to create and manage your AI agents" })] }), verificationStep ? (_jsxs("div", { className: "space-y-4 py-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("svg", { width: "50", height: "50", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "text-primary", children: [_jsx("path", { d: "M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12Z", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M12 8V13", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("path", { d: "M12 16H12.01", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })] }) }), _jsx("h3", { className: "text-lg font-medium", children: "Check your email" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["We've sent a verification link to ", _jsx("span", { className: "font-medium", children: email }), ". Please check your inbox and click the link to verify your account."] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [_jsx("p", { children: "After verification, you'll be automatically logged in." }), _jsx("p", { className: "mt-2", children: "Can't find the email? Check your spam folder." })] })] }), _jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: () => {
                                reset();
                                setVerificationStep(false);
                            }, children: "Back to Sign Up" })] })) : (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4 py-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsx(Input, Object.assign({ id: "firstName", type: "text", autoComplete: "given-name", placeholder: "John" }, register("firstName"), { disabled: isLoading })), errors.firstName && (_jsx("p", { className: "text-sm text-red-500", children: errors.firstName.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsx(Input, Object.assign({ id: "lastName", type: "text", autoComplete: "family-name", placeholder: "Doe" }, register("lastName"), { disabled: isLoading })), errors.lastName && (_jsx("p", { className: "text-sm text-red-500", children: errors.lastName.message }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "company", children: "Company" }), _jsx(Input, Object.assign({ id: "company", type: "text", autoComplete: "organization", placeholder: "Your Company (Optional)" }, register("company"), { disabled: isLoading })), errors.company && (_jsx("p", { className: "text-sm text-red-500", children: errors.company.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, Object.assign({ id: "email", type: "email", autoComplete: "username", placeholder: "name@example.com" }, register("email"), { disabled: isLoading })), errors.email && (_jsx("p", { className: "text-sm text-red-500", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, Object.assign({ id: "password", type: "password", autoComplete: "new-password" }, register("password"), { disabled: isLoading })), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsx(Input, Object.assign({ id: "confirmPassword", type: "password", autoComplete: "new-password" }, register("confirmPassword"), { disabled: isLoading })), errors.confirmPassword && (_jsx("p", { className: "text-sm text-red-500", children: errors.confirmPassword.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Creating account..."] })) : ("Create Account") })] }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 flex items-center", children: _jsx(Separator, { className: "w-full" }) }), _jsx("div", { className: "relative flex justify-center text-xs uppercase", children: _jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "Or continue with" }) })] }), _jsx("div", { className: "grid gap-2", children: _jsxs(Button, { variant: "outline", type: "button", onClick: handleGoogleSignIn, disabled: isLoading, className: "w-full", children: [_jsx("svg", { className: "mr-2 h-4 w-4", "aria-hidden": "true", focusable: "false", "data-prefix": "fab", "data-icon": "google", role: "img", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 488 512", children: _jsx("path", { fill: "currentColor", d: "M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" }) }), "Google"] }) })] })), _jsx(DialogFooter, { className: "flex flex-col sm:flex-row sm:justify-center sm:space-x-0", children: _jsxs("div", { className: "text-center text-sm", children: ["Already have an account?", " ", _jsx(Button, { variant: "link", className: "px-0 font-normal", onClick: handleOpenLogin, disabled: isLoading, children: "Sign in" })] }) })] }) }));
}
