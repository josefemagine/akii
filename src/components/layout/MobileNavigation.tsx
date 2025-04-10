import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import type { User } from "@supabase/supabase-js";
import { 
  Monitor, 
  Smartphone, 
  MessageCircle, 
  Send, 
  ShoppingBag, 
  Globe, 
  Puzzle, 
  Share, 
  Workflow 
} from "lucide-react";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onLogin?: () => void;
  onJoin: () => void;
  onSignOut?: () => void;
  onLogout?: () => void;
}

const MobileNavigation = ({
  isOpen,
  onClose,
  user,
  isAuthenticated = false,
  onSignIn,
  onLogin,
  onJoin,
  onSignOut,
  onLogout,
}: MobileNavigationProps) => {
  if (!isOpen) return null;

  // For backward compatibility
  const handleLogin = onLogin || onSignIn;
  const handleLogout = onLogout || onSignOut;
  const isUserLoggedIn = isAuthenticated || user !== null;

  return (
    <div className="md:hidden border-t">
      <div className="container py-4 space-y-4">
        <Link
          to="/"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Home
        </Link>
        <div className="py-2">
          <div className="text-base font-medium mb-2">Apps & Integrations</div>
          <div className="pl-4 space-y-2">
            <Link
              to="/products/private-ai-api"
              className="block py-1 text-sm text-muted-foreground font-medium flex items-center gap-2"
              onClick={onClose}
            >
              <Puzzle className="h-4 w-4" /> Private AI API
            </Link>
            <Link
              to="/products/web-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Monitor className="h-4 w-4" /> Web Chat
            </Link>
            <Link
              to="/products/mobile-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Smartphone className="h-4 w-4" /> Mobile Chat
            </Link>
            <Link
              to="/products/whatsapp-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Chat
            </Link>
            <Link
              to="/products/telegram-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Send className="h-4 w-4" /> Telegram Chat
            </Link>
            <Link
              to="/products/shopify-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <ShoppingBag className="h-4 w-4" /> Shopify Chat
            </Link>
            <Link
              to="/products/wordpress-chat"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Globe className="h-4 w-4" /> WordPress Chat
            </Link>
            <Link
              to="/products/integrations/zapier"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Share className="h-4 w-4" /> Zapier Integration
            </Link>
            <Link
              to="/products/integrations/n8n"
              className="block py-1 text-sm text-muted-foreground flex items-center gap-2"
              onClick={onClose}
            >
              <Workflow className="h-4 w-4" /> n8n Integration
            </Link>
          </div>
        </div>
        <Link
          to="/plans"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Plans
        </Link>
        <Link
          to="/contact"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Contact
        </Link>
        <div className="pt-4 flex flex-col space-y-2">
          {isUserLoggedIn ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard" onClick={onClose}>
                  Dashboard
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => {
                if (handleLogout) handleLogout();
                onClose();
              }}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleLogin}>
                Sign In
              </Button>
              <Button onClick={onJoin}>Get Started</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
