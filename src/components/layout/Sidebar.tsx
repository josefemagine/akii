import React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import SidebarItem from "./dashboard/SidebarItem.tsx";
import {
  FileText,
  Shield,
  Database,
  Network,
  ArrowUpCircle,
  UserCircle,
  UserCheck,
  ArrowRight as Workflow,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const sidebarItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      href: "/security",
      label: "Security",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      href: "/data",
      label: "Data",
      icon: <Database className="h-5 w-5" />,
    },
    {
      href: "/integrations",
      label: "Integrations",
      icon: <Network className="h-5 w-5" />,
    },
    {
      href: "/upgrades",
      label: "Upgrades",
      icon: <ArrowUpCircle className="h-5 w-5" />,
    },
    {
      href: "/account",
      label: "Account",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      href: "/team",
      label: "Team",
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      href: "/workflow",
      label: "Workflow",
      icon: <Workflow className="h-5 w-5" />,
    },
  ];

  const adminItems = [
    {
      href: "/admin/users",
      label: "User Management",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      href: "/admin/settings",
      label: "Admin Settings",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      href: "/admin/logs",
      label: "System Logs",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-all",
        collapsed && "w-16"
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="h-[80px]"></div>
        
        <nav className="flex flex-1 flex-col gap-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>
        
        <div className="my-2 border-t dark"></div>
        
        {!collapsed && (
          <div className="px-3 py-2">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark">
              More
            </h2>
            
            {adminItems.map((item, index) => (
              <SidebarItem
                key={`admin-${index}`}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
