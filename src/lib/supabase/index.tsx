import React from "react";
/**
 * SUPABASE INDEX MODULE
 * Main entry point for all Supabase-related functionality
 * IMPORTANT: Always import from this file, never from individual modules
 */
// Import directly to fix references
import { supabase } from './client.ts';
import { getAuth } from './auth.ts';
interface indexProps {}

// Re-export from client
export { getClient, getAdminClient, supabase, supabaseAdmin } from './client.ts';
// Re-export from auth
export { getAuth, getCurrentUser, getCurrentSession, getUserProfile, updateUserProfile, checkUserStatus, setUserRole, setUserStatus } from './auth.ts';
// Re-export from admin
export { getAllUsers, syncUserProfile, ensureUserProfile, setUserAsAdmin } from './admin.ts';
// Aliases for backward compatibility
export const supabaseClient = supabase;
export const auth = getAuth();
