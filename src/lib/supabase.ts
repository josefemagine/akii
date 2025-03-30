import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Debug environment variables
console.log("Vite Environment Variables:", {
  MODE: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  Available_Vars: Object.keys(import.meta.env).filter((key) =>
    key.startsWith("VITE_"),
  ),
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseProjectId =
  import.meta.env.SUPABASE_PROJECT_ID || "injxxchotrvgvvzelhvj";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

console.log("Using Supabase Project ID:", supabaseProjectId);

console.log("Initializing Supabase client with URL:", supabaseUrl);
console.log("Supabase key available:", !!supabaseAnonKey);

// Create the Supabase client with persistence config
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key);
          console.log(
            `Storage: Retrieved ${key}`,
            item ? "(exists)" : "(null)",
          );
          return item;
        } catch (error) {
          console.error("Error accessing localStorage:", error);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          console.log(`Storage: Setting ${key}`);
          localStorage.setItem(key, value);
        } catch (error) {
          console.error("Error writing to localStorage:", error);
        }
      },
      removeItem: (key) => {
        try {
          console.log(`Storage: Removing ${key}`);
          localStorage.removeItem(key);
        } catch (error) {
          console.error("Error removing from localStorage:", error);
        }
      },
    },
  },
});

// Helper function to handle hash redirect
export const handleHashRedirect = async () => {
  if (!isBrowser) return null;

  const hash = window.location.hash;
  if (hash) {
    try {
      console.log("Processing hash redirect...");
      // Parse the hash fragment
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      console.log("Tokens found:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      if (accessToken && refreshToken) {
        console.log("Setting session with tokens...");
        // Set the session in Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          throw error;
        }

        if (session) {
          console.log("Session set successfully");
          // Store session in localStorage as a backup
          try {
            localStorage.setItem(
              "akii-auth-backup",
              JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                timestamp: new Date().toISOString(),
              }),
            );
            console.log("Backup session stored in localStorage");
          } catch (e) {
            console.error("Failed to store backup session:", e);
          }

          // Clear the hash but don't change the URL yet
          // Let the callback handler handle the redirect
          window.history.replaceState({}, "", window.location.pathname);
          return session;
        }
      }
    } catch (error) {
      console.error("Error handling hash redirect:", error);
    }
  }
  return null;
};

// Helper function to check if we're in a browser environment
export const isBrowser = typeof window !== "undefined";

// Helper function to get the current session
export const getCurrentSession = async () => {
  if (!isBrowser) return null;

  try {
    console.log("Getting current session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      throw error;
    }

    console.log("Current session:", session ? "Found" : "Not found");

    // If no session found, try to recover from backup
    if (!session) {
      const backupSession = localStorage.getItem("akii-auth-backup");
      if (backupSession) {
        try {
          console.log("Attempting to recover session from backup");
          const parsedBackup = JSON.parse(backupSession);
          if (parsedBackup.access_token && parsedBackup.refresh_token) {
            console.log("Restoring session from backup");
            const result = await supabase.auth.setSession({
              access_token: parsedBackup.access_token,
              refresh_token: parsedBackup.refresh_token,
            });

            if (result.error) {
              console.error(
                "Failed to restore session from backup:",
                result.error,
              );
              localStorage.removeItem("akii-auth-backup");
            } else if (result.data.session) {
              console.log("Successfully restored session from backup");
              return result.data.session;
            }
          }
        } catch (e) {
          console.error("Error parsing backup session:", e);
          localStorage.removeItem("akii-auth-backup");
        }
      }
    }

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

// Helper function to sign in with Google
export const loginWithGoogle = async () => {
  if (!isBrowser) return;

  try {
    console.log("Starting Google OAuth sign in...");
    const redirectUrl = `${window.location.origin}/auth/callback`;
    console.log("Redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error initiating Google OAuth:", error);
      throw error;
    }

    console.log("OAuth response:", data);
    // If we have a redirect URL, use it
    if (data?.url) {
      console.log("Redirecting to:", data.url);
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Helper function to sign out
export const signOut = async () => {
  if (!isBrowser) return;

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear any backup sessions
    localStorage.removeItem("akii-auth-backup");

    window.location.href = "/";
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Authentication helper functions
export const auth = {
  login: async (email: string, password: string) => {
    console.log("Auth helper: login with email", email);
    return await supabase.auth.signInWithPassword({ email, password });
  },
  register: async (email: string, password: string) => {
    console.log("Auth helper: register with email", email);
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
  verifyOtp: async (
    email: string,
    token: string,
    type: "signup" | "recovery",
  ) => {
    console.log("Auth helper: verify OTP for", email);
    return await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
  },
  resetPassword: async (email: string) => {
    console.log("Auth helper: reset password for", email);
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
  },
  updatePassword: async (password: string) => {
    console.log("Auth helper: update password");
    return await supabase.auth.updateUser({
      password,
    });
  },
  logout: async () => {
    console.log("Auth helper: logout");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      throw error;
    }
  },
  getCurrentUser: async () => {
    console.log("Auth helper: get current user");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error.message);
      throw error;
    }
    return user;
  },
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    console.log("Auth helper: setting up auth state change listener");
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Helper function to check session persistence
export const checkSessionPersistence = async () => {
  if (!isBrowser) return false;

  try {
    console.log("Checking session persistence...");
    // Check Supabase session directly
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking session persistence:", error);
      return false;
    }

    if (session) {
      console.log("Session found and valid");
      return true;
    }

    // As a fallback, check localStorage
    const storedSession = localStorage.getItem("akii-auth");
    if (!storedSession) {
      console.log("No stored session found in localStorage");
      return false;
    }

    // Try to parse the stored session to see if it's valid
    try {
      const parsedSession = JSON.parse(storedSession);
      if (parsedSession && parsedSession.access_token) {
        console.log("Found valid session in localStorage");
        return true;
      }
    } catch (e) {
      console.error("Error parsing stored session:", e);
    }

    console.log("No valid session found");
    return false;
  } catch (error) {
    console.error("Error checking session persistence:", error);
    return false;
  }
};
