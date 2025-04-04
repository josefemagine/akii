import React, { Suspense, lazy, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// Import providers
import { SearchProvider } from "./contexts/SearchContext";
import { DirectAuthProvider } from "./contexts/direct-auth-context";
import { AuthProvider } from "./contexts/auth-compatibility";

// Import components
import { EnvWarning } from "@/components/ui/env-warning";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "./components/ui/toaster";
import MainLayout from "./components/layout/MainLayout";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { PrivateRoute } from "./components/PrivateRoute";
import { GlobalErrorHandler } from "./components/GlobalErrorHandler";
import ScrollToTop from "./components/layout/ScrollToTop";

// Import utilities
import { setupNetworkInterceptors } from "./lib/network-utils";

// Import pages
import LandingPage from "./pages/LandingPage";
import { UserDetailPage } from "./pages/admin/UserDetail";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
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
const ManageInstances = lazy(() => import("./pages/admin/ManageInstances"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const APIKeys = lazy(() => import("./pages/dashboard/APIKeys"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
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
const AdminBedrock = lazy(() => import("./pages/admin/Bedrock"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin mx-auto"></div>
      <p className="text-foreground">Loading...</p>
    </div>
  </div>
);

// The main App component
export default function App() {
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

  return (
    <Suspense fallback={<LoadingScreen />}>
      <DirectAuthProvider>
        <AuthProvider>
            <SearchProvider>
              <ScrollToTop />
              <EnvWarning />
              <GlobalErrorHandler />
              <Routes>
                {/* Public home routes */}
                <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
                  <Route index element={<LandingPage />} />
                </Route>
                
                {/* Login route */}
                <Route path="/login" element={<Login />} />
                
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
                <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/ai-instances" element={<PrivateRoute><DashboardLayout><Agents /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/settings" element={<PrivateRoute><DashboardLayout><Settings /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/web-chat" element={<PrivateRoute><DashboardLayout><WebChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/mobile-chat" element={<PrivateRoute><DashboardLayout><MobileChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/whatsapp-chat" element={<PrivateRoute><DashboardLayout><WhatsAppChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/telegram-chat" element={<PrivateRoute><DashboardLayout><TelegramChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/shopify-chat" element={<PrivateRoute><DashboardLayout><ShopifyChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/wordpress-chat" element={<PrivateRoute><DashboardLayout><WordPressChat /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/private-ai" element={<PrivateRoute><DashboardLayout><PrivateAI /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/billing" element={<PrivateRoute><DashboardLayout><Billing /></DashboardLayout></PrivateRoute>} />
                <Route path="/dashboard/api-keys" element={<PrivateRoute><DashboardLayout><APIKeys /></DashboardLayout></PrivateRoute>} />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <PrivateRoute adminOnly={true}>
                    <DashboardLayout isAdmin={true}>
                      <AdminDashboard />
                    </DashboardLayout>
                  </PrivateRoute>
                } />
                
                <Route path="/admin" element={
                  <PrivateRoute adminOnly={true}>
                    <DashboardLayout isAdmin={true}>
                      <Outlet />
                    </DashboardLayout>
                  </PrivateRoute>
                }>
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="packages" element={<AdminPackages />} />
                  <Route path="email-templates" element={<AdminEmailTemplates />} />
                  <Route path="lead-magnets" element={<AdminLeadMagnets />} />
                  <Route path="landing-pages" element={<AdminLandingPages />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="affiliates" element={<AdminAffiliates />} />
                  <Route path="compliance" element={<AdminCompliance />} />
                  <Route path="bedrock" element={<AdminBedrock />} />
                  <Route path="run-migration" element={<RunMigration />} />
                  <Route path="n8n-workflows" element={<AdminN8nWorkflows />} />
                  <Route path="moderation" element={<Moderation />} />
                  <Route path="database-schema" element={<DatabaseSchemaPage />} />
                  <Route path="user-status-migration" element={<UserStatusMigration />} />
                  <Route path="user-profile-migration" element={<UserProfileMigration />} />
                  <Route path="workflows" element={<Workflows />} />
                  <Route path="user-detail/:userId" element={<UserDetailPage />} />
                  <Route path="manage-instances" element={<ManageInstances />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <Toaster />
            </SearchProvider>
        </AuthProvider>
      </DirectAuthProvider>
    </Suspense>
  );
}
