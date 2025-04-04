import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, User as UserIcon, Moon, Sun, LogOut, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-compatibility";
import { toast } from "@/components/ui/use-toast";
import { useDirectAuth } from "@/contexts/direct-auth-context";
import { refreshSession } from "@/lib/direct-db-access";

interface HeaderProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  theme?: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark") => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick = () => {},
  isAdmin = false,
  theme = "dark",
  onThemeChange,
}) => {
  // Use both auth contexts for a smooth transition
  const compatAuth = useAuth();
  const { profile, signOut, isAdmin: contextIsAdmin } = useDirectAuth();
  
  const navigate = useNavigate();
  
  // Refresh the session when the header is displayed
  useEffect(() => {
    refreshSession();
  }, []);

  // Handle sign out using direct auth
  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
        navigate("/");
      } else if (compatAuth.signOut) {
        // Fallback to compatibility layer if direct auth fails
        await compatAuth.signOut();
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Sign out error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("dashboard-theme", newTheme);
    
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  // Get profile from direct auth first, fallback to compatibility layer
  const displayProfile = profile || compatAuth.profile;
  
  const displayName = 
    displayProfile?.first_name || 
    displayProfile?.display_name || 
    'User';
  
  const avatarUrl = displayProfile?.avatar_url;
  const firstInitial = displayName.charAt(0).toUpperCase();
  
  // Determine if user is admin from props, direct context, or compat layer
  const userIsAdmin = isAdmin || contextIsAdmin || !!compatAuth.isAdmin;

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
          {userIsAdmin && (
            <div className="mr-2 px-2 py-1 text-xs font-medium bg-amber-200 text-amber-900 rounded">
              Admin
            </div>
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
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="User's profile picture" />
                  ) : (
                    <AvatarFallback>
                      {firstInitial || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium ml-1 hidden md:inline-block">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
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