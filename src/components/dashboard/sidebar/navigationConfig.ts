/**
 * Navigation configuration for the sidebar
 * 
 * This file defines the navigation structure without JSX to avoid TypeScript errors.
 * The actual icons are added when the navigation is rendered.
 */

export interface NavSubLink {
  to: string;
  label: string;
}

export interface NavLinkConfig {
  to: string;
  iconName: string;
  label: string;
  section: string;
  isExpandable: boolean;
  isExpanded?: boolean;
  subLinks?: NavSubLink[];
  requiresAdmin?: boolean;
  requiresSuper?: boolean;
  requiresSubscription?: string;
}

export interface NavSectionConfig {
  title: string;
  links: NavLinkConfig[];
  requiresAdmin?: boolean;
  requiresSuper?: boolean;
}

// Plain object navigation configuration without JSX
export const navigationConfig: NavSectionConfig[] = [
  {
    title: "Overview",
    links: [
      {
        to: "/dashboard",
        iconName: "Home",
        label: "Dashboard",
        section: "dashboard",
        isExpandable: false,
      },
      {
        to: "/profile",
        iconName: "User",
        label: "Profile",
        section: "profile",
        isExpandable: false,
      },
    ],
  },
  {
    title: "App",
    links: [
      {
        to: "/dashboard/messages",
        iconName: "Mail",
        label: "Messages",
        section: "messages",
        isExpandable: false,
      },
      {
        to: "/dashboard/prompts",
        iconName: "ArrowRightLeft",
        label: "Prompts",
        section: "prompts",
        isExpandable: false,
      },
      {
        to: "/dashboard/team",
        iconName: "Users2",
        label: "Team",
        section: "team",
        isExpandable: false,
        requiresSubscription: "TEAM_MANAGEMENT",
      },
      {
        to: "/dashboard/settings",
        iconName: "Settings",
        label: "Settings",
        section: "settings",
        isExpandable: false,
      },
    ],
  },
  {
    title: "Admin",
    requiresAdmin: true,
    links: [
      {
        to: "/dashboard/admin",
        iconName: "Shield",
        label: "Admin Dashboard",
        section: "admin-dashboard",
        isExpandable: false,
      },
      {
        to: "/dashboard/admin/organization",
        iconName: "Building2",
        label: "Organization",
        section: "admin-org",
        isExpandable: true,
        subLinks: [
          {
            to: "/dashboard/admin/organization/details",
            label: "Details",
          },
          {
            to: "/dashboard/admin/organization/billing",
            label: "Billing",
          },
        ],
      },
      {
        to: "/dashboard/admin/users",
        iconName: "Users2",
        label: "Users",
        section: "admin-users",
        isExpandable: false,
      },
      {
        to: "/dashboard/admin/security",
        iconName: "ShieldCheck",
        label: "Security",
        section: "admin-security",
        isExpandable: true,
        subLinks: [
          {
            to: "/dashboard/admin/security/permissions",
            label: "Permissions",
          },
          {
            to: "/dashboard/admin/security/audit-logs",
            label: "Audit Logs",
          },
        ],
      },
    ],
  },
  {
    title: "System",
    requiresAdmin: true,
    requiresSuper: true,
    links: [
      {
        to: "/dashboard/admin/supabase",
        iconName: "Globe",
        label: "Supabase",
        section: "admin-supabase",
        isExpandable: true,
        subLinks: [
          {
            to: "/dashboard/admin/supabase/dashboard",
            label: "Dashboard",
          },
          {
            to: "/dashboard/admin/supabase/ai",
            label: "AI",
          },
          {
            to: "/dashboard/admin/supabase/storage",
            label: "Storage",
          },
          {
            to: "/dashboard/admin/supabase/check",
            label: "Health Check",
          },
        ],
      },
      {
        to: "/dashboard/admin/bedrock",
        iconName: "Zap",
        label: "Bedrock",
        section: "admin-bedrock",
        isExpandable: false,
      },
      {
        to: "/dashboard/admin/support",
        iconName: "HelpCircle",
        label: "Support",
        section: "admin-support",
        isExpandable: false,
      },
    ],
  },
]; 