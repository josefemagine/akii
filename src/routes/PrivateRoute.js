import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { LoadingScreen } from '../components/LoadingScreen';
// Debug logging
const debug = (...args) => console.log('[PrivateRoute]', ...args);
export function PrivateRoute({ requireAdmin = false, requireProfile = true }) {
    const { user, profile, hasProfile, authLoading, isAdmin } = useAuth();
    // Derived states for cleaner logic
    const isAuthenticated = !!user;
    const hasValidProfile = !!profile && hasProfile;
    // Debug state info
    debug('PrivateRoute auth state:', {
        hasUser: isAuthenticated,
        isAdmin,
        isLoading: authLoading,
        hasProfile,
        requireAdmin,
        requireProfile,
        profileRole: profile === null || profile === void 0 ? void 0 : profile.role
    });
    // Still initializing the application
    if (authLoading) {
        return _jsx(LoadingScreen, { message: "Loading authentication data..." });
    }
    // Authentication failed - redirect to login
    if (!isAuthenticated) {
        debug('User not authenticated, redirecting to login page');
        return _jsx(Navigate, { to: "/auth/login", replace: true });
    }
    // Profile required but missing - redirect to profile setup
    if (requireProfile && !hasValidProfile) {
        debug('Profile required but missing, redirecting to profile setup');
        return _jsx(Navigate, { to: "/profile/setup", replace: true });
    }
    // Admin access required but user is not admin
    if (requireAdmin && !isAdmin) {
        debug('Admin access required but user is not admin');
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    // All checks passed - render the protected content
    debug('Auth requirements satisfied, rendering protected route', {
        isAdmin,
        adminOnly: requireAdmin,
        profileRole: profile === null || profile === void 0 ? void 0 : profile.role,
        hasProfile: hasValidProfile
    });
    return _jsx(Outlet, {});
}
export default PrivateRoute;
