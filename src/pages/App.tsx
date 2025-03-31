import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Documents from "./dashboard/Documents";
import Agents from "./dashboard/Agents";
import AgentSetup from "./dashboard/AgentSetup";
import Settings from "./dashboard/Settings";
import AuthCallback from "./auth/callback";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import LandingPage from "./LandingPage";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

function App() {
  const { isAuthenticated, isLoading } = useAuth() as any;
  const location = useLocation();
  const { toast } = useToast();

  // Listen for auth state changes and handle redirects from Supabase auth
  useEffect(() => {
    // Check if the URL contains hash parameters from auth redirect
    if (
      location.hash &&
      (location.hash.includes("access_token") ||
        location.hash.includes("error") ||
        location.hash.includes("type=recovery"))
    ) {
      console.log("Auth redirect detected with hash params:", location.hash);

      // Log tokens for debugging
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      console.log("DEBUG - Tokens detected:", {
        accessToken: accessToken
          ? `${accessToken.substring(0, 10)}...`
          : "none",
        refreshToken: refreshToken ? "present" : "none",
        fullHash: location.hash,
      });

      // Store tokens in localStorage for debugging
      if (accessToken) {
        localStorage.setItem("debug-access-token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("debug-refresh-token", refreshToken);
      }

      // Let the callback page handle it
      window.location.href = "/auth/callback" + location.search + location.hash;
      return;
    }

    // Check if we have auth code in URL query params
    const query = new URLSearchParams(location.search);
    if (query.has("code") || query.has("error") || query.has("provider")) {
      console.log("Auth redirect detected with query params:", location.search);

      // Log code for debugging
      const code = query.get("code");
      console.log(
        "DEBUG - Auth code detected:",
        code ? `${code.substring(0, 10)}...` : "none",
      );

      // Store code in localStorage for debugging
      if (code) {
        localStorage.setItem("debug-auth-code", code);
      }

      // Let the callback page handle it
      if (location.pathname !== "/auth/callback") {
        window.location.href =
          "/auth/callback" + location.search + location.hash;
        return;
      }
    }

    // Setup Supabase auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state change:",
        event,
        session ? "Session exists" : "No session",
      );
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location]);

  // Handle deep-linking magic links for password reset
  useEffect(() => {
    if (location.hash && location.hash.includes("type=recovery")) {
      console.log("Password reset detected");
      toast({
        title: "Password Reset Link Detected",
        description: "Please enter your new password.",
      });
    }
  }, [location.hash, toast]);

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

  // Private routes that require authentication
  const renderPrivateRoutes = () => {
    if (isLoading) {
      // Show nothing while checking auth status
      return null;
    }

    if (!isAuthenticated) {
      // If not authenticated, redirect to landing page
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    // User is authenticated, render the private routes
    return (
      <MainLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agent-setup" element={<AgentSetup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </MainLayout>
    );
  };

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Private routes */}
        <Route path="/*" element={renderPrivateRoutes()} />
      </Routes>

      {/* Global toast notification */}
      <Toaster />
    </>
  );
}

export default App;
