"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Set CORS headers
const isSuperAdminCorsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
// Simple response helpers
const isSuperAdminCreateSuccessResponse = (data) => {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: Object.assign(Object.assign({}, isSuperAdminCorsHeaders), { "Content-Type": "application/json" })
    });
};
const isSuperAdminCreateErrorResponse = (message, status = 400) => {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: Object.assign(Object.assign({}, isSuperAdminCorsHeaders), { "Content-Type": "application/json" })
    });
};
// Main handler function
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: isSuperAdminCorsHeaders });
    }
    try {
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return isSuperAdminCreateErrorResponse("Authorization header required", 401);
        }
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !supabaseKey) {
            return isSuperAdminCreateErrorResponse("Missing environment variables", 500);
        }
        // Create Supabase client using dynamic import to avoid TypeScript errors
        const { createClient } = yield import("https://esm.sh/@supabase/supabase-js@2.21.0");
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Get token from Authorization header
        const token = authHeader.replace("Bearer ", "");
        // Get user from token
        const { data, error: authError } = yield supabase.auth.getUser(token);
        if (authError || !data.user) {
            return isSuperAdminCreateErrorResponse("User not authenticated", 401);
        }
        const userId = data.user.id;
        console.log("Checking super admin status for user:", userId);
        // First check if the user exists in the 'profiles' table
        const { data: profileData, error: profileError } = yield supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();
        if (profileError) {
            console.log("Error fetching from profiles table:", profileError.message);
        }
        // If the profile has a 'super_admin' role, they are a super admin
        if ((profileData === null || profileData === void 0 ? void 0 : profileData.role) === 'super_admin') {
            console.log("User is super admin based on profile role");
            return isSuperAdminCreateSuccessResponse({
                is_super_admin: true
            });
        }
        // Then check the 'users' table as a fallback
        const { data: userData, error: userError } = yield supabase
            .from("users")
            .select("is_super_admin")
            .eq("id", userId)
            .single();
        if (userError) {
            console.log("Error fetching from users table:", userError.message);
            // If we couldn't find the user in either table, check directly in auth.users
            const { data: authUserData, error: authUserError } = yield supabase
                .from("auth.users")
                .select("is_super_admin")
                .eq("id", userId)
                .single();
            if (authUserError) {
                console.log("Error fetching from auth.users table:", authUserError.message);
                // As a last resort, check if this is a development environment and the user is set as admin
                if (Deno.env.get("ENVIRONMENT") === "development" || Deno.env.get("SUPABASE_ENV") === "development") {
                    console.log("Development environment detected, checking dev admin status");
                    // In development, if they're an admin in the auth system, make them a super admin
                    const { data: roleData } = yield supabase
                        .rpc('get_claims', { uid: userId });
                    const isAdmin = (roleData === null || roleData === void 0 ? void 0 : roleData.role) === 'admin' || (roleData === null || roleData === void 0 ? void 0 : roleData.role) === 'supabase_admin';
                    if (isAdmin) {
                        console.log("User is admin in development mode, granting super admin access");
                        return isSuperAdminCreateSuccessResponse({
                            is_super_admin: true
                        });
                    }
                }
                return isSuperAdminCreateErrorResponse("User not found in any table", 404);
            }
            console.log("Found user in auth.users table, super admin status:", !!(authUserData === null || authUserData === void 0 ? void 0 : authUserData.is_super_admin));
            return isSuperAdminCreateSuccessResponse({
                is_super_admin: !!(authUserData === null || authUserData === void 0 ? void 0 : authUserData.is_super_admin)
            });
        }
        console.log("Found user in users table, super admin status:", !!(userData === null || userData === void 0 ? void 0 : userData.is_super_admin));
        // Return the result from users table
        return isSuperAdminCreateSuccessResponse({
            is_super_admin: !!(userData === null || userData === void 0 ? void 0 : userData.is_super_admin)
        });
    }
    catch (error) {
        console.error("Error checking super admin status:", error);
        return isSuperAdminCreateErrorResponse(error instanceof Error ? error.message : "Failed to check super admin status", 500);
    }
}));
