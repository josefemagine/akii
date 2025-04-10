import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";

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

/**
 * A common sidebar link component that can be either a button or a Link based on whether onClick is provided.
 * Supports collapsed and expanded states, badges, and child indicators.
 */
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