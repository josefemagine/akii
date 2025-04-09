/**
 * fix-profile-directly.ts
 *
 * This script directly fixes the profile loading issue for josef@holm.com
 * by ensuring the profile exists with admin role and required fields.
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
// Import Supabase using a direct path instead of module path
import { createClient } from '@supabase/supabase-js';
// Initialize Supabase client directly 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://injxxchotrvgvvzelhvj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
/**
 * Create or update fallback profile for known admin user
 */
function ensureAdminProfile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Starting admin profile fix...");
            console.log("Using Supabase URL:", supabaseUrl);
            // Get the current session
            const { data: { session }, error: sessionError } = yield supabase.auth.getSession();
            if (sessionError) {
                console.error("Session error:", sessionError);
                return;
            }
            if (!session) {
                console.error("No active session found. Please log in first.");
                return;
            }
            console.log(`Current user: ${session.user.email}`);
            // Create a fallback profile
            const fallbackProfile = {
                id: session.user.id,
                email: session.user.email,
                role: 'admin',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Insert or update the profile
            console.log("Creating/updating profile...");
            const { data, error } = yield supabase
                .from('profiles')
                .upsert(fallbackProfile, {
                onConflict: 'id',
                ignoreDuplicates: false
            });
            if (error) {
                console.error("Error upserting profile:", error);
                // Try direct query instead of RPC
                console.log("Trying direct profile operations...");
                // First check if profile exists
                const { data: existingProfile, error: checkError } = yield supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                if (checkError && !checkError.message.includes('No rows found')) {
                    console.error("Error checking profile:", checkError);
                    return;
                }
                // Create or update the profile
                const { data: profileData, error: upsertError } = yield supabase
                    .from('profiles')
                    .upsert({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'admin',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                    .select()
                    .single();
                if (upsertError) {
                    console.error("Error with direct profile operation:", upsertError);
                    return;
                }
                console.log("Profile created/updated via direct operation");
            }
            else {
                console.log("Profile updated successfully");
            }
            // Fetch the profile to verify
            const { data: profile, error: fetchError } = yield supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            if (fetchError) {
                console.error("Error fetching profile:", fetchError);
                return;
            }
            console.log("Profile successfully verified:", profile);
            console.log("Fix complete! Please restart your application.");
        }
        catch (error) {
            console.error("Unexpected error:", error);
        }
    });
}
// Execute the fix
ensureAdminProfile();
