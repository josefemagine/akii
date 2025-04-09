import React, { useState } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export interface AuthLoginProps {
  onSuccess?: () => void;
  redirectPath?: string;
  showGoogleSignIn?: boolean;
  signInWithGoogle?: () => Promise<void>;
  title?: string; 
  description?: string;
  className?: string;
}

/**
 * AuthLogin - A unified authentication component
 * 
 * Handles both standard login form and authentication status display
 * Can be used in multiple places with consistent UI and behavior
 */
export default function AuthLogin({
  onSuccess,
  redirectPath = "/dashboard",
  showGoogleSignIn = false,
  signInWithGoogle,
  title = "Login to Akii",
  description = "Enter your credentials to access your dashboard",
  className = "w-full max-w-md mx-auto",
}: AuthLoginProps) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  // Auth context
  const { signIn, signOut, user, profile, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Check if user is already authenticated
  const isAuthenticated = !!user;

  // Handle sign in form submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    setFormError(null);

    console.log("Starting login process for:", email);

    if (!email || !password) {
      setFormError("Email and password are required");
      setIsFormSubmitting(false);
      return;
    }

    try {
      // Store login attempt in localStorage to track state
      localStorage.setItem("login-attempt", "true");
      localStorage.setItem("login-attempt-time", Date.now().toString());
      localStorage.setItem("login-attempt-email", email);

      await signIn(email, password);
      
      // If we get here, login was successful
      console.log("Login successful");

      // Store user email for backup recovery
      localStorage.setItem("akii-auth-user-email", email);
      localStorage.setItem("akii-auth-timestamp", Date.now().toString());

      // Clear login attempt tracking
      localStorage.removeItem("login-attempt");
      localStorage.removeItem("login-attempt-time");
      localStorage.removeItem("login-attempt-email");

      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Clear form
      setEmail("");
      setPassword("");

      // Redirect if path is provided
      if (redirectPath) {
        setTimeout(() => {
          if (window.location.pathname !== redirectPath) {
            console.log(`Redirecting to ${redirectPath} after login`);
            window.location.href = redirectPath;
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);
      setFormError("An unexpected error occurred. Please try again.");
      localStorage.removeItem("login-attempt");
      localStorage.removeItem("login-attempt-time");
      localStorage.removeItem("login-attempt-email");
    } finally {
      setIsFormSubmitting(false);
    }
  };
  
  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    if (!signInWithGoogle) {
      console.error("Google sign in function not provided");
      return;
    }
    
    setIsFormSubmitting(true);
    try {
      console.log("Starting Google sign-in process");
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign In Error",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFormSubmitting(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading authentication status...</p>
        </CardContent>
      </Card>
    );
  }

  // If authenticated, show user info and sign out button
  if (isAuthenticated) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Welcome, {profile?.first_name || profile?.email || user.email}</CardTitle>
          <CardDescription>You are currently signed in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email:</p>
              <p className="text-sm">{user.email}</p>
            </div>
            {profile && (
              <div>
                <p className="text-sm font-medium">Role:</p>
                <p className="text-sm capitalize">{profile.role}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Otherwise, show login form
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isFormSubmitting}
          >
            {isFormSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {showGoogleSignIn && signInWithGoogle && (
          <>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isFormSubmitting}
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
                Continue with Google
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
} 