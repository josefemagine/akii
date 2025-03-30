import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Menu,
  X,
  Circle,
  ChevronDown,
  Github,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginModal from "@/components/auth/LoginModal";
import JoinModal from "@/components/auth/JoinModal";
import PasswordReset from "@/components/auth/PasswordReset";
import { useAuth } from "@/contexts/AuthContext";
import { EnvWarning } from "@/components/ui/env-warning";

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

interface MainLayoutProps {
  children: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const MainLayout = ({ children, onSearchChange }: MainLayoutProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Debug user state in MainLayout
  console.log("MainLayout - User state:", user ? "Logged in" : "Not logged in");

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Theme is always dark, no toggle needed
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openJoinModal = () => {
    setJoinModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openPasswordReset = () => {
    setPasswordResetOpen(true);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Circle className="h-6 w-6" fill="#23c55f" stroke="#23c55f" />
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
                  <Link to="/products/web-chat-agent">Web Chat Agent</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/products/mobile-chat-agent">
                    Mobile Chat Agent
                  </Link>
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
                <DropdownMenuItem asChild>
                  <Link to="/products/private-ai-api">Private AI API</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/pricing">Pricing</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme toggle removed - always dark mode */}
            {user ? (
              <>
                <Button variant="ghost" className="hidden md:flex" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  className="hidden md:flex"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container py-4 space-y-4">
              <div className="py-2">
                <div className="text-base font-medium mb-2">Products</div>
                <div className="pl-4 space-y-2">
                  <Link
                    to="/products/web-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Web Chat Agent
                  </Link>
                  <Link
                    to="/products/mobile-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mobile Chat Agent
                  </Link>
                  <Link
                    to="/products/whatsapp-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    WhatsApp Chat Agent
                  </Link>
                  <Link
                    to="/products/telegram-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Telegram Chat Agent
                  </Link>
                  <Link
                    to="/products/shopify-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shopify Chat Agent
                  </Link>
                  <Link
                    to="/products/wordpress-chat-agent"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    WordPress Chat Agent
                  </Link>
                  <Link
                    to="/products/private-ai-api"
                    className="block py-1 text-sm text-muted-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Private AI API
                  </Link>
                </div>
              </div>
              <Link
                to="/blog"
                className="block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/pricing"
                className="block py-2 text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <div className="pt-4 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </Button>
                    <Button onClick={handleSignOut}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={openLoginModal}>
                      Sign In
                    </Button>
                    <Button onClick={openJoinModal}>Get Started</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <EnvWarning />

      <main className="flex-1">{children}</main>

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

      <footer className="border-t bg-muted/40">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Circle className="h-6 w-6" fill="#23c55f" stroke="#23c55f" />
                <span className="text-xl font-bold">Akii</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Powerful AI agents for your business. Boost sales and reduce
                costs with our cutting-edge AI solutions.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://github.com" target="_blank" rel="noreferrer">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="sr-only">Facebook</span>
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/products/web-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Web Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/mobile-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mobile Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/whatsapp-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    WhatsApp Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/telegram-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Telegram Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/shopify-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Shopify Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/wordpress-chat-agent"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    WordPress Chat Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/private-ai-api"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Private AI API
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/terms-of-service"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/legal/cookie-policy"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Akii. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link to="/terms-of-service" className="hover:text-foreground">
                Terms
              </Link>
              <Link to="/privacy-policy" className="hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
