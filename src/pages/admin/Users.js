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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreVertical, UserPlus, Download, Filter, Mail, Edit, Trash2, Lock, CheckCircle, XCircle, AlertCircle, } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { setUserAsAdmin, createUserProfile } from "@/lib/supabase-admin";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAdminClient } from "@/lib/supabase-singleton";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
const getRoleBadge = (role) => {
    switch (role) {
        case "admin":
            return (_jsx(Badge, { variant: "outline", className: "bg-primary/10 text-primary border-primary/20", children: "Admin" }));
        case "moderator":
            return (_jsx(Badge, { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800", children: "Moderator" }));
        default:
            return (_jsx(Badge, { variant: "outline", className: "bg-muted text-muted-foreground", children: "User" }));
    }
};
const getStatusIcon = (status) => {
    switch (status) {
        case "active":
            return _jsx(CheckCircle, { className: "h-4 w-4 text-green-500" });
        case "inactive":
            return _jsx(XCircle, { className: "h-4 w-4 text-red-500" });
        case "pending":
            return _jsx(AlertCircle, { className: "h-4 w-4 text-amber-500" });
        default:
            return null;
    }
};
const getPlanBadge = (plan) => {
    switch (plan) {
        case "enterprise":
            return (_jsx(Badge, { className: "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300", children: "Enterprise" }));
        case "professional":
            return (_jsx(Badge, { className: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300", children: "Professional" }));
        case "starter":
            return (_jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300", children: "Starter" }));
        default:
            return (_jsx(Badge, { className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300", children: "Free" }));
    }
};
const UsersPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [editedUserData, setEditedUserData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        company_name: "",
        role: "",
        status: "",
    });
    const navigate = useNavigate();
    // Fetch all users from the database
    useEffect(() => {
        const fetchUsers = () => __awaiter(void 0, void 0, void 0, function* () {
            setLoading(true);
            try {
                console.log("Fetching all users from profiles table...");
                // First, try to get auth users using admin client
                const adminClient = getAdminClient();
                let authUsers = [];
                if (adminClient) {
                    try {
                        const { data: authData, error: authError } = yield adminClient.auth.admin.listUsers();
                        if (authError) {
                            console.error("Error fetching auth users:", authError);
                        }
                        else if (authData) {
                            console.log(`Successfully loaded ${authData.users.length} auth users`);
                            authUsers = authData.users;
                        }
                    }
                    catch (authErr) {
                        console.error("Error accessing admin auth API:", authErr);
                    }
                }
                // Use the standard client to fetch all profiles without any filters
                const { data: profileData, error: profileError } = yield supabase
                    .from("profiles")
                    .select("*");
                if (profileError) {
                    console.error("Error fetching profiles:", profileError);
                    setError(profileError.message || "Failed to fetch users");
                    toast({
                        title: "Error loading users",
                        description: profileError.message,
                        variant: "destructive",
                    });
                    setUsers([]);
                    return;
                }
                // Create a map of profiles by ID for quick lookup
                const profilesMap = new Map();
                if (profileData) {
                    profileData.forEach(profile => {
                        profilesMap.set(profile.id, profile);
                    });
                }
                // Create profiles for auth users that don't have profiles
                const profilesToCreate = [];
                for (const authUser of authUsers) {
                    if (!profilesMap.has(authUser.id)) {
                        profilesToCreate.push(authUser);
                    }
                }
                // Create missing profiles
                if (profilesToCreate.length > 0) {
                    console.log(`Creating profiles for ${profilesToCreate.length} users without profiles`);
                    for (const authUser of profilesToCreate) {
                        try {
                            const { success, data } = yield createUserProfile(authUser);
                            if (success && data) {
                                profilesMap.set(data.id, data);
                            }
                        }
                        catch (err) {
                            console.error(`Error creating profile for user ${authUser.id}:`, err);
                        }
                    }
                }
                if (profilesMap.size > 0) {
                    console.log(`Successfully processed ${profilesMap.size} profiles`);
                    // Create a map of auth users by ID for quick lookup
                    const authUsersMap = new Map();
                    authUsers.forEach(user => {
                        authUsersMap.set(user.id, user);
                    });
                    // Map profiles to our User interface
                    const mappedUsers = Array.from(profilesMap.values()).map(profile => {
                        var _a;
                        // Get auth user data if available
                        const authUser = authUsersMap.get(profile.id);
                        // Determine status from either status field or active field
                        let userStatus = 'inactive';
                        if (profile.status === 'active') {
                            userStatus = 'active';
                        }
                        else if (profile.status === 'pending') {
                            userStatus = 'pending';
                        }
                        else if (profile.active === true) {
                            userStatus = 'active';
                        }
                        else if (authUser === null || authUser === void 0 ? void 0 : authUser.confirmed_at) {
                            userStatus = 'active';
                        }
                        else if (authUser === null || authUser === void 0 ? void 0 : authUser.email_confirmed_at) {
                            userStatus = 'active';
                        }
                        // Get the last login time from auth data if available
                        let lastLogin = '-';
                        if (profile.last_sign_in_at) {
                            lastLogin = new Date(profile.last_sign_in_at).toISOString().split('T')[0];
                        }
                        else if (authUser === null || authUser === void 0 ? void 0 : authUser.last_sign_in_at) {
                            lastLogin = new Date(authUser.last_sign_in_at).toISOString().split('T')[0];
                        }
                        // Default to safer values when fields are missing
                        return {
                            id: profile.id || `profile-${Math.random()}`,
                            name: profile.full_name ||
                                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
                                ((_a = profile.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) ||
                                'Unknown User',
                            email: profile.email || (authUser === null || authUser === void 0 ? void 0 : authUser.email) || 'unknown@example.com',
                            role: profile.role || 'user',
                            status: userStatus,
                            plan: profile.subscription_tier || 'free',
                            createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] :
                                (authUser === null || authUser === void 0 ? void 0 : authUser.created_at) ? new Date(authUser.created_at).toISOString().split('T')[0] :
                                    'Unknown',
                            lastLogin,
                            agents: profile.agents_count || 0,
                            messagesUsed: profile.messages_used || 0,
                            messageLimit: profile.message_limit || 1000,
                            company_name: profile.company_name || '',
                        };
                    });
                    setUsers(mappedUsers);
                    console.log("Loaded users from database:", mappedUsers.length);
                }
                else {
                    console.log("No users found in profiles table");
                    setUsers([]);
                    toast({
                        title: "No users found",
                        description: "No user profiles were found in the database.",
                    });
                }
            }
            catch (err) {
                console.error("Unexpected error fetching users:", err);
                setError(err instanceof Error ? err.message : String(err));
                setUsers([]);
                toast({
                    title: "Error loading users",
                    description: "Failed to fetch user data from Supabase.",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
        });
        fetchUsers();
    }, []);
    // Function to update a user's role
    const updateUserRole = (userId, email, newRole) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Update role directly with standard client
            const { data, error } = yield supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)
                .select();
            if (error) {
                toast({
                    title: "Error updating role",
                    description: error.message || "Failed to update user role",
                    variant: "destructive",
                });
                return;
            }
            // Update local state
            setUsers(users.map(user => user.id === userId ? Object.assign(Object.assign({}, user), { role: newRole }) : user));
            toast({
                title: "Role updated",
                description: `${email} is now a ${newRole}`,
            });
        }
        catch (err) {
            toast({
                title: "Error updating role",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
    });
    // Function to open edit dialog
    const handleEditUser = (user) => {
        setEditingUser(user);
        // Split the name into first_name and last_name if it's a full name
        let firstName = "";
        let lastName = "";
        if (user.name && user.name.includes(" ")) {
            const nameParts = user.name.split(" ");
            firstName = nameParts[0];
            lastName = nameParts.slice(1).join(" ");
        }
        else {
            firstName = user.name;
        }
        setEditedUserData({
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            company_name: user.company_name || "",
            role: user.role,
            status: user.status,
        });
    };
    // Function to close dialog
    const handleCloseDialog = () => {
        setEditingUser(null);
    };
    // Function to save edited user
    const handleSaveUser = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!editingUser)
            return;
        try {
            console.log("Saving user updates:", editedUserData);
            // Create full_name from first_name and last_name
            const fullName = `${editedUserData.first_name} ${editedUserData.last_name}`.trim();
            // Start with basic fields that are known to exist
            const updateData = {
                first_name: editedUserData.first_name,
                last_name: editedUserData.last_name,
                full_name: fullName,
                role: editedUserData.role,
            };
            // Add status field if it exists (might not in some databases)
            if (editedUserData.status) {
                updateData.status = editedUserData.status;
            }
            // Add company_name field if provided
            if (editedUserData.company_name) {
                updateData.company_name = editedUserData.company_name;
            }
            console.log("Updating with data:", updateData);
            // Update user data in database using standard client
            const { data, error } = yield supabase
                .from('profiles')
                .update(updateData)
                .eq('id', editingUser.id)
                .select();
            if (error) {
                console.error("Error updating user in database:", error);
                // Check for specific column errors
                if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes("Could not find the 'company_name' column")) {
                    // Try again without the company_name field
                    delete updateData.company_name;
                    console.log("Retrying without company_name field:", updateData);
                    // Show toast with link to migration
                    toast({
                        title: "Company Name field missing",
                        description: (_jsxs("div", { children: ["The company_name column is missing from your database.", _jsx("br", {}), _jsx("a", { href: "/dashboard/admin/user-profile-migration", className: "underline text-blue-500 hover:text-blue-700", children: "Run the Profile Migration" }), " to add it."] })),
                        variant: "destructive",
                    });
                    const { data: retryData, error: retryError } = yield supabase
                        .from('profiles')
                        .update(updateData)
                        .eq('id', editingUser.id)
                        .select();
                    if (retryError) {
                        // If there's still an error, check for status column issues
                        if ((_b = retryError.message) === null || _b === void 0 ? void 0 : _b.includes("Could not find the 'status' column")) {
                            // Try one more time without the status field
                            delete updateData.status;
                            console.log("Retrying without status field:", updateData);
                            const { data: finalRetryData, error: finalRetryError } = yield supabase
                                .from('profiles')
                                .update(updateData)
                                .eq('id', editingUser.id)
                                .select();
                            if (finalRetryError) {
                                console.error("Error in final retry:", finalRetryError);
                                toast({
                                    title: "Error updating user",
                                    description: finalRetryError.message,
                                    variant: "destructive",
                                });
                                return;
                            }
                        }
                        else {
                            console.error("Error updating user in retry:", retryError);
                            toast({
                                title: "Error updating user",
                                description: retryError.message,
                                variant: "destructive",
                            });
                            return;
                        }
                    }
                }
                else if ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes("Could not find the 'status' column")) {
                    // Try again without the status field
                    delete updateData.status;
                    console.log("Retrying without status field:", updateData);
                    const { data: retryData, error: retryError } = yield supabase
                        .from('profiles')
                        .update(updateData)
                        .eq('id', editingUser.id)
                        .select();
                    if (retryError) {
                        console.error("Error updating user in retry:", retryError);
                        toast({
                            title: "Error updating user",
                            description: retryError.message,
                            variant: "destructive",
                        });
                        return;
                    }
                }
                else {
                    toast({
                        title: "Error updating user",
                        description: error.message,
                        variant: "destructive",
                    });
                    return;
                }
            }
            // Update local state with the new data
            setUsers(users.map((user) => user.id === editingUser.id
                ? Object.assign(Object.assign({}, user), { name: fullName, company_name: editedUserData.company_name, role: editedUserData.role, status: editedUserData.status }) : user));
            toast({
                title: "User updated",
                description: "User details have been saved successfully.",
            });
            setEditingUser(null);
        }
        catch (err) {
            console.error("Error saving user:", err);
            toast({
                title: "Error saving user",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
            });
        }
    });
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Users" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Manage user accounts and permissions" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => __awaiter(void 0, void 0, void 0, function* () {
                                    try {
                                        // Add current user as admin via direct API
                                        const email = prompt("Enter your email address");
                                        if (!email)
                                            return;
                                        toast({
                                            title: "Adding admin user",
                                            description: `Attempting to add ${email} as admin...`,
                                        });
                                        const { success, data, error } = yield setUserAsAdmin(email);
                                        if (error || !success) {
                                            toast({
                                                title: "Error adding admin",
                                                description: error && typeof error === 'object' && 'message' in error ? error.message : "Failed to set user as admin",
                                                variant: "destructive",
                                            });
                                            return;
                                        }
                                        if (data && data.length > 0) {
                                            toast({
                                                title: "Success!",
                                                description: `${email} is now an admin. Please refresh the page.`,
                                            });
                                            // Refresh the page to show updated data
                                            setTimeout(() => window.location.reload(), 2000);
                                        }
                                        else {
                                            toast({
                                                title: "User not found",
                                                description: "No user found with that email",
                                                variant: "destructive",
                                            });
                                        }
                                    }
                                    catch (err) {
                                        toast({
                                            title: "Error adding admin",
                                            description: err instanceof Error ? err.message : String(err),
                                            variant: "destructive",
                                        });
                                    }
                                }), variant: "secondary", children: "Add Me As Admin" }), _jsxs(Button, { children: [_jsx(UserPlus, { className: "h-4 w-4 mr-2" }), " Add User"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "All Users" }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), " Export"] })] }), _jsx(CardDescription, { children: loading ? "Loading users..." : `Showing ${filteredUsers.length} users` })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), _jsx(Input, { type: "search", placeholder: "Search users...", className: "pl-8", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(Button, { variant: "outline", size: "icon", children: _jsx(Filter, { className: "h-4 w-4" }) })] }), _jsx("div", { className: "rounded-md border", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "User" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Plan" }), _jsx(TableHead, { children: "Created" }), _jsx(TableHead, { children: "Last Login" }), _jsx(TableHead, { children: "Usage" }), _jsx(TableHead, {})] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4", children: "Loading users..." }) })) : error ? (_jsx(TableRow, { children: _jsxs(TableCell, { colSpan: 8, className: "text-center py-4 text-red-500", children: ["Error: ", error] }) })) : filteredUsers.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, className: "text-center py-4", children: "No users found." }) })) : (filteredUsers.map((user) => (_jsxs(TableRow, { className: "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800", onClick: () => navigate(`/admin/user-detail/${user.id}`), children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}` }), _jsx(AvatarFallback, { children: user.name.substring(0, 2).toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: user.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: user.email })] })] }) }), _jsx(TableCell, { children: getRoleBadge(user.role) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-1", children: [getStatusIcon(user.status), _jsx("span", { className: "capitalize", children: user.status })] }) }), _jsx(TableCell, { children: getPlanBadge(user.plan) }), _jsx(TableCell, { children: user.createdAt }), _jsx(TableCell, { children: user.lastLogin }), _jsx(TableCell, { children: _jsxs("div", { className: "w-32", children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { children: user.messagesUsed.toLocaleString() }), _jsx("span", { children: user.messageLimit.toLocaleString() })] }), _jsx("div", { className: "h-2 w-full bg-muted rounded-full", children: _jsx("div", { className: "h-2 bg-primary rounded-full", style: {
                                                                            width: `${(user.messagesUsed / user.messageLimit) * 100}%`,
                                                                        } }) })] }) }), _jsx(TableCell, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", onClick: (e) => e.stopPropagation(), children: [_jsx(MoreVertical, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Menu" })] }) }), _jsxs(DropdownMenuContent, { align: "end", onClick: (e) => e.stopPropagation(), children: [_jsxs(DropdownMenuItem, { onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                handleEditUser(user);
                                                                            }, children: [_jsx(Edit, { className: "h-4 w-4 mr-2" }), " Edit"] }), _jsxs(DropdownMenuItem, { onClick: (e) => e.stopPropagation(), children: [_jsx(Mail, { className: "h-4 w-4 mr-2" }), " Email"] }), _jsxs(DropdownMenuItem, { onClick: (e) => e.stopPropagation(), children: [_jsx(Lock, { className: "h-4 w-4 mr-2" }), " Reset Password"] }), _jsx(DropdownMenuItem, { onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                updateUserRole(user.id, user.email, 'admin');
                                                                            }, disabled: user.role === 'admin', children: "Set as Admin" }), _jsx(DropdownMenuItem, { onClick: (e) => {
                                                                                e.stopPropagation();
                                                                                updateUserRole(user.id, user.email, 'user');
                                                                            }, disabled: user.role === 'user', children: "Set as User" }), _jsxs(DropdownMenuItem, { className: "text-destructive focus:text-destructive", onClick: (e) => e.stopPropagation(), children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), " Delete"] })] })] }) })] }, user.id)))) })] }) })] }), _jsxs(CardFooter, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Showing ", _jsx("strong", { children: "1" }), " to", " ", _jsx("strong", { children: filteredUsers.length }), " of", " ", _jsx("strong", { children: users.length }), " users"] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: true, children: "Previous" }), _jsx(Button, { variant: "outline", size: "sm", disabled: true, children: "Next" })] })] })] }), _jsx(Dialog, { open: editingUser !== null, onOpenChange: open => !open && handleCloseDialog(), children: _jsxs(DialogContent, { className: "sm:max-w-md dark:bg-gray-900 dark:border-gray-800", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "dark:text-white", children: "Edit User" }), _jsx(DialogDescription, { className: "dark:text-gray-400", children: "Update user details and permissions" })] }), _jsxs("div", { className: "space-y-4 py-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "first_name", className: "dark:text-gray-200", children: "First Name" }), _jsx(Input, { id: "first_name", value: editedUserData.first_name, onChange: e => setEditedUserData(Object.assign(Object.assign({}, editedUserData), { first_name: e.target.value })), className: "dark:bg-gray-800 dark:border-gray-700 dark:text-white" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "last_name", className: "dark:text-gray-200", children: "Last Name" }), _jsx(Input, { id: "last_name", value: editedUserData.last_name, onChange: e => setEditedUserData(Object.assign(Object.assign({}, editedUserData), { last_name: e.target.value })), className: "dark:bg-gray-800 dark:border-gray-700 dark:text-white" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", className: "dark:text-gray-200", children: "Email" }), _jsx(Input, { id: "email", value: editedUserData.email, disabled: true, className: "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:opacity-70" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "company_name", className: "dark:text-gray-200", children: "Company Name" }), _jsx(Input, { id: "company_name", value: editedUserData.company_name, onChange: e => setEditedUserData(Object.assign(Object.assign({}, editedUserData), { company_name: e.target.value })), className: "dark:bg-gray-800 dark:border-gray-700 dark:text-white" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "role", className: "dark:text-gray-200", children: "Role" }), _jsxs("select", { id: "role", value: editedUserData.role, onChange: e => setEditedUserData(Object.assign(Object.assign({}, editedUserData), { role: e.target.value })), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white", children: [_jsx("option", { value: "user", children: "User" }), _jsx("option", { value: "admin", children: "Admin" }), _jsx("option", { value: "moderator", children: "Moderator" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "status", className: "dark:text-gray-200", children: "User Status" }), _jsxs("select", { id: "status", value: editedUserData.status, onChange: e => setEditedUserData(Object.assign(Object.assign({}, editedUserData), { status: e.target.value })), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white", children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "suspended", children: "Suspended" }), _jsx("option", { value: "pending", children: "Pending" })] }), _jsx("p", { className: "text-xs text-muted-foreground dark:text-gray-400", children: "Setting a user to \"inactive\" or \"suspended\" will prevent them from accessing the application. If the status field is missing from your database, visit Admin > User Status Migration." })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: handleCloseDialog, className: "dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800", children: "Cancel" }), _jsx(Button, { onClick: () => {
                                        console.log("Save Changes button clicked");
                                        handleSaveUser();
                                    }, children: "Save Changes" })] })] }) })] }));
};
export default UsersPage;
