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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useRef } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
// Default avatar URL
const DEFAULT_AVATAR_URL = "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png";
// Edge Function endpoint
const USER_DATA_ENDPOINT = "https://injxxchotrvgvvzelhvj.supabase.co/functions/v1/user-data";
const Profile = () => {
    var _a, _b, _c, _d;
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { toast } = useToast();
    // Form setup
    const form = useForm({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            company: "",
        },
    });
    // Fetch user data from Edge Function with direct database query
    const fetchUserData = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user)
            return;
        setIsFetching(true);
        try {
            const { data: sessionData } = yield supabase.auth.getSession();
            if (!sessionData.session) {
                throw new Error("No active session");
            }
            const response = yield fetch(USER_DATA_ENDPOINT, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.session.access_token}`
                }
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.error || "Failed to fetch user data");
            }
            const userData = yield response.json();
            console.log("User data fetched directly from database:", userData);
            setProfileData(userData);
            // Update form values
            form.reset({
                first_name: userData.first_name || "",
                last_name: userData.last_name || "",
                email: userData.email || "",
                company: userData.company || "",
            });
        }
        catch (error) {
            console.error("Error fetching user data:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch user data",
                variant: "destructive",
            });
        }
        finally {
            setIsFetching(false);
        }
    });
    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, [user]);
    // Submit handler - uses the direct database approach via Edge Function
    const onSubmit = (data) => __awaiter(void 0, void 0, void 0, function* () {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to update your profile",
                variant: "destructive",
            });
            return;
        }
        setIsLoading(true);
        try {
            // Create a simple update with only the fields we need to change
            const updates = {
                first_name: data.first_name,
                last_name: data.last_name,
                company: data.company,
            };
            // Get current session for the token
            const { data: sessionData } = yield supabase.auth.getSession();
            if (!sessionData.session) {
                throw new Error("No active session");
            }
            // Send update to the Edge Function that uses direct database queries
            const response = yield fetch(USER_DATA_ENDPOINT, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.session.access_token}`
                },
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.error || "Failed to update profile");
            }
            const result = yield response.json();
            console.log("Profile updated directly in database:", result);
            // Update the local state with the new profile data
            setProfileData(result.profile);
            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });
        }
        catch (error) {
            console.error('Profile update error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    // Avatar upload - still uses Storage API but updates profile through Edge Function
    const triggerFileUpload = () => {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    // Handle avatar upload
    const handleAvatarUpload = (event) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file || !(user === null || user === void 0 ? void 0 : user.id))
            return;
        setIsUploading(true);
        try {
            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError, data } = yield supabase.storage
                .from('avatars')
                .upload(filePath, file);
            if (uploadError) {
                throw uploadError;
            }
            // Get public URL
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            // Get current session for the token
            const { data: sessionData } = yield supabase.auth.getSession();
            if (!sessionData.session) {
                throw new Error("No active session");
            }
            // Update profile with new avatar URL via Edge Function
            const response = yield fetch(USER_DATA_ENDPOINT, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionData.session.access_token}`
                },
                body: JSON.stringify({
                    avatar_url: urlData.publicUrl
                })
            });
            if (!response.ok) {
                const errorData = yield response.json();
                throw new Error(errorData.error || "Failed to update avatar");
            }
            const result = yield response.json();
            console.log("Avatar updated via direct database approach:", result);
            // Update the local state with the new profile data
            setProfileData(result.profile);
            toast({
                title: "Avatar updated",
                description: "Your avatar has been updated successfully.",
            });
        }
        catch (error) {
            console.error('Error uploading avatar:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload avatar",
                variant: "destructive",
            });
        }
        finally {
            setIsUploading(false);
        }
    });
    // Show if super admin badge when applicable
    const SuperAdminBadge = () => {
        if (!(profileData === null || profileData === void 0 ? void 0 : profileData.is_super_admin))
            return null;
        return (_jsx("div", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 ml-2", children: "Super Admin" }));
    };
    if (isFetching) {
        return (_jsx(Card, { children: _jsxs(CardContent, { className: "p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading profile..." })] }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: ["Profile", _jsx(SuperAdminBadge, {})] }), _jsx(CardDescription, { children: "Manage your personal information" })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), children: [_jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative group", children: [_jsxs(Avatar, { className: "h-24 w-24", children: [_jsx(AvatarImage, { src: (profileData === null || profileData === void 0 ? void 0 : profileData.avatar_url) || DEFAULT_AVATAR_URL }), _jsxs(AvatarFallback, { className: "text-xl bg-primary/10", children: [((_b = (_a = profileData === null || profileData === void 0 ? void 0 : profileData.first_name) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || '', ((_d = (_c = profileData === null || profileData === void 0 ? void 0 : profileData.last_name) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.toUpperCase()) || ''] })] }), _jsx("div", { className: "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer", onClick: triggerFileUpload, children: isUploading ? (_jsx(Loader2, { className: "h-6 w-6 text-white animate-spin" })) : (_jsx(Camera, { className: "h-6 w-6 text-white" })) }), _jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*", onChange: handleAvatarUpload, disabled: isUploading })] }), _jsxs("div", { children: [_jsxs("h3", { className: "text-xl font-semibold", children: [profileData === null || profileData === void 0 ? void 0 : profileData.first_name, " ", profileData === null || profileData === void 0 ? void 0 : profileData.last_name] }), _jsx("p", { className: "text-gray-500 dark:text-gray-400", children: profileData === null || profileData === void 0 ? void 0 : profileData.email }), _jsx("p", { className: "text-sm text-gray-400 dark:text-gray-500 mt-1", children: "Hover over image to change avatar" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(FormField, { control: form.control, name: "first_name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "First Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "First name" }, field, { disabled: isLoading })) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "last_name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Last Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Last name" }, field, { disabled: isLoading })) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Email address" }, field, { disabled: true })) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "company", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Company" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Company name" }, field, { disabled: isLoading })) }), _jsx(FormMessage, {})] })) })] })] }), _jsxs(CardFooter, { className: "flex justify-between items-center border-t p-6", children: [_jsx("div", { children: isLoading ? "Saving your profile information..." : "" }), _jsx(Button, { type: "submit", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Saving..."] })) : ("Save Changes") })] })] }) }))] }));
};
export default Profile;
