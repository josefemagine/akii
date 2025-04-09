var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Monitor, Smartphone, MessageCircle, Send, ShoppingBag, Globe, Puzzle, Share, Workflow } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import MobileNavigation from "./MobileNavigation";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import LoginModal from "@/components/auth/LoginModal";
import JoinModal from "@/components/auth/JoinModal";
import PasswordReset from "@/components/auth/PasswordReset";
import { supabase } from "@/lib/supabase";
import AkiiLogo from "@/components/shared/AkiiLogo";
import { toast } from "@/components/ui/use-toast";
const NavLink = ({ href, children, className }) => {
    const location = useLocation();
    const isActive = location.pathname === href;
    return (_jsx(Link, { to: href, className: cn("text-sm font-medium transition-colors hover:text-primary", isActive ? "text-primary" : "text-muted-foreground", className), children: children }));
};
const Header = ({}) => {
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
    const [isAuthenticatedLocal, setIsAuthenticatedLocal] = useState(undefined);
    // Use a ref to track if session check is in progress
    const sessionCheckInProgress = useRef(false);
    const lastSessionCheckTime = useRef(0);
    // One-time direct check on mount
    useEffect(() => {
        const checkAuthState = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Avoid duplicate checks
            if (sessionCheckInProgress.current)
                return;
            // Throttle checks to once per second
            const now = Date.now();
            if (now - lastSessionCheckTime.current < 1000)
                return;
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
                }
                catch (e) {
                    console.error("Error checking localStorage:", e);
                }
                // If we found a token, immediately set auth to avoid UI flash
                if (hasToken && isAuthenticatedLocal === undefined) {
                    setIsAuthenticatedLocal(true);
                }
                // Then verify with an actual session check
                const { data } = yield supabase.auth.getSession();
                const hasSession = !!data.session;
                // Only log if there's a meaningful change to report
                if (hasSession !== isAuthenticatedLocal) {
                    console.log("[Header] Direct session check:", {
                        hasSession,
                        sessionExpires: (_a = data.session) === null || _a === void 0 ? void 0 : _a.expires_at,
                        previousState: isAuthenticatedLocal
                    });
                }
                // Update state if it's different
                if (hasSession !== isAuthenticatedLocal) {
                    setIsAuthenticatedLocal(hasSession);
                }
            }
            catch (e) {
                console.error("Error in session check:", e);
            }
            finally {
                sessionCheckInProgress.current = false;
            }
        });
        checkAuthState();
    }, [isAuthenticatedLocal]);
    // Update local auth state whenever auth context changes - with reduced logging
    useEffect(() => {
        var _a;
        const contextAuthState = Boolean(auth.user);
        // Only update and log if there's an actual change
        if (contextAuthState !== isAuthenticatedLocal) {
            console.log("[Header] Auth state updated from context:", {
                hasUser: Boolean(auth.user),
                userId: (_a = auth.user) === null || _a === void 0 ? void 0 : _a.id,
                previousState: isAuthenticatedLocal
            });
            setIsAuthenticatedLocal(contextAuthState);
        }
    }, [auth.user, isAuthenticatedLocal]);
    // Listen for auth state changes
    useEffect(() => {
        const handleAuthStateChange = (event) => __awaiter(void 0, void 0, void 0, function* () {
            // Only log important events to reduce console noise
            if (event.type === 'SIGNED_IN' || event.type === 'SIGNED_OUT') {
                console.log("Auth state changed event received in Header", event.type || 'unknown');
            }
            // Deduplicate session checks using a ref
            if (sessionCheckInProgress.current)
                return;
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
                    if (now - lastSessionCheckTime.current < 1000)
                        return;
                    sessionCheckInProgress.current = true;
                    lastSessionCheckTime.current = now;
                    const { data } = yield supabase.auth.getSession();
                    const hasDirectSession = !!data.session;
                    // Update authentication state based on direct session check
                    if (event.type === 'SIGNED_IN' || hasDirectSession) {
                        setIsAuthenticatedLocal(true);
                    }
                    else if (event.type === 'SIGNED_OUT') {
                        setIsAuthenticatedLocal(false);
                    }
                }
                catch (e) {
                    console.error("Error checking session after event:", e);
                }
                finally {
                    sessionCheckInProgress.current = false;
                }
            }
        });
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
            authListener === null || authListener === void 0 ? void 0 : authListener.subscription.unsubscribe();
            window.removeEventListener('akii:auth:reset', handleAuthReset);
        };
    }, []);
    // Handle sign out with better cleanup
    const handleSignOut = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (scope = 'global') {
        console.log(`Logging out user (scope: ${scope})`);
        if (scope === 'local' || scope === 'others') {
            // Show a warning that this is not fully supported
            toast({
                title: "Limited Functionality",
                description: `Single device logouts are not fully supported. All devices will be logged out.`,
                variant: "destructive",
            });
        }
        // Call auth context signOut
        auth.signOut().catch(error => {
            console.error("Error during logout:", error);
        });
        // Force navigation to home page
        navigate('/', { replace: true });
    });
    // UI handlers
    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);
    const openLoginModal = () => {
        if (isAuthenticatedLocal)
            return;
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
    return (_jsxs("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: [_jsxs("div", { className: "container flex h-16 items-center justify-between py-4", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx(AkiiLogo, {}) }), _jsxs("nav", { className: "hidden md:flex items-center gap-6", children: [_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "flex items-center gap-1", children: ["Apps & Integrations ", _jsx(ChevronDown, { className: "h-4 w-4" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/private-ai-api", className: "font-medium flex items-center gap-2", children: [_jsx(Puzzle, { className: "h-4 w-4" }), " Private AI API"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/web-chat", className: "flex items-center gap-2", children: [_jsx(Monitor, { className: "h-4 w-4" }), " Web Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/mobile-chat", className: "flex items-center gap-2", children: [_jsx(Smartphone, { className: "h-4 w-4" }), " Mobile Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/whatsapp-chat", className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "h-4 w-4" }), " WhatsApp Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/telegram-chat", className: "flex items-center gap-2", children: [_jsx(Send, { className: "h-4 w-4" }), " Telegram Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/shopify-chat", className: "flex items-center gap-2", children: [_jsx(ShoppingBag, { className: "h-4 w-4" }), " Shopify Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/wordpress-chat", className: "flex items-center gap-2", children: [_jsx(Globe, { className: "h-4 w-4" }), " WordPress Chat"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/integrations/zapier", className: "flex items-center gap-2", children: [_jsx(Share, { className: "h-4 w-4" }), " Zapier Integration"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: "/products/integrations/n8n", className: "flex items-center gap-2", children: [_jsx(Workflow, { className: "h-4 w-4" }), " n8n Integration"] }) })] })] }), _jsx(NavLink, { href: "/plans", children: "Plans" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [isAuthenticatedLocal ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "default", className: "hidden md:flex items-center gap-2 bg-green-500 hover:bg-green-600", asChild: true, children: _jsx(Link, { to: "/dashboard", className: "flex-1 text-sm font-medium", children: "Dashboard" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: "hidden md:flex items-center gap-1", children: ["Log Out ", _jsx(ChevronDown, { className: "h-4 w-4 ml-1" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => handleSignOut('local'), children: "This Device Only" }), _jsx(DropdownMenuItem, { onClick: () => handleSignOut('others'), children: "Other Devices Only" }), _jsx(DropdownMenuItem, { onClick: () => handleSignOut('global'), children: "All Devices" })] })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", className: "hidden md:flex", onClick: openLoginModal, children: "Sign In" }), _jsx(Button, { className: "hidden md:flex", onClick: openJoinModal, children: "Get Started" })] })), _jsxs(Button, { variant: "ghost", size: "icon", className: "md:hidden", onClick: toggleMobileMenu, children: [mobileMenuOpen ? (_jsx(X, { className: "h-5 w-5" })) : (_jsx(Menu, { className: "h-5 w-5" })), _jsx("span", { className: "sr-only", children: "Toggle menu" })] })] })] }), _jsx(MobileNavigation, { isOpen: mobileMenuOpen, onClose: closeMobileMenu, isAuthenticated: isAuthenticatedLocal, onLogin: openLoginModal, onJoin: openJoinModal, onLogout: () => handleSignOut('global') }), _jsx(LoginModal, { isOpen: loginModalOpen, onClose: () => setLoginModalOpen(false), onOpenJoin: () => {
                    setLoginModalOpen(false);
                    setJoinModalOpen(true);
                }, onOpenPasswordReset: () => {
                    setLoginModalOpen(false);
                    setPasswordResetOpen(true);
                } }), _jsx(JoinModal, { isOpen: joinModalOpen, onClose: () => setJoinModalOpen(false), onOpenLogin: () => {
                    setJoinModalOpen(false);
                    setLoginModalOpen(true);
                } }), _jsx(PasswordReset, { isOpen: passwordResetOpen, onClose: () => setPasswordResetOpen(false), onOpenLogin: () => {
                    setPasswordResetOpen(false);
                    setLoginModalOpen(true);
                } })] }));
};
export default Header;
