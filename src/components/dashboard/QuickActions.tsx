import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Plus, Upload, MessageSquare, Settings, BarChart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  onClick: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: "Create AI Instance",
      description: "Set up a new AI agent with custom settings",
      icon: <Plus className="h-6 w-6" />,
      variant: "default",
      onClick: () => console.log("Create New Agent clicked"),
    },
    {
      title: "Upload Training Data",
      description: "Add documents to train your AI agents",
      icon: <Upload className="h-6 w-6" />,
      variant: "outline",
      onClick: () => console.log("Upload Training Data clicked"),
    },
    {
      title: "View Conversations",
      description: "Review recent agent conversations",
      icon: <MessageSquare className="h-6 w-6" />,
      variant: "outline",
      onClick: () => console.log("View Conversations clicked"),
    },
    {
      title: "Configure API Access",
      description: "Set up and manage your Private AI API",
      icon: <Settings className="h-6 w-6" />,
      variant: "outline",
      onClick: () => console.log("Configure API Access clicked"),
    },
    {
      title: "Analytics Dashboard",
      description: "View performance metrics and insights",
      icon: <BarChart className="h-6 w-6" />,
      variant: "outline",
      onClick: () => console.log("Analytics Dashboard clicked"),
    },
    {
      title: "Deploy to Platform",
      description: "Deploy your agent to any supported platform",
      icon: <Zap className="h-6 w-6" />,
      variant: "outline",
      onClick: () => console.log("Deploy to Platform clicked"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto flex-col items-start gap-2 p-4 text-left"
              onClick={action.onClick}
            >
              <div className="flex w-full items-center gap-3">
                {action.icon}
                <div className="space-y-1">
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
