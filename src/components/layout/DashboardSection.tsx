import React, { ReactNode } from "react";
import { dashboardStyles } from "./DashboardPageContainer";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function DashboardSection({
  children,
  className,
  title,
  description
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