import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, lazy, useEffect } from "./lib/react-singleton";
import React from "react";
import { Routes, Route, Navigate, Outlet, } from "./lib/react-router-singleton";
// Initialize supabase client at app root
import { ensureSupabaseInitialized } from "./lib/supabase-singleton";
import { initializeProductionRecovery } from "./lib/production-recovery";
// Import providers
import { SearchProvider } from "./contexts/SearchContext";
import { UnifiedAuthProvider } from "./contexts/UnifiedAuthContext";
// Import components
import { EnvWarning } from "@/components/ui/env-warning";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Toaster } from "./components/ui/toaster";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { GlobalErrorHandler } from "./components/GlobalErrorHandler";
import ScrollToTop from "./components/layout/ScrollToTop";
// Import development-only components
// Only import AuthDebugger in development mode
const AuthDebugger = import.meta.env.DEV
    ? lazy(() => import("./components/debug/AuthDebugger"))
    : () => null;
// Import utilities
import { setupNetworkInterceptors } from "./lib/network-utils";
// Import pages
import LandingPage from "./pages/LandingPage";
import { UserDetailPage } from "./pages/admin/UserDetail";
// Lazy load pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Agents = lazy(() => import("./pages/dashboard/Agents"));
const WebChat = lazy(() => import("./pages/dashboard/WebChat"));
const MobileChat = lazy(() => import("./pages/dashboard/MobileChat"));
const WhatsAppChat = lazy(() => import("./pages/dashboard/WhatsAppChat"));
const TelegramChat = lazy(() => import("./pages/dashboard/TelegramChat"));
const ShopifyChat = lazy(() => import("./pages/dashboard/ShopifyChat"));
const WordPressChat = lazy(() => import("./pages/dashboard/WordPressChat"));
const PrivateAI = lazy(() => import("./pages/dashboard/PrivateAI"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminPackages = lazy(() => import("./pages/admin/Packages"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/EmailTemplates"));
const AdminLeadMagnets = lazy(() => import("./pages/admin/LeadMagnets"));
const AdminLandingPages = lazy(() => import("./pages/admin/LandingPages"));
const AdminBlog = lazy(() => import("./pages/admin/Blog"));
const AdminAffiliates = lazy(() => import("./pages/admin/Affiliates"));
const AdminCompliance = lazy(() => import("./pages/admin/Compliance"));
const RunMigration = lazy(() => import("./pages/admin/RunMigration"));
const AdminN8nWorkflows = lazy(() => import("./pages/admin/n8nWorkflows"));
const Moderation = lazy(() => import("./pages/admin/Moderation"));
const DatabaseSchemaPage = lazy(() => import("./pages/admin/DatabaseSchema"));
const UserStatusMigration = lazy(() => import("./pages/admin/UserStatusMigration"));
const UserProfileMigration = lazy(() => import("./pages/admin/UserProfileMigration"));
const Workflows = lazy(() => import("./pages/admin/Workflows"));
// @ts-expect-error - JSX file without type definitions
const ManageInstances = lazy(() => import("./pages/admin/ManageInstances"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const APIKeys = lazy(() => import("./pages/dashboard/APIKeys"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Plans = lazy(() => import("./pages/Plans"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const AuthCallback = lazy(() => import("./pages/auth/callback"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const TokenHandler = lazy(() => import("./pages/auth/TokenHandler"));
const WebChatAgent = lazy(() => import("./pages/products/WebChatAgent"));
const MobileChatAgent = lazy(() => import("./pages/products/MobileChatAgent"));
const WhatsAppChatAgent = lazy(() => import("./pages/products/WhatsAppChatAgent"));
const TelegramChatAgent = lazy(() => import("./pages/products/TelegramChatAgent"));
const ShopifyChatAgent = lazy(() => import("./pages/products/ShopifyChatAgent"));
const WordPressChatAgent = lazy(() => import("./pages/products/WordPressChatAgent"));
const PrivateAIAPI = lazy(() => import("./pages/products/PrivateAIAPI"));
const ZapierIntegration = lazy(() => import("./pages/products/ZapierIntegration"));
const N8nIntegration = lazy(() => import("./pages/products/N8nIntegration"));
import ManagePlans from "./pages/admin/ManagePlans";
const AIInstancesPage = lazy(() => import("./pages/AIInstances"));
const CreateAIInstancePage = lazy(() => import("./pages/CreateAIInstance"));
const TrainingDataPage = lazy(() => import("./pages/TrainingData"));
const ConversationsPage = lazy(() => import("./pages/Conversations"));
const AppsPage = lazy(() => import("./pages/Apps"));
const TeamPage = lazy(() => import("./pages/dashboard/Team"));
const SupabaseBedrock = lazy(() => import("./pages/admin/SupabaseBedrock"));
const SupabaseCheck = lazy(() => import("./pages/admin/SupabaseCheck"));
const AdminCheck = lazy(() => import("./pages/admin/AdminCheck"));
// Loading fallback component
const LoadingFallback = () => (_jsx("div", { className: "flex items-center justify-center h-screen bg-background", children: _jsxs("div", { className: "text-center space-y-4", children: [_jsx("div", { className: "w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto" }), _jsx("p", { className: "text-foreground", children: "Loading..." })] }) }));
// Wrap dashboard route in a stable memo component to prevent remounts
const MemoDashboardRoute = React.memo(() => (_jsx(PrivateRoute, { children: _jsx(DashboardLayout, { children: _jsx(Outlet, {}) }) })));
// Wrap admin route in a stable memo component to prevent remounts
const MemoAdminRoute = React.memo(() => (_jsx(PrivateRoute, { adminOnly: true, children: _jsx(Outlet, {}) })));
// The main App component
export default function App() {
    // Initialize Supabase singleton as early as possible
    useEffect(() => {
        // Verify and initialize Supabase client
        ensureSupabaseInitialized().then(result => {
            if (result.success) {
                console.log('Supabase client initialized successfully');
            }
            else {
                console.error('Failed to initialize Supabase client:', result.error);
            }
        });
    }, []);
    // In development mode, force admin status for testing
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('App: Dev mode detected, enabling admin access for testing');
            localStorage.setItem('akii-is-admin', 'true');
        }
    }, []);
    // Set dark theme as the default theme for the application
    useEffect(() => {
        // Set dark theme to localStorage if no theme is set
        const currentTheme = localStorage.getItem('dashboard-theme');
        if (!currentTheme) {
            localStorage.setItem('dashboard-theme', 'dark');
        }
        // Apply dark class to html element for initial render
        const isDarkMode = currentTheme === 'dark' || !currentTheme;
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }, []);
    // Initialize production recovery for auth persistence
    useEffect(() => {
        // Only initialize in production or when specifically targeting akii.com
        const isProd = window.location.hostname === 'akii.com' ||
            window.location.hostname === 'www.akii.com' ||
            window.location.hostname === 'app.akii.com';
        if (isProd || import.meta.env.PROD) {
            console.log('App: Initializing production recovery module for auth persistence');
            const result = initializeProductionRecovery();
            // Return cleanup function if it exists
            return result === null || result === void 0 ? void 0 : result.cleanup;
        }
    }, []);
    // Check for port mismatch on application initialization
    useEffect(() => {
        // Get current URL information
        const currentPort = window.location.port;
        const knownPorts = ['5187', '5188']; // Known development ports
        const currentPathname = window.location.pathname;
        // Log detailed port information
        console.log('App: Port check', {
            currentPort,
            isDev: import.meta.env.DEV,
            fullUrl: window.location.href,
            currentPathname,
            isLoginRedirect: currentPathname === '/login' && knownPorts.includes(currentPort)
        });
        // If we're redirected to login on the wrong port (5187), fix it
        if (import.meta.env.DEV && currentPort === '5187') {
            // Get a list of all running instances from localStorage if available
            const runningInstances = localStorage.getItem('akii-dev-ports');
            const targetPort = runningInstances ? JSON.parse(runningInstances)[0] : '5188';
            console.log(`App: Port mismatch detected. On port ${currentPort}, redirecting to port ${targetPort}`);
            // Store the target URL to redirect to after login in localStorage
            if (currentPathname !== '/login') {
                localStorage.setItem('akii-redirect-after-login', currentPathname);
            }
            // Redirect to the correct port
            const correctUrl = window.location.href.replace(`:${currentPort}`, `:${targetPort}`);
            window.location.href = correctUrl;
            return;
        }
        // If we're on the correct port and there's a stored redirect, handle it
        if (currentPathname === '/login' && currentPort !== '5187') {
            const storedRedirect = localStorage.getItem('akii-redirect-after-login');
            // Clear the stored redirect to prevent loops
            localStorage.removeItem('akii-redirect-after-login');
            // Store this port as the last known good port
            localStorage.setItem('akii-dev-ports', JSON.stringify([currentPort]));
            // Skip if no redirect or if we're not logged in
            if (!storedRedirect || localStorage.getItem('akii-is-logged-in') !== 'true') {
                return;
            }
            console.log('App: Following stored redirect after login:', storedRedirect);
            setTimeout(() => {
                window.location.href = `${window.location.origin}${storedRedirect}`;
            }, 100);
        }
    }, []);
    // Set up network interceptors only once when the app loads
    useEffect(() => {
        setupNetworkInterceptors();
    }, []);
    return (_jsx(Suspense, { fallback: _jsx(LoadingScreen, {}), children: _jsx(UnifiedAuthProvider, { children: _jsxs(SearchProvider, { children: [_jsx(ScrollToTop, {}), _jsx(EnvWarning, {}), _jsx(GlobalErrorHandler, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MainLayout, { children: _jsx(Outlet, {}) }), children: _jsx(Route, { index: true, element: _jsx(LandingPage, {}) }) }), _jsx(Route, { path: "/login", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/pricing", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(Pricing, {}) }) }), _jsx(Route, { path: "/blog", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(Blog, {}) }) }), _jsx(Route, { path: "/contact", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(Contact, {}) }) }), _jsx(Route, { path: "/privacy-policy", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(PrivacyPolicy, {}) }) }), _jsx(Route, { path: "/terms-of-service", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(TermsOfService, {}) }) }), _jsxs(Route, { path: "/auth", children: [_jsx(Route, { path: "callback", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(AuthCallback, {}) }) }), _jsx(Route, { path: "reset-password", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(ResetPassword, {}) }) })] }), _jsx(Route, { path: "/token/*", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(TokenHandler, {}) }) }), _jsx(Route, { path: "/products/web-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(WebChatAgent, {}) }) }), _jsx(Route, { path: "/products/mobile-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(MobileChatAgent, {}) }) }), _jsx(Route, { path: "/products/whatsapp-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(WhatsAppChatAgent, {}) }) }), _jsx(Route, { path: "/products/telegram-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(TelegramChatAgent, {}) }) }), _jsx(Route, { path: "/products/shopify-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(ShopifyChatAgent, {}) }) }), _jsx(Route, { path: "/products/wordpress-chat", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(WordPressChatAgent, {}) }) }), _jsx(Route, { path: "/products/private-ai-api", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(PrivateAIAPI, {}) }) }), _jsx(Route, { path: "/products/integrations/zapier", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(ZapierIntegration, {}) }) }), _jsx(Route, { path: "/products/integrations/n8n", element: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(N8nIntegration, {}) }) }), _jsxs(Route, { path: "/dashboard", element: _jsx(MemoDashboardRoute, {}), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "ai-instances", element: _jsx(AIInstancesPage, {}) }), _jsx(Route, { path: "create-ai-instance", element: _jsx(CreateAIInstancePage, {}) }), _jsx(Route, { path: "training-data", element: _jsx(TrainingDataPage, {}) }), _jsx(Route, { path: "conversations", element: _jsx(ConversationsPage, {}) }), _jsx(Route, { path: "apps", element: _jsx(AppsPage, {}) }), _jsx(Route, { path: "team", element: _jsx(TeamPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "agents", element: _jsx(Agents, {}) }), _jsx(Route, { path: "web-chat", element: _jsx(WebChat, {}) }), _jsx(Route, { path: "mobile-chat", element: _jsx(MobileChat, {}) }), _jsx(Route, { path: "whatsapp-chat", element: _jsx(WhatsAppChat, {}) }), _jsx(Route, { path: "telegram-chat", element: _jsx(TelegramChat, {}) }), _jsx(Route, { path: "shopify-chat", element: _jsx(ShopifyChat, {}) }), _jsx(Route, { path: "wordpress-chat", element: _jsx(WordPressChat, {}) }), _jsx(Route, { path: "private-ai", element: _jsx(PrivateAI, {}) }), _jsx(Route, { path: "billing", element: _jsx(Billing, {}) }), _jsx(Route, { path: "api-keys", element: _jsx(APIKeys, {}) })] }), _jsxs(Route, { path: "/dashboard/admin", element: _jsx(DashboardLayout, { isAdmin: true, children: _jsx(MemoAdminRoute, {}) }), children: [_jsx(Route, { index: true, element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "users", element: _jsx(AdminUsers, {}) }), _jsx(Route, { path: "user-detail/:userId", element: _jsx(UserDetailPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(AdminSettings, {}) }), _jsx(Route, { path: "packages", element: _jsx(AdminPackages, {}) }), _jsx(Route, { path: "email-templates", element: _jsx(AdminEmailTemplates, {}) }), _jsx(Route, { path: "lead-magnets", element: _jsx(AdminLeadMagnets, {}) }), _jsx(Route, { path: "landing-pages", element: _jsx(AdminLandingPages, {}) }), _jsx(Route, { path: "blog", element: _jsx(AdminBlog, {}) }), _jsx(Route, { path: "affiliates", element: _jsx(AdminAffiliates, {}) }), _jsx(Route, { path: "compliance", element: _jsx(AdminCompliance, {}) }), _jsx(Route, { path: "run-migration", element: _jsx(RunMigration, {}) }), _jsx(Route, { path: "n8n-workflows", element: _jsx(AdminN8nWorkflows, {}) }), _jsx(Route, { path: "moderation", element: _jsx(Moderation, {}) }), _jsx(Route, { path: "database-schema", element: _jsx(DatabaseSchemaPage, {}) }), _jsx(Route, { path: "user-status-migration", element: _jsx(UserStatusMigration, {}) }), _jsx(Route, { path: "user-profile-migration", element: _jsx(UserProfileMigration, {}) }), _jsx(Route, { path: "workflows", element: _jsx(Workflows, {}) }), _jsx(Route, { path: "manage-instances", element: _jsx(ManageInstances, {}) }), _jsx(Route, { path: "manage-plans", element: _jsx(ManagePlans, {}) }), _jsx(Route, { path: "supabase-bedrock", element: _jsx(SupabaseBedrock, {}) }), _jsx(Route, { path: "supabase-check", element: _jsx(SupabaseCheck, {}) })] })] }), _jsx(Toaster, {})] }) }) }));
}
