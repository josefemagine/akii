import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { AUTH_STATE_CHANGE_EVENT, type AuthStateChangeEvent } from './AuthStateManager';
import supabase from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-compatibility";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenJoin: () => void;
  onOpenPasswordReset: () => void;
}

// Add a new utility function at the beginning of the file after the imports
// This function handles redirection to the dashboard using standard navigation
const forceRedirectToDashboard = () => {
  console.log("[Login Modal] Redirecting to dashboard");
  
  // Always use a literal dashboard path to avoid concatenation issues
  const DASHBOARD_PATH = "/dashboard";
  
  // Use window.location for direct navigation
  window.location.href = DASHBOARD_PATH;
};

const LoginModal = ({
  isOpen,
  onClose,
  onOpenJoin,
  onOpenPasswordReset,
}: LoginModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Try to use the auth hook safely
  let auth;
  try {
    auth = useAuth();
  } catch (error) {
    console.error("Error using auth in LoginModal:", error);
    // Create a fallback auth object with minimal needed functionality
    auth = {
      user: null,
      session: null,
      signIn: async () => ({ data: null, error: new Error("Auth not initialized") }),
      signInWithGoogle: async () => ({ data: null, error: new Error("Auth not initialized") })
    };
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  
  // Debug function to check auth state
  const checkAuthState = () => {
    console.log("[Login Modal] Current auth state:", {
      user: auth.user ? "Logged in" : "Not logged in",
      userId: auth.user?.id,
      email: auth.user?.email,
      hasSession: !!auth.session,
      isModalOpen: isOpen,
    });
    return !!auth.user;
  };

  // Call on mount and when auth state changes
  useEffect(() => {
    if (isOpen) {
      const isAuthenticated = checkAuthState();
      console.log("[Login Modal] Authentication check:", isAuthenticated);
    }
  }, [auth.user, auth.session, isOpen]);

  // Enhanced auto-close if user is logged in
  useEffect(() => {
    if ((auth.user || auth.session) && isOpen) {
      console.log("[Login Modal] User authenticated, closing modal automatically");
      
      // Try to close modal immediately
      onClose();
      
      // Fallback in case the close didn't work
      setTimeout(() => {
        if (isOpen && (auth.user || auth.session)) {
          console.log("[Login Modal] Fallback - forcing modal close after delay");
          onClose();
        }
      }, 500);
    }
  }, [auth.user, auth.session, isOpen, onClose]);

  // Modify the periodic auth check to stop after detecting authentication
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let checkCount = 0;
    const MAX_CHECKS = 10; // Limit the number of checks to prevent infinite loops
    
    const checkAndCleanup = async () => {
      checkCount++;
      const { data } = await supabase.auth.getSession();
      const sessionExists = !!data?.session;
      
      console.log(`[LoginModal] Auth check #${checkCount}:`, { 
        session: sessionExists, 
        user: !!auth.user,
        isOpen 
      });
      
      // Stop checking if authenticated or exceeded max checks
      if (sessionExists || auth.user || checkCount >= MAX_CHECKS) {
        if (sessionExists || auth.user) {
          console.log('[LoginModal] Detected authentication, closing modal');
          onClose();
        }
        if (interval) {
          console.log('[LoginModal] Stopping auth check interval');
          clearInterval(interval);
          interval = null;
        }
      }
    };
    
    // Only start the interval if the modal is open
    if (isOpen) {
      // Check immediately
      checkAndCleanup();
      
      // Then check periodically
      interval = setInterval(() => {
        checkAndCleanup();
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen, auth.user, onClose]);

  // Listen for global auth state changes
  useEffect(() => {
    const handleAuthStateChange = (e: CustomEvent<AuthStateChangeEvent>) => {
      if (e.detail.authenticated && isOpen) {
        console.log('[LoginModal] Detected authenticated state from event, closing modal');
        onClose();
      }
    };
    
    // Add event listener
    document.addEventListener(
      AUTH_STATE_CHANGE_EVENT, 
      handleAuthStateChange as EventListener
    );
    
    // Clean up
    return () => {
      document.removeEventListener(
        AUTH_STATE_CHANGE_EVENT, 
        handleAuthStateChange as EventListener
      );
    };
  }, [isOpen, onClose]);

  // Force close the modal on route change or on component mount if already authenticated
  useEffect(() => {
    // Direct DOM-based solution that will forcibly close the modal
    const forceCloseModal = () => {
      console.log('[LoginModal] Force closing modal...');
      
      // First try using the onClose prop
      onClose();
      
      // As a fallback, find and click any close button in the modal
      setTimeout(() => {
        try {
          // Try clicking the close button
          const closeButton = document.querySelector('[data-dialog-close="true"]');
          if (closeButton) {
            console.log('[LoginModal] Found close button, clicking it');
            (closeButton as HTMLElement).click();
          }
          
          // Try clicking the overlay as another fallback
          const overlay = document.querySelector('[data-radix-dialog-overlay]');
          if (overlay) {
            console.log('[LoginModal] Found overlay, clicking it');
            (overlay as HTMLElement).click();
          }
        } catch (e) {
          console.error('[LoginModal] Error in force close:', e);
        }
      }, 100);
    };

    // Check for auth tokens directly from localStorage as a backup method
    const checkTokensDirectly = () => {
      const hasToken = localStorage.getItem('supabase.auth.token') !== null;
      return hasToken;
    };
    
    const handleVisibilityChange = () => {
      // When tab becomes visible again, check if user is authenticated
      if (!document.hidden && (auth.session || checkTokensDirectly())) {
        console.log('[LoginModal] Tab visible again & user authenticated, force closing');
        forceCloseModal();
      }
    };
    
    // Force close if already authenticated
    if (auth.session || auth.user || checkTokensDirectly()) {
      console.log('[LoginModal] Session or user or token detected, force closing modal');
      forceCloseModal();
    }
    
    // Add visibility change listener to close modal when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Directly listen for storage events to detect auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('supabase.auth.token') || e.key.includes('supabase.auth.refreshToken'))) {
        console.log('[LoginModal] Auth storage changed, likely authenticated');
        forceCloseModal();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onClose, auth.session, auth.user]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "[Login Modal] Starting email sign-in process for:",
        data.email,
      );

      // Try to close the modal BEFORE the signIn attempt
      // This ensures the modal won't block the redirect
      onClose();

      // Set a flag in localStorage to indicate we're in the middle of login
      localStorage.setItem("akii-login-in-progress", "true");
      localStorage.setItem("akii-login-time", Date.now().toString());
      
      // Attempt the sign-in
      const response = await auth.signIn(data.email, data.password);

      if (response.error) {
        setError(response.error.message);
        console.error("[Login Modal] Sign-in error:", response.error);
        return;
      }

      console.log("[Login Modal] Sign-in successful, triggering immediate redirect");
      
      // Use our aggressive redirect function
      forceRedirectToDashboard();
      
      // Reset form after successful login
      reset();
    } catch (error) {
      console.error("[Login Modal] Unexpected sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
      
      // Check if we're logged in but still on the homepage after a delay
      // This catches cases where the earlier redirects failed
      setTimeout(() => {
        // Check if we're still on the home page but actually logged in
        if (window.location.pathname === "/" && (auth.user || auth.session)) {
          console.log("[Login Modal] Detected logged in state but still on homepage, forcing redirect");
          forceRedirectToDashboard();
        }
        
        // Also check the login-in-progress flag
        if (localStorage.getItem("akii-login-in-progress") === "true") {
          const loginTime = parseInt(localStorage.getItem("akii-login-time") || "0");
          // Only force redirect if login started less than 10 seconds ago
          if (Date.now() - loginTime < 10000) {
            console.log("[Login Modal] Login in progress flag still set, forcing redirect");
            forceRedirectToDashboard();
            localStorage.removeItem("akii-login-in-progress");
          }
        }
      }, 1000); // 1 second fallback timeout
    }
  };

  // Helper function to handle successful login
  const handleSuccessfulLogin = (returnPath: string) => {
    // Ensure returnPath is valid
    if (!returnPath || returnPath === "/dashboard" || returnPath === "/ddashboard") {
      returnPath = "/dashboard";
    }
    
    console.log("[Login Modal] Navigating to:", returnPath);
    
    // Use simple window.location navigation
    window.location.href = returnPath;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[Login Modal] Starting Google sign-in process");

      // Close modal first
      onClose();
      
      // Store the redirect path and set login flags
      localStorage.setItem("akii-login-in-progress", "true");
      localStorage.setItem("akii-login-time", Date.now().toString());
      localStorage.setItem("akii-login-method", "google");
      localStorage.setItem("akii-auth-redirect", "/dashboard");

      // Start the OAuth process
      const response = await auth.signInWithGoogle();

      if (response.error) {
        console.error("[Login Modal] Error signing in with Google:", response.error);
        setError("There was a problem signing in with Google. Please try again.");
        
        // Clear login flags on error
        localStorage.removeItem("akii-login-in-progress");
        localStorage.removeItem("akii-auth-redirect");
        return;
      }

      console.log("[Login Modal] Started Google authentication flow");
      
      // Since Google OAuth will redirect, we don't do a redirect here immediately.
      // But we should check for existing auth - in case we're already signed in with Google
      
      setTimeout(() => {
        // Check if we're already logged in but not redirected (happens with existing Google sessions)
        if (auth.user || auth.session) {
          console.log("[Login Modal] Already authenticated with Google, forcing redirect");
          forceRedirectToDashboard();
        }
      }, 500);
    } catch (error) {
      console.error("[Login Modal] Error signing in with Google:", error);
      setError("There was a problem signing in with Google. Please try again.");
      
      // Clear login flags on error
      localStorage.removeItem("akii-login-in-progress");
      localStorage.removeItem("akii-auth-redirect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenJoin = () => {
    reset();
    onClose();
    onOpenJoin();
  };

  const handleOpenPasswordReset = () => {
    reset();
    onClose();
    onOpenPasswordReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sign In</DialogTitle>
          <DialogDescription>
            Sign in to your Akii account to access your dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                className="px-0 font-normal"
                type="button"
                onClick={handleOpenPasswordReset}
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Google
          </Button>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-0">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="px-0 font-normal"
              onClick={handleOpenJoin}
              disabled={isLoading}
            >
              Sign up
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
