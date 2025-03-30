import { useState } from "react";
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

const joinSchema = z
  .object({
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
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const { signUp, signInWithGoogle, verifyOtp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: JoinFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signUp(data.email, data.password);
      if (error) {
        setError(error.message);
      } else {
        setEmail(data.email);
        setVerificationStep(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await verifyOtp(email, verificationCode);
      if (error) {
        setError(error.message);
      } else {
        reset();
        setVerificationStep(false);
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("OTP verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: "Sign In Error",
        description: "There was a problem signing in with Google. Please try again.",
        variant: "destructive"
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

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
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
