import { lazy } from 'react';
import { 
  Shield, FileText, MessageCircle, Layout, Users, 
  Settings, UserCheck, Mail, CreditCard, TrendingUp, 
  Database, PlusCircle
} from 'lucide-react';

// Lazy load page components
const AIInstancesPage = lazy(() => import('@/pages/AIInstances'));
const CreateAIInstancePage = lazy(() => import('@/pages/CreateAIInstance'));
const TrainingDataPage = lazy(() => import('@/pages/TrainingData'));
const ConversationsPage = lazy(() => import('@/pages/Conversations'));
const AppsPage = lazy(() => import('@/pages/Apps'));
const TeamPage = lazy(() => import('@/pages/Team'));
const SettingsPage = lazy(() => import('@/pages/Settings'));

// Admin pages
const UsersPage = lazy(() => import('@/pages/admin/Users'));
const UserSyncPage = lazy(() => import('@/pages/admin/UserSync'));
const ModerationPage = lazy(() => import('@/pages/admin/Moderation'));
const EmailTemplatesPage = lazy(() => import('@/pages/admin/EmailTemplates'));
const BillingPage = lazy(() => import('@/pages/admin/Billing'));
const WorkflowsPage = lazy(() => import('@/pages/admin/Workflows'));
const DatabaseSchemaPage = lazy(() => import('@/pages/admin/DatabaseSchema'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettings'));

// Route configuration
export const routes = {
  dashboard: [
    {
      path: "/dashboard/create-ai-instance",
      component: CreateAIInstancePage,
      name: "Create AI Instance",
      icon: PlusCircle,
      primary: true
    },
    {
      path: "/dashboard/ai-instances",
      component: AIInstancesPage,
      name: "AI Instances",
      icon: Shield
    },
    {
      path: "/dashboard/training-data",
      component: TrainingDataPage,
      name: "Training Data",
      icon: FileText
    },
    {
      path: "/dashboard/conversations",
      component: ConversationsPage,
      name: "Conversations",
      icon: MessageCircle
    },
    {
      path: "/dashboard/apps",
      component: AppsPage,
      name: "Apps",
      icon: Layout,
      hasSubmenu: true
    },
    {
      path: "/dashboard/team",
      component: TeamPage,
      name: "Team",
      icon: Users
    },
    {
      path: "/dashboard/settings",
      component: SettingsPage,
      name: "Settings",
      icon: Settings
    }
  ],
  admin: [
    {
      path: "/dashboard/admin/users",
      component: UsersPage,
      name: "Users",
      icon: Users
    },
    {
      path: "/dashboard/admin/user-sync",
      component: UserSyncPage,
      name: "User Sync",
      icon: UserCheck
    },
    {
      path: "/dashboard/admin/moderation",
      component: ModerationPage,
      name: "Moderation",
      icon: Shield
    },
    {
      path: "/dashboard/admin/email-templates",
      component: EmailTemplatesPage,
      name: "Email Templates",
      icon: Mail
    },
    {
      path: "/dashboard/admin/billing",
      component: BillingPage,
      name: "Billing",
      icon: CreditCard
    },
    {
      path: "/dashboard/admin/workflows",
      component: WorkflowsPage,
      name: "Workflows",
      icon: TrendingUp
    },
    {
      path: "/dashboard/admin/database-schema",
      component: DatabaseSchemaPage,
      name: "Database Schema",
      icon: Database
    },
    {
      path: "/dashboard/admin/settings",
      component: AdminSettingsPage,
      name: "Admin Settings",
      icon: Settings
    }
  ]
}; 