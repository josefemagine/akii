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
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/lib/supabase';
/**
 * Component to check admin status directly from the database
 * This is a diagnostic component - for use in development only
 */
const AdminCheck = () => {
    const { user, profile, isAdmin, isDeveloper } = useAuth();
    const [dbProfile, setDbProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        function checkAdminStatusInDb() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    setLoading(false);
                    return;
                }
                try {
                    const { data, error } = yield supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (error) {
                        throw error;
                    }
                    setDbProfile(data);
                }
                catch (err) {
                    setError(err instanceof Error ? err.message : 'Unknown error occurred');
                    console.error('[AdminCheck] Error fetching profile:', err);
                }
                finally {
                    setLoading(false);
                }
            });
        }
        checkAdminStatusInDb();
    }, [user === null || user === void 0 ? void 0 : user.id]);
    if (loading) {
        return _jsx("div", { className: "p-4 bg-gray-100 dark:bg-gray-800 rounded-md", children: "Loading admin status..." });
    }
    return (_jsxs("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 text-gray-900 dark:text-gray-100", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Admin Status Check" }), error && (_jsxs("div", { className: "text-red-600 dark:text-red-400 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded", children: ["Error: ", error] })), _jsxs("div", { className: "text-sm space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "User ID:" }), " ", (user === null || user === void 0 ? void 0 : user.id) || 'Not logged in'] }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", (user === null || user === void 0 ? void 0 : user.email) || 'Not available'] }), _jsxs("p", { children: [_jsx("strong", { children: "Context - isAdmin:" }), " ", isAdmin ? 'true' : 'false'] }), _jsxs("p", { children: [_jsx("strong", { children: "Context - isDeveloper:" }), " ", isDeveloper ? 'true' : 'false'] }), _jsxs("p", { children: [_jsx("strong", { children: "Context - Profile Role:" }), " ", (profile === null || profile === void 0 ? void 0 : profile.role) || 'Not set'] }), _jsxs("p", { children: [_jsx("strong", { children: "DB - Profile Role:" }), " ", (dbProfile === null || dbProfile === void 0 ? void 0 : dbProfile.role) || 'Not set'] }), _jsxs("p", { children: [_jsx("strong", { children: "Auth Status:" }), " ", (profile === null || profile === void 0 ? void 0 : profile.status) || 'Not set'] }), _jsxs("p", { children: [_jsx("strong", { children: "Subscription Tier:" }), " ", (profile === null || profile === void 0 ? void 0 : profile.subscription_tier) || 'Not set'] })] })] }));
};
export default AdminCheck;
