import React from "react";
import { dashboardStyles } from "./DashboardPageContainer.tsx";
import { cn } from "@/lib/utils.ts";

interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  requireAuth?: boolean;
}

export function DashboardSection({ 
  children, 
  className, 
  title, 
  description, 
  requireAuth = true 
}: DashboardSectionProps) {
  return (
    <div className={cn(dashboardStyles.sectionSpacing, className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
