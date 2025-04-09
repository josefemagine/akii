var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/lib/supabase';
// Maximum number of retries for the API call
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;
// For debugging - track function call count
let debugCallCount = 0;
/**
 * Hook for checking and managing super admin status
 * This separates the super admin functionality from the main auth context
 */
export function useSuperAdmin() {
    debugCallCount++;
    console.log(`[SuperAdmin] Hook initialized (call #${debugCallCount})`);
    const { user, hasUser } = useAuth();
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Function to check super admin status with retries
    const checkSuperAdminStatus = useCallback((...args_1) => __awaiter(this, [...args_1], void 0, function* (retryCount = 0) {
        if (!hasUser) {
            console.log('[SuperAdmin] Cannot check super admin status - no user');
            setIsSuperAdmin(false);
            setIsLoading(false);
            return false;
        }
        // Don't set loading to true on retries to avoid UI flicker
        if (retryCount === 0) {
            setIsLoading(true);
            setError(null);
        }
        try {
            console.log(`[SuperAdmin] Checking super admin status (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
            console.log('[SuperAdmin] User ID:', user === null || user === void 0 ? void 0 : user.id);
            // Check if we're in development mode and admin is enabled in localStorage
            if (import.meta.env.DEV && localStorage.getItem('akii-is-admin') === 'true') {
                console.log('[SuperAdmin] DEV MODE: Enabling super admin access from localStorage');
                setIsSuperAdmin(true);
                return true;
            }
            // Call the deployed Edge Function directly
            console.time('superadmin-function-call');
            const { data, error } = yield supabase.functions.invoke('is_super_admin');
            console.timeEnd('superadmin-function-call');
            console.log('[SuperAdmin] Function response:', { data, error });
            if (error) {
                throw new Error(`Failed to check super admin status: ${error.message}`);
            }
            const superAdminStatus = !!(data === null || data === void 0 ? void 0 : data.is_super_admin);
            console.log(`[SuperAdmin] Status: ${superAdminStatus}`);
            setIsSuperAdmin(superAdminStatus);
            return superAdminStatus;
        }
        catch (err) {
            console.error('[SuperAdmin] Error checking status:', err);
            // If we haven't exhausted retries, try again after delay
            if (retryCount < MAX_RETRIES) {
                console.log(`[SuperAdmin] Retrying in ${RETRY_DELAY}ms...`);
                yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                return checkSuperAdminStatus(retryCount + 1);
            }
            // After all retries, check localStorage as fallback in dev mode
            if (import.meta.env.DEV && localStorage.getItem('akii-is-admin') === 'true') {
                console.log('[SuperAdmin] DEV MODE: Falling back to localStorage admin setting');
                setIsSuperAdmin(true);
                return true;
            }
            setError(err instanceof Error ? err : new Error('Unknown error checking super admin status'));
            return false;
        }
        finally {
            if (retryCount === 0 || retryCount === MAX_RETRIES) {
                setIsLoading(false);
            }
        }
    }), [hasUser, user === null || user === void 0 ? void 0 : user.id]);
    // Check super admin status when user changes
    useEffect(() => {
        let isMounted = true;
        const checkStatus = () => __awaiter(this, void 0, void 0, function* () {
            if (hasUser && isMounted) {
                console.log('[SuperAdmin] User available, checking status');
                yield checkSuperAdminStatus();
            }
            else if (isMounted) {
                console.log('[SuperAdmin] No user, skipping status check');
                setIsSuperAdmin(false);
                setIsLoading(false);
            }
        });
        checkStatus();
        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted = false;
            console.log('[SuperAdmin] Component unmounted, cleanup triggered');
        };
    }, [hasUser, checkSuperAdminStatus]);
    return {
        isSuperAdmin,
        isLoading,
        error,
        checkSuperAdminStatus
    };
}
