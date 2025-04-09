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
const emailSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});
const resetSchema = z
    .object({
    code: z.string().min(6, "Please enter the verification code"),
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
export default function PasswordReset({ isOpen, onClose, onOpenLogin, }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [resetStep, setResetStep] = useState("email");
    const [email, setEmail] = useState("");
    // Try to use the auth hook safely
    let auth = {
        resetPassword: () => __awaiter(this, void 0, void 0, function* () { return ({ error: new Error("Auth not initialized") }); }),
        confirmPasswordReset: () => __awaiter(this, void 0, void 0, function* () { return ({ error: new Error("Auth not initialized") }); })
    };
    try {
        auth = useAuth();
    }
    catch (error) {
        console.error("Error using auth in PasswordReset:", error);
    }
    const { resetPassword, confirmPasswordReset } = auth;
    const emailForm = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: "",
        },
    });
    const resetForm = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            code: "",
            password: "",
            confirmPassword: "",
        },
    });
    const onSubmitEmail = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = yield resetPassword(data.email);
            if (error) {
                setError(error.message);
            }
            else {
                setEmail(data.email);
                setSuccess("Password reset instructions have been sent to your email. Please check your inbox.");
                setResetStep("reset");
            }
        }
        catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Password reset error:", err);
        }
        finally {
            setIsLoading(false);
        }
    });
    const onSubmitReset = (data) => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = yield confirmPasswordReset(email, data.code, data.password);
            if (error) {
                setError(error.message);
            }
            else {
                setSuccess("Your password has been reset successfully.");
                setTimeout(() => {
                    handleOpenLogin();
                }, 2000);
            }
        }
        catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Password reset confirmation error:", err);
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleOpenLogin = () => {
        emailForm.reset();
        resetForm.reset();
        setResetStep("email");
        setError(null);
        setSuccess(null);
        onClose();
        onOpenLogin();
    };
    const handleClose = () => {
        emailForm.reset();
        resetForm.reset();
        setResetStep("email");
        setError(null);
        setSuccess(null);
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && handleClose(), children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-2xl font-bold", children: resetStep === "email" ? "Reset Password" : "Enter New Password" }), _jsx(DialogDescription, { children: resetStep === "email"
                                ? "Enter your email address and we'll send you a verification code"
                                : `Enter the verification code sent to ${email} and your new password` })] }), resetStep === "email" ? (_jsxs("form", { onSubmit: emailForm.handleSubmit(onSubmitEmail), className: "space-y-4 py-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), success && (_jsx(Alert, { children: _jsx(AlertDescription, { children: success }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, Object.assign({ id: "email", type: "email", placeholder: "name@example.com" }, emailForm.register("email"), { disabled: isLoading })), emailForm.formState.errors.email && (_jsx("p", { className: "text-sm text-red-500", children: emailForm.formState.errors.email.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sending..."] })) : ("Send Reset Instructions") })] })) : (_jsxs("form", { onSubmit: resetForm.handleSubmit(onSubmitReset), className: "space-y-4 py-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), success && (_jsx(Alert, { children: _jsx(AlertDescription, { children: success }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "code", children: "Verification Code" }), _jsx(Input, Object.assign({ id: "code", type: "text", placeholder: "Enter verification code" }, resetForm.register("code"), { disabled: isLoading })), resetForm.formState.errors.code && (_jsx("p", { className: "text-sm text-red-500", children: resetForm.formState.errors.code.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "New Password" }), _jsx(Input, Object.assign({ id: "password", type: "password" }, resetForm.register("password"), { autoComplete: "new-password", disabled: isLoading })), resetForm.formState.errors.password && (_jsx("p", { className: "text-sm text-red-500", children: resetForm.formState.errors.password.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }), _jsx(Input, Object.assign({ id: "confirmPassword", type: "password" }, resetForm.register("confirmPassword"), { autoComplete: "new-password", disabled: isLoading })), resetForm.formState.errors.confirmPassword && (_jsx("p", { className: "text-sm text-red-500", children: resetForm.formState.errors.confirmPassword.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Resetting..."] })) : ("Reset Password") })] })), _jsx(DialogFooter, { className: "flex flex-col sm:flex-row sm:justify-center sm:space-x-0", children: _jsxs("div", { className: "text-center text-sm", children: ["Remember your password?", " ", _jsx(Button, { variant: "link", className: "px-0 font-normal", onClick: handleOpenLogin, disabled: isLoading, children: "Sign in" })] }) })] }) }));
}
