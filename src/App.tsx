import React, { Suspense, lazy, useEffect, useState, useMemo } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useRoutes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import routes from "tempo-routes";
// Import our auth compatibility layer instead of specific auth contexts
import { 
  CombinedAuthProvider 
} from './contexts/auth-compatibility';
import LandingPage from "./pages/LandingPage";
import { SearchProvider } from "./contexts/SearchContext";
import { EnvWarning } from "@/components/ui/env-warning";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "./components/ui/toaster";
import MainLayout from "./components/layout/MainLayout";
// Import DashboardLayout directly instead of lazy loading
import DashboardLayout from "./components/layout/DashboardLayout";

// Lazy load pages with better chunking
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Agents = lazy(() => import("./pages/dashboard/Agents"));
const Conversations = lazy(() => import("./pages/dashboard/Conversations"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const APIKeys = lazy(() => import("./pages/dashboard/APIKeys"));
const Documents = lazy(() => import("./pages/dashboard/Documents"));
const Team = lazy(() => import("./pages/dashboard/Team"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const N8nWorkflows = lazy(() => import("./pages/dashboard/n8nWorkflows"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LeadMagnet = lazy(() => import("./pages/LeadMagnet"));
const SupabaseTest = lazy(() => import("./pages/SupabaseTest"));

// Lazy load product pages with better chunking
const WebChatAgent = lazy(() => import("./pages/products/WebChatAgent"));
const MobileChatAgent = lazy(() => import("./pages/products/MobileChatAgent"));
const WhatsAppChatAgent = lazy(
  () => import("./pages/products/WhatsAppChatAgent"),
);
const TelegramChatAgent = lazy(
  () => import("./pages/products/TelegramChatAgent"),
);
const ShopifyChatAgent = lazy(
  () => import("./pages/products/ShopifyChatAgent"),
);
const WordPressChatAgent = lazy(
  () => import("./pages/products/WordPressChatAgent"),
);
const PrivateAIAPI = lazy(() => import("./pages/products/PrivateAIAPI"));

// Auth pages
const AuthCallback = lazy(() => import("./pages/auth/callback"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));
const TokenHandler = lazy(() => import("./pages/auth/TokenHandler"));

// Dashboard web chat
const WebChat = lazy(() => import("./pages/dashboard/WebChat"));
const ShopifyChat = lazy(() => import("./pages/dashboard/ShopifyChat"));

// Lazy load additional dashboard pages
const AgentSetup = lazy(() => import("./pages/dashboard/AgentSetup"));
const Subscription = lazy(() => import("./pages/dashboard/Subscription"));

// Admin pages (now under dashboard)
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
const DatabaseSchemaPage = lazy(() => import("@/pages/admin/DatabaseSchema"));
const UserSyncPage = lazy(() => import("@/pages/admin/UserSync"));
const UserStatusMigration = lazy(
  () => import("@/pages/admin/UserStatusMigration"),
);
const UserProfileMigration = lazy(
  () => import("@/pages/admin/UserProfileMigration"),
);
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Workflows = lazy(() => import("@/pages/admin/Workflows"));

// Add these missing imports at the top with your other lazy imports
const HomePage = lazy(() => import("@/pages/HomePage"));
const UsersPage = lazy(() => import("@/pages/admin/Users"));

// Import our new StandardAuthContext
import { AuthProvider as StandardAuthProvider } from "./contexts/StandardAuthContext";
import { PrivateRoute } from "./components/PrivateRoute";

// Add this function to directly bypass auth checks for dashboard access
function allowDashboardAccess() {
  // Check if we have admin override
  if (localStorage.getItem('akii_admin_override') === 'true' ||
      localStorage.getItem('admin_override') === 'true') {
    console.log("Using admin override to bypass auth checks");
    return true;
  }
  
  // Check for any auth tokens
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('supabase.auth.token') || 
      key.includes('sb-') ||
      key.includes('akii-auth') ||
      key.includes('force-auth-login') ||
      key.includes('token')
    )) {
      console.log("Found auth token, allowing dashboard access:", key);
      return true;
    }
  }
  
  return false;
}

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto"></div>
      <p className="text-foreground">Loading...</p>
    </div>
  </div>
);

// Route redirection component
const RouteRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasAuth, setHasAuth] = useState(false);

  // Added localStorage-based authentication check
  useEffect(() => {
    // Check localStorage for auth tokens
    const checkLocalStorageAuth = () => {
      try {
        // Look for Supabase tokens or custom auth markers in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('supabase.auth.token') || 
            key.includes('sb-') ||
            key.includes('akii-auth') ||
            key === 'force-auth-login'
          )) {
            console.log("RouteRedirect: Found auth token in localStorage:", key);
            setHasAuth(true);
            return true;
          }
        }
      } catch (e) {
        console.error("RouteRedirect: Error checking localStorage auth:", e);
      }
      return false;
    };
    
    checkLocalStorageAuth();
  }, []);

  useEffect(() => {
    // Scan localStorage for any problematic redirects
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('redirect') || key.includes('auth') || key.includes('return'))) {
        const value = localStorage.getItem(key);
        if (value && value.includes('/ddashboard')) {
          console.error(`[RouteRedirect] Found problematic redirect in localStorage: ${key}=${value}`);
          localStorage.setItem(key, value.replace('/ddashboard', '/dashboard'));
          console.log(`[RouteRedirect] Fixed localStorage value to: ${value.replace('/ddashboard', '/dashboard')}`);
        }
      }
    }

    // Don't redirect if found auth tokens
    if (hasAuth) {
      console.log("RouteRedirect: Authentication detected in localStorage, allowing access to dashboard");
      return;
    }

    // Check if we're trying to access dashboard routes
    if (location.pathname.startsWith("/dashboard")) {
      // Don't redirect specific dashboard routes that we know exist
      if (
        location.pathname === "/dashboard" ||
        location.pathname === "/dashboard/agents" ||
        location.pathname === "/dashboard/settings"
      ) {
        console.log("Accessing known dashboard route, not redirecting:", location.pathname);
        return;
      }
      
      console.log("Redirecting from unknown dashboard route:", location.pathname);
      // Force a navigation to the dashboard route - fix the original route
      navigate("/dashboard", { replace: true });
    } else if (location.pathname.startsWith("/ddashboard")) {
      // Fix the typo if this occurs
      console.log("Correcting typo in dashboard URL");
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate, hasAuth]);

  return <LoadingScreen />;
};

