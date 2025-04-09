var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, User as UserIcon, Moon, Sun, LogOut, Circle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useToast } from "@/components/ui/use-toast";
// Default avatar URL
const DEFAULT_AVATAR_URL = "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png";
const Header = ({ onMenuClick = () => { }, theme = "dark", onThemeChange, }) => {
    var _a;
    // Use unified auth context
    const { user, profile, signOut, isAdmin } = useAuth();
    const { isSuperAdmin } = useSuperAdmin();
    const { toast } = useToast();
    const navigate = useNavigate();
    // Handle sign out with proper error handling
    const handleSignOut = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield signOut();
            toast({
                title: "Signed out",
                description: "You have been signed out successfully.",
            });
            navigate('/');
        }
        catch (error) {
            console.error("[Header] Sign out error:", error);
            toast({
                title: "Sign out failed",
                description: "There was a problem signing you out. Please try again.",
                variant: "destructive",
            });
        }
    });
    // Theme toggle handler
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        localStorage.setItem("dashboard-theme", newTheme);
        if (onThemeChange) {
            onThemeChange(newTheme);
        }
    };
    // Get profile info from unified auth
    const displayProfile = profile;
    // Get display name with fallbacks
    const displayName = (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.first_name) ||
        (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.display_name) ||
        ((_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) ||
        'User';
    // Get avatar URL with fallback
    const avatarUrl = (displayProfile === null || displayProfile === void 0 ? void 0 : displayProfile.avatar_url) || DEFAULT_AVATAR_URL;
    const firstInitial = displayName.charAt(0).toUpperCase();
    return (_jsx("header", { className: "sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: _jsxs("div", { className: "flex h-16 items-center px-4", children: [_jsx("div", { className: "md:hidden mr-2", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: onMenuClick, children: _jsx(Menu, { className: "h-5 w-5" }) }) }), _jsx("div", { className: "mr-4 md:flex", children: _jsxs(Link, { to: "/dashboard", className: "flex items-center", children: [_jsx(Circle, { className: "h-6 w-6 fill-primary text-primary" }), _jsx("span", { className: "ml-2 text-xl font-bold", children: "Akii" })] }) }), _jsxs("div", { className: "ml-auto flex items-center gap-3", children: [isSuperAdmin && (_jsxs("div", { className: "mr-2 px-2 py-1 text-xs font-medium bg-red-200 text-red-900 rounded flex items-center", children: [_jsx(Shield, { className: "h-3 w-3 mr-1" }), " Super Admin"] })), isAdmin && !isSuperAdmin && (_jsx("div", { className: "mr-2 px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 rounded", children: "Admin" })), _jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Toggle Theme", className: "rounded-full", onClick: toggleTheme, children: theme === "dark" ? (_jsx(Sun, { className: "h-5 w-5" })) : (_jsx(Moon, { className: "h-5 w-5" })) }), _jsx(Button, { variant: "ghost", size: "icon", "aria-label": "Notifications", className: "rounded-full", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", className: "flex items-center gap-2 rounded-full overflow-hidden", children: [_jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: avatarUrl, alt: `${displayName}'s profile picture` }), _jsx(AvatarFallback, { children: firstInitial || _jsx(UserIcon, { className: "h-5 w-5" }) })] }), _jsx("span", { className: "font-medium ml-1 hidden md:inline-block", children: displayName })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsx(DropdownMenuItem, { onClick: () => navigate('/dashboard/profile'), children: "Profile" }), _jsx(DropdownMenuItem, { onClick: () => navigate('/dashboard/settings'), children: "Settings" }), isSuperAdmin && (_jsxs(DropdownMenuItem, { onClick: () => navigate('/dashboard/admin/admin-check'), children: [_jsx(Shield, { className: "h-4 w-4 mr-2" }), "Admin Check"] })), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleSignOut, children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), "Sign Out"] })] })] })] })] }) }));
};
export default Header;
