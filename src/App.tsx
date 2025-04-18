import { Suspense, lazy, useEffect, memo } from "./lib/react-singleton.tsx";
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "./lib/react-router-singleton.tsx";

// Initialize supabase client at app root
import { supabase, ensureSupabaseInitialized } from "./lib/supabase-singleton.tsx";
import { initializeProductionRecovery } from "./lib/production-recovery.ts";
import { forceAdminStatus, enableDevAdminMode } from "./lib/admin-utils.ts";

// Import debug utilities
import * as debugUtils from "./debug";

// Import providers
import { SearchProvider } from "./contexts/SearchContext.tsx";
import { UnifiedAuthProvider, useAuth } from "./contexts/UnifiedAuthContext.tsx";

// Use a direct import from react-query instead of @tanstack/react-query
import { QueryClient, QueryClientProvider } from "react-query";

// Import components
import { EnvWarning } from "@/components/ui/env-warning.tsx";
import LoadingScreen from "@/components/ui/LoadingScreen.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import MainLayout from "./components/layout/MainLayout.tsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.tsx";
import { PrivateRoute } from "./components/PrivateRoute.tsx";
import { GlobalErrorHandler } from "./components/GlobalErrorHandler.tsx";
import ScrollToTop from "./components/layout/ScrollToTop.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner.tsx";

// Import development-only components
// Only import AuthDebugger in development mode
const AuthDebugger = import.meta.env.DEV 
  ? lazy(() => import("./components/debug/AuthDebugger")) 
  : () => null;

// Import utilities
import { setupNetworkInterceptors } from "./lib/network-utils.ts";

// Import pages
import LandingPage from "./pages/LandingPage.tsx";
import { UserDetailPage } from "./pages/admin/UserDetail.tsx";

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
const Profile = lazy(() => import("./pages/dashboard/Profile"));
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
import ManagePlans from "./pages/admin/ManagePlans.tsx";
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
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto"></div>
      <p className="text-foreground">Loading...</p>
    </div>
  </div>
);

// Wrap dashboard route in a stable memo component to prevent remounts
const MemoDashboardRoute = React.memo(() => (
  <PrivateRoute>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </PrivateRoute>
));

// Wrap admin route in a stable memo component to prevent remounts
const MemoAdminRoute = React.memo(() => (
  <PrivateRoute adminOnly={true}>
    <Outlet />
  </PrivateRoute>
));

