import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, User as UserIcon, Moon, Sun, LogOut, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-compatibility";
import { toast } from "@/components/ui/use-toast";
import { useDirectAuth } from "@/contexts/direct-auth-context";
import { supabase } from "@/lib/supabase";
import { ensureDashboardAccess } from "@/lib/production-recovery";

// Control debug logging with a single flag
const DEBUG_AUTH = false;

interface HeaderProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick = () => {},
  isAdmin = false,
  theme = "dark",
  onThemeChange,
}) => {
  // Use both auth contexts for compatibility
  const compatAuth = useAuth();
  const { profile, signOut, isAdmin: contextIsAdmin, refreshAuthState } = useDirectAuth();
  const previousAuthState = useRef<boolean>(false);
  const lastCheckTime = useRef<number>(Date.now());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const authStatusChecked = useRef<boolean>(false);
  
  const navigate = useNavigate();
  
  // Log with debug control
  const logDebug = (message: string, ...args: any[]) => {
    if (DEBUG_AUTH) {
      console.log(`[Header] ${message}`, ...args);
    }
  };
  
  // Debounced refresh function to prevent excessive calls - now with better rate limiting
  const debouncedRefresh = useCallback(() => {
    // Clear any pending debounce
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    // Check if we've refreshed recently
    const now = Date.now();
    if (now - lastCheckTime.current < 5000) { // Increased to 5 seconds
      // Schedule a refresh after the debounce period
      debounceTimeout.current = setTimeout(() => {
        logDebug('Executing debounced auth refresh');
        refreshAuthState();
        lastCheckTime.current = Date.now();
      }, 5000); // Increased debounce time
      return;
    }
    
    // If we haven't refreshed recently, do it now
    logDebug('Immediate auth refresh');
    refreshAuthState();
    lastCheckTime.current = now;
  }, [refreshAuthState]);
  
  // Force check login state on mount and periodically
  useEffect(() => {
    // Skip if already checked recently to avoid duplicate calls
    if (authStatusChecked.current) {
      return;
    }
    
    const checkAuthStatus = async () => {
      // Skip if already in progress
      if (authStatusChecked.current) {
        return;
      }
      
      authStatusChecked.current = true;
      logDebug('Checking auth status');
      
      try {
        // Import refreshSession dynamically
        const { refreshSession } = await import('@/lib/direct-db-access');
        
        // Force check if emergency auth is set
        const emergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
        const isLoggedIn = localStorage.getItem('akii-is-logged-in') === 'true';
        
        if (emergencyAuth || isLoggedIn) {
          // First try to get a session from Supabase
          const { data } = await supabase.auth.getSession();
          
          if (data?.session) {
            logDebug('Found valid session, refreshing auth state');
            debouncedRefresh();
            return;
          }
          
          // If no session but we have emergency auth, ensure dashboard access
          if (window.location.hostname === 'www.akii.com' || window.location.hostname === 'akii.com') {
            ensureDashboardAccess();
          }
          
          // Force refresh to ensure state is updated
          debouncedRefresh();
          
          // Also force a session refresh but only if logged in
          if (isLoggedIn) {
            refreshSession();
          }
        }
      } finally {
        // Reset the check flag after a delay to allow future checks
        setTimeout(() => {
          authStatusChecked.current = false;
        }, 5000);
      }
    };
    
    // Check immediately on mount
    checkAuthStatus();
    
    // And set up a periodic check - use a longer interval to reduce load
    const interval = setInterval(checkAuthStatus, 120000); // Increased to 2 minutes from 30 seconds
    
    return () => clearInterval(interval);
  }, [debouncedRefresh]);

  // Set up Supabase auth listener using the official SDK method
  useEffect(() => {
    logDebug('Setting up Supabase auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      logDebug('Auth state change event:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Update local storage with session data for emergency recovery
        if (session) {
          localStorage.setItem('akii-auth-emergency', 'true');
          localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
          localStorage.setItem('akii-is-logged-in', 'true');
          
          if (session.user) {
            localStorage.setItem('akii-auth-user-id', session.user.id);
            localStorage.setItem('akii-auth-emergency-email', session.user.email || '');
          }
          
          // Store session data for recovery
          try {
            const sessionData = {
              timestamp: Date.now(),
              userId: session.user?.id,
              email: session.user?.email,
              hasSession: true
            };
            localStorage.setItem('akii-session-data', JSON.stringify(sessionData));
          } catch (e) {
            console.error('[Header] Error storing session data', e);
          }
        }
        
        debouncedRefresh();
      } else if (event === 'SIGNED_OUT') {
        // Clear emergency auth data
        localStorage.removeItem('akii-auth-emergency');
        localStorage.removeItem('akii-auth-emergency-time');
        localStorage.removeItem('akii-auth-emergency-email');
        localStorage.removeItem('akii-is-logged-in');
        localStorage.removeItem('akii-auth-user-id');
        localStorage.removeItem('akii-session-data');
        
        debouncedRefresh();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [debouncedRefresh]);

  // Listen for auth events and storage changes with reduced frequency
  useEffect(() => {
    previousAuthState.current = !!compatAuth.user;
    
    // Handle localStorage changes
    const handleAuthChange = (event: StorageEvent) => {
      if (!event.key) return;
      
      // Only care about specific auth-related keys
      const isAuthKey = event.key.includes('auth') || 
                       event.key.includes('sb-') || 
                       event.key.includes('akii') || 
                       event.key.includes('supabase');
      
      if (isAuthKey) {
        logDebug('Auth-related localStorage change detected:', event.key);
        debouncedRefresh();
      }
    };
    
    // Handle custom auth events
    const handleAuthEvent = async (event: any) => {
      logDebug('Custom auth event received', event?.type);
      
      // Check if event indicates we're logged in
      if (event?.detail?.isLoggedIn) {
        // Try to get session directly from Supabase
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // If we don't have a session, ensure emergency auth is set
          localStorage.setItem('akii-auth-emergency', 'true');
          localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
          
          if (event?.detail?.email) {
            localStorage.setItem('akii-auth-emergency-email', event.detail.email);
          }
          
          if (event?.detail?.userId) {
            localStorage.setItem('akii-auth-user-id', event.detail.userId);
          }
          
          if (window.location.hostname === 'www.akii.com' || window.location.hostname === 'akii.com') {
            ensureDashboardAccess();
          }
        }
        
        // Import refreshSession dynamically
        const { refreshSession } = await import('@/lib/direct-db-access');
        refreshSession();
        debouncedRefresh();
      }
    };
    
    // Add event listeners for auth changes
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('akii-login-state-changed', handleAuthEvent as EventListener);
    window.addEventListener('akii-auth-changed', handleAuthEvent as EventListener);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('akii-login-state-changed', handleAuthEvent as EventListener);
      window.removeEventListener('akii-auth-changed', handleAuthEvent as EventListener);
    };
  }, [compatAuth.user, debouncedRefresh]);

  // Handle sign out using direct auth
  const handleSignOut = async () => {
    try {
      // First clear any emergency auth data
      localStorage.removeItem('akii-auth-emergency');
      localStorage.removeItem('akii-auth-emergency-time');
      localStorage.removeItem('akii-auth-emergency-email');
      localStorage.removeItem('akii-is-logged-in');
      localStorage.removeItem('akii-auth-user-id');
      
      // Then use the sign out function from context
      if (signOut) {
        await signOut();
      } else if (compatAuth.signOut) {
        // Fallback to compatibility layer if direct auth fails
        await compatAuth.signOut();
      }
      
      // Call sign out from Supabase directly
      logDebug('Calling Supabase sign out method');
      await supabase.auth.signOut();
      
      navigate("/");
    } catch (error) {
      console.error('[Header] Error signing out:', error);
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("dashboard-theme", newTheme);
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Get profile from direct auth first, fallback to compatibility layer
  const displayProfile = profile || compatAuth.profile;
  
  const displayName = 
    displayProfile?.first_name || 
    displayProfile?.display_name || 
    'User';
  
  const avatarUrl = displayProfile?.avatar_url;
  const firstInitial = displayName.charAt(0).toUpperCase();
  
  // Determine if user is admin from props, direct context, or compat layer
  const userIsAdmin = isAdmin || contextIsAdmin || !!compatAuth.isAdmin;

  // Force-check authentication state when the header renders
  useEffect(() => {
    if (!compatAuth.user && !profile) {
      const isLoggedIn = localStorage.getItem('akii-is-logged-in') === 'true';
      const hasEmergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
      
      if (isLoggedIn || hasEmergencyAuth) {
        console.log('[Header] Found login state in localStorage but context is empty, forcing refresh');
        
        // Try to get session directly
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            console.log('[Header] Valid session found during initial check');
          } else {
            console.log('[Header] No valid session found during initial check, using emergency auth');
          }
          refreshAuthState();
        });
      }
    }
  }, [compatAuth.user, profile, refreshAuthState]);

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <div className="md:hidden mr-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="mr-4 md:flex">
          <Link to="/dashboard" className="flex items-center">
            <Circle className="h-6 w-6 fill-primary text-primary" />
            <span className="ml-2 text-xl font-bold">Akii</span>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {userIsAdmin && (
            <div className="mr-2 px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 rounded">
              Admin
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="rounded-full"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full overflow-hidden"
              >
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="User's profile picture" />
                  ) : (
                    <AvatarFallback>
                      {firstInitial || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium ml-1 hidden md:inline-block">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header; 