import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

// Declare global window property for circuit breaker state
declare global {
  interface Window {
    circuitBroken?: boolean;
  }
}

// Login form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().default(false),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the Supabase auth context
  const { signIn, user } = useSupabaseAuth();
  
  // Clear any redirect loops on initial load
  useEffect(() => {
    // Clear any circuit breaker or redirect tracking
    sessionStorage.removeItem('redirect-count');
    sessionStorage.removeItem('last-redirect-time');
    sessionStorage.removeItem('navigation-history');
    sessionStorage.removeItem('login-page-visits');
    
    // Reset circuit breaker state if present
    if (window.circuitBroken) {
      window.circuitBroken = false;
    }
    
    console.log('Login: Cleared any potential redirect loop state');
  }, []);
  
  // If user is already logged in, redirect to dashboard or the page they came from
  useEffect(() => {
    if (user) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

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
      console.log("Login: Attempting login with email:", values.email);
      
      // Use signIn from the Supabase auth context
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error("Login: Login failed", error);
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        console.log("Login: Login successful");
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Auth state change will trigger navigation in the auth context
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
      // Keep loading state active for a moment to allow auth sync to happen
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }

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
                        autoComplete="email"
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
                        autoComplete="current-password"
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
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>

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
