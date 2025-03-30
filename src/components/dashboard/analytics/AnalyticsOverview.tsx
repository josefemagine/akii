import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Zap, BarChart3 } from "lucide-react";

interface AnalyticsOverviewProps {
  totalMessages: number;
  activeAgents: number;
  totalConversations: number;
  averageRating: number;
}

const AnalyticsOverview = ({
  totalMessages = 0,
  activeAgents = 0,
  totalConversations = 0,
  averageRating = 0,
}: AnalyticsOverviewProps) => {
  const stats = [
    {
      title: "Total Messages",
      value: totalMessages.toLocaleString(),
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      description: "Messages processed by your agents",
    },
    {
      title: "Active Agents",
      value: activeAgents.toLocaleString(),
      icon: <Zap className="h-5 w-5 text-purple-500" />,
      description: "Agents currently deployed",
    },
    {
      title: "Conversations",
      value: totalConversations.toLocaleString(),
      icon: <Users className="h-5 w-5 text-green-500" />,
      description: "Total user conversations",
    },
    {
      title: "Average Rating",
      value: averageRating.toFixed(1) + "/5",
      icon: <BarChart3 className="h-5 w-5 text-yellow-500" />,
      description: "User satisfaction rating",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsOverview;
