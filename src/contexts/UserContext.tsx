import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase.tsx";

// Define the context type
interface UserContextType {
  user: User | null;
  session: Session | null;
  sessionLoaded: boolean;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  session: null,
  sessionLoaded: false,
});

// Provider props type
interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider component to handle Supabase authentication
 * This provider:
 * - Gets the initial session on mount
 * - Subscribes to auth state changes
 * - Avoids calling getUser() directly (uses session data instead)
 * - Works in both client and server environments
 */
export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  useEffect(() => {
    // Skip if window is not defined (server-side rendering)
    if (typeof window === "undefined") {
      return;
    }

    // Function to set authentication state
    const setAuthState = (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      setSessionLoaded(true);
    };

    // Get initial session on component mount
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          // Handle session error (only log in development)
          if (process.env.NODE_ENV === "development") {
            console.debug("Error fetching initial session:", error.message);
          }
          setSessionLoaded(true);
          return;
        }
        
        // Set initial state from session
        setAuthState(data.session);
      } catch (err) {
        // Set session loaded even if there's an error to avoid infinite loading
        setSessionLoaded(true);
        
        // Only log in development
        if (process.env.NODE_ENV === "development") {
          console.error("Error in auth initialization:", err);
        }
      }
    };

    // Initialize auth on component mount
    initializeAuth();

    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState(session);
      }
    );

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, session, sessionLoaded }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  
  return context;
};

export default UserContext; 