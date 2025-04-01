import React, { Suspense, lazy, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useRoutes,
  useNavigate,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import routes from "tempo-routes";
import { AuthProvider } from "./contexts/ConsolidatedAuthContext";
import LandingPage from "./pages/LandingPage";
import { SearchProvider } from "./contexts/SearchContext";
import { EnvWarning } from "@/components/ui/env-warning";
import { LoadingScreen } from "@/components/LoadingScreen";
import PrivateRoute from "./routes/PrivateRoute";
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

// Add these missing imports at the top with your other lazy imports
const HomePage = lazy(() => import("@/pages/HomePage"));
const UsersPage = lazy(() => import("@/pages/admin/Users"));

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

  useEffect(() => {
    // Check if we're trying to access dashboard routes
    if (location.pathname.startsWith("/dashboard")) {
      console.log("Redirecting to dashboard");
      // Force a navigation to the dashboard route
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate]);

  return <LoadingScreen />;
};

function App() {
  const location = useLocation();
  const tempoRoutes = import.meta.env.VITE_TEMPO ? useRoutes(routes) : null;

  return (
    <SearchProvider>
      <Suspense fallback={<LoadingScreen />}>
        <EnvWarning />
        <AuthProvider>
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
            <Route
              path="/products/mobile-chat-agent"
              element={<MobileChatAgent />}
            />
            <Route
              path="/products/whatsapp-chat-agent"
              element={<WhatsAppChatAgent />}
            />
            <Route
              path="/products/telegram-chat-agent"
              element={<TelegramChatAgent />}
            />
            <Route
              path="/products/shopify-chat-agent"
              element={<ShopifyChatAgent />}
            />
            <Route
              path="/products/wordpress-chat-agent"
              element={<WordPressChatAgent />}
            />
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
              path="/dashboard/agent-setup"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AgentSetup />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/agent/:id/analytics"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/agent/:id/conversations"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Conversations />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/documents"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Documents />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/integrations"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Integrations />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/conversations"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Conversations />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Analytics />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/api-keys"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <APIKeys />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/web-chat"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <WebChat />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/shopify-chat"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ShopifyChat />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/workflows"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <N8nWorkflows />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/team"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Team />
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
            <Route
              path="/dashboard/subscription"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Subscription />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/billing"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Billing />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            {/* Admin routes - now under dashboard */}
            <Route
              path="/dashboard/users"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminUsers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/admin-settings"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminSettings />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/packages"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminPackages />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/moderation"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Moderation />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/email-templates"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminEmailTemplates />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/lead-magnets"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminLeadMagnets />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/landing-pages"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminLandingPages />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/blog"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminBlog />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/affiliates"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminAffiliates />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/compliance"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminCompliance />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/run-migration"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <RunMigration />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/workflows"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminN8nWorkflows />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/database-schema"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <DatabaseSchemaPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/user-sync"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <UserSyncPage />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/user-status-migration"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <UserStatusMigration />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />

            {/* Dashboard redirect for any unmatched dashboard routes */}
            <Route path="/dashboard/*" element={<RouteRedirect />} />

            {/* Fallback route */}
            {/* Add this before the catchall route */}
            {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Suspense>
    </SearchProvider>
  );
}

export default App;
