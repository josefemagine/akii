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
const superAdminCheckCorsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};
// Simple response helpers
const superAdminCheckCreateSuccessResponse = (data) => {
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: Object.assign(Object.assign({}, superAdminCheckCorsHeaders), { "Content-Type": "application/json" })
    });
};
const superAdminCheckCreateErrorResponse = (message, status = 400) => {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: Object.assign(Object.assign({}, superAdminCheckCorsHeaders), { "Content-Type": "application/json" })
    });
};
// Main handler function
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: superAdminCheckCorsHeaders });
    }
    try {
        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return superAdminCheckCreateErrorResponse("Authorization header required", 401);
        }
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
        if (!supabaseUrl || !supabaseKey) {
            return superAdminCheckCreateErrorResponse("Missing environment variables", 500);
        }
        // Create Supabase client using dynamic import to avoid TypeScript errors
        const { createClient } = yield import("https://esm.sh/@supabase/supabase-js@2.21.0");
        const supabase = createClient(supabaseUrl, supabaseKey);
        // Get token from Authorization header
        const token = authHeader.replace("Bearer ", "");
        // Get user from token
        const { data, error: authError } = yield supabase.auth.getUser(token);
        if (authError || !data.user) {
            return superAdminCheckCreateErrorResponse("User not authenticated", 401);
        }
        const userId = data.user.id;
        console.log("Running super admin check for user:", userId);
        // Build response object with all data
        const responseData = {
            user_id: userId,
            timestamp: new Date().toISOString(),
            environment: Deno.env.get("ENVIRONMENT") || "unknown",
            tables: {},
            raw_jwt: {},
        };
        // Check profiles table
        const { data: profileData, error: profileError } = yield supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        responseData.tables.profiles = {
            exists: !profileError,
            error: profileError ? profileError.message : null,
            data: profileData || null,
        };
        // Check users table
        const { data: userData, error: userError } = yield supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();
        responseData.tables.users = {
            exists: !userError,
            error: userError ? userError.message : null,
            data: userData || null,
        };
        // Check JWT claims/metadata
        try {
            const { data: jwtData } = yield supabase.rpc('get_claims', { uid: userId });
            responseData.raw_jwt = jwtData || {};
        }
        catch (e) {
            responseData.raw_jwt = { error: e instanceof Error ? e.message : String(e) };
        }
        // Add admin status from localStorage (client-side check)
        responseData.client_checks = {
            localStorage_admin: true, // This will be filled in by the frontend
        };
        // Return all the collected data
        return superAdminCheckCreateSuccessResponse(responseData);
    }
    catch (error) {
        console.error("Error checking admin status:", error);
        return superAdminCheckCreateErrorResponse(error instanceof Error ? error.message : "Failed to check admin status", 500);
    }
}));
