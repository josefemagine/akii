import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// SidebarLink component
export interface SidebarLinkProps {
  to: string;
  icon?: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  hasNestedLinks: boolean;
  isExpanded: boolean;
  toggleExpanded: () => void;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  isActive,
  isCollapsed,
  hasNestedLinks,
  isExpanded,
  toggleExpanded,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (hasNestedLinks) {
      e.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(
        "flex items-center py-2 px-3 rounded-md text-sm transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-foreground/70 hover:text-foreground hover:bg-muted",
        isCollapsed && "justify-center px-0"
      )}
    >
      {icon && (
        <span className={cn("shrink-0", isCollapsed ? "mr-0" : "mr-2")}>
          {icon}
        </span>
      )}
      
      {!isCollapsed && (
        <>
          <span className="flex-grow truncate">{label}</span>
          {hasNestedLinks && (
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

// NestedLink component
export interface NestedLinkProps {
  to: string;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export const NestedLink: React.FC<NestedLinkProps> = ({
  to,
  label,
  isActive,
  isCollapsed,
}) => {
  if (isCollapsed) return null;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ml-8 hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <span>{label}</span>
    </Link>
  );
};

// AdminBadge component to show in the sidebar
export const AdminBadge: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  if (isCollapsed) {
    return (
      <div className="flex justify-center items-center py-1">
        <Shield className="h-5 w-5 text-amber-500" />
      </div>
    );
  }
  
  return (
    <div className="px-4 py-1 mb-2 bg-amber-100 text-amber-800 rounded flex items-center text-xs font-medium">
      <Shield className="h-3 w-3 mr-1" /> Admin Access
    </div>
  );
}; 