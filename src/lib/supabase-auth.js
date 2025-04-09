var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { supabase } from '@/lib/supabase-singleton';
import { getSessionSafely } from '@/lib/auth-lock-fix';
// Authentication functions
export function signUp(email, password, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin,
                    data: metadata
                }
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error('Sign up error:', error);
            return { data: null, error: error };
        }
    });
}
export function signIn(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error('Sign in error:', error);
            return { data: null, error: error };
        }
    });
}
export function signInWithOAuth(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error(`Sign in with ${provider} error:`, error);
            return { data: null, error: error };
        }
    });
}
export function signOut() {
    return __awaiter(this, arguments, void 0, function* (scope = 'global') {
        try {
            const { error } = yield supabase.auth.signOut({
                scope: scope === 'global' ? 'global' : (scope === 'local' ? 'local' : 'others')
            });
            if (error)
                throw error;
            return { error: null };
        }
        catch (error) {
            console.error('Sign out error:', error);
            return { error: error };
        }
    });
}
export function resetPasswordForEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`
            });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error('Reset password error:', error);
            return { data: null, error: error };
        }
    });
}
export function updatePassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.updateUser({ password });
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error('Update password error:', error);
            return { data: null, error: error };
        }
    });
}
// Session management
export function getCurrentSession() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield getSessionSafely();
            if (error)
                throw error;
            return { data: data.session, error: null };
        }
        catch (error) {
            console.error('Get session error:', error);
            return { data: null, error: error };
        }
    });
}
export function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.auth.getUser();
            if (error)
                throw error;
            return { data: data.user, error: null };
        }
        catch (error) {
            console.error('Get user error:', error);
            return { data: null, error: error };
        }
    });
}
// User profile management
export function getUserProfile(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const { data, error } = yield supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Get profile error:', error);
                // Check for infinite recursion in RLS policy error
                if (((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('infinite recursion')) || error.code === '42P17') {
                    console.warn('RLS policy error detected. Using fallback profile strategy.');
                    // Get current user to extract metadata
                    const { data: userData } = yield supabase.auth.getUser();
                    if (userData === null || userData === void 0 ? void 0 : userData.user) {
                        // Create a minimal profile from user metadata
                        const fallbackProfile = {
                            id: userId,
                            email: userData.user.email,
                            first_name: ((_b = userData.user.user_metadata) === null || _b === void 0 ? void 0 : _b.first_name) || ((_c = userData.user.user_metadata) === null || _c === void 0 ? void 0 : _c.full_name) || ((_d = userData.user.user_metadata) === null || _d === void 0 ? void 0 : _d.name),
                            last_name: (_e = userData.user.user_metadata) === null || _e === void 0 ? void 0 : _e.last_name,
                            company: (_f = userData.user.user_metadata) === null || _f === void 0 ? void 0 : _f.company,
                            avatar_url: ((_g = userData.user.user_metadata) === null || _g === void 0 ? void 0 : _g.avatar_url) || ((_h = userData.user.user_metadata) === null || _h === void 0 ? void 0 : _h.picture),
                            role: 'user', // Default role
                            status: 'active',
                            created_at: userData.user.created_at,
                            updated_at: userData.user.updated_at
                        };
                        return { data: fallbackProfile, error: null };
                    }
                }
                return { data: null, error };
            }
            return { data, error: null };
        }
        catch (error) {
            console.error('Get profile error:', error);
            return { data: null, error: error };
        }
    });
}
export function updateUserProfile(profile) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!profile.id) {
                const { data: user } = yield getCurrentUser();
                if (!user)
                    throw new Error('No authenticated user');
                profile.id = user.id;
            }
            const { data, error } = yield supabase
                .from('profiles')
                .update(profile)
                .eq('id', profile.id)
                .select()
                .single();
            if (error)
                throw error;
            return { data, error: null };
        }
        catch (error) {
            console.error('Update profile error:', error);
            return { data: null, error: error };
        }
    });
}
// Utility to ensure a user profile exists
export function ensureUserProfile(user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        try {
            // First check if profile exists
            const { data: existingProfile, error: getError } = yield getUserProfile(user.id);
            if (existingProfile) {
                return { data: existingProfile, error: null };
            }
            // If there's an infinite recursion error, we've already tried to create a fallback profile
            // in getUserProfile, so we should return that instead of trying again
            if (getError && (((_a = getError.message) === null || _a === void 0 ? void 0 : _a.includes('infinite recursion')) ||
                (getError === null || getError === void 0 ? void 0 : getError.code) === '42P17')) {
                console.warn('Skipping profile creation due to RLS policy error');
                // Get user data to create fallback profile
                const { data: userData } = yield supabase.auth.getUser();
                if (userData === null || userData === void 0 ? void 0 : userData.user) {
                    const fallbackProfile = {
                        id: user.id,
                        email: user.email || userData.user.email,
                        first_name: ((_b = userData.user.user_metadata) === null || _b === void 0 ? void 0 : _b.first_name) || ((_c = userData.user.user_metadata) === null || _c === void 0 ? void 0 : _c.full_name) || ((_d = userData.user.user_metadata) === null || _d === void 0 ? void 0 : _d.name),
                        last_name: (_e = userData.user.user_metadata) === null || _e === void 0 ? void 0 : _e.last_name,
                        company: (_f = userData.user.user_metadata) === null || _f === void 0 ? void 0 : _f.company,
                        avatar_url: ((_g = userData.user.user_metadata) === null || _g === void 0 ? void 0 : _g.avatar_url) || ((_h = userData.user.user_metadata) === null || _h === void 0 ? void 0 : _h.picture),
                        role: 'user',
                        status: 'active',
                        created_at: userData.user.created_at,
                        updated_at: userData.user.updated_at
                    };
                    return { data: fallbackProfile, error: null };
                }
                return { data: null, error: getError };
            }
            // Create profile if it doesn't exist or if we failed to get it for other reasons
            const newProfile = {
                id: user.id,
                email: user.email,
                role: 'user',
                status: 'active',
                created_at: new Date().toISOString()
            };
            try {
                const { data, error } = yield supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();
                if (error)
                    throw error;
                return { data, error: null };
            }
            catch (insertError) {
                console.error('Error creating profile:', insertError);
                // If insert fails due to RLS policy, return fallback profile
                if (insertError instanceof Error &&
                    (((_j = insertError.message) === null || _j === void 0 ? void 0 : _j.includes('infinite recursion')) ||
                        (insertError === null || insertError === void 0 ? void 0 : insertError.code) === '42P17')) {
                    // Get user data for fallback
                    const { data: userData } = yield supabase.auth.getUser();
                    if (userData === null || userData === void 0 ? void 0 : userData.user) {
                        const fallbackProfile = {
                            id: user.id,
                            email: user.email || userData.user.email,
                            first_name: ((_k = userData.user.user_metadata) === null || _k === void 0 ? void 0 : _k.first_name) || ((_l = userData.user.user_metadata) === null || _l === void 0 ? void 0 : _l.full_name) || ((_m = userData.user.user_metadata) === null || _m === void 0 ? void 0 : _m.name),
                            last_name: (_o = userData.user.user_metadata) === null || _o === void 0 ? void 0 : _o.last_name,
                            company: (_p = userData.user.user_metadata) === null || _p === void 0 ? void 0 : _p.company,
                            avatar_url: ((_q = userData.user.user_metadata) === null || _q === void 0 ? void 0 : _q.avatar_url) || ((_r = userData.user.user_metadata) === null || _r === void 0 ? void 0 : _r.picture),
                            role: 'user',
                            status: 'active',
                            created_at: userData.user.created_at,
                            updated_at: userData.user.updated_at
                        };
                        return { data: fallbackProfile, error: null };
                    }
                }
                return { data: null, error: insertError };
            }
        }
        catch (error) {
            console.error('Ensure profile error:', error);
            return { data: null, error: error };
        }
    });
}
/**
 * Check if a user is an admin by directly querying the profiles table
 * This provides a reliable way to check admin status even when the profile object isn't available
 */
export function checkIsAdmin(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!userId)
                return false;
            // First try getting the profile from the database
            const { data, error } = yield supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Error checking admin status:', error);
                return false;
            }
            // Check if the role field is 'admin'
            return (data === null || data === void 0 ? void 0 : data.role) === 'admin';
        }
        catch (e) {
            console.error('Exception checking admin status:', e);
            return false;
        }
    });
}
// Utility to clear auth tokens from storage (this helps with cleanup during logout)
export function clearAuthTokens() {
    try {
        // Clear all supabase related localStorage items
        Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') ||
                key.includes('sb-') ||
                key.includes('akii-auth') ||
                key.includes('token') ||
                key.includes('auth') ||
                key.startsWith('auth-')) {
                localStorage.removeItem(key);
            }
        });
        // Also try to clear cookies if possible
        document.cookie.split(';').forEach(c => {
            const cookieName = c.trim().split('=')[0];
            if (cookieName.includes('supabase') || cookieName.includes('sb-')) {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
        });
        console.log('Auth tokens cleared from storage');
        return true;
    }
    catch (error) {
        console.error('Error clearing auth tokens:', error);
        return false;
    }
}
