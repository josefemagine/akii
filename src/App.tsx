import React, { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
/* Import removed to fix TS2307 error */
import { SearchProvider, useSearch } from "./contexts/SearchContext";
import { EnvWarning } from "@/components/ui/env-warning";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/LoadingScreen";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useSearch as useSearchContext } from "@/contexts/SearchContext";

// Import DashboardLayout directly instead of lazy loading
import DashboardLayout from "./components/layout/DashboardLayout";
import MainLayout from "./components/layout/MainLayout";

// Lazy load pages with better chunking
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Agents = lazy(() => import("./pages/dashboard/Agents"));
const Conversations = lazy(() => import("./pages/dashboard/Conversations"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const APIKeys = lazy(() => import("./pages/dashboard/APIKeys"));
const Users = lazy(() => import("./pages/admin/Users"));
const Affiliates = lazy(() => import("./pages/admin/Affiliates"));
const Compliance = lazy(() => import("./pages/admin/Compliance"));
const Moderation = lazy(() => import("./pages/admin/Moderation"));
const EmailTemplates = lazy(() => import("./pages/admin/EmailTemplates"));
const Documents = lazy(() => import("./pages/dashboard/Documents"));
const Team = lazy(() => import("./pages/dashboard/Team"));
const LeadMagnets = lazy(() => import("./pages/admin/LeadMagnets"));
const LandingPages = lazy(() => import("./pages/admin/LandingPages"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const N8nWorkflows = lazy(() => import("./pages/dashboard/n8nWorkflows"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LeadMagnet = lazy(() => import("./pages/LeadMagnet"));

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

// Admin pages
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

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [forceShowContent, setForceShowContent] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const location = useLocation();

  // Additional state to track auth checked status
  const [authChecked, setAuthChecked] = useState(false);

  // Force content to show after a reasonable timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.log(
          "[ROOT CAUSE FIX] Force timeout reached - showing content regardless of loading state",
        );
        setForceShowContent(true);
      }, 5000); // 5 seconds max wait time
    } else {
      // When loading finishes, mark auth as checked
      setAuthChecked(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // When the component mounts, set content as ready
  useEffect(() => {
    console.log("AppRoutes component mounted - content is ready");
    setContentReady(true);
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log("[ROOT CAUSE FIX] AppRoutes - Auth state:", {
      isLoggedIn: !!user,
      isLoading,
      authChecked,
      forceShowContent,
      contentReady,
      path: location.pathname,
    });

    // If user becomes authenticated, force re-render all components
    if (user && location.pathname === "/") {
      console.log(
        "[ROOT CAUSE FIX] User authenticated on homepage, should redirect to dashboard",
      );
    }
  }, [
    user,
    isLoading,
    authChecked,
    forceShowContent,
    contentReady,
    location.pathname,
  ]);

  // Global search handler
  const handleSearchChange = useCallback((value: string) => {
    console.log("Current search value:", value);
    setSearchValue(value);
  }, []);

  // Determine whether to show content
  const shouldShowContent =
    contentReady && (!isLoading || forceShowContent || authChecked);

  return (
    <Routes>
      {/* Public home routes */}
      <Route
        path="/"
        element={
          <MainLayout onSearchChange={handleSearchChange}>
            <Outlet />
          </MainLayout>
        }
      >
        <Route index element={<LandingPage searchValue={searchValue} />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="blog" element={<Blog />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-of-service" element={<TermsOfService />} />
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
              {shouldShowContent ? (
                <Outlet />
              ) : (
                <LoadingScreen message="Loading dashboard..." />
              )}
            </DashboardLayout>
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agent-setup" element={<AgentSetup />} />
        <Route path="agent/:id/analytics" element={<Analytics />} />
        <Route path="agent/:id/conversations" element={<Conversations />} />
        <Route path="documents" element={<Documents />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="api-keys" element={<APIKeys />} />
        <Route path="web-chat" element={<WebChat />} />
        <Route path="shopify-chat" element={<ShopifyChat />} />
        <Route path="workflows" element={<N8nWorkflows />} />
        <Route path="team" element={<Team />} />
        <Route path="settings" element={<Settings />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="billing" element={<Billing />} />
      </Route>

      {/* Admin routes - protected by admin role */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout isAdmin={true}>
              <Outlet />
            </DashboardLayout>
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="email-templates" element={<EmailTemplates />} />
        <Route path="lead-magnets" element={<AdminLeadMagnets />} />
        <Route path="landing-pages" element={<AdminLandingPages />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="affiliates" element={<AdminAffiliates />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="run-migration" element={<RunMigration />} />
        <Route path="workflows" element={<AdminN8nWorkflows />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const [hasAuthInProgress, setHasAuthInProgress] = useState(false);
  const location = useLocation();
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if authentication is in progress to prevent unnecessary redirects
  const checkAuthInProgress = () => {
    const isInProgress = localStorage.getItem("auth-in-progress") === "true";
    const progressTime = localStorage.getItem("auth-in-progress-time");

    // If progress time exists, check if it's been too long (stale)
    if (isInProgress && progressTime) {
      const elapsedTime = Date.now() - parseInt(progressTime);
      // If more than 5 minutes, clear and return false
      if (elapsedTime > 300000) {
        console.log("Auth in progress timeout - clearing stale state");
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
        return false;
      }
    }

    return isInProgress;
  };

  // Handle authentication flow detection
  useEffect(() => {
    // Check for auth in progress on component mount and route changes
    const checkAuthStatus = () => {
      // Check if we're in the middle of auth flow
      const isAuthCallback = location.pathname === "/auth/callback";
      const hasAuthTokens =
        window.location.hash && window.location.hash.includes("access_token");
      const hasAuthCode = new URLSearchParams(window.location.search).has(
        "code",
      );
      const hasAuthInProgress = checkAuthInProgress(); // Use our safety function

      // Log auth state for debugging
      console.log("App - Auth state check:", {
        path: location.pathname,
        isAuthCallback,
        hasAuthTokens: !!hasAuthTokens,
        hasAuthCode: !!hasAuthCode,
        hasAuthInProgress: !!hasAuthInProgress,
      });

      // Handle auth tokens outside of callback page
      if (hasAuthTokens && !isAuthCallback) {
        console.log(
          "Auth tokens detected outside callback page, redirecting...",
        );

        // Prepare callback URL with the complete hash
        const callbackUrl = `${window.location.origin}/auth/callback${window.location.hash}`;

        // Redirect to callback handler
        window.location.replace(callbackUrl);
        return;
      }

      // Handle auth code outside of callback page
      if (hasAuthCode && !isAuthCallback) {
        console.log("Auth code detected outside callback page, redirecting...");

        // Prepare callback URL with the complete query string
        const callbackUrl = `${window.location.origin}/auth/callback${window.location.search}`;

        // Redirect to callback handler
        window.location.replace(callbackUrl);
        return;
      }

      // If we're on the callback page, clear direct hasAuthInProgress state so page doesn't get stuck
      if (isAuthCallback) {
        if (hasAuthInProgress) {
          console.log("On callback page - auth still in progress");
        }
      } else if (
        hasAuthInProgress &&
        !isAuthCallback &&
        !hasAuthTokens &&
        !hasAuthCode
      ) {
        // If auth is in progress but we're not on callback page and don't have tokens,
        // it might be a stuck state from a previous failed attempt
        console.log(
          "Possible stuck auth state detected - clearing auth-in-progress",
        );
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");
        setHasAuthInProgress(false);
        return;
      }

      // Update state for conditional rendering
      setHasAuthInProgress(isAuthCallback || hasAuthInProgress);
    };

    checkAuthStatus();
  }, [location.pathname, location.search, location.hash]);

  // Log environment info on mount
  useEffect(() => {
    console.log("App mounted, current route:", location.pathname);

    // Check if environment variables are available
    console.log("Environment check in App:", {
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    });

    // Log any global errors
    const handleError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [location]);

  // Initial auth state check to ensure we have a session before rendering routes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(
          "[EXTENDED FIX] Performing improved auth check with connection error handling",
        );

        // Clear any stuck auth states first
        localStorage.removeItem("auth-in-progress");
        localStorage.removeItem("auth-in-progress-time");

        // Add special handling for connection errors during auth
        const getSessionSafely = async () => {
          try {
            return await supabase.auth.getSession();
          } catch (sessionError) {
            console.error(
              "[EXTENDED FIX] Error fetching session, using fallback:",
              sessionError,
            );

            // Check for fallback login information
            const email = localStorage.getItem("akii-auth-robust-email");
            const timestamp = localStorage.getItem("akii-auth-robust-time");
            const success = localStorage.getItem("akii-auth-success");

            if (email && timestamp && success) {
              const authTime = parseInt(timestamp);
              const isRecent = Date.now() - authTime < 300000; // 5 minutes

              if (isRecent) {
                console.log(
                  "[EXTENDED FIX] Using recent auth data as fallback:",
                  email,
                );
                // Return a dummy result to prevent errors
                return {
                  data: {
                    session: { user: { email } } as any,
                  },
                };
              }
            }

            // Re-throw if no suitable fallback
            throw sessionError;
          }
        };

        // Attempt to get session with enhanced error handling
        const { data } = await getSessionSafely();

        console.log(
          "[EXTENDED FIX] Auth check complete with connection error handling:",
          {
            hasSession: !!data.session,
            user: data.session?.user
              ? {
                  id: data.session.user.id || "unknown",
                  email: data.session.user.email,
                }
              : null,
          },
        );

        // Add direct DOM marker for auth state
        try {
          if (data.session?.user) {
            const marker = document.createElement("div");
            marker.id = "akii-auth-marker";
            marker.style.display = "none";
            marker.dataset.userEmail = data.session.user.email || "";
            marker.dataset.timestamp = Date.now().toString();
            document.body.appendChild(marker);
          }
        } catch (e) {
          console.error("[EXTENDED FIX] Error creating DOM marker:", e);
        }

        // Mark auth as initialized so the app can render
        setAuthInitialized(true);
      } catch (error) {
        console.error(
          "[EXTENDED FIX] Critical error in auth initialization:",
          error,
        );
        // Even on error, we need to mark as initialized to allow app to render
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Force clear auth-in-progress after a timeout
  useEffect(() => {
    // On first load, force clear any auth flags to prevent getting stuck
    console.log("App initial load - force clearing any stuck auth states");
    localStorage.removeItem("auth-in-progress");
    localStorage.removeItem("auth-in-progress-time");

    // Set a timeout to force clear after 10 seconds regardless of auth state
    const forceResetTimeout = setTimeout(() => {
      console.log("Force timeout reached - clearing auth-in-progress");
      localStorage.removeItem("auth-in-progress");
      localStorage.removeItem("auth-in-progress-time");
      setHasAuthInProgress(false);
    }, 10000);

    return () => clearTimeout(forceResetTimeout);
  }, []);

  // Show loading screen while authentication is initializing
  if (!authInitialized) {
    return <LoadingScreen message="Initializing application..." />;
  }

  // Return the app content only after auth is initialized
  return (
    <AuthProvider>
      <SearchProvider>
        <Suspense fallback={<LoadingScreen />}>
          <EnvWarning />
          <AppRoutes />
        </Suspense>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
