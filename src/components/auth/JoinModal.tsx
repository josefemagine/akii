import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/UnifiedAuthContext";
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
import { supabase } from "@/lib/supabase";

const joinSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    company: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type JoinFormValues = z.infer<typeof joinSchema>;

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function JoinModal({
  isOpen,
  onClose,
  onOpenLogin,
}: JoinModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState(false);
  const [email, setEmail] = useState("");
  const { signUp, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: JoinFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting to create account with email:", data.email);
      
      // Add user metadata for first name, last name and company
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        company: data.company || null,
      };
      
      const { error } = await signUp(data.email, data.password, metadata);
      if (error) {
        console.error("Signup error:", error.message);
        
        if (error.message.includes("rate limit") || error.message.includes("exceeded")) {
          setError("Account creation rate limit reached. Please try again later or use a different email address.");
        } else if (error.message.includes("timeout") || error.message.includes("network") || error.message.includes("establish connection")) {
          setError("Connection error. The server is currently unreachable. Please check your internet connection and try again later.");
        } else {
          setError(error.message);
        }
      } else {
        setEmail(data.email);
        setVerificationStep(true);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes("timeout") || err.message.includes("504") || err.message.includes("Gateway Timeout")) {
          setError("Server timeout. The authentication service is not responding. Please try again later.");
        } else if (err.message.includes("network") || err.message.includes("establish connection")) {
          setError("Network error. Please check your internet connection and try again.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Use Supabase directly for Google sign-in
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Sign In Error",
        description:
          "There was a problem signing in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLogin = () => {
    reset();
    setVerificationStep(false);
    onClose();
    onOpenLogin();
  };

  // Force close the modal on component mount if already authenticated
  useEffect(() => {
    // Direct DOM-based solution that will forcibly close the modal
    const forceCloseModal = () => {
      console.log('[JoinModal] Force closing modal...');
      
      // First try using the onClose prop
      onClose();
      
      // As a fallback, find and click any close button in the modal
      setTimeout(() => {
        try {
          // Try clicking the close button
          const closeButton = document.querySelector('[data-dialog-close="true"]');
          if (closeButton) {
            console.log('[JoinModal] Found close button, clicking it');
            (closeButton as HTMLElement).click();
          }
          
          // Try clicking the overlay as another fallback
          const overlay = document.querySelector('[data-radix-dialog-overlay]');
          if (overlay) {
            console.log('[JoinModal] Found overlay, clicking it');
            (overlay as HTMLElement).click();
          }
        } catch (e) {
          console.error('[JoinModal] Error in force close:', e);
        }
      }, 100);
    };

    // Force close if already authenticated
    if (user) {
      console.log('[JoinModal] User detected, force closing modal');
      forceCloseModal();
    }
    
    // Directly listen for storage events to detect auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.includes('supabase.auth.token') || e.key.includes('supabase.auth.refreshToken'))) {
        console.log('[JoinModal] Auth storage changed, likely authenticated');
        forceCloseModal();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [onClose, user]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {verificationStep ? "Verify Email" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {verificationStep
              ? `We've sent a verification code to ${email}. Please enter it below.`
              : "Join Akii to create and manage your AI agents"}
          </DialogDescription>
        </DialogHeader>

        {verificationStep ? (
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <svg 
                  width="50" 
                  height="50" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path 
                    d="M22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                  />
                  <path 
                    d="M12 8V13" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M12 16H12.01" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium">Check your email</h3>
              
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to <span className="font-medium">{email}</span>.
                Please check your inbox and click the link to verify your account.
              </p>
              
              <div className="text-sm text-muted-foreground">
                <p>After verification, you'll be automatically logged in.</p>
                <p className="mt-2">Can't find the email? Check your spam folder.</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                reset();
                setVerificationStep(false);
              }}
            >
              Back to Sign Up
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Your Company (Optional)"
                  {...register("company")}
                  disabled={isLoading}
                />
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
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
          </>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-0">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Button
              variant="link"
              className="px-0 font-normal"
              onClick={handleOpenLogin}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
