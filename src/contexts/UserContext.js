var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
// Create context with default values
const UserContext = createContext({
    user: null,
    session: null,
    sessionLoaded: false,
});
/**
 * UserProvider component to handle Supabase authentication
 * This provider:
 * - Gets the initial session on mount
 * - Subscribes to auth state changes
 * - Avoids calling getUser() directly (uses session data instead)
 * - Works in both client and server environments
 */
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [sessionLoaded, setSessionLoaded] = useState(false);
    useEffect(() => {
        // Skip if window is not defined (server-side rendering)
        if (typeof window === "undefined") {
            return;
        }
        // Function to set authentication state
        const setAuthState = (session) => {
            var _a;
            setSession(session);
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
            setSessionLoaded(true);
        };
        // Get initial session on component mount
        const initializeAuth = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase.auth.getSession();
                if (error) {
                    // Handle session error (only log in development)
                    if (process.env.NODE_ENV === "development") {
                        console.debug("Error fetching initial session:", error.message);
                    }
                    setSessionLoaded(true);
                    return;
                }
                // Set initial state from session
                setAuthState(data.session);
            }
            catch (err) {
                // Set session loaded even if there's an error to avoid infinite loading
                setSessionLoaded(true);
                // Only log in development
                if (process.env.NODE_ENV === "development") {
                    console.error("Error in auth initialization:", err);
                }
            }
        });
        // Initialize auth on component mount
        initializeAuth();
        // Set up auth state change subscription
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthState(session);
        });
        // Clean up subscription when component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    return (_jsx(UserContext.Provider, { value: { user, session, sessionLoaded }, children: children }));
};
// Custom hook to use the user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
export default UserContext;
