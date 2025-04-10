import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Settings,
  Circle,
  FileText,
  MessageSquare,
  BarChart3,
  Globe,
  X,
  Package,
  Mail,
  Layout,
  BookOpen,
  Users2,
  FileCheck,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
}: SidebarItemProps) => {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
        active
          ? "bg-gray-100 text-primary dark:bg-gray-800"
          : "text-gray-500 dark:text-gray-400",
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const AdminSidebar = ({
  collapsed = false,
  onToggle = () => {},
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const adminSidebarItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/users",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/admin/settings",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Packages",
      href: "/admin/packages",
    },
    {
      icon: (
        <div className="h-5 w-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
      ),
      label: "Moderation",
      href: "/admin/moderation",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: "/admin/email-templates",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Lead Magnets",
      href: "/admin/lead-magnets",
    },
    {
      icon: <Layout className="h-5 w-5" />,
      label: "Landing Pages",
      href: "/admin/landing-pages",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Blog",
      href: "/admin/blog",
    },
    {
      icon: <Users2 className="h-5 w-5" />,
      label: "Affiliates",
      href: "/admin/affiliates",
    },
    {
      icon: <FileCheck className="h-5 w-5" />,
      label: "Compliance",
      href: "/admin/compliance",
    },
    {
      icon: <Terminal className="h-5 w-5" />,
      label: "Run Migration",
      href: "/admin/run-migration",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800 transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[280px]",
      )}
    >
      <div className="flex h-14 items-center border-b px-3 dark:border-gray-800">
        {collapsed ? (
          <div className="flex w-full justify-center">
            <div className="h-6 w-6 fill-red-500 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 fill-red-500 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8 lg:hidden"
          onClick={onToggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {adminSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={collapsed ? "" : item.label}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => navigate(item.href)}
            />
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t dark:border-gray-800">
        {!collapsed && (
          <div className="flex flex-col space-y-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              <Circle className="mr-2 h-4 w-4 fill-green-500 text-green-500" />
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
