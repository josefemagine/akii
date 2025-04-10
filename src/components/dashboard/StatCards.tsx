import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";
import { ArrowUpRight, MessageSquare, Users, Zap } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
}

const StatCard = ({
  title = "Stat",
  value = "0",
  change,
  changeType = "neutral",
  icon = <Zap className="h-4 w-4" />,
}: StatCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-950">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="mt-1 flex items-center text-xs">
            <span
              className={`mr-1 ${
                changeType === "increase"
                  ? "text-green-500"
                  : changeType === "decrease"
                    ? "text-red-500"
                    : "text-gray-500"
              }`}
            >
              {change}
            </span>
            {changeType === "increase" && (
              <ArrowUpRight className="h-3 w-3 text-green-500" />
            )}
            {changeType === "decrease" && (
              <ArrowUpRight className="h-3 w-3 rotate-180 text-red-500" />
            )}
            <span className="text-gray-500 dark:text-gray-400">
              from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface StatCardsProps {
  stats?: {
    activeAgents: number;
    totalMessages: number;
    activeUsers: number;
    usagePercentage: number;
  };
}

const StatCards = ({
  stats = {
    activeAgents: 3,
    totalMessages: 1248,
    activeUsers: 36,
    usagePercentage: 68,
  },
}: StatCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Agents"
        value={stats.activeAgents.toString()}
        change="+1"
        changeType="increase"
        icon={<Zap className="h-4 w-4" />}
      />
      <StatCard
        title="Total Messages"
        value={stats.totalMessages.toLocaleString()}
        change="+12.5%"
        changeType="increase"
        icon={<MessageSquare className="h-4 w-4" />}
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers.toString()}
        change="-4"
        changeType="decrease"
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Usage"
        value={`${stats.usagePercentage}%`}
        change="+5%"
        changeType="increase"
        icon={<Zap className="h-4 w-4" />}
      />
    </div>
  );
};

export default StatCards;
