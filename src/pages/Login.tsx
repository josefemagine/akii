import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useDirectAuth } from "@/contexts/direct-auth-context";
import { setLoggedIn } from "@/lib/direct-db-access";

// Login form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().default(false),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the direct auth context for login
  const { directLogin } = useDirectAuth();
  
  // Debug logging on component mount
  useEffect(() => {
    console.log("Login: Component mounted");
    
    // Store the current port as the last known good port
    const currentPort = window.location.port;
    localStorage.setItem('akii-dev-ports', JSON.stringify([currentPort]));
    console.log(`Login: Stored current port ${currentPort} as the last known good port`);
    
    // Check if we're already logged in
    const isLoggedIn = localStorage.getItem('akii-is-logged-in') === 'true';
    const userId = localStorage.getItem('akii-auth-user-id');
    
    console.log("Login: Initial login state check:", { 
      isLoggedIn,
      userId,
      currentUrl: window.location.href,
      currentPort
    });
    
    // If already logged in, redirect to dashboard
    if (isLoggedIn && userId) {
      console.log("Login: Already logged in, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log("Login: Attempting direct login with email:", values.email);
      
      // Use direct login from the auth context
      const { success, error } = await directLogin(values.email, values.password);
      
      if (success) {
        console.log("Login: Login successful, preparing to redirect to dashboard");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Log the entire localStorage state after successful login
        console.log("Login: localStorage state after successful login:");
        const storageState: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            storageState[key] = localStorage.getItem(key);
          }
        }
        console.log(storageState);
        
        // Add a delay to ensure the login state is fully processed
        setTimeout(() => {
          // Verify again that login state is properly set
          const loginStateCheck = localStorage.getItem('akii-is-logged-in');
          console.log("Login: Final login state check before redirect:", {
            isLoggedIn: loginStateCheck,
            userId: localStorage.getItem('akii-auth-user-id'),
            timestamp: localStorage.getItem('akii-login-timestamp')
          });
          
          // Navigate to the dashboard with replace: true to prevent back navigation to login
          console.log("Login: Now redirecting to dashboard");
          navigate('/dashboard', { replace: true });
        }, 300);
      } else {
        console.error("Login: Login failed", error);
        toast({
          title: "Login failed",
          description: error?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Login: Unexpected error during login", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // For development mode - allow instant login
  const handleDevLogin = async () => {
    setIsLoading(true);
    
    try {
      console.log("Login: Using development mode instant login");
      
      // Debug the localStorage state before login
      console.log("Login: localStorage state before login:");
      const beforeState: Record<string, string | null> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          beforeState[key] = localStorage.getItem(key);
        }
      }
      console.log(beforeState);
      
      // Use direct login with the hardcoded credentials
      const { success, error } = await directLogin("josef@holm.com", "password");
      
      if (success) {
        console.log("Login: Dev login successful, preparing to redirect");
        
        // Debug the localStorage state after login
        console.log("Login: localStorage state after login:");
        const afterState: Record<string, string | null> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            afterState[key] = localStorage.getItem(key);
          }
        }
        console.log(afterState);
        
        toast({
          title: "Dev login successful",
          description: "Welcome to development mode!",
        });
        
        // Add a more significant delay to ensure authentication state is properly set
        console.log("Login: Waiting for auth state to stabilize before redirecting");
        setTimeout(() => {
          // Verify login state is properly set
          const loginStateCheck = localStorage.getItem('akii-is-logged-in');
          console.log("Login: Final login state check before redirect:", {
            isLoggedIn: loginStateCheck,
            userId: localStorage.getItem('akii-auth-user-id'),
            timestamp: localStorage.getItem('akii-login-timestamp')
          });
          
          console.log("Login: Now navigating to /dashboard with replace:true");
          // Navigate to the dashboard with replace:true to prevent navigation history issues
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        console.error("Login: Dev login failed", error);
        toast({
          title: "Dev login failed",
          description: error?.message || "Could not create development profile",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("Login: Unexpected error during dev login", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Login error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left side - Login form */}
      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Please enter your details to sign in to your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDevLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Dev Mode Login"}
            </Button>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
              onClick={() => {
                // Emergency direct localStorage login
                const userId = "b574f273-e0e1-4cb8-8c98-f5a7569234c8";
                const email = "dev@example.com";
                
                console.log('Emergency login: Starting direct login process');
                
                // Use the more reliable setLoggedIn function instead of direct localStorage manipulation
                setLoggedIn(userId, email);
                
                // CRITICAL FIX: Set emergency login state
                const emergencyTimestamp = Date.now();
                localStorage.setItem('akii-auth-emergency', 'true');
                localStorage.setItem('akii-auth-emergency-time', emergencyTimestamp.toString());
                
                // Store a fallback user object
                localStorage.setItem('akii-auth-fallback-user', JSON.stringify({
                  id: userId,
                  email: email,
                  name: 'Dev User',
                  role: 'admin',
                  timestamp: emergencyTimestamp
                }));
                
                // Force-set all required values synchronously
                localStorage.setItem('akii-is-logged-in', 'true');
                localStorage.setItem('akii-auth-user-id', userId);
                localStorage.setItem('akii-login-timestamp', emergencyTimestamp.toString());
                localStorage.setItem('akii-session-duration', (8 * 60 * 60 * 1000).toString());
                localStorage.setItem('akii-session-expiry', (emergencyTimestamp + 8 * 60 * 60 * 1000).toString());
                localStorage.setItem('akii-auth-user-email', email);
                
                // Set in sessionStorage too
                sessionStorage.setItem('akii-is-logged-in', 'true');
                sessionStorage.setItem('akii-auth-user-id', userId);
                
                // Verify the localStorage state immediately
                const isLoggedInSet = localStorage.getItem('akii-is-logged-in') === 'true';
                const userIdSet = localStorage.getItem('akii-auth-user-id') === userId;
                const timestampSet = !!localStorage.getItem('akii-login-timestamp');
                
                console.log('Emergency login: Immediate verification', {
                  isLoggedIn: isLoggedInSet,
                  userId: userIdSet,
                  timestamp: timestampSet,
                  success: isLoggedInSet && userIdSet && timestampSet
                });
                
                // Log the entire localStorage state after setting
                console.log('Emergency login: localStorage state after setting:');
                const storageState: Record<string, string | null> = {};
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key) {
                    storageState[key] = localStorage.getItem(key);
                  }
                }
                console.log(storageState);
                
                // Navigate directly to dashboard
                console.log('Emergency login: Now navigating to dashboard');
                navigate('/dashboard', { replace: true });
              }}
            >
              Emergency Direct Login
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/auth/reset-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Image/Brand */}
      <div className="hidden lg:block lg:w-1/2 bg-primary">
        <div className="flex h-full items-center justify-center p-12">
          <div className="max-w-lg text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Power your business with AI
            </h2>
            <p className="text-lg mb-8">
              Create, train, and deploy AI agents across multiple channels to enhance your customer experience.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-medium mb-1">Web Chat</div>
                <p className="text-sm opacity-80">
                  Engage website visitors with customized AI chat.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-medium mb-1">WhatsApp</div>
                <p className="text-sm opacity-80">
                  Connect with customers on their favorite messaging app.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-medium mb-1">Mobile</div>
                <p className="text-sm opacity-80">
                  Support users on the go with mobile-friendly AI.
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="font-medium mb-1">E-commerce</div>
                <p className="text-sm opacity-80">
                  Boost sales with AI product recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
