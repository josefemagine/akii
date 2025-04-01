import React, { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import JoinModal from "@/components/auth/JoinModal";
import PasswordReset from "@/components/auth/PasswordReset";

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
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openLoginModal = () => {
    // Check if already logged in before opening modal
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      window.location.href = "/dashboard";
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
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex items-center gap-2"
                  >
                    <span>{user.email?.split("@")[0] || "User"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/agents" className="w-full">
                      My Agents
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/subscription" className="w-full">
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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
        user={user as any}
        onSignIn={openLoginModal}
        onJoin={openJoinModal}
        onSignOut={handleSignOut}
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
