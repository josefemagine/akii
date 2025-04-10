import React from "react";
import StatCards from "./StatCards.tsx";
import AgentsList from "./AgentsList.tsx";
import RecentActivity from "./RecentActivity.tsx";
import { QuickActions } from "./QuickActions.tsx";
import SubscriptionUsage from "./SubscriptionUsage.tsx";

interface DashboardOverviewProps {
  stats?: {
    activeAgents: number;
    totalMessages: number;
    activeUsers: number;
    usagePercentage: number;
  };
  onCreateAgent?: () => void;
  onEditAgent?: (id: string) => void;
  onDeleteAgent?: (id: string) => void;
  onToggleAgentStatus?: (id: string, newStatus: "active" | "paused") => void;
  onDuplicateAgent?: (id: string) => void;
  onViewAgent?: (id: string) => void;
}

const DashboardOverview = ({
  stats = {
    activeAgents: 5,
    totalMessages: 1248,
    activeUsers: 36,
    usagePercentage: 68,
  },
  onCreateAgent = () => {},
  onEditAgent = () => {},
  onDeleteAgent = () => {},
  onToggleAgentStatus = () => {},
  onDuplicateAgent = () => {},
  onViewAgent = () => {},
}: DashboardOverviewProps) => {
  return (
    <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI agents and platform activity.
        </p>
      </div>

      {/* Stats Overview */}
      <StatCards stats={stats} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents List - Takes 2/3 of the space on large screens */}
        <div className="lg:col-span-2">
          <AgentsList
            onEdit={onEditAgent}
            onDelete={onDeleteAgent}
            onToggleStatus={onToggleAgentStatus}
            onDuplicate={onDuplicateAgent}
            onView={onViewAgent}
          />
        </div>

        {/* Right Column - Takes 1/3 of the space on large screens */}
        <div className="lg:col-span-1 space-y-6">
          <SubscriptionUsage />
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default DashboardOverview;
