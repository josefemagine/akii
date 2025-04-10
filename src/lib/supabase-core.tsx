import React from "react";
/**
 * DEPRECATED: Legacy compatibility layer.
 * Import from supabase-singleton.ts or auth-helpers.ts directly.
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
// Import from supabase-singleton
import { supabase, supabaseAdmin, auth, getSupabaseClient, getAdminClient, getAuth } from "./supabase-singleton.tsx";
// Import from auth-helpers
import { 
// User functions
getCurrentUser, getCurrentSession, getUserProfile, ensureUserProfile, updateUserProfile, setUserRole, setUserStatus } from "./auth-helpers.ts";
interface supabase-coreProps {}

// Add the missing function that's causing the error
export function checkUserStatus(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!userId) {
                throw new Error("User ID is required to check status");
            }
            const { data: profile, error } = yield getUserProfile(userId);
            if (error)
                throw error;
            if (!profile)
                throw new Error("User profile not found");
            // Ensure we return null if status is undefined
            return { data: profile.status || null, error: null };
        }
        catch (error) {
            console.error("Error checking user status:", error);
            return { data: null, error: error };
        }
    });
}
// Re-export everything
export { 
// Clients
supabase, supabaseAdmin, auth, getSupabaseClient, getAdminClient, getAuth, 
// User functions
getCurrentUser, getCurrentSession, getUserProfile, ensureUserProfile, updateUserProfile, setUserRole, setUserStatus };
// Default export
export default supabase;
