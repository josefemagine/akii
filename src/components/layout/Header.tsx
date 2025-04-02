import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Circle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileNavigation from "./MobileNavigation";
import { useAuth } from "@/contexts/StandardAuthContext";
import LoginModal from "@/components/auth/LoginModal";
import JoinModal from "@/components/auth/JoinModal";
import PasswordReset from "@/components/auth/PasswordReset";
import { extractUserProfileData } from "@/lib/auth-core";
import { supabase } from "@/lib/supabase-auth";

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
  // Use auth context directly
  let user = null;
  let signOut: () => Promise<any> = async () => { console.log("Auth not available"); return { error: null }; };
  
  try {
    const auth = useAuth();
    user = auth.user;
    signOut = auth.signOut;
    
    // Debug auth state more clearly
    console.log("Header auth state from context:", { 
      hasUser: !!auth.user, 
      userId: auth.user?.id,
      session: !!auth.session,
      isAdmin: auth.isAdmin,
      isLoading: auth.isLoading
    });
  } catch (error) {
    console.error("Error using auth in Header:", error);
  }
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Enhanced auth state detection
  useEffect(() => {
    console.log("Header auth state check:", { 
      hasUser: !!user, 
      userId: user?.id,
      isAuthenticated
    });
    
    // First check if user is available directly from context
    if (user) {
      console.log("Header: User found in auth context, setting isAuthenticated to true");
      setIsAuthenticated(true);
      return;
    }
    
    // Check localStorage for auth tokens as a fallback
    const checkLocalStorageAuth = () => {
      try {
        // Check all localStorage items
        console.log("Header: Checking localStorage for auth tokens");
        for (const key in localStorage) {
          if (key && typeof key === 'string') {
            console.log(`Header: Checking localStorage key: ${key}`);
            if (
              key.includes('supabase.auth.token') || 
              key.includes('sb-') ||
              key.includes('akii-auth') ||
              key === 'force-auth-login'
            ) {
              console.log("Header: Found auth token in localStorage:", key);
              setIsAuthenticated(true);
              return true;
            }
          }
        }
        
        // Direct check for Supabase auth data
        const sbAuthKey = Object.keys(localStorage).find(key => key.startsWith('sb-'));
        if (sbAuthKey) {
          try {
            console.log(`Header: Found Supabase key: ${sbAuthKey}, parsing contents`);
            const authData = JSON.parse(localStorage.getItem(sbAuthKey) || '{}');
            console.log("Header: Parsed auth data:", authData);
            if (authData?.access_token || authData?.expires_at || authData?.refresh_token) {
              console.log("Header: Found Supabase auth data in localStorage");
              setIsAuthenticated(true);
              return true;
            }
          } catch (e) {
            console.error("Error parsing Supabase auth data:", e);
          }
        }
      } catch (e) {
        console.error("Error checking localStorage auth:", e);
      }
      return false;
    };
    
    const hasLocalStorageAuth = checkLocalStorageAuth();
    if (!hasLocalStorageAuth) {
      console.log("Header: No auth found in localStorage");
    }
    
    // Add a force check by directly checking with Supabase
    const checkSupabaseAuth = async () => {
      try {
        console.log("Header: Checking Supabase session directly");
        if (typeof supabase !== 'undefined' && supabase?.auth) {
          const { data } = await supabase.auth.getSession();
          console.log("Header: Direct Supabase session check result:", data);
          if (data?.session) {
            console.log("Header: Found active Supabase session");
            setIsAuthenticated(true);
            return true;
          }
        }
      } catch (e) {
        console.error("Error checking Supabase auth:", e);
      }
      return false;
    };
    
    // Check Supabase if we still don't have auth
    if (!hasLocalStorageAuth) {
      checkSupabaseAuth();
    }
    
    // Do a single delayed check if needed, but don't continuously refresh
    if (!user && !hasLocalStorageAuth && forceRefresh === 0) {
      console.log("Header: Scheduling delayed auth check");
      setTimeout(() => {
        setForceRefresh(1); // Only increment once to avoid infinite loops
        checkSupabaseAuth(); // Also try Supabase directly after a delay
      }, 1000);
    }
  }, [user, forceRefresh]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openLoginModal = () => {
    // Don't redirect if already logged in, just do nothing
    if (user || isAuthenticated) {
      console.log("User already logged in");
      return;
    }
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

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMobileMenu();
      
      // Navigate to home page after sign out
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
            <span className="text-xl font-bold">Akii</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Products <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/products/private-ai-api" className="font-medium">
                  Private AI API
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/web-chat-agent">Web Chat Agent</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/mobile-chat-agent">Mobile Chat Agent</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/whatsapp-chat-agent">
                  WhatsApp Chat Agent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/telegram-chat-agent">
                  Telegram Chat Agent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/shopify-chat-agent">
                  Shopify Chat Agent
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/products/wordpress-chat-agent">
                  WordPress Chat Agent
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {(user || isAuthenticated) ? (
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
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
                onClick={handleSignOut}
              >
                Logout
              </Button>
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
        isAuthenticated={user !== null || isAuthenticated}
        onLogin={openLoginModal}
        onJoin={openJoinModal}
        onLogout={handleSignOut}
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
