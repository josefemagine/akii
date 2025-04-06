import React, { useEffect, useState, useRef } from "react";
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
import supabase from "@/lib/supabase";
import { ensureDashboardAccess } from "@/lib/production-recovery";

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
  const [forceRefresh, setForceRefresh] = useState(0);
  
  const navigate = useNavigate();
  
  // Force check login state on mount and periodically
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Import refreshSession dynamically
      const { refreshSession } = await import('@/lib/direct-db-access');
      
      // Force check if emergency auth is set
      const emergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
      const isLoggedIn = localStorage.getItem('akii-is-logged-in') === 'true';
      
      if (emergencyAuth || isLoggedIn) {
        console.log('[Header] Emergency auth or login detected, ensuring header state is updated');
        
        // First try to get a session from Supabase
        const { data } = await supabase.auth.getSession();
        
        if (data?.session) {
          console.log('[Header] Valid Supabase session found, updating UI');
          refreshAuthState();
          setForceRefresh(prev => prev + 1);
          return;
        }
        
        // If no session but we have emergency auth, ensure dashboard access
        if (window.location.hostname === 'www.akii.com' || window.location.hostname === 'akii.com') {
          ensureDashboardAccess();
        }
        
        // Force refresh to ensure state is updated
        refreshAuthState();
        
        // Also force a session refresh
        refreshSession();
      }
    };
    
    // Check immediately on mount
    checkAuthStatus();
    
    // And set up a periodic check
    const interval = setInterval(checkAuthStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [refreshAuthState]);

  // Set up Supabase auth listener using the official SDK method
  useEffect(() => {
    console.log('[Header] Setting up official Supabase auth listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[Header] Supabase auth event:", event, session ? "Session exists" : "No session");
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("[Header] User signed in or token refreshed, syncing UI");
        
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
        
        refreshAuthState();
        setForceRefresh(prev => prev + 1);
      } else if (event === 'SIGNED_OUT') {
        console.log("[Header] User signed out, updating UI");
        
        // Clear emergency auth data
        localStorage.removeItem('akii-auth-emergency');
        localStorage.removeItem('akii-auth-emergency-time');
        localStorage.removeItem('akii-auth-emergency-email');
        localStorage.removeItem('akii-is-logged-in');
        localStorage.removeItem('akii-auth-user-id');
        localStorage.removeItem('akii-session-data');
        
        refreshAuthState();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAuthState]);

  // Listen for auth events and storage changes
  useEffect(() => {
    console.log("[Header] Auth state updated from context:", { 
      hasUser: !!compatAuth.user, 
      userId: compatAuth.user?.id,
      hasSession: !!compatAuth.session,
      previousState: previousAuthState.current
    });
    
    previousAuthState.current = !!compatAuth.user;
    
    // Handle localStorage changes
    const handleAuthChange = (event: StorageEvent) => {
      if (event.key?.includes('auth') || 
          event.key?.includes('sb-') || 
          event.key?.includes('akii') || 
          event.key?.includes('supabase')) {
        console.log('[Header] Auth-related localStorage change detected:', event.key);
        refreshAuthState();
        setForceRefresh(prev => prev + 1);
      }
    };
    
    // Handle custom auth events
    const handleAuthEvent = async (event: any) => {
      // Import refreshSession dynamically
      const { refreshSession } = await import('@/lib/direct-db-access');
      
      console.log('[Header] Auth state changed event received:', event?.detail);
      
      // Check if event indicates we're logged in
      if (event?.detail?.isLoggedIn) {
        console.log('[Header] Login event received, updating UI state');
        
        // Try to get session directly from Supabase
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('[Header] Valid session found after login event');
        } else {
          console.log('[Header] No valid session found after login event, using emergency auth');
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
      }
      
      refreshSession();
      refreshAuthState();
      setForceRefresh(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('akii-login-state-changed', handleAuthEvent);
    window.addEventListener('akii-auth-changed', handleAuthEvent);
    window.addEventListener('akii-production-recovery', handleAuthEvent);
    
    // Setup a periodic check in production to ensure header state is correct
    let checkInterval: NodeJS.Timeout | null = null;
    
    if (window.location.hostname === 'www.akii.com' || window.location.hostname === 'akii.com') {
      checkInterval = setInterval(async () => {
        const emergencyAuth = localStorage.getItem('akii-auth-emergency') === 'true';
        const isLoggedIn = localStorage.getItem('akii-is-logged-in') === 'true';
        const hasAuthContext = !!compatAuth.user;
        
        if ((emergencyAuth || isLoggedIn) && !hasAuthContext) {
          console.log('[Header] Auth state mismatch detected, verifying session status');
          
          // Check if we have a real session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('[Header] Valid session found, forcing UI update');
          } else {
            console.log('[Header] No valid session found, using emergency recovery');
            ensureDashboardAccess();
          }
          
          refreshAuthState();
          setForceRefresh(prev => prev + 1);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('akii-login-state-changed', handleAuthEvent);
      window.removeEventListener('akii-auth-changed', handleAuthEvent);
      window.removeEventListener('akii-production-recovery', handleAuthEvent);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [compatAuth.user, compatAuth.session, refreshAuthState]);

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
      console.log('[Header] Calling Supabase sign out method');
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