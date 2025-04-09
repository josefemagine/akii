var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Import with type assertion for Deno environment
// @ts-ignore - Module will be resolved by Deno's import system
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "./cors.ts";
// Validate required environment variables
export function validateSecrets(requiredSecrets) {
    for (const secret of requiredSecrets) {
        if (!Deno.env.get(secret)) {
            return { isValid: false, error: `${secret} is not set` };
        }
    }
    return { isValid: true };
}
// Create an error response with proper CORS headers
export function createErrorResponse(message, status = 500) {
    return new Response(JSON.stringify({
        status: "error",
        message,
    }), {
        status,
        headers: Object.assign(Object.assign({}, corsHeaders), { "Content-Type": "application/json" }),
    });
}
// Create a success response with proper CORS headers
export function createSuccessResponse(data, status = 200) {
    return new Response(JSON.stringify(Object.assign({ status: "ok" }, data)), {
        status,
        headers: Object.assign(Object.assign({}, corsHeaders), { "Content-Type": "application/json" }),
    });
}
// Create a Supabase client with auth context
export function createAuthClient(req, adminAccess = false) {
    var _a, _b, _c;
    const SUPABASE_URL = (_a = Deno.env.get("SUPABASE_URL")) !== null && _a !== void 0 ? _a : "";
    const SUPABASE_ANON_KEY = (_b = Deno.env.get("SUPABASE_ANON_KEY")) !== null && _b !== void 0 ? _b : "";
    const SUPABASE_SERVICE_ROLE_KEY = (_c = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) !== null && _c !== void 0 ? _c : "";
    // For admin access, use the service role key with minimal options
    if (adminAccess) {
        return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            }
        });
    }
    // For regular access, create client with the anon key
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return client;
}
// Verify authentication and return user
export function verifyAuth(req_1) {
    return __awaiter(this, arguments, void 0, function* (req, adminRequired = false) {
        var _a;
        const token = (_a = req.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return { user: null, error: "No authorization token provided" };
        }
        const supabaseClient = createAuthClient(req);
        const { data: { user }, error: authError } = yield supabaseClient.auth.getUser(token);
        if (authError || !user) {
            return { user: null, error: "Authentication failed" };
        }
        if (adminRequired && user.role !== "admin") {
            return { user: null, error: "Admin access required" };
        }
        return { user };
    });
}
// Handle common request setup including CORS and auth
export function handleRequest(req_1, handler_1) {
    return __awaiter(this, arguments, void 0, function* (req, handler, options = {}) {
        const { requiredSecrets = ["SUPABASE_URL", "SUPABASE_ANON_KEY"], requireAuth = true, requireAdmin = false, requireBody = true, } = options;
        // Handle CORS preflight requests
        if (req.method === "OPTIONS") {
            return new Response("ok", { headers: corsHeaders });
        }
        // Validate secrets first
        const secretsValidation = validateSecrets(requiredSecrets);
        if (!secretsValidation.isValid) {
            return createErrorResponse(secretsValidation.error, 500);
        }
        // Verify authentication if required
        if (requireAuth) {
            const { user, error } = yield verifyAuth(req, requireAdmin);
            if (error || !user) {
                return createErrorResponse(error || "Authentication failed", 401);
            }
            // Parse request body if required
            let body;
            if (requireBody) {
                try {
                    body = yield req.json();
                }
                catch (error) {
                    return createErrorResponse("Invalid request body", 400);
                }
            }
            // Call the handler with authenticated user and parsed body
            try {
                return yield handler(user, body);
            }
            catch (error) {
                console.error("Error in request handler:", error);
                return createErrorResponse((error === null || error === void 0 ? void 0 : error.message) || "Unknown error occurred", 500);
            }
        }
        // If no auth required, just call the handler
        try {
            const body = requireBody ? yield req.json() : undefined;
            return yield handler(null, body);
        }
        catch (error) {
            console.error("Error in request handler:", error);
            return createErrorResponse((error === null || error === void 0 ? void 0 : error.message) || "Unknown error occurred", 500);
        }
    });
}
