import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { LinkGroups } from "./LinkGroups";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { user, profile, signOut, isAdmin, checkSuperAdminStatus } = useAuth();
  const [isSuper, setIsSuper] = useState(false);

  // Check if user is a super admin
  React.useEffect(() => {
    if (isAdmin) {
      const checkSuperAdmin = async () => {
        const isSuperAdmin = await checkSuperAdminStatus();
        setIsSuper(isSuperAdmin);
      };
      checkSuperAdmin();
    }
  }, [isAdmin, checkSuperAdminStatus]);

  const toggleExpanded = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleLogout = async () => {
    await signOut();
  };

  // Get subscribed products from user profile
  const subscribedProducts = profile?.subscription_tier 
    ? ['TEAM_MANAGEMENT'] // Add actual product keys based on subscription tier
    : [];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all",
        isCollapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      {/* Logo/header section */}
      <div className="flex h-14 items-center border-b px-3">
        {!isCollapsed && (
          <span className="text-lg font-semibold">App</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-auto">
        <LinkGroups 
          expanded={expandedSections}
          toggleExpanded={toggleExpanded}
          isCollapsed={isCollapsed}
          isAdmin={isAdmin}
          isSuper={isSuper}
          subscribedProducts={subscribedProducts}
        />
      </div>

      {/* User profile and logout section */}
      <div className="mt-auto border-t p-2">
        {!isCollapsed && profile && (
          <div className="mb-2 px-3 py-2">
            <div className="text-sm font-medium">
              {profile.first_name} {profile.last_name}
              {profile.role && (
                <span className="ml-2 text-xs text-muted-foreground">({profile.role})</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{profile.email}</div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}; 