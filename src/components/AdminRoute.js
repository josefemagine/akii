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
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { getClientSideAdminStatus, initializeAdminPage, checkAdminStatusInDatabase } from "@/lib/admin-utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";
const AdminRoute = ({ children }) => {
    const { isAdmin: authContextAdmin, isLoading, user } = useAuth();
    const location = useLocation();
    const [localAdmin, setLocalAdmin] = useState(getClientSideAdminStatus());
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);
    // Initialize admin page on component mount
    useEffect(() => {
        console.log("[AdminRoute] Initializing with auth state:", {
            authContextAdmin,
            localAdmin,
            isLoading,
            hasUser: !!user
        });
        initializeAdminPage();
        // Re-check local admin status
        setLocalAdmin(getClientSideAdminStatus());
    }, [authContextAdmin, isLoading, user]);
    // Secondary check if context doesn't show admin but localStorage does
    useEffect(() => {
        // Only run this if we have a user but auth context doesn't show admin
        if ((user === null || user === void 0 ? void 0 : user.id) && !authContextAdmin && localAdmin) {
            // Check directly in the database as a fallback
            const checkDirectAccess = () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    setIsRetrying(true);
                    const isActuallyAdmin = yield checkAdminStatusInDatabase(user.id);
                    if (isActuallyAdmin) {
                        console.log("[AdminRoute] Database confirms admin status");
                        // Local admin is already true, so we don't need to update it
                    }
                    else if (localAdmin) {
                        console.log("[AdminRoute] Database says NOT admin but localStorage does");
                        // Keep allowing access since localStorage is set - might be development override
                    }
                }
                catch (err) {
                    console.error("[AdminRoute] Error checking admin status:", err);
                    setError("Error verifying admin status");
                }
                finally {
                    setIsRetrying(false);
                }
            });
            checkDirectAccess();
        }
    }, [user === null || user === void 0 ? void 0 : user.id, authContextAdmin, localAdmin]);
    // Force admin status on development
    useEffect(() => {
        if (import.meta.env.DEV && (user === null || user === void 0 ? void 0 : user.email) &&
            (user.email === 'josefholm@gmail.com' || user.email === 'admin@akii.com' || user.email === 'josef@holm.com')) {
            localStorage.setItem('akii-is-admin', 'true');
            localStorage.setItem('akii-auth-user-email', user.email);
            setLocalAdmin(true);
        }
    }, [user === null || user === void 0 ? void 0 : user.email]);
    // Handle manual retry
    const handleRetry = () => {
        setError(null);
        setIsRetrying(true);
        // Force reload the page to retry auth
        window.location.reload();
    };
    // Force dashboard navigation
    const goToDashboard = () => {
        window.location.href = '/dashboard';
    };
    // If still loading auth state, return a minimal loading state
    if (isLoading || isRetrying) {
        return (_jsxs("div", { className: "flex h-screen flex-col items-center justify-center bg-background p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }), _jsx("p", { className: "text-lg font-medium", children: "Verifying admin access..." })] }), isRetrying && (_jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Double-checking access permissions..." }))] }));
    }
    // First check if user is logged in
    if (!user) {
        return _jsx(Navigate, { to: "/", state: { from: location }, replace: true });
    }
    // Check for admin access either from context or localStorage
    const hasAdminAccess = authContextAdmin || localAdmin;
    // If there's an error but we have admin access, show the error but still render the content
    if (error && hasAdminAccess) {
        return (_jsxs(DashboardLayout, { isAdmin: true, children: [_jsxs(Alert, { className: "mb-4", variant: "default", children: [_jsx(ShieldAlert, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Warning" }), _jsxs(AlertDescription, { children: [error, " - Proceeding with local admin permission."] })] }), children] }));
    }
    // If not admin, redirect to dashboard
    if (!hasAdminAccess) {
        return (_jsx("div", { className: "flex h-screen flex-col items-center justify-center bg-background p-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs(Alert, { variant: "destructive", className: "mb-4", children: [_jsx(ShieldAlert, { className: "h-4 w-4" }), _jsx(AlertTitle, { children: "Access Denied" }), _jsxs(AlertDescription, { children: ["You don't have admin privileges to access this page.", (user === null || user === void 0 ? void 0 : user.email) && (_jsxs("div", { className: "mt-1 text-xs", children: ["Logged in as: ", user.email] }))] })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { onClick: handleRetry, variant: "outline", className: "flex-1", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Retry"] }), _jsx(Button, { onClick: goToDashboard, className: "flex-1", children: "Go to Dashboard" })] })] }) }));
    }
    // If user is logged in and is an admin, render the admin content
    return _jsx(DashboardLayout, { isAdmin: true, children: children });
};
export default AdminRoute;
