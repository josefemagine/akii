import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/UnifiedAuthContext';
import LoadingScreen from './ui/LoadingScreen';
/**
 * Circuit Breaker Logic
 *
 * The circuit breaker prevents infinite redirect loops by tracking navigation patterns
 */
const REDIRECT_THRESHOLD = 3; // Max number of redirects allowed in a time window
const TIME_WINDOW_MS = 5000; // Time window for tracking redirects (5 seconds)
const CIRCUIT_RECOVERY_TIME = 30000; // Time until circuit breaker resets (30 seconds)
const MAX_AUTH_WAIT_TIME = 10000; // Maximum time to wait for auth before showing content anyway (10 seconds)
// Track redirect timestamps globally
const redirectHistory = [];
let circuitBreakerTimeout = null;
// Make sure circuitBroken is accessible globally
if (typeof window !== 'undefined') {
    window.circuitBroken = window.circuitBroken || false;
}
// Circuit breaker function
const checkCircuitBreaker = (path) => {
    const now = Date.now();
    // Remove redirects outside the time window
    const validRedirects = redirectHistory.filter(timestamp => now - timestamp < TIME_WINDOW_MS);
    // Replace history with valid redirects
    redirectHistory.length = 0;
    redirectHistory.push(...validRedirects, now);
    // Check if circuit is already broken
    if (window.circuitBroken) {
        return true;
    }
    // Check if we've hit the threshold
    if (redirectHistory.length >= REDIRECT_THRESHOLD) {
        console.error(`Circuit breaker triggered! Detected ${redirectHistory.length} redirects in ${TIME_WINDOW_MS}ms`);
        console.error(`Last attempted path: ${path}`);
        // Trip the circuit breaker
        window.circuitBroken = true;
        // Set up recovery after timeout
        if (circuitBreakerTimeout) {
            window.clearTimeout(circuitBreakerTimeout);
        }
        circuitBreakerTimeout = window.setTimeout(() => {
            console.log('Circuit breaker reset after cooling period');
            window.circuitBroken = false;
            redirectHistory.length = 0;
        }, CIRCUIT_RECOVERY_TIME);
        return true;
    }
    return false;
};
/**
 * A route component that requires authentication to access
 * Redirects to login if not authenticated
 * Optionally, can restrict access to admin users only
 */
export const PrivateRoute = ({ children, adminOnly = false, redirectTo = '/', }) => {
    const { user, isAdmin, isLoading, profile } = useAuth();
    const location = useLocation();
    const [showContent, setShowContent] = useState(false);
    const loadingTimerRef = useRef(null);
    const [redirectAttempt, setRedirectAttempt] = useState(false);
    // Track if we're past the initial mount
    const isMounted = useRef(false);
    // For logging purposes
    useEffect(() => {
        console.log('PrivateRoute auth state:', {
            hasUser: !!user,
            isAdmin,
            isLoading,
            hasProfile: !!profile,
            profileRole: profile === null || profile === void 0 ? void 0 : profile.role,
            path: location.pathname,
            redirectTo,
            adminOnly,
            devMode: import.meta.env.DEV,
            localAdmin: localStorage.getItem('akii-is-admin') === 'true'
        });
    }, [user, isAdmin, isLoading, profile, location.pathname, redirectTo, adminOnly]);
    // Handle loading timeouts
    useEffect(() => {
        // Set a loading timeout to prevent indefinite loading screens
        if (isLoading && !showContent) {
            loadingTimerRef.current = setTimeout(() => {
                console.log('Setting showContent to true after loading timeout');
                setShowContent(true);
            }, 5000); // Show content after 5 seconds of loading
        }
        else if (!isLoading) {
            // When loading is finished, show the content
            setShowContent(true);
            // Clear any pending timer
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        }
        return () => {
            if (loadingTimerRef.current) {
                clearTimeout(loadingTimerRef.current);
                loadingTimerRef.current = null;
            }
        };
    }, [isLoading, showContent]);
    // Mark component as mounted after first render
    useEffect(() => {
        isMounted.current = true;
    }, []);
    // Show loading screen while auth is initializing
    if (!showContent && isLoading) {
        return (_jsx(LoadingScreen, { message: "Authenticating..." }));
    }
    // Handle user auth check after loading
    // If we have a user, render the protected content
    if (user) {
        // For admin routes, check if user has admin access
        const hasAdminAccess = () => {
            // Context-based admin check
            if (isAdmin)
                return true;
            // Profile-based admin check
            if ((profile === null || profile === void 0 ? void 0 : profile.role) === 'admin')
                return true;
            // Development mode override
            if (import.meta.env.DEV && localStorage.getItem('akii-is-admin') === 'true') {
                console.log('DEV MODE: Admin access granted via localStorage override');
                return true;
            }
            return false;
        };
        // If route requires admin access but user is not admin
        if (adminOnly && !hasAdminAccess()) {
            console.log('Admin route accessed by non-admin user, redirecting to dashboard', {
                userId: user.id,
                email: user.email,
                profileRole: profile === null || profile === void 0 ? void 0 : profile.role,
                isAdmin,
                isDev: import.meta.env.DEV
            });
            return _jsx(Navigate, { to: "/dashboard", replace: true });
        }
        // User is authenticated and meets admin requirements if needed
        console.log('Auth requirements satisfied, rendering protected route', {
            isAdmin,
            adminOnly,
            profileRole: profile === null || profile === void 0 ? void 0 : profile.role,
            hasAdminAccess: hasAdminAccess()
        });
        return _jsx(_Fragment, { children: children });
    }
    // If no user but past the loading state, redirect to login
    // We use redirectAttempt to prevent multiple redirects
    if (!user && !redirectAttempt) {
        console.log('User not authenticated, redirecting to login page');
        setRedirectAttempt(true);
        return _jsx(Navigate, { to: redirectTo, state: { from: location.pathname }, replace: true });
    }
    // Safety fallback - if something else goes wrong, show an error screen
    // This should rarely happen but provides a safeguard against edge cases
    return (_jsx("div", { className: "flex flex-col items-center justify-center h-screen bg-background", children: _jsxs("div", { className: "max-w-lg p-6 bg-card rounded-lg shadow-lg", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground mb-4", children: "Authentication Error" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "We encountered a problem with authentication. Please try clearing your browser cache and cookies, then refresh the page." }), _jsx("button", { className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90", onClick: () => {
                        sessionStorage.clear();
                        localStorage.clear();
                        window.location.href = redirectTo;
                    }, children: "Clear Session & Retry" })] }) }));
};
export default PrivateRoute;
