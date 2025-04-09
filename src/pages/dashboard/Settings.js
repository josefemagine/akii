import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import Profile from "./Profile";
import Appearance from "./Appearance";
import Security from "./Security";
import Notifications from "./Notifications";
import Billing from "./Billing";
import APIKeys from "./APIKeys";
import { AdminSetter } from '@/components/debug/AdminSetter';
import { useAuth } from "@/contexts/UnifiedAuthContext";
export default function Settings() {
    const { user, profile: authProfile, refreshProfile, hasUser, authLoading } = useAuth();
    const [localProfile, setLocalProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Force create a fallback profile if database access fails
    useEffect(() => {
        var _a, _b;
        if (user && !authProfile) {
            console.log('[Settings] No profile found, creating fallback profile');
            // Create minimal fallback profile for UI to work
            const fallbackProfile = {
                id: user.id,
                email: user.email || '',
                role: ((_a = user.email) === null || _a === void 0 ? void 0 : _a.includes('@holm.com')) ? 'admin' : 'user',
                status: 'active',
                first_name: ((_b = user.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) || 'User',
                is_fallback_profile: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setLocalProfile(fallbackProfile);
            setIsLoading(false);
        }
        else if (authProfile) {
            console.log('[Settings] Using profile from context:', authProfile);
            setLocalProfile(authProfile);
            setIsLoading(false);
        }
        else if (!user) {
            console.log('[Settings] No user found');
            setIsLoading(false);
        }
    }, [user, authProfile]);
    // Handle loading state
    if (authLoading || isLoading) {
        return (_jsxs(DashboardPageContainer, { className: "pb-12", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Settings" }), _jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading settings..." })] }) })] }));
    }
    // If we have a user but no profile (from context or local fallback)
    if (hasUser && !authProfile && !localProfile) {
        return (_jsxs(DashboardPageContainer, { className: "pb-12", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Settings" }), _jsxs("div", { className: "p-6 bg-destructive/10 rounded-lg mb-6", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "Profile Error" }), _jsx("p", { className: "mb-4", children: "We couldn't load your profile data. Please try refreshing the page." }), _jsx("button", { className: "px-4 py-2 bg-primary text-white rounded-md", onClick: () => {
                                refreshProfile === null || refreshProfile === void 0 ? void 0 : refreshProfile();
                                window.location.reload();
                            }, children: "Refresh Now" })] })] }));
    }
    // Use either the context profile or our local fallback
    const displayProfile = authProfile || localProfile;
    return (_jsxs(DashboardPageContainer, { className: "pb-12", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Settings" }), _jsxs(Tabs, { defaultValue: "profile", className: "w-full", children: [_jsxs(TabsList, { className: "mb-8", children: [_jsx(TabsTrigger, { value: "profile", children: "Profile" }), _jsx(TabsTrigger, { value: "appearance", children: "Appearance" }), _jsx(TabsTrigger, { value: "security", children: "Security" }), _jsx(TabsTrigger, { value: "notifications", children: "Notifications" }), _jsx(TabsTrigger, { value: "billing", children: "Billing" }), _jsx(TabsTrigger, { value: "api", children: "API Keys" })] }), _jsx(TabsContent, { value: "profile", children: _jsx(Profile, {}) }), _jsx(TabsContent, { value: "appearance", children: _jsx(Appearance, {}) }), _jsx(TabsContent, { value: "security", children: _jsx(Security, {}) }), _jsx(TabsContent, { value: "notifications", children: _jsx(Notifications, {}) }), _jsx(TabsContent, { value: "billing", children: _jsx(Billing, {}) }), _jsx(TabsContent, { value: "api", children: _jsx(APIKeys, {}) })] }), _jsxs("div", { className: "mb-8 mt-12", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Admin Access" }), _jsx(AdminSetter, {})] }), _jsxs("div", { className: "mt-12 p-4 border border-gray-200 rounded-md", children: [_jsx("h3", { className: "text-sm font-semibold mb-2", children: "Debug Information" }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [_jsxs("p", { children: ["User ID: ", (user === null || user === void 0 ? void 0 : user.id) || "Not logged in"] }), _jsxs("p", { children: ["Email: ", (user === null || user === void 0 ? void 0 : user.email) || "Unknown"] }), _jsxs("p", { children: ["Profile Status: ", authProfile ? "Loaded from DB" : (localProfile ? "Using fallback" : "Not loaded")] }), _jsxs("p", { children: ["Role: ", (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.role) || "Unknown"] }), _jsxs("p", { children: ["Is Admin: ", (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.role) === "admin" ? "Yes" : "No"] }), _jsxs("p", { children: ["Is Fallback: ", (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.is_fallback_profile) ? "Yes" : "No"] })] })] })] }));
}
