import React from "react";
import { SidebarLink } from "./SidebarLink.tsx";
import { NestedLink } from "./NestedLink.tsx";
import { useLocation } from "react-router-dom";
import {
  Home,
  Mail,
  MessageSquare,
  User,
  ArrowRightLeft,
  Settings,
  Users2,
  Building2,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Globe,
  FileText,
  Zap,
} from "lucide-react";

interface LinkGroupsProps {
  expanded: Record<string, boolean>;
  toggleExpanded: (section: string) => void;
  isCollapsed: boolean;
  isSuper: boolean;
  isAdmin: boolean;
  subscribedProducts: string[];
}

export const LinkGroups: React.FC<LinkGroupsProps> = ({
  expanded,
  toggleExpanded,
  isCollapsed,
  isSuper,
  isAdmin,
  subscribedProducts,
}) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Main navigation links
  const mainLinks = [
    {
      to: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      section: "dashboard",
      isExpandable: false,
    },
    {
      to: "/profile",
      icon: <User className="h-5 w-5" />,
      label: "Profile",
      section: "profile",
      isExpandable: false,
    },
  ];

  // App sub-links
  const appLinks = [
    {
      to: "/dashboard/messages",
      icon: <Mail className="h-5 w-5" />,
      label: "Messages",
      section: "messages",
      isExpandable: false,
    },
    {
      to: "/dashboard/prompts",
      icon: <ArrowRightLeft className="h-5 w-5" />,
      label: "Prompts",
      section: "prompts",
      isExpandable: false,
    },
    {
      to: "/dashboard/team",
      icon: <Users2 className="h-5 w-5" />,
      label: "Team",
      section: "team",
      isExpandable: false,
    },
    {
      to: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      section: "settings",
      isExpandable: false,
    },
  ];

  // Admin links
  const adminConfigLinks = [
    {
      to: "/admin/organization",
      icon: <Building2 className="h-5 w-5" />,
      label: "Organization",
      isExpanded: expanded["admin-org"] === true,
      section: "admin-org",
      isExpandable: true,
      subLinks: [
        {
          to: "/admin/organization/details",
          label: "Details",
        },
        {
          to: "/admin/organization/billing",
          label: "Billing",
        },
      ],
    },
    {
      to: "/admin/users",
      icon: <Users2 className="h-5 w-5" />,
      label: "Users",
      section: "admin-users",
      isExpandable: false,
      isExpanded: false,
    },
    {
      to: "/admin/security",
      icon: <ShieldCheck className="h-5 w-5" />,
      label: "Security",
      isExpanded: expanded["admin-security"] === true,
      section: "admin-security",
      isExpandable: true,
      subLinks: [
        {
          to: "/admin/security/permissions",
          label: "Permissions",
        },
        {
          to: "/admin/security/audit-logs",
          label: "Audit Logs",
        },
      ],
    },
  ];

  const adminSystemLinks = [
    {
      to: "/admin/supabase",
      icon: <Globe className="h-5 w-5" />,
      label: "Supabase",
      isExpanded: expanded["admin-supabase"] === true,
      section: "admin-supabase",
      isExpandable: true,
      subLinks: [
        {
          to: "/admin/supabase/dashboard",
          label: "Dashboard",
        },
        {
          to: "/admin/supabase/ai",
          label: "AI",
        },
        {
          to: "/admin/supabase/storage",
          label: "Storage",
        },
        {
          to: "/admin/supabase/check",
          label: "Health Check",
        },
      ],
    },
    {
      to: "/admin/bedrock",
      icon: <Zap className="h-5 w-5" />,
      label: "Bedrock",
      section: "admin-bedrock",
      isExpandable: false,
      isExpanded: false,
    },
    {
      to: "/admin/support",
      icon: <HelpCircle className="h-5 w-5" />,
      label: "Support",
      section: "admin-support",
      isExpandable: false,
      isExpanded: false,
    },
  ];

  // Filter app links based on subscribed products
  const filteredAppLinks = appLinks.filter((link) => {
    // If section is 'team', check if TEAM_MANAGEMENT is in subscribedProducts
    if (link.section === "team") {
      return subscribedProducts.includes("TEAM_MANAGEMENT");
    }
    return true;
  });

  return (
    <>
      {/* Main Links */}
      <div className={isCollapsed ? "py-2" : "px-3 py-2"}>
        <div className="mb-2">
          <h2 className={isCollapsed ? "sr-only" : "mb-2 px-4 text-lg font-semibold tracking-tight"}>
            Overview
          </h2>
          <div className="space-y-1">
            {mainLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                isActive={currentPath === link.to}
                isCollapsed={isCollapsed}
                isExpanded={false}
                hasNestedLinks={false}
                toggleExpanded={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      {/* App Links */}
      <div className={isCollapsed ? "py-2" : "px-3 py-2"}>
        <div className="mb-2">
          <h2 className={isCollapsed ? "sr-only" : "mb-2 px-4 text-lg font-semibold tracking-tight"}>
            App
          </h2>
          <div className="space-y-1">
            {filteredAppLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                isActive={currentPath === link.to}
                isCollapsed={isCollapsed}
                isExpanded={false}
                hasNestedLinks={false}
                toggleExpanded={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Admin Links - only show if user is admin or super admin */}
      {(isAdmin || isSuper) && (
        <div className={isCollapsed ? "py-2" : "px-3 py-2"}>
          <div className="mb-2">
            <h2 className={isCollapsed ? "sr-only" : "mb-2 px-4 text-lg font-semibold tracking-tight"}>
              Admin
            </h2>
            <div className="space-y-1">
              <div className="space-y-1">
                {/* Configuration Admin Links */}
                {adminConfigLinks.map((link) => (
                  <React.Fragment key={link.to}>
                    <SidebarLink
                      to={link.to}
                      icon={link.icon}
                      label={link.label}
                      isActive={currentPath === link.to || currentPath.startsWith(link.to + "/")}
                      isCollapsed={isCollapsed}
                      isExpanded={link.isExpanded}
                      hasNestedLinks={link.isExpandable && !!link.subLinks && link.subLinks.length > 0}
                      toggleExpanded={() => toggleExpanded(link.section)}
                    />
                    {link.isExpandable && link.isExpanded && link.subLinks && (
                      <div className="pt-1 pl-6">
                        {link.subLinks.map((subLink) => (
                          <NestedLink
                            key={subLink.to}
                            to={subLink.to}
                            label={subLink.label}
                            isActive={currentPath === subLink.to}
                            isCollapsed={isCollapsed}
                          />
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* System Admin Links - only show to super admins */}
              {isSuper && (
                <div className="mt-6 space-y-1">
                  <h3 className={isCollapsed ? "sr-only" : "mb-2 px-4 text-sm font-medium text-muted-foreground"}>
                    System
                  </h3>
                  {adminSystemLinks.map((link) => (
                    <React.Fragment key={link.to}>
                      <SidebarLink
                        to={link.to}
                        icon={link.icon}
                        label={link.label}
                        isActive={currentPath === link.to || currentPath.startsWith(link.to + "/")}
                        isCollapsed={isCollapsed}
                        isExpanded={link.isExpanded}
                        hasNestedLinks={link.isExpandable && !!link.subLinks && link.subLinks.length > 0}
                        toggleExpanded={() => toggleExpanded(link.section)}
                      />
                      {link.isExpandable && link.isExpanded && link.subLinks && (
                        <div className="pt-1 pl-6">
                          {link.subLinks.map((subLink) => (
                            <NestedLink
                              key={subLink.to}
                              to={subLink.to}
                              label={subLink.label}
                              isActive={currentPath === subLink.to}
                              isCollapsed={isCollapsed}
                            />
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 