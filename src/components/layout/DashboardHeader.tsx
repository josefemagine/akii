import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Bell, Menu, Search, Settings, User as UserIcon, 
  Moon, Sun, LogOut, ChevronDown 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearch } from "@/contexts/SearchContext";
import { toast } from "@/components/ui/use-toast";
import AkiiLogo from "@/components/shared/AkiiLogo";
import { UserProfile } from "@/hooks/useDashboardLayoutAuth";

interface UserDisplayData {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
}

interface DashboardHeaderProps {
  userData: UserDisplayData;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  handleSignOut: (scope?: 'global' | 'local' | 'others') => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  isDarkMode,
  toggleDarkMode,
  toggleSidebar,
  handleSignOut,
  isAdmin,
  isSuperAdmin,
  loading
}) => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();

  // Get initials for avatar
  const getInitials = () => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`;
    } else if (userData.firstName) {
      return userData.firstName.charAt(0);
    } else if (userData.email) {
      return userData.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Navigate to profile settings
  const goToSettings = () => {
    navigate("/dashboard/settings/profile");
  };

  // Navigate to support
  const goToSupport = () => {
    navigate("/dashboard/support");
  };

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get display name for greeting
  const getDisplayName = () => {
    if (userData.firstName) {
      return userData.firstName;
    }
    if (userData.email) {
      // Extract name from email (username portion before @)
      const emailName = userData.email.split('@')[0];
      // Capitalize first letter
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "there";
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <AkiiLogo />
        <div className="hidden md:flex">
          <h2 className="text-lg font-medium">
            {getGreeting()}, {getDisplayName()}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 md:w-[280px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        <Button variant="outline" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {userData.avatarUrl ? (
                  <AvatarImage src={userData.avatarUrl} alt="User" />
                ) : null}
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {userData.firstName || userData.lastName ? (
                  <p className="font-medium">
                    {userData.firstName} {userData.lastName}
                  </p>
                ) : null}
                {userData.email ? (
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                ) : null}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings/profile" className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Portal</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader; 