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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
const resetSchema = z
    .object({
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
export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const auth = useAuth();
    // Use Supabase directly for password reset
    const confirmPasswordReset = (email, token, password) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Use Supabase directly since we might not have the method in the auth context
            return yield supabase.auth.updateUser({ password });
        }
        catch (err) {
            return { data: null, error: err };
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const email = searchParams.get("email");
    const token = searchParams.get("token");
    const { register, handleSubmit, formState: { errors }, } = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });
    useEffect(() => {
        if (!email || !token) {
            navigate("/");
        }
    }, [email, token, navigate]);
    const onSubmit = (data) => __awaiter(this, void 0, void 0, function* () {
        if (!email || !token)
            return;
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const { error } = yield confirmPasswordReset(email, token, data.password);
            if (error) {
                setError(error.message);
            }
            else {
                setSuccess("Your password has been reset successfully.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
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
    if (!email || !token) {
        return null;
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-background p-4", children: _jsxs("div", { className: "w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm", children: [_jsxs("div", { className: "space-y-2 text-center", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Reset Your Password" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your new password below" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), success && (_jsx(Alert, { children: _jsx(AlertDescription, { children: success }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "New Password" }), _jsx(Input, Object.assign({ id: "password", type: "password" }, register("password"), { autoComplete: "new-password", disabled: isLoading })), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }), _jsx(Input, Object.assign({ id: "confirmPassword", type: "password" }, register("confirmPassword"), { autoComplete: "new-password", disabled: isLoading })), errors.confirmPassword && (_jsx("p", { className: "text-sm text-red-500", children: errors.confirmPassword.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Resetting Password..."] })) : ("Reset Password") })] })] }) }));
}