// The main App component
export default function App() {
  // Initialize Supabase singleton as early as possible
  useEffect(() => {
    // Verify and initialize Supabase client
    ensureSupabaseInitialized().then(result => {
      if (result.success) {
        console.log('Supabase client initialized successfully');
      } else {
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
    } else {
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
      
      // Check if cleanup function exists before returning it
      return result?.cleanup;
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

  // Initialize debug utilities in development mode only
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('App: Initializing debug utilities in development mode');
      // Make debug utils available globally
      (window as any).akiiDebugUtils = debugUtils;
      // Set the admin user ID for convenient access
      (window as any).ADMIN_USER_ID = 'b574f273-e0e1-4cb8-8c98-f5a7569234c8';
      console.log('Debug utilities available at window.akiiDebugUtils');
    }
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <UnifiedAuthProvider>
        <SearchProvider>
          <ScrollToTop />
          <EnvWarning />
          <GlobalErrorHandler />
          <Routes>
            {/* Public home routes */}
            <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
              <Route index element={<LandingPage />} />
            </Route>
            
            {/* Redirect login to homepage */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            
            {/* Public pages */}
            <Route path="/pricing" element={<Suspense fallback={<LoadingFallback />}><Pricing /></Suspense>} />
            <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><Blog /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
            <Route path="/privacy-policy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense>} />
            <Route path="/terms-of-service" element={<Suspense fallback={<LoadingFallback />}><TermsOfService /></Suspense>} />
            
            {/* Auth routes */}
            <Route path="/auth">
              <Route path="callback" element={<Suspense fallback={<LoadingFallback />}><AuthCallback /></Suspense>} />
              <Route path="reset-password" element={<Suspense fallback={<LoadingFallback />}><ResetPassword /></Suspense>} />
            </Route>
            <Route path="/token/*" element={<Suspense fallback={<LoadingFallback />}><TokenHandler /></Suspense>} />
            
            {/* Product pages */}
            <Route path="/products/web-chat" element={<Suspense fallback={<LoadingFallback />}><WebChatAgent /></Suspense>} />
            <Route path="/products/mobile-chat" element={<Suspense fallback={<LoadingFallback />}><MobileChatAgent /></Suspense>} />
            <Route path="/products/whatsapp-chat" element={<Suspense fallback={<LoadingFallback />}><WhatsAppChatAgent /></Suspense>} />
            <Route path="/products/telegram-chat" element={<Suspense fallback={<LoadingFallback />}><TelegramChatAgent /></Suspense>} />
            <Route path="/products/shopify-chat" element={<Suspense fallback={<LoadingFallback />}><ShopifyChatAgent /></Suspense>} />
            <Route path="/products/wordpress-chat" element={<Suspense fallback={<LoadingFallback />}><WordPressChatAgent /></Suspense>} />
            <Route path="/products/private-ai-api" element={<Suspense fallback={<LoadingFallback />}><PrivateAIAPI /></Suspense>} />
            <Route path="/products/integrations/zapier" element={<Suspense fallback={<LoadingFallback />}><ZapierIntegration /></Suspense>} />
            <Route path="/products/integrations/n8n" element={<Suspense fallback={<LoadingFallback />}><N8nIntegration /></Suspense>} />
            
            {/* Dashboard routes - protected */}
            <Route path="/dashboard" element={<MemoDashboardRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-instances" element={<AIInstancesPage />} />
              <Route path="create-ai-instance" element={<CreateAIInstancePage />} />
              <Route path="training-data" element={<TrainingDataPage />} />
              <Route path="conversations" element={<ConversationsPage />} />
              <Route path="apps" element={<AppsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="agents" element={<Agents />} />
              <Route path="web-chat" element={<WebChat />} />
              <Route path="mobile-chat" element={<MobileChat />} />
              <Route path="whatsapp-chat" element={<WhatsAppChat />} />
              <Route path="telegram-chat" element={<TelegramChat />} />
              <Route path="shopify-chat" element={<ShopifyChat />} />
              <Route path="wordpress-chat" element={<WordPressChat />} />
              <Route path="private-ai" element={<PrivateAI />} />
              <Route path="billing" element={<Billing />} />
              <Route path="api-keys" element={<APIKeys />} />
            </Route>

            {/* Admin routes - only accessible to admin users */}
            <Route path="/dashboard/admin" element={<DashboardLayout isAdmin={true}><MemoAdminRoute /></DashboardLayout>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="user-detail/:userId" element={<UserDetailPage />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="packages" element={<AdminPackages />} />
              <Route path="email-templates" element={<AdminEmailTemplates />} />
              <Route path="lead-magnets" element={<AdminLeadMagnets />} />
              <Route path="landing-pages" element={<AdminLandingPages />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="affiliates" element={<AdminAffiliates />} />
              <Route path="compliance" element={<AdminCompliance />} />
              <Route path="run-migration" element={<RunMigration />} />
              <Route path="n8n-workflows" element={<AdminN8nWorkflows />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="database-schema" element={<DatabaseSchemaPage />} />
              <Route path="user-status-migration" element={<UserStatusMigration />} />
              <Route path="user-profile-migration" element={<UserProfileMigration />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="manage-instances" element={<ManageInstances />} />
              <Route path="manage-plans" element={<ManagePlans />} />
              <Route path="supabase-bedrock" element={<SupabaseBedrock />} />
              <Route path="supabase-check" element={<SupabaseCheck />} />
            </Route>
          </Routes>
          <Toaster />
        </SearchProvider>
      </UnifiedAuthProvider>
    </Suspense>
  );
}
