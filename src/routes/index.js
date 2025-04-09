import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy } from "react";
import { Shield, FileText, MessageCircle, Layout, Users, Settings, Mail, CreditCard, TrendingUp, Database, PlusCircle, } from "lucide-react";
// Lazy load page components
const AIInstancesPage = lazy(() => import("@/pages/AIInstances"));
const CreateAIInstancePage = lazy(() => import("@/pages/CreateAIInstance"));
const TrainingDataPage = lazy(() => import("@/pages/TrainingData"));
const ConversationsPage = lazy(() => import("@/pages/Conversations"));
const AppsPage = lazy(() => import("@/pages/Apps"));
const TeamPage = lazy(() => import("@/pages/dashboard/Team"));
const SettingsPage = lazy(() => import("@/pages/Settings"));
// Admin pages
const UsersPage = lazy(() => import("@/pages/admin/Users"));
const ModerationPage = lazy(() => import("@/pages/admin/Moderation"));
const EmailTemplatesPage = lazy(() => import("@/pages/admin/EmailTemplates"));
const BillingPage = lazy(() => import("@/pages/admin/Billing"));
const WorkflowsPage = lazy(() => import("@/pages/admin/Workflows"));
const DatabaseSchemaPage = lazy(() => import("@/pages/admin/DatabaseSchema"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettings"));
// Dashboard component for the root dashboard route
const DashboardPage = lazy(() => import("@/pages/dashboard/Dashboard"));
// Route configuration for sidebar navigation
export const routes = [
    {
        path: "/dashboard",
        element: _jsx(DashboardPage, {}),
    },
    {
        path: "/dashboard/create-ai-instance",
        element: _jsx(CreateAIInstancePage, {}),
    },
    {
        path: "/dashboard/ai-instances",
        element: _jsx(AIInstancesPage, {}),
    },
    {
        path: "/dashboard/training-data",
        element: _jsx(TrainingDataPage, {}),
    },
    {
        path: "/dashboard/conversations",
        element: _jsx(ConversationsPage, {}),
    },
    {
        path: "/dashboard/apps",
        element: _jsx(AppsPage, {}),
    },
    {
        path: "/dashboard/team",
        element: _jsx(TeamPage, {}),
        errorElement: (_jsxs("div", { className: "p-8", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Error loading team page" }), _jsx("p", { children: "There was an error loading the team page. Please try again later." })] })),
    },
    {
        path: "/dashboard/settings",
        element: _jsx(SettingsPage, {}),
    },
    // Admin routes
    {
        path: "/admin/users",
        element: _jsx(UsersPage, {}),
    },
    {
        path: "/admin/moderation",
        element: _jsx(ModerationPage, {}),
    },
    {
        path: "/admin/email-templates",
        element: _jsx(EmailTemplatesPage, {}),
    },
    {
        path: "/admin/billing",
        element: _jsx(BillingPage, {}),
    },
    {
        path: "/admin/workflows",
        element: _jsx(WorkflowsPage, {}),
    },
    {
        path: "/admin/database-schema",
        element: _jsx(DatabaseSchemaPage, {}),
    },
    {
        path: "/admin/settings",
        element: _jsx(AdminSettingsPage, {}),
    },
];
// Navigation configuration for sidebar
export const navigationConfig = {
    dashboard: [
        {
            path: "/dashboard/create-ai-instance",
            component: CreateAIInstancePage,
            name: "Create AI Instance",
            icon: PlusCircle,
            primary: true,
        },
        {
            path: "/dashboard/ai-instances",
            component: AIInstancesPage,
            name: "AI Instances",
            icon: Shield,
        },
        {
            path: "/dashboard/training-data",
            component: TrainingDataPage,
            name: "Training Data",
            icon: FileText,
        },
        {
            path: "/dashboard/conversations",
            component: ConversationsPage,
            name: "Conversations",
            icon: MessageCircle,
        },
        {
            path: "/dashboard/apps",
            component: AppsPage,
            name: "Apps",
            icon: Layout,
            hasSubmenu: true,
        },
        {
            path: "/dashboard/team",
            component: TeamPage,
            name: "Team",
            icon: Users,
        },
        {
            path: "/dashboard/settings",
            component: SettingsPage,
            name: "Settings",
            icon: Settings,
        },
    ],
    admin: [
        {
            path: "/admin/users",
            component: UsersPage,
            name: "Users",
            icon: Users,
        },
        {
            path: "/admin/moderation",
            component: ModerationPage,
            name: "Moderation",
            icon: Shield,
        },
        {
            path: "/admin/email-templates",
            component: EmailTemplatesPage,
            name: "Email Templates",
            icon: Mail,
        },
        {
            path: "/admin/billing",
            component: BillingPage,
            name: "Billing",
            icon: CreditCard,
        },
        {
            path: "/admin/workflows",
            component: WorkflowsPage,
            name: "Workflows",
            icon: TrendingUp,
        },
        {
            path: "/admin/database-schema",
            component: DatabaseSchemaPage,
            name: "Database Schema",
            icon: Database,
        },
        {
            path: "/admin/settings",
            component: AdminSettingsPage,
            name: "Admin Settings",
            icon: Settings,
        },
    ],
};
