import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Star, MessageSquare, Users } from "lucide-react";

interface AgentData {
  id: string;
  name: string;
  conversations: number;
  messages: number;
  rating: number;
  type?: string;
  avatar_url?: string | null;
}

interface TopAgentsPerformanceProps {
  agents?: AgentData[];
  period?: string;
}

const TopAgentsPerformance = ({
  agents = [
    {
      id: "agent-1",
      name: "Sales Assistant",
      conversations: 842,
      messages: 3650,
      rating: 4.8,
      type: "Sales",
      avatar_url: null,
    },
    {
      id: "agent-2",
      name: "Support Helper",
      conversations: 756,
      messages: 2980,
      rating: 4.7,
      type: "Support",
      avatar_url: null,
    },
    {
      id: "agent-3",
      name: "Product Guide",
      conversations: 624,
      messages: 2450,
      rating: 4.6,
      type: "Product",
      avatar_url: null,
    },
    {
      id: "agent-4",
      name: "Onboarding Agent",
      conversations: 512,
      messages: 1980,
      rating: 4.9,
      type: "Onboarding",
      avatar_url: null,
    },
  ],
  period = "Last 30 days",
}: TopAgentsPerformanceProps) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Top Performing Agents
          </CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {agents.map((agent, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.type} Agent
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {agent.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs">
                    {agent.conversations.toLocaleString()} conversations
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-xs">
                    {agent.messages.toLocaleString()} messages
                  </span>
                </div>
              </div>
              {index < agents.length - 1 && (
                <div className="h-px w-full bg-border mt-3" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopAgentsPerformance;
