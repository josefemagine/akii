import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Bell, Circle, LogOut, Menu, Moon, Shield, Sun, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { Profile } from "@/types/auth.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { AuthRepository } from "@/lib/database/auth-repository.ts";
import { UserRepository } from "@/lib/database/user-repository";

// Default avatar fallback URL
const DEFAULT_AVATAR_URL = '/assets/default-avatar.png';

// Extended profile type with optional display fields
interface ExtendedProfile extends Profile {
  display_name?: string;
  avatar_url?: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick = () => {},
  theme = "dark",
  onThemeChange,
}) => {
  // Use unified auth context for all auth-related data
  const { user, profile, signOut, isAdmin: contextIsAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Add state for REST API admin status
  const [isAdminViaREST, setIsAdminViaREST] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  
  // Combined admin status - true if any check returns true
  const isAdmin = contextIsAdmin || isAdminViaREST === true;
  
  // Check admin status using REST API
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;
      
      setAdminCheckLoading(true);
      try {
        console.log("[Header] Checking admin status via REST API for:", user.id);
        const adminStatus = await UserRepository.checkAdminStatusREST(user.id);
        console.log("[Header] REST API admin check result:", adminStatus);
        setIsAdminViaREST(adminStatus);
      } catch (error) {
        console.error("[Header] Error checking admin status via REST:", error);
      } finally {
        setAdminCheckLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user?.id]);
  
  // Handle sign out with proper error handling
  const handleSignOut = async () => {
    try {
      // Use AuthRepository for sign out
      const { error } = await AuthRepository.signOut();
      
      if (error) {
        throw error;
      }
      
      await signOut(); // Call context's signOut to update state
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/');
    } catch (error) {
      console.error("[Header] Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("dashboard-theme", newTheme);
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Get profile info from unified auth
  const displayProfile = profile as ExtendedProfile;
  
  // Get display name with fallbacks
  const displayName = 
    displayProfile?.first_name || 
    displayProfile?.display_name || 
    user?.email?.split('@')[0] || 
    'User';
  
  // Get avatar URL with fallback
  const avatarUrl = displayProfile?.avatar_url || DEFAULT_AVATAR_URL;
  const firstInitial = displayName.charAt(0).toUpperCase();

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
          {isAdmin && (
            <div className="mr-2 px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 rounded flex items-center">
              <Shield className="h-3 w-3 mr-1" /> Admin
            </div>
          )}
          
          {adminCheckLoading && (
            <div className="mr-2 w-4 h-4 border-2 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
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
                  <AvatarImage src={avatarUrl} alt={`${displayName}'s profile picture`} />
                  <AvatarFallback>
                    {firstInitial || <UserIcon className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium ml-1 hidden md:inline-block">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin/admin-check')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Check
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/admin')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                </>
              )}
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