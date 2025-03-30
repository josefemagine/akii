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

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetSchema = z
  .object({
    code: z.string().min(6, "Please enter the verification code"),
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

type EmailFormValues = z.infer<typeof emailSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

interface PasswordResetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function PasswordReset({
  isOpen,
  onClose,
  onOpenLogin,
}: PasswordResetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const { resetPassword, confirmPasswordReset } = useAuth();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmitEmail = async (data: EmailFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        setError(error.message);
      } else {
        setEmail(data.email);
        setSuccess(
          "Password reset instructions have been sent to your email. Please check your inbox.",
        );
        setResetStep("reset");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await confirmPasswordReset(
        email,
        data.code,
        data.password,
      );
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Your password has been reset successfully.");
        setTimeout(() => {
          handleOpenLogin();
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset confirmation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLogin = () => {
    emailForm.reset();
    resetForm.reset();
    setResetStep("email");
    setError(null);
    setSuccess(null);
    onClose();
    onOpenLogin();
  };

  const handleClose = () => {
    emailForm.reset();
    resetForm.reset();
    setResetStep("email");
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {resetStep === "email" ? "Reset Password" : "Enter New Password"}
          </DialogTitle>
          <DialogDescription>
            {resetStep === "email"
              ? "Enter your email address and we'll send you a verification code"
              : `Enter the verification code sent to ${email} and your new password`}
          </DialogDescription>
        </DialogHeader>

        {resetStep === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            className="space-y-4 py-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...emailForm.register("email")}
                disabled={isLoading}
              />
              {emailForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(onSubmitReset)}
            className="space-y-4 py-4"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                {...resetForm.register("code")}
                disabled={isLoading}
              />
              {resetForm.formState.errors.code && (
                <p className="text-sm text-red-500">
                  {resetForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                {...resetForm.register("password")}
                disabled={isLoading}
              />
              {resetForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {resetForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...resetForm.register("confirmPassword")}
                disabled={isLoading}
              />
              {resetForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {resetForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-0">
          <div className="text-center text-sm">
            Remember your password?{" "}
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
