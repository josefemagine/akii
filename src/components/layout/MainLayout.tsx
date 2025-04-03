import React from "react";
import { Link } from "react-router-dom";
import { Circle, Github, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvWarning } from "@/components/ui/env-warning";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  // Force dark mode
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <EnvWarning />
      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/40">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Circle className="h-6 w-6" fill="#23c55f" stroke="#23c55f" />
                <span className="text-xl font-bold">Akii</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI. Your Data. No Leaks.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://twitter.com/akii"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://github.com/akii" target="_blank" rel="noreferrer">
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://linkedin.com/company/akii"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href="https://facebook.com/akiiAI"
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
              <h3 className="text-sm font-medium">Apps & Integrations</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    to="/products/web-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Web Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/mobile-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Mobile Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/whatsapp-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    WhatsApp Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/telegram-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Telegram Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/shopify-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Shopify Chat
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/wordpress-chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    WordPress Chat
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
                <li>
                  <Link
                    to="/products/integrations/zapier"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Zapier Integration
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products/integrations/n8n"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    n8n Integration
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
