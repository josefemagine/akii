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
  Globe,
  FileText,
  Zap,
  Shield,
} from "lucide-react";
import { ReactNode } from "react";

export interface NavLink {
  to: string;
  icon: ReactNode;
  label: string;
  section: string;
  isExpandable: boolean;
  isExpanded?: boolean;
  subLinks?: {
    to: string;
    label: string;
  }[];
  requiresAdmin?: boolean;
  requiresSuper?: boolean;
  requiresSubscription?: string;
}

export interface NavSection {
  title: string;
  links: NavLink[];
  requiresAdmin?: boolean;
  requiresSuper?: boolean;
}

// Function to create the navigation structure with proper typing
export const createNavigation = (): NavSection[] => {
  const sidebarNavigation: NavSection[] = [
    {
      title: "Overview",
      links: [
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
      ],
    },
    {
      title: "App",
      links: [
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
          requiresSubscription: "TEAM_MANAGEMENT",
        },
        {
          to: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
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
          icon: <Shield className="h-5 w-5" />,
          label: "Admin Dashboard",
          section: "admin-dashboard",
          isExpandable: false,
        },
        {
          to: "/dashboard/admin/organization",
          icon: <Building2 className="h-5 w-5" />,
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
          icon: <Users2 className="h-5 w-5" />,
          label: "Users",
          section: "admin-users",
          isExpandable: false,
        },
        {
          to: "/dashboard/admin/security",
          icon: <ShieldCheck className="h-5 w-5" />,
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
          icon: <Globe className="h-5 w-5" />,
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
          icon: <Zap className="h-5 w-5" />,
          label: "Bedrock",
          section: "admin-bedrock",
          isExpandable: false,
        },
        {
          to: "/dashboard/admin/support",
          icon: <HelpCircle className="h-5 w-5" />,
          label: "Support",
          section: "admin-support",
          isExpandable: false,
        },
      ],
    },
  ];

  return sidebarNavigation;
}; 