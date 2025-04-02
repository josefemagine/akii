import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  supabase,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithOAuth,
  resetPasswordForEmail,
  updatePassword,
  getCurrentSession,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  ensureUserProfile,
  type User,
  type Session,
  type UserProfile,
  type AuthResponse
} from "@/lib/supabase-auth";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<AuthResponse<any>>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<AuthResponse<any>>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<AuthResponse<any>>;
  signInWithGithub: () => Promise<AuthResponse<any>>;
  resetPassword: (email: string) => Promise<AuthResponse<any>>;
  updatePassword: (password: string) => Promise<AuthResponse<any>>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<AuthResponse<UserProfile>>;
}

const defaultAuthState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  isAdmin: false
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    async function initializeAuth() {
      try {
        setState(prev => ({ ...prev, isLoading: true }));
        
        // Get current session
        const { data: session } = await getCurrentSession();
        
        if (!session) {
          setState({
            ...defaultAuthState,
            isLoading: false
          });
          return;
        }
        
        // Get user
        const { data: user } = await getCurrentUser();
        
        if (!user) {
          setState({
            ...defaultAuthState,
            isLoading: false
          });
          return;
        }
        
        // Get or create profile
        const { data: profile } = await ensureUserProfile(user);
        const isAdmin = profile?.role === 'admin';
        
        setState({
          user,
          profile,
          session,
          isLoading: false,
          isAdmin
        });
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState({
          ...defaultAuthState,
          isLoading: false
        });
      }
    }

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          initializeAuth();
        } else if (event === 'SIGNED_OUT') {
          setState({
            ...defaultAuthState,
            isLoading: false
          });
        }
      }
    );

    initializeAuth();

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign in handler
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authSignIn(email, password);
      
      if (response.error) {
        toast({
          title: "Sign in failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed in successfully",
          variant: "default",
        });
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign in error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Sign up handler
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authSignUp(email, password, metadata);
      
      if (response.error) {
        toast({
          title: "Sign up failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up successful",
          description: "Please check your email to confirm your account",
          variant: "default",
        });
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign up error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Sign out handler
  const signOut = async () => {
    try {
      const response = await authSignOut();
      
      if (response.error) {
        toast({
          title: "Sign out failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out successfully",
          variant: "default",
        });
        navigate('/login');
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Sign out error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { error: error as Error };
    }
  };

  // OAuth handlers
  const signInWithGoogle = () => signInWithOAuth('google');
  const signInWithGithub = () => signInWithOAuth('github');

  // Password reset
  const resetPassword = async (email: string) => {
    try {
      const response = await resetPasswordForEmail(email);
      
      if (response.error) {
        toast({
          title: "Password reset failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for the reset link",
          variant: "default",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Password reset error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  // Update profile
  const updateProfileHandler = async (profile: Partial<UserProfile>) => {
    try {
      const response = await updateUserProfile(profile);
      
      if (response.error) {
        toast({
          title: "Profile update failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated successfully",
          variant: "default",
        });
        
        // Update local state
        if (response.data) {
          setState(prev => ({ 
            ...prev, 
            profile: response.data,
            isAdmin: response.data.role === 'admin'
          }));
        }
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Profile update error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { data: null, error: error as Error };
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    updatePassword,
    updateProfile: updateProfileHandler
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 