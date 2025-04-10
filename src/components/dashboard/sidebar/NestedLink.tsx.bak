import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface NestedLinkProps {
  to: string;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
}

/**
 * Simple nested link component for sidebar sub-items
 * Doesn't render anything when sidebar is collapsed
 */
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