// Global error handler component
const GlobalErrorHandler = () => {
  useEffect(() => {
    // Save original error handlers
    const originalOnError = window.onerror;
    const originalConsoleError = console.error;
    
    // Override window.onerror to catch and handle global errors
    window.onerror = function(message, source, lineno, colno, error) {
      // Specifically catch and suppress Chrome extension connection errors
      if (message && message.toString().includes("Could not establish connection")) {
        console.log("[GlobalErrorHandler] Suppressed connection error:", message);
        return true; // Prevents the error from propagating
      }
      
      // For other errors, use the original handler
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
    
    // Also override console.error for errors that might only appear there
    console.error = function(...args) {
      // Check for connection error in console errors
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes("Unchecked runtime.lastError: Could not establish connection")) {
        console.log("[GlobalErrorHandler] Suppressed console error:", args[0]);
        return;
      }
      
      // Also check for GoTrueClient warning - no longer run cleanup, just log it
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes("Multiple GoTrueClient instances detected")) {
        console.log("[GlobalErrorHandler] Detected GoTrueClient warning - using standard Supabase auth");
        return;
      }
      
      // Call original for other errors
      return originalConsoleError.apply(console, args);
    };
    
    return () => {
      // Restore original handlers on cleanup
      window.onerror = originalOnError;
      console.error = originalConsoleError;
    };
  }, []);
  
  return null; // This component doesn't render anything
};

// Replace the AuthCleanupHandler component
const AuthCleanupHandler = () => {
  useEffect(() => {
    // No longer need to run cleanup, just log that we're using standard auth
    console.log("Using standard Supabase authentication - no cleanup needed");
  }, []);
  
  return null;
};

// Create an AppContent component that contains all the routes and content
function AppContent() {
  const location = useLocation();
  const tempoRoutes = import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;
  
  return (
    <>
      {/* Add GlobalErrorHandler before anything else */}
      <GlobalErrorHandler />
      {/* Add AuthCleanupHandler to fix auth issues on startup */}
      <AuthCleanupHandler />
      
      <EnvWarning />
      
      {/* Tempo routes */}
      {tempoRoutes}
      
      <Routes>
        {/* Public home routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route index element={<LandingPage />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="supabase-test" element={<SupabaseTest />} />
        </Route>

        {/* Auth routes */}
        <Route path="/auth">
          <Route path="callback" element={<AuthCallback />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Token handler route for deep links with tokens */}
        <Route path="/token/*" element={<TokenHandler />} />

        {/* Product pages */}
        <Route path="/products/web-chat-agent" element={<WebChatAgent />} />
        <Route path="/products/mobile-chat-agent" element={<MobileChatAgent />} />
        <Route path="/products/whatsapp-chat-agent" element={<WhatsAppChatAgent />} />
        <Route path="/products/telegram-chat-agent" element={<TelegramChatAgent />} />
        <Route path="/products/shopify-chat-agent" element={<ShopifyChatAgent />} />
        <Route path="/products/wordpress-chat-agent" element={<WordPressChatAgent />} />
        <Route path="/products/private-ai-api" element={<PrivateAIAPI />} />

        {/* Dashboard routes - protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/agents"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Agents />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        {/* ... all the other dashboard routes ... */}
        
        {/* Dashboard redirect for any unmatched dashboard routes */}
        <Route path="/dashboard/*" element={<RouteRedirect />} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute adminOnly={false}> {/* Set to true in production */}
              <DashboardLayout isAdmin={true}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <PrivateRoute adminOnly={false}> {/* Set to true in production */}
              <DashboardLayout isAdmin={true}>
                <Suspense fallback={<LoadingFallback />}>
                  <Outlet />
                </Suspense>
              </DashboardLayout>
            </PrivateRoute>
          }
        >
          <Route path="users" element={<AdminUsers />} />
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
          <Route path="user-sync" element={<UserSyncPage />} />
          <Route path="user-status-migration" element={<UserStatusMigration />} />
          <Route path="user-profile-migration" element={<UserProfileMigration />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* Fallback route */}
        {/* Add this before the catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

// The main App component - export this directly, without any router wrapping
function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <StandardAuthProvider>
        <SearchProvider>
          <AppContent />
          <Toaster />
        </SearchProvider>
      </StandardAuthProvider>
    </Suspense>
  );
}

// Export App directly - no wrapper with BrowserRouter
export default App;
