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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
export default function AuthExample() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Use our auth hooks
    const { signIn, signOut, user, profile, isLoading } = useAuth();
    const isAuthenticated = !!user;
    // Handle sign in
    const handleSignIn = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        try {
            yield signIn(email, password);
            // Clear form on success
            setEmail('');
            setPassword('');
        }
        catch (err) {
            console.error('Error signing in:', err);
            toast({
                title: "Authentication Error",
                description: "Failed to sign in. Please check your credentials and try again."
            });
        }
    });
    // Handle sign out
    const handleSignOut = () => __awaiter(this, void 0, void 0, function* () {
        yield signOut();
    });
    // We can't update profile directly with UnifiedAuthContext, so this has been modified
    const handleUpdateName = () => __awaiter(this, void 0, void 0, function* () {
        alert('Profile updates are not available in this example');
    });
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Authentication Example" }), _jsx(CardDescription, { children: "Using the Unified Auth Context" })] }), _jsx(CardContent, { children: isAuthenticated ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsxs("h3", { className: "text-lg font-medium", children: ["Welcome, ", (profile === null || profile === void 0 ? void 0 : profile.first_name) || (user === null || user === void 0 ? void 0 : user.email) || 'User', "!"] }), (profile === null || profile === void 0 ? void 0 : profile.role) && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Role: ", profile.role] }))] }), _jsxs("div", { className: "flex flex-col space-y-2", children: [_jsx(Button, { variant: "outline", onClick: handleUpdateName, disabled: isLoading, children: "Update Name" }), _jsx(Button, { variant: "destructive", onClick: handleSignOut, disabled: isLoading, children: isLoading ? 'Signing Out...' : 'Sign Out' })] })] })) : (_jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "email", className: "text-sm font-medium", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "password", className: "text-sm font-medium", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Signing In...' : 'Sign In' })] })) }), _jsx(CardFooter, { className: "flex justify-center text-sm text-muted-foreground", children: "This component uses the new consolidated Auth Context" })] }));
}
