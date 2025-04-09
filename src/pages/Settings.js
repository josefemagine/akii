var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import * as auth from '@/lib/auth-helpers';
/**
 * Settings component with authentication check
 */
export default function Settings() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    /**
     * Check if the user is authenticated before showing settings
     */
    const checkAuthState = () => __awaiter(this, void 0, void 0, function* () {
        console.log("Settings: Checking auth state...");
        try {
            // First try the standard method
            const result = yield auth.getCurrentSession();
            // If standard method failed but we have a token, proceed anyway
            if (!(result === null || result === void 0 ? void 0 : result.data)) {
                // Check for valid auth token in localStorage as fallback
                const tokenKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.includes('-auth-token'));
                if (tokenKey) {
                    try {
                        const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
                        if (tokenData === null || tokenData === void 0 ? void 0 : tokenData.access_token) {
                            console.log("Settings: Using token from localStorage after session check failed");
                            // We have a token, so we can assume the user is authenticated
                            setIsAuthenticated(true);
                            return;
                        }
                    }
                    catch (e) {
                        console.warn("Settings: Error parsing token from localStorage:", e);
                    }
                }
                console.error("Settings: Session error:", (result === null || result === void 0 ? void 0 : result.error) || "No session found");
                setIsAuthenticated(false);
                return;
            }
            // If we got a valid session, user is authenticated
            setIsAuthenticated(true);
        }
        catch (error) {
            console.error("Settings: Session error:", error);
            // Even if session check failed, check localStorage as fallback
            try {
                const tokenKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.includes('-auth-token'));
                if (tokenKey) {
                    const tokenData = JSON.parse(localStorage.getItem(tokenKey) || '{}');
                    if (tokenData === null || tokenData === void 0 ? void 0 : tokenData.access_token) {
                        console.log("Settings: Using token from localStorage after error");
                        setIsAuthenticated(true);
                        return;
                    }
                }
            }
            catch (e) {
                // If everything fails, user is not authenticated
                console.warn("Settings: Error during fallback token check:", e);
            }
            setIsAuthenticated(false);
        }
    });
    // Check auth state on component mount
    useEffect(() => {
        checkAuthState().finally(() => setIsLoading(false));
    }, []);
    if (isLoading) {
        return _jsx("div", { children: "Loading settings..." });
    }
    if (!isAuthenticated) {
        return _jsx("div", { children: "Please sign in to view settings." });
    }
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Settings" }), _jsx("p", { children: "Your account settings will appear here." })] }));
}
