/**
 * Shared authentication utilities for Supabase Edge Functions
 *
 * This file includes utilities for:
 * - Validating environment variables
 * - Creating Supabase clients with appropriate authentication
 * - Verifying user authentication and permissions
 * - Handling common request patterns
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "./cors";
// Validate required environment variables
export function validateSecrets(requiredSecrets) {
    for (const secret of requiredSecrets) {
        if (!process.env[secret]) {
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
    const SUPABASE_URL = (_a = process.env.SUPABASE_URL) !== null && _a !== void 0 ? _a : "";
    const SUPABASE_ANON_KEY = (_b = process.env.SUPABASE_ANON_KEY) !== null && _b !== void 0 ? _b : "";
    const SUPABASE_SERVICE_ROLE_KEY = (_c = process.env.SUPABASE_SERVICE_ROLE_KEY) !== null && _c !== void 0 ? _c : "";
    const options = adminAccess ? {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    } : {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            headers: {
                Authorization: req.headers.get("Authorization") || ""
            }
        }
    };
    return createClient(SUPABASE_URL, adminAccess ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY, options);
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
        try {
            const { data, error: authError } = yield supabaseClient.auth.getUser(token);
            const user = data === null || data === void 0 ? void 0 : data.user;
            if (authError || !user) {
                return { user: null, error: "Authentication failed" };
            }
            if (adminRequired && user.role !== "admin") {
                return { user: null, error: "Admin access required" };
            }
            return { user };
        }
        catch (error) {
            console.error("Error in verifyAuth:", error);
            return { user: null, error: "Authentication failed" };
        }
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
