import React from "react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Upload,
  MessageSquare,
  Settings,
  BarChart,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  onClick?: () => void;
}

const QuickAction = ({
  title = "Action Title",
  description = "Action description goes here",
  icon = <PlusCircle className="h-6 w-6" />,
  variant = "outline",
  onClick = () => {},
}: QuickActionProps) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-left",
        "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-center">
        <h3 className="font-medium text-base">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </Button>
  );
};

interface QuickActionsProps {
  actions?: QuickActionProps[];
}

const QuickActions = ({ actions }: QuickActionsProps) => {
  const defaultActions: QuickActionProps[] = [
    {
      title: "Create New Agent",
      description: "Set up a new AI agent for your business",
      icon: <PlusCircle className="h-6 w-6" />,
      variant: "outline",
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

  const displayActions = actions || defaultActions;

  return (
    <div className="w-full bg-card p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayActions.map((action, index) => (
          <QuickAction key={index} {...action} />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
