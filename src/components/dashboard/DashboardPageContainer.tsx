import React, { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

interface DashboardPageContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export const DashboardPageContainer: React.FC<DashboardPageContainerProps> = ({
  children,
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div className={cn("container mx-auto py-6", className)}>
      <div className="flex items-center gap-4 mb-6">
        {icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}; 