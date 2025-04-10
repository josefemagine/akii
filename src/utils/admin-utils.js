var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from '@/lib/supabase';
/**
 * Force the admin status to true for development testing purposes
 */
export const forceAdminStatus = () => {
    if (import.meta.env.DEV) {
        console.log('Forcing admin status in development mode');
        localStorage.setItem('akii-is-admin', 'true');
        return true;
    }
    return false;
};
/**
 * Set admin mode from database only
 * @param enable Ignored - kept for backward compatibility
 */
export const enableDevAdminMode = (enable) => {
    console.log(`Admin status is now always determined from database roles`);
    // Remove any localStorage overrides to ensure we only use database roles
    localStorage.removeItem('akii-is-admin');
    return false; // Always return false to indicate operation is no longer supported
};
/**
 * Diagnose super admin issues by checking user status in various tables
 * This is a utility function for debugging purposes
 */
export const diagnoseSuperAdminIssues = () => __awaiter(void 0, void 0, void 0, function* () {
    // Only run in development mode
    if (!import.meta.env.DEV) {
        console.warn('diagnoseSuperAdminIssues can only be used in development mode');
        return { error: 'Can only run in development mode' };
    }
    try {
        console.log('Running super admin diagnostic...');
        // Check if admin mode is enabled in localStorage
        const localStorageAdmin = localStorage.getItem('akii-is-admin') === 'true';
        console.log('Admin mode in localStorage:', localStorageAdmin);
        // Call the super admin check function
        const { data, error } = yield supabase.functions.invoke('super_admin_check');
        if (error) {
            console.error('Error running super admin check:', error);
            return {
                error: error.message,
                localStorageAdmin
            };
        }
        // Enhance the data with client-side information
        if (data && typeof data === 'object') {
            data.client_checks = Object.assign(Object.assign({}, data.client_checks), { localStorage_admin: localStorageAdmin, browser: navigator.userAgent, window_location: window.location.href });
        }
        console.log('Super admin check results:', data);
        // Now also check normal is_super_admin function for comparison
        try {
            const { data: superAdminData, error: superAdminError } = yield supabase.functions.invoke('is_super_admin');
            console.log('Regular is_super_admin check:', { data: superAdminData, error: superAdminError });
            if (data) {
                data.is_super_admin_check = {
                    data: superAdminData,
                    error: superAdminError ? superAdminError.message : null
                };
            }
        }
        catch (err) {
            console.error('Error checking is_super_admin:', err);
            if (data) {
                data.is_super_admin_check = {
                    error: err instanceof Error ? err.message : String(err)
                };
            }
        }
        return data || { error: 'No data returned from super admin check' };
    }
    catch (err) {
        console.error('Admin diagnostic error:', err);
        return {
            error: err instanceof Error ? err.message : String(err),
            localStorageAdmin: localStorage.getItem('akii-is-admin') === 'true'
        };
    }
});
