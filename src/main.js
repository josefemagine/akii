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
import { StrictMode } from "./lib/react-singleton";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "./lib/react-router-singleton";
import App from "./App";
import "./index.css";
import { TempoDevtools } from "tempo-devtools";
import { supabase } from '@/lib/supabase-singleton';
import { Analytics } from "@vercel/analytics/react";
import { verifyReactSingleton } from "./lib/react-singleton";
import { patchTempoDevtools, verifyTempoPatch } from './lib/patches/tempo-devtools-react-patch';
import { setupModuleAliases, verifyModuleAliases } from './lib/module-alias';
import { patchViteModules, verifyVitePatch } from './lib/vite-module-patch';
import { verifyRouterPatch } from "./lib/router-patch";
// Apply Vite module patch
patchViteModules();
verifyVitePatch();
// Set up module aliases to ensure consistent React usage
setupModuleAliases();
verifyModuleAliases();
// Verify React singleton is working
verifyReactSingleton();
// Verify React Router singleton is working
// NOTE: Removed verifyReactRouterSingleton as it doesn't exist
verifyRouterPatch();
// Initialize Tempo Devtools
TempoDevtools.init();
// Patch Tempo Devtools to use our React singleton
setTimeout(() => {
    patchTempoDevtools();
    verifyTempoPatch();
}, 100);
// Debug supabase in dev mode
if (import.meta.env.DEV) {
    console.log("[Main] Enabling Supabase debugging in development mode");
    window.supabase = supabase;
}
// Add emergency admin override for specific user
const setupAdminOverride = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Target user ID
        const TARGET_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
        console.log("[Auth] Setting up admin override for user:", TARGET_USER_ID);
        // Check if user is logged in
        const { data } = yield supabase.auth.getSession();
        if (((_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.id) === TARGET_USER_ID) {
            console.log("[Auth] Target user is logged in, ensuring admin status");
            // Store admin status in localStorage as fallback mechanism
            localStorage.setItem('user_is_admin', 'true');
            localStorage.setItem('admin_user_id', TARGET_USER_ID);
            // Preload profile in sessionStorage
            const adminProfile = {
                id: TARGET_USER_ID,
                email: data.session.user.email,
                role: 'admin',
                status: 'active',
                is_admin_override: true,
                updated_at: new Date().toISOString()
            };
            sessionStorage.setItem(`profile-${TARGET_USER_ID}`, JSON.stringify({
                profile: adminProfile,
                timestamp: Date.now()
            }));
            console.log("[Auth] Admin override setup complete");
            // If needed, update profile in database as well
            try {
                const { error } = yield supabase
                    .from('profiles')
                    .upsert({
                    id: TARGET_USER_ID,
                    role: 'admin',
                    status: 'active',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });
                if (error) {
                    console.error("[Auth] Failed to update profile in database:", error);
                }
                else {
                    console.log("[Auth] Successfully updated admin status in database");
                }
            }
            catch (err) {
                console.error("[Auth] Unexpected error updating profile:", err);
            }
        }
    }
    catch (error) {
        console.error("[Auth] Error setting up admin override:", error);
    }
});
// Run admin override setup
setupAdminOverride();
// Handle redirects from the fallback page
const processRedirect = () => {
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    if (redirectPath) {
        // Remove the redirect parameter
        params.delete('redirect');
        // Get the remaining query string
        const newSearch = params.toString();
        const searchStr = newSearch ? `?${newSearch}` : '';
        // Create the new URL
        const newUrl = `${window.location.origin}${redirectPath}${searchStr}${window.location.hash}`;
        // Replace the current URL without reloading
        window.history.replaceState(null, '', newUrl);
        console.log(`[Router] Redirected to: ${newUrl}`);
    }
};
// Process redirects on initial load
processRedirect();
// Mount the application
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsxs(BrowserRouter, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true
        }, children: [_jsx(App, {}), _jsx(Analytics, {})] }) }));
