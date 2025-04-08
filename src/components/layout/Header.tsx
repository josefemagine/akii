import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Circle, ChevronDown, Monitor, Smartphone, MessageCircle, Send, ShoppingBag, Globe, Puzzle, Share, Workflow } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNavigation from "./MobileNavigation";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import LoginModal from "@/components/auth/LoginModal";
import JoinModal from "@/components/auth/JoinModal";
import PasswordReset from "@/components/auth/PasswordReset";
import { supabase } from "@/lib/supabase";
import AkiiLogo from "@/components/shared/AkiiLogo";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
};

interface HeaderProps {}

const Header = ({}: HeaderProps) => {
  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  
  // Auth context
  const auth = useAuth();
  const navigate = useNavigate();
  
  // Track authenticated status in local state for more reliable UI updates
  // Default to undefined to avoid initial flash
  const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState<boolean | undefined>(undefined);
  
  // Use a ref to track if session check is in progress
  const sessionCheckInProgress = useRef(false);
  const lastSessionCheckTime = useRef(0);
  
  // One-time direct check on mount
  useEffect(() => {
    const checkAuthState = async () => {
      // Avoid duplicate checks
      if (sessionCheckInProgress.current) return;
      
      // Throttle checks to once per second
      const now = Date.now();
      if (now - lastSessionCheckTime.current < 1000) return;
      
      try {
        sessionCheckInProgress.current = true;
        lastSessionCheckTime.current = now;
        
        // Check localStorage first for quick feedback
        let hasToken = false;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase.auth.token') || key.includes('sb-'))) {
              hasToken = true;
              break;
            }
          }
        } catch (e) {
          console.error("Error checking localStorage:", e);
        }
        
        // If we found a token, immediately set auth to avoid UI flash
        if (hasToken && isAuthenticatedLocal === undefined) {
          setIsAuthenticatedLocal(true);
        }
        
        // Then verify with an actual session check
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;
        
        // Only log if there's a meaningful change to report
        if (hasSession !== isAuthenticatedLocal) {
          console.log("[Header] Direct session check:", { 
            hasSession, 
            sessionExpires: data.session?.expires_at,
            previousState: isAuthenticatedLocal 
          });
        }
        
        // Update state if it's different
        if (hasSession !== isAuthenticatedLocal) {
          setIsAuthenticatedLocal(hasSession);
        }
      } catch (e) {
        console.error("Error in session check:", e);
      } finally {
        sessionCheckInProgress.current = false;
      }
    };
    
    checkAuthState();
  }, [isAuthenticatedLocal]);
  
  // Update local auth state whenever auth context changes - with reduced logging
  useEffect(() => {
    const contextAuthState = Boolean(auth.user) || Boolean(auth.session);
    
    // Only update and log if there's an actual change
    if (contextAuthState !== isAuthenticatedLocal) {
      console.log("[Header] Auth state updated from context:", { 
        hasUser: Boolean(auth.user),
        userId: auth.user?.id,
        hasSession: Boolean(auth.session),
        previousState: isAuthenticatedLocal
      });
      
      setIsAuthenticatedLocal(contextAuthState);
    }
  }, [auth.user, auth.session, isAuthenticatedLocal]);
  
  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = async (event: any) => {
      // Only log important events to reduce console noise
      if (event.type === 'SIGNED_IN' || event.type === 'SIGNED_OUT') {
        console.log("Auth state changed event received in Header", event.type || 'unknown');
      }
      
      // Deduplicate session checks using a ref
      if (sessionCheckInProgress.current) return;
      
      // Check for Auth reset events separately
      if (event.type === 'akii:auth:reset') {
        console.log("[Header] Auth reset event received, clearing local state");
        setIsAuthenticatedLocal(undefined);
        return;
      }
      
      // Only perform direct session check for important auth events
      if (event.type === 'SIGNED_IN' || event.type === 'SIGNED_OUT' || event.type === 'TOKEN_REFRESHED') {
        try {
          // Debounce session checks
          const now = Date.now();
          if (now - lastSessionCheckTime.current < 1000) return;
          
          sessionCheckInProgress.current = true;
          lastSessionCheckTime.current = now;
          
          const { data } = await supabase.auth.getSession();
          const hasDirectSession = !!data.session;
          
          // Update authentication state based on direct session check
          if (event.type === 'SIGNED_IN' || hasDirectSession) {
            setIsAuthenticatedLocal(true);
          } else if (event.type === 'SIGNED_OUT') {
            setIsAuthenticatedLocal(false);
          }
        } catch (e) {
          console.error("Error checking session after event:", e);
        } finally {
          sessionCheckInProgress.current = false;
        }
      }
    };
    
    // Register a direct listener on Supabase auth
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Create a unified event object to handle both direct and custom events
      handleAuthStateChange({ type: event, session });
    });
    
    // Listen for our custom auth reset event
    const handleAuthReset = () => handleAuthStateChange({ type: 'akii:auth:reset' });
    window.addEventListener('akii:auth:reset', handleAuthReset);
    
    return () => {
      // Clean up all listeners
      authListener?.subscription.unsubscribe();
      window.removeEventListener('akii:auth:reset', handleAuthReset);
    };
  }, []);
  
  // Handle sign out with better cleanup
  const handleSignOut = async (scope: 'global' | 'local' | 'others' = 'global') => {
    // Immediately set local state to unauthenticated for fast UI feedback
    setIsAuthenticatedLocal(false);
    
    // Manually clear tokens for immediate UI feedback
    try {
      const authKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('akii-auth') ||
          key.includes('token')
        )) {
          authKeys.push(key);
        }
      }
      
      if (authKeys.length > 0) {
        authKeys.forEach(key => localStorage.removeItem(key));
        console.log(`[Header] Cleared ${authKeys.length} auth tokens from localStorage`);
      }
    } catch (e) {
      console.error("Error clearing localStorage:", e);
    }
    
    // Call auth context signOut
    auth.signOut(scope).catch(error => {
      console.error("Error during logout:", error);
    });
    
    // Force navigation to home page
    navigate('/', { replace: true });
  };

  // UI handlers
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openLoginModal = () => {
    if (isAuthenticatedLocal) return;
    setLoginModalOpen(true);
    closeMobileMenu();
  };

  const openJoinModal = () => {
    setJoinModalOpen(true);
    closeMobileMenu();
  };

  const openPasswordReset = () => {
    setPasswordResetOpen(true);
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <AkiiLogo />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Apps & Integrations <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/products/private-ai-api" className="font-medium flex items-center gap-2">
                  <Puzzle className="h-4 w-4" /> Private AI API
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/web-chat" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> Web Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/mobile-chat" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" /> Mobile Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/whatsapp-chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/telegram-chat" className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> Telegram Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/shopify-chat" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Shopify Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/wordpress-chat" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" /> WordPress Chat
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/integrations/zapier" className="flex items-center gap-2">
                  <Share className="h-4 w-4" /> Zapier Integration
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/integrations/n8n" className="flex items-center gap-2">
                  <Workflow className="h-4 w-4" /> n8n Integration
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink href="/plans">Plans</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticatedLocal ? (
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                className="hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600"
                asChild
              >
                <Link to="/dashboard" className="flex-1 text-sm font-medium">
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="hidden md:flex items-center gap-1"
                  >
                    Log Out <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSignOut('local')}>
                    This Device Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSignOut('others')}>
                    Other Devices Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSignOut('global')}>
                    All Devices
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="hidden md:flex"
                onClick={openLoginModal}
              >
                Sign In
              </Button>
              <Button className="hidden md:flex" onClick={openJoinModal}>
                Get Started
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        isAuthenticated={isAuthenticatedLocal}
        onLogin={openLoginModal}
        onJoin={openJoinModal}
        onLogout={() => handleSignOut('global')}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenJoin={() => {
          setLoginModalOpen(false);
          setJoinModalOpen(true);
        }}
        onOpenPasswordReset={() => {
          setLoginModalOpen(false);
          setPasswordResetOpen(true);
        }}
      />

      <JoinModal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onOpenLogin={() => {
          setJoinModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      <PasswordReset
        isOpen={passwordResetOpen}
        onClose={() => setPasswordResetOpen(false)}
        onOpenLogin={() => {
          setPasswordResetOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </header>
  );
};

export default Header;


