import React, { useState } from "react";
import { ChevronDown, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

export interface SidebarItemProps {
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

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
  subItems,
  collapsed = false,
  className,
}) => {
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

export default SidebarItem; 