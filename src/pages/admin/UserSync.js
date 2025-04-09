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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/supabase-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, UserPlus } from "lucide-react";
const UserSyncPage = () => {
    const [loading, setLoading] = useState(true);
    const [authUsers, setAuthUsers] = useState([]);
    const [profileUsers, setProfileUsers] = useState([]);
    const [missingUsers, setMissingUsers] = useState([]);
    const [syncStatus, setSyncStatus] = useState(null);
    const [syncError, setSyncError] = useState(null);
    // Fetch all users from both tables
    const fetchUsers = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            setLoading(true);
            setSyncError(null);
            let authUsersList = [];
            // Get the current user as a starting point
            const { data: currentSession } = yield supabase.auth.getSession();
            if ((_a = currentSession === null || currentSession === void 0 ? void 0 : currentSession.session) === null || _a === void 0 ? void 0 : _a.user) {
                const user = currentSession.session.user;
                authUsersList = [{
                        id: user.id,
                        email: user.email || 'unknown',
                        created_at: user.created_at || new Date().toISOString(),
                        last_sign_in_at: user.last_sign_in_at || null,
                        provider: ((_b = user.app_metadata) === null || _b === void 0 ? void 0 : _b.provider) || 'email'
                    }];
            }
            else {
                setSyncError("No authenticated user found. Please sign in first.");
            }
            // Fetch profile users using the standard client
            const { data: profileData, error: profileError } = yield supabase
                .from('profiles')
                .select('id, email, full_name, role, created_at');
            if (profileError) {
                console.error("Error fetching profile users:", profileError);
                toast({
                    title: "Error fetching profile users",
                    description: profileError.message,
                    variant: "destructive",
                });
                setSyncError(profileError.message);
                return;
            }
            // Process profiles
            const processedProfiles = profileData || [];
            // Find missing users (in auth but not in profiles)
            const missing = authUsersList.filter(authUser => !processedProfiles.some(profile => profile.email === authUser.email));
            setAuthUsers(authUsersList);
            setProfileUsers(processedProfiles);
            setMissingUsers(missing);
            toast({
                title: "Users loaded",
                description: `Found ${authUsersList.length} auth users and ${processedProfiles.length} profiles`,
            });
        }
        catch (err) {
            console.error("Error fetching users:", err);
            setSyncError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
        }
    });
    // Sync a single user from auth to profiles
    const syncUser = (authUser) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setSyncStatus(`Syncing user ${authUser.email}...`);
            // Use ensureUserProfile to create or update the profile
            const { data: profile, error } = yield ensureUserProfile({
                id: authUser.id,
                email: authUser.email
            });
            if (error) {
                console.error("Error syncing user profile:", error);
                setSyncError(error.message);
                return false;
            }
            if (profile) {
                setSyncStatus(`Profile synced for ${authUser.email}`);
                return true;
            }
            else {
                setSyncError(`Failed to sync profile for ${authUser.email}`);
                return false;
            }
        }
        catch (err) {
            console.error("Error syncing user:", err);
            setSyncError(err instanceof Error ? err.message : String(err));
            return false;
        }
    });
    // Sync all missing users
    const syncAllMissingUsers = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setSyncStatus("Starting sync of all missing users...");
            setSyncError(null);
            setLoading(true);
            let successCount = 0;
            let errorCount = 0;
            for (const user of missingUsers) {
                setSyncStatus(`Syncing ${user.email} (${successCount + errorCount + 1}/${missingUsers.length})...`);
                const success = yield syncUser(user);
                if (success) {
                    successCount++;
                }
                else {
                    errorCount++;
                }
            }
            yield fetchUsers(); // Refresh the lists
            setSyncStatus(`Sync completed. Success: ${successCount}, Errors: ${errorCount}`);
            toast({
                title: "Sync Completed",
                description: `Successfully synced ${successCount} users with ${errorCount} errors`,
                variant: errorCount > 0 ? "destructive" : "default",
            });
        }
        catch (err) {
            console.error("Error in bulk sync:", err);
            setSyncError(err instanceof Error ? err.message : String(err));
        }
        finally {
            setLoading(false);
        }
    });
    // Load users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "User Sync Utility" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Synchronize users between auth.users and profiles tables" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: fetchUsers, disabled: loading, variant: "outline", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }), _jsxs(Button, { onClick: syncAllMissingUsers, disabled: loading || missingUsers.length === 0, children: [_jsx(UserPlus, { className: "h-4 w-4 mr-2" }), "Sync Missing Users"] })] })] }), syncStatus && (_jsxs(Alert, { className: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800", children: [_jsx(RefreshCw, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }), _jsx(AlertDescription, { className: "text-sm", children: syncStatus })] })), syncError && (_jsxs(Alert, { className: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-red-600 dark:text-red-400" }), _jsxs(AlertDescription, { className: "text-sm", children: ["Error: ", syncError] })] })), _jsxs(Tabs, { defaultValue: "missing", children: [_jsxs(TabsList, { className: "mb-4", children: [_jsxs(TabsTrigger, { value: "missing", children: ["Missing Users (", missingUsers.length, ")"] }), _jsxs(TabsTrigger, { value: "auth", children: ["Auth Users (", authUsers.length, ")"] }), _jsxs(TabsTrigger, { value: "profiles", children: ["Profile Users (", profileUsers.length, ")"] })] }), _jsx(TabsContent, { value: "missing", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Missing Users" }), _jsx(CardDescription, { children: "Users that exist in auth.users but not in profiles table" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "py-4 text-center", children: "Loading users..." })) : missingUsers.length === 0 ? (_jsx("div", { className: "py-4 text-center", children: "No missing users - everything is in sync!" })) : (_jsx("div", { className: "rounded-md border", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "p-2 text-left font-medium", children: "Email" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Created" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Last Sign In" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Provider" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: missingUsers.map((user, i) => (_jsxs("tr", { className: i % 2 ? "bg-muted/50" : "", children: [_jsx("td", { className: "p-2", children: user.email }), _jsx("td", { className: "p-2", children: new Date(user.created_at).toLocaleDateString() }), _jsx("td", { className: "p-2", children: user.last_sign_in_at
                                                                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                                                                    : 'Never' }), _jsx("td", { className: "p-2", children: user.provider }), _jsx("td", { className: "p-2", children: _jsx(Button, { size: "sm", onClick: () => syncUser(user), disabled: loading, children: "Sync User" }) })] }, user.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "auth", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Auth Users" }), _jsx(CardDescription, { children: "Users from the auth.users table" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "py-4 text-center", children: "Loading users..." })) : authUsers.length === 0 ? (_jsx("div", { className: "py-4 text-center", children: "No auth users found" })) : (_jsx("div", { className: "rounded-md border", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "p-2 text-left font-medium", children: "Email" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Created" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Last Sign In" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Provider" })] }) }), _jsx("tbody", { children: authUsers.map((user, i) => (_jsxs("tr", { className: i % 2 ? "bg-muted/50" : "", children: [_jsx("td", { className: "p-2", children: user.email }), _jsx("td", { className: "p-2", children: new Date(user.created_at).toLocaleDateString() }), _jsx("td", { className: "p-2", children: user.last_sign_in_at
                                                                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                                                                    : 'Never' }), _jsx("td", { className: "p-2", children: user.provider })] }, user.id))) })] }) })) })] }) }), _jsx(TabsContent, { value: "profiles", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Users" }), _jsx(CardDescription, { children: "Users from the profiles table" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "py-4 text-center", children: "Loading users..." })) : profileUsers.length === 0 ? (_jsx("div", { className: "py-4 text-center", children: "No profile users found" })) : (_jsx("div", { className: "rounded-md border", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b bg-muted/50", children: [_jsx("th", { className: "p-2 text-left font-medium", children: "Name" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Email" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Role" }), _jsx("th", { className: "p-2 text-left font-medium", children: "Created" })] }) }), _jsx("tbody", { children: profileUsers.map((user, i) => (_jsxs("tr", { className: i % 2 ? "bg-muted/50" : "", children: [_jsx("td", { className: "p-2", children: user.full_name || 'Unknown' }), _jsx("td", { className: "p-2", children: user.email }), _jsx("td", { className: "p-2", children: user.role }), _jsx("td", { className: "p-2", children: new Date(user.created_at).toLocaleDateString() })] }, user.id))) })] }) })) })] }) })] })] }));
};
export default UserSyncPage;
