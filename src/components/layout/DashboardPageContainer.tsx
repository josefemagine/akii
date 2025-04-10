import React from "react";
import { cn } from "@/lib/utils.ts";

// Define consistent dashboard styling variables
export const dashboardStyles = {
  containerPadding: "p-8",
  containerWidth: "max-w-7xl",
  containerMargin: "mx-auto",
  pageMinHeight: "min-h-[calc(100vh-4rem)]",
  pageBg: "bg-gray-50 dark:bg-gray-900",
  contentSpacing: "space-y-8",
  sectionSpacing: "mb-8",
};

interface DashboardPageContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  requireAuth?: boolean;
}

export function DashboardPageContainer({
  children,
  className,
  fullWidth = false,
  requireAuth = true,
}: DashboardPageContainerProps) {
  return (
    <div className={cn(
      dashboardStyles.pageBg,
      dashboardStyles.pageMinHeight,
      dashboardStyles.containerPadding,
      className
    )}>
      <div className={cn(
        "w-full",
        !fullWidth && dashboardStyles.containerWidth,
        !fullWidth && dashboardStyles.containerMargin,
        dashboardStyles.contentSpacing
      )}>
        {children}
      </div>
    </div>
  );
} 