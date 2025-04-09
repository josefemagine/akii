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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, User, Shield } from 'lucide-react';
export function AdminSetter() {
    const auth = useAuth();
    const { user, profile, isAdmin, setUserAsAdmin } = auth;
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    if (!user) {
        return (_jsx(Card, { className: "w-full max-w-md mx-auto", children: _jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Admin Access" }), _jsx(CardDescription, { children: "You need to be logged in to set admin status" })] }) }));
    }
    const handleSetAdmin = () => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
        setResult(null);
        try {
            // First try refreshing auth state to ensure we have latest profile
            yield auth.refreshProfile();
            if (isAdmin) {
                setResult('You are already an admin!');
                setIsLoading(false);
                return;
            }
            // Set user as admin
            const success = yield setUserAsAdmin();
            if (success) {
                setResult('Successfully set as admin! Refreshing state...');
                // Refresh auth state to update UI
                setTimeout(() => {
                    auth.refreshProfile();
                    setIsLoading(false);
                }, 1000);
            }
            else {
                setResult('Failed to set admin status. Check console for details.');
                setIsLoading(false);
            }
        }
        catch (error) {
            console.error('Error setting admin status:', error);
            setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
            setIsLoading(false);
        }
    });
    return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5" }), "Admin Access Tool"] }), _jsx(CardDescription, { children: "Set your account as admin for full access" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(User, { className: "h-5 w-5 text-muted-foreground" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: (profile === null || profile === void 0 ? void 0 : profile.email) || user.email }), _jsx("div", { className: "text-sm text-muted-foreground", children: (profile === null || profile === void 0 ? void 0 : profile.first_name) ? `${profile.first_name} ${profile.last_name || ''}` : 'User' })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Current Role:" }), _jsx(Badge, { variant: isAdmin ? "default" : "secondary", className: isAdmin ? "bg-green-500" : "", children: isAdmin ? 'Admin' : ((profile === null || profile === void 0 ? void 0 : profile.role) || 'Unknown') })] }), result && (_jsx("div", { className: `p-3 rounded-md ${result.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [result.includes('Success') ? (_jsx(Check, { className: "h-4 w-4" })) : (_jsx(AlertTriangle, { className: "h-4 w-4" })), _jsx("p", { className: "text-sm", children: result })] }) }))] }) }), _jsx(CardFooter, { children: _jsx(Button, { onClick: handleSetAdmin, disabled: isLoading || isAdmin, className: "w-full", children: isLoading ? 'Setting admin status...' : isAdmin ? 'Already Admin' : 'Set as Admin' }) })] }));
}
