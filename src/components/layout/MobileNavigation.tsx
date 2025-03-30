import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignIn: () => void;
  onJoin: () => void;
  onSignOut: () => void;
}

const MobileNavigation = ({
  isOpen,
  onClose,
  user,
  onSignIn,
  onJoin,
  onSignOut,
}: MobileNavigationProps) => {
  if (!isOpen) return null;

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
          <div className="text-base font-medium mb-2">Products</div>
          <div className="pl-4 space-y-2">
            <Link
              to="/products/private-ai-api"
              className="block py-1 text-sm text-muted-foreground font-medium"
              onClick={onClose}
            >
              Private AI API
            </Link>
            <Link
              to="/products/web-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              Web Chat Agent
            </Link>
            <Link
              to="/products/mobile-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              Mobile Chat Agent
            </Link>
            <Link
              to="/products/whatsapp-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              WhatsApp Chat Agent
            </Link>
            <Link
              to="/products/telegram-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              Telegram Chat Agent
            </Link>
            <Link
              to="/products/shopify-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              Shopify Chat Agent
            </Link>
            <Link
              to="/products/wordpress-chat-agent"
              className="block py-1 text-sm text-muted-foreground"
              onClick={onClose}
            >
              WordPress Chat Agent
            </Link>
          </div>
        </div>
        <Link
          to="/blog"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Blog
        </Link>
        <Link
          to="/pricing"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Pricing
        </Link>
        <Link
          to="/contact"
          className="block py-2 text-base font-medium"
          onClick={onClose}
        >
          Contact
        </Link>
        <div className="pt-4 flex flex-col space-y-2">
          {user ? (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard" onClick={onClose}>
                  Dashboard
                </Link>
              </Button>
              <Button onClick={onSignOut}>Sign Out</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onSignIn}>
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
