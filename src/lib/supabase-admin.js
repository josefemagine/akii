/**
 * Supabase admin client export
 * This file re-exports the centralized admin client from supabase-singleton
 * to maintain backward compatibility with existing imports
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
import { getAdminClient, supabaseAdmin } from "./supabase-singleton";
// Export the admin client for backward compatibility
export { supabaseAdmin };
// Export your admin-specific functions but don't re-export clients
export function adminSetUserRole(userId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminClient = getAdminClient();
        if (!adminClient) {
            throw new Error("Admin client not available");
        }
        // Implementation...
    });
}
export function adminPromoteToAdmin(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const adminClient = getAdminClient();
        // Implementation...
    });
}
// Use a different name to avoid conflicts
export function adminFetchAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const adminClient = getAdminClient();
        // Implementation...
    });
}
// Function to get user role directly from database
export function getUserRole(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!getAdminClient()) {
                throw new Error("Admin client not available");
            }
            const { data, error } = yield getAdminClient()
                .from("profiles")
                .select("role")
                .eq("email", email)
                .single();
            if (error)
                throw error;
            return { role: (data === null || data === void 0 ? void 0 : data.role) || null, error: null };
        }
        catch (error) {
            console.error("Error getting user role:", error);
            return { role: null, error };
        }
    });
}
/**
 * Get users from auth schema using the service role
 */
export function getAuthUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!getAdminClient()) {
                throw new Error("Admin client not available");
            }
            // First try the admin API
            const { data, error } = yield getAdminClient().auth.admin.listUsers();
            if (error) {
                console.error("Failed to fetch users with admin API:", error);
                // Fall back to getting users from auth schema directly if available
                try {
                    const { data: userData, error: userError } = yield getAdminClient().rpc("get_auth_users");
                    if (userError) {
                        console.error("Failed to fetch users with RPC:", userError);
                        return { data: null, error: userError };
                    }
                    return { data: userData, error: null };
                }
                catch (rpcError) {
                    console.error("RPC call failed:", rpcError);
                    return { data: null, error: rpcError };
                }
            }
            return { data, error: null };
        }
        catch (err) {
            console.error("Error in getAuthUsers:", err);
            return { data: null, error: err };
        }
    });
}
// Add this debug function at the top of the file
export function debugAdminStatus() {
    const adminClient = getAdminClient();
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_SERVICE_KEY;
    console.log("Admin client available:", !!adminClient);
    console.log("Service key available:", !!serviceKey);
    console.log("Service key length:", serviceKey ? serviceKey.length : 0);
    return {
        adminAvailable: !!adminClient,
        serviceKeyAvailable: !!serviceKey,
        serviceKeyLength: serviceKey ? serviceKey.length : 0
    };
}
// Modify getAllUsers to handle missing admin client more gracefully
export function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminClient = getAdminClient();
            if (!adminClient) {
                console.error("Admin client not available - check your VITE_SUPABASE_SERVICE_KEY");
                // Return mock data for development
                return {
                    users: [
                        {
                            id: "mock-user",
                            email: "mock@example.com",
                            role: "user",
                            status: "active",
                            created_at: new Date().toISOString(),
                            full_name: "Mock User"
                        }
                    ],
                    error: new Error("Admin client not available - check your VITE_SUPABASE_SERVICE_KEY")
                };
            }
            // Try to get users from profiles table
            try {
                const { data: profileData, error: profileError } = yield adminClient
                    .from("profiles")
                    .select("*");
                if (profileError) {
                    console.error("Error fetching profiles:", profileError);
                    throw profileError;
                }
                console.log("Successfully fetched profiles:", (profileData === null || profileData === void 0 ? void 0 : profileData.length) || 0);
                return { users: profileData || [], error: null };
            }
            catch (dbError) {
                console.error("Database error fetching profiles:", dbError);
                throw dbError;
            }
        }
        catch (error) {
            console.error("Error in getAllUsers:", error);
            return {
                users: [],
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    });
}
/**
 * Set a user as admin by email
 * This function will find the user by email and set their role to admin
 */
export function setUserAsAdmin(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error("Admin client not available");
            }
            // Find the user by email
            const { data, error } = yield adminClient
                .from("profiles")
                .update({ role: "admin" })
                .eq("email", email)
                .select();
            if (error)
                throw error;
            return {
                success: data && data.length > 0,
                data,
                error: null
            };
        }
        catch (error) {
            console.error("Error setting user as admin:", error);
            return {
                success: false,
                data: null,
                error
            };
        }
    });
}
/**
 * Set a user's role
 * This is used by the Users page to update user roles
 */
export function setUserRole(userId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error("Admin client not available");
            }
            const { data, error } = yield adminClient
                .from("profiles")
                .update({
                role,
                updated_at: new Date().toISOString(),
            })
                .eq("id", userId)
                .select();
            if (error)
                throw error;
            return {
                success: data && data.length > 0,
                data,
                error: null
            };
        }
        catch (error) {
            console.error("Error setting user role:", error);
            return {
                success: false,
                data: null,
                error
            };
        }
    });
}
/**
 * Create user profile for a real Supabase user
 * This functions creates a profile record in the profiles table for an existing Supabase user
 */
export function createUserProfile(authUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminClient = getAdminClient();
            if (!adminClient) {
                throw new Error("Admin client not available");
            }
            if (!authUser || !authUser.id) {
                throw new Error("Valid user data is required");
            }
            // Check if profile already exists
            const { data: existingProfile, error: checkError } = yield adminClient
                .from("profiles")
                .select("*")
                .eq("id", authUser.id)
                .maybeSingle();
            if (checkError) {
                console.error("Error checking for existing profile:", checkError);
            }
            // If profile exists, return it
            if (existingProfile) {
                console.log("Profile already exists for user:", authUser.id);
                return {
                    success: true,
                    data: existingProfile,
                    error: null
                };
            }
            // Create new profile from auth user data
            const userMetadata = authUser.user_metadata || {};
            const newProfile = {
                id: authUser.id,
                email: authUser.email,
                full_name: userMetadata.full_name || userMetadata.name || '',
                first_name: userMetadata.first_name || '',
                last_name: userMetadata.last_name || '',
                avatar_url: userMetadata.avatar_url || userMetadata.picture || '',
                role: 'user',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            console.log("Creating new profile for user:", authUser.id);
            const { data, error } = yield adminClient
                .from("profiles")
                .insert(newProfile)
                .select()
                .single();
            if (error) {
                console.error("Error creating user profile:", error);
                throw error;
            }
            return {
                success: true,
                data,
                error: null
            };
        }
        catch (error) {
            console.error("Error in createUserProfile:", error);
            return {
                success: false,
                data: null,
                error
            };
        }
    });
}
