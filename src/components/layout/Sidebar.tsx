import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Circle,
  MessageSquare,
  Users,
  Settings,
  ChevronDown,
  HelpCircle,
  Layout,
  Bot,
  BarChart3,
  CreditCard,
  FileText,
  ArrowUpCircle,
  UserCircle,
  Shield,
  Database,
  Box,
  Network,
  UserCheck,
  ArrowRight as Workflow,
  Monitor,
  Smartphone,
  MessageCircle,
  Send,
  ShoppingBag,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  subItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  collapsed?: boolean;
  className?: string;
}

const SidebarItem = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
  subItems,
  collapsed = false,
  className,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive = (subHref: string) => location.pathname === subHref;
  const isAnySubItemActive =
    hasSubItems && subItems.some((item) => isSubItemActive(item.href));

  return (
    <div>
      <a
        href={hasSubItems ? "#" : href}
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) {
            setIsOpen(!isOpen);
          } else {
            navigate(href);
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          !className && "hover:bg-gray-100 dark:hover:bg-gray-800",
          !className && (active || isAnySubItemActive)
            ? "bg-gray-100 text-primary dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400",
          className,
        )}
      >
        {icon}
        {!collapsed && (
          <>
            <span className="flex-1">{label}</span>
            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180",
                )}
              />
            )}
          </>
        )}
      </a>
      {!collapsed && hasSubItems && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {subItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                isSubItemActive(item.href)
                  ? "bg-gray-100 text-primary dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

// Simplified Sidebar component that doesn't rely on auth context
const SimpleSidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Always show all items regardless of admin status
  const sidebarItems = [
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create AI Instance",
      href: "/dashboard/create",
      className: "create-instance-btn bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
      subItems: [
        {
          label: "My Instances",
          href: "/dashboard/agents",
        },
        {
          label: "Recent Activity",
          href: "/dashboard/activity",
        },
      ],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Training Data",
      href: "/dashboard/training",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Conversations",
      href: "/dashboard/conversations",
    },
    {
      icon: <Layout className="h-5 w-5" />,
      label: "Apps",
      href: "#",
      subItems: [
        {
          label: "Web Chat",
          href: "/dashboard/apps/web",
          icon: <Monitor className="h-4 w-4" />
        },
        {
          label: "Mobile Chat",
          href: "/dashboard/apps/mobile",
          icon: <Smartphone className="h-4 w-4" />
        },
        {
          label: "WhatsApp Chat",
          href: "/dashboard/apps/whatsapp",
          icon: <MessageCircle className="h-4 w-4" />
        },
        {
          label: "Telegram Chat",
          href: "/dashboard/apps/telegram",
          icon: <Send className="h-4 w-4" />
        },
        {
          label: "Shopify Chat",
          href: "/dashboard/apps/shopify",
          icon: <ShoppingBag className="h-4 w-4" />
        },
        {
          label: "WordPress Chat",
          href: "/dashboard/apps/wordpress",
          icon: <Globe className="h-4 w-4" />
        },
      ],
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Team",
      href: "/dashboard/team",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  // Admin section items for testing
  const adminItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Admin Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "User Management",
      href: "/admin/users",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Admin Settings",
      href: "/admin/settings",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: "/admin/billing",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Email Templates",
      href: "/admin/email-templates",
    },
    {
      icon: <Layout className="h-5 w-5" />,
      label: "Landing Pages",
      href: "/admin/landing-pages",
    },
    {
      icon: <Bot className="h-5 w-5" />,
      label: "Lead Magnets",
      href: "/admin/lead-magnets",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: "/admin/moderation",
    },
    {
      icon: <Box className="h-5 w-5" />,
      label: "Packages",
      href: "/admin/packages",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Affiliates",
      href: "/admin/affiliates",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Blog",
      href: "/admin/blog",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Compliance",
      href: "/admin/compliance",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database Schema",
      href: "/admin/database-schema",
    },
    {
      icon: <Network className="h-5 w-5" />,
      label: "n8n Workflows",
      href: "/admin/n8n-workflows",
    },
    {
      icon: <ArrowUpCircle className="h-5 w-5" />,
      label: "Run Migration",
      href: "/admin/run-migration",
    },
    {
      icon: <UserCircle className="h-5 w-5" />,
      label: "User Sync",
      href: "/admin/user-sync",
    },
    {
      icon: <UserCheck className="h-5 w-5" />,
      label: "User Status Migration",
      href: "/admin/user-status-migration",
    },
    {
      icon: <Workflow className="h-5 w-5" />,
      label: "Workflows",
      href: "/admin/workflows",
    }
  ];

  return (
    <aside
      className={cn(
        "fixed top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-all",
        collapsed && "w-16",
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <nav className="flex flex-1 flex-col gap-1">
          {sidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              subItems={item.subItems}
              collapsed={collapsed}
              className={item.className}
            />
          ))}
          
          {/* Admin section */}
          <div className="my-2 border-t dark:border-gray-800"></div>
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Admin
              </h2>
            </div>
          )}
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
        </nav>
      </div>
    </aside>
  );
};

export default SimpleSidebar;
