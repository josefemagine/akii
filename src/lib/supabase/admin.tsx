import React from "react";
/**
 * SUPABASE ADMIN MODULE
 * Admin-only functions that require service role
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
import { getAdminClient } from './client.ts';
interface adminProps {}

/**
 * Get all users (admin only)
 */
export function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const admin = getAdminClient();
            if (!admin) {
                throw new Error("Admin client not available");
            }
            const { data, error } = yield admin
                .from("profiles")
                .select("*");
            if (error)
                throw error;
            return { data: data || [], error: null };
        }
        catch (error) {
            console.error("Error fetching all users:", error);
            return { data: [], error: error };
        }
    });
}
/**
 * Sync a user's profile (create if doesn't exist)
 */
export function syncUserProfile(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!user || !user.id || !user.email) {
                throw new Error("Invalid user data for sync");
            }
            const admin = getAdminClient();
            if (!admin) {
                throw new Error("Admin client not available for profile sync");
            }
            // Check if profile exists
            const { data: existingProfile, error: checkError } = yield admin
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
            if (checkError && checkError.code !== "PGRST116") {
                throw checkError;
            }
            if (!existingProfile) {
                // Create profile if it doesn't exist
                const { data: newProfile, error: insertError } = yield admin
                    .from("profiles")
                    .insert({
                    id: user.id,
                    email: user.email,
                    role: "user",
                    status: "active",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                    .select()
                    .single();
                if (insertError)
                    throw insertError;
                return { data: newProfile, error: null };
            }
            return { data: existingProfile, error: null };
        }
        catch (error) {
            console.error("Error syncing user profile:", error);
            return { data: null, error: error };
        }
    });
}
/**
 * Set a user as admin (admin only)
 */
export function setUserAsAdmin(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const admin = getAdminClient();
            if (!admin) {
                throw new Error("Admin client not available");
            }
            const { data, error } = yield admin
                .from("profiles")
                .update({
                role: "admin",
                updated_at: new Date().toISOString(),
            })
                .eq("id", userId)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error("Error setting user as admin:", error);
            return { data: null, error: error };
        }
    });
}
// Alias for backward compatibility
export const ensureUserProfile = syncUserProfile;
