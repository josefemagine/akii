import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
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

export default function LoginModal({
  isOpen,
  onClose,
  onOpenJoin,
  onOpenPasswordReset,
}: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signIn, signInWithGoogle } = useAuth();

  // Auto-close if user is already logged in
  useEffect(() => {
    if (user && isOpen) {
      console.log("[Login Modal] User already logged in, closing modal");
      onClose();
      window.location.href = "/dashboard";
    }
  }, [user, isOpen, onClose]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Debug function to check auth state
  const checkAuthState = () => {
    console.log("[Login Modal] Current auth state:", {
      user: user ? "Logged in" : "Not logged in",
      email: user?.email,
      isModalOpen: isOpen,
    });
  };

  // Call on mount and when auth state changes
  useEffect(() => {
    checkAuthState();
  }, [user, isOpen]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(
        "[Login Modal] Starting email sign-in process for:",
        data.email,
      );

      // Store the current path for redirection after login
      localStorage.setItem(
        "auth-return-path",
        window.location.pathname === "/"
          ? "/dashboard"
          : window.location.pathname,
      );

      // EXTENDED FIX: Add more robust login tracking
      localStorage.setItem("akii-auth-robust-email", data.email);
      localStorage.setItem("akii-auth-robust-time", Date.now().toString());
      localStorage.setItem("akii-auth-robust-method", "email");

      // Use try-catch to ensure login attempt works even if there are network issues
      try {
        // Call the signIn function from AuthContext
        const { error } = await signIn(data.email, data.password);

        if (error) {
          console.error("[Login Modal] Sign-in error:", error.message);
          setError(error.message);
        } else {
          console.log(
            "[Login Modal] Sign-in successful - CRITICAL FIX: Forcing immediate redirect",
          );

          // Close modal immediately
          reset();
          onClose();

          // Set a success flag for handling possible connection errors
          localStorage.setItem("akii-auth-success", "true");
          localStorage.setItem("akii-auth-success-time", Date.now().toString());

          // Get redirect path
          const returnPath =
            localStorage.getItem("auth-return-path") || "/dashboard";

          // EXTENDED FIX: Use a reliable method to redirect
          handleSuccessfulLogin(returnPath);
        }
      } catch (signInError) {
        console.error("[Login Modal] Exception during sign-in:", signInError);
        // Fall back to manual login pattern if the signIn function throws
        setError(
          "Error during login. Please try refreshing the page and trying again.",
        );
      }
    } catch (error) {
      console.error("[Login Modal] Critical error in login process:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // EXTENDED FIX: Helper function to handle successful login
  const handleSuccessfulLogin = (returnPath: string) => {
    // Create a final success indicator
    try {
      const successMarker = document.createElement("div");
      successMarker.id = "akii-auth-success-marker";
      successMarker.style.display = "none";
      document.body.appendChild(successMarker);
    } catch (e) {
      console.error("Failed to create success marker:", e);
    }

    console.log("[EXTENDED FIX] Forcing direct navigation to:", returnPath);

    // Use multiple techniques for resilience
    try {
      // 1. Try normal navigation first
      window.location.href = returnPath;

      // 2. Set a backup timeout to force location.replace
      setTimeout(() => {
        if (document.location.pathname !== returnPath) {
          console.log("[EXTENDED FIX] Backup navigation with location.replace");
          window.location.replace(returnPath);
        }
      }, 200);

      // 3. Final fallback
      setTimeout(() => {
        if (document.location.pathname !== returnPath) {
          console.log("[EXTENDED FIX] Final fallback with form submission");
          const form = document.createElement("form");
          form.method = "GET";
          form.action = returnPath;
          document.body.appendChild(form);
          form.submit();
        }
      }, 500);
    } catch (e) {
      console.error("[EXTENDED FIX] Error during navigation:", e);
      // Last resort
      window.location.href = returnPath;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("[Login Modal] Starting Google sign-in process");

      // Store the current path for redirection after login
      localStorage.setItem(
        "auth-return-path",
        window.location.pathname === "/"
          ? "/dashboard"
          : window.location.pathname,
      );

      await signInWithGoogle();

      console.log("[Login Modal] Started Google authentication flow");
      // We don't reset the form here since we're redirecting to Google

      // CRITICAL: Set a backup redirect cookie in case callback doesn't work
      document.cookie = "auth_redirect_backup=dashboard; path=/; max-age=300";
    } catch (error) {
      console.error("[Login Modal] Error signing in with Google:", error);
      setError("There was a problem signing in with Google. Please try again.");
    } finally {
      setIsLoading(false);
      // Close modal to get out of the way of redirect
      onClose();
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
