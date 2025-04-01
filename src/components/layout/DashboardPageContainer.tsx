import React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardPageContainer({
  children,
  className,
}: DashboardPageContainerProps) {
  return (
    <div className={cn("pt-9 px-9 w-full", className)}>
      {children}
    </div>
  );
} 