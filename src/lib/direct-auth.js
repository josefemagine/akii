/**
 * Direct authentication handler for URL hash tokens
 * This is a specialized module to handle the specific case of tokens in the URL hash
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
import { supabase } from "./supabase";
/**
 * Directly extracts and processes tokens from the URL hash
 * This is a synchronous function that should be called as early as possible
 */
export function processHashTokens() {
    try {
        const hash = window.location.hash;
        if (!hash || !hash.includes("access_token")) {
            return false;
        }
        console.log("[DIRECT AUTH] Found access token in URL hash");
        // Parse the hash fragment
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (!accessToken || !refreshToken) {
            console.error("[DIRECT AUTH] Missing tokens in hash");
            return false;
        }
        // Store tokens in localStorage for immediate use
        localStorage.setItem("akii-direct-auth", JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            timestamp: new Date().toISOString(),
        }));
        console.log("[DIRECT AUTH] Tokens stored for immediate use");
        return true;
    }
    catch (error) {
        console.error("[DIRECT AUTH] Error processing hash tokens:", error);
        return false;
    }
}
/**
 * Applies the stored direct auth tokens to the session
 * This should be called after Supabase is initialized
 */
export function applyStoredTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const storedTokensJson = localStorage.getItem("akii-direct-auth");
            if (!storedTokensJson) {
                return false;
            }
            console.log("[DIRECT AUTH] Found stored tokens, applying to session");
            const tokens = JSON.parse(storedTokensJson);
            const { data, error } = yield supabase.auth.setSession({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
            });
            if (error) {
                console.error("[DIRECT AUTH] Error setting session:", error);
                localStorage.removeItem("akii-direct-auth");
                return false;
            }
            if (data.session) {
                console.log("[DIRECT AUTH] Session set successfully");
                // Clear the hash but keep the current path
                const currentPath = window.location.pathname;
                window.history.replaceState({}, "", currentPath);
                // Clean up after successful application
                localStorage.removeItem("akii-direct-auth");
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("[DIRECT AUTH] Error applying stored tokens:", error);
            localStorage.removeItem("akii-direct-auth");
            return false;
        }
    });
}
