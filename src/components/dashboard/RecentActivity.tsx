import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  MessageSquare,
  Bell,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type ActivityType =
  | "message"
  | "notification"
  | "document"
  | "alert"
  | "success";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  status?: "info" | "warning" | "error" | "success";
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  maxItems?: number;
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    case "notification":
      return <Bell className="h-4 w-4" />;
    case "document":
      return <FileText className="h-4 w-4" />;
    case "alert":
      return <AlertCircle className="h-4 w-4" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case "warning":
      return "bg-yellow-500";
    case "error":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "info":
    default:
      return "bg-blue-500";
  }
};

const RecentActivity = ({
  activities = defaultActivities,
  maxItems = 5,
}: RecentActivityProps) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="h-full bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto max-h-[320px] pb-2">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
          >
            <div className="flex-shrink-0">
              {activity.user ? (
                <Avatar>
                  {activity.user.avatar ? (
                    <AvatarImage
                      src={activity.user.avatar}
                      alt={activity.user.name}
                    />
                  ) : (
                    <AvatarFallback>{activity.user.initials}</AvatarFallback>
                  )}
                </Avatar>
              ) : (
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(activity.status)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {activity.description}
              </p>
              {activity.status && (
                <div className="mt-2">
                  <Badge
                    variant={
                      activity.status === "error"
                        ? "destructive"
                        : activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                            ? "secondary"
                            : "outline"
                    }
                    className="text-xs"
                  >
                    {activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const defaultActivities: ActivityItem[] = [
  {
    id: "1",
    type: "message",
    title: "New conversation started",
    description: "Customer initiated a chat with Sales Agent",
    time: "5 min ago",
    user: {
      name: "John Doe",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      initials: "JD",
    },
    status: "info",
  },
  {
    id: "2",
    type: "document",
    title: "Document uploaded",
    description: "Product catalog added to training data",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: "3",
    type: "alert",
    title: "Agent training completed",
    description: "Support Agent v2 is ready for deployment",
    time: "3 hours ago",
    status: "success",
  },
  {
    id: "4",
    type: "notification",
    title: "Subscription update",
    description: "Your plan will renew in 3 days",
    time: "Yesterday",
    status: "warning",
  },
  {
    id: "5",
    type: "message",
    title: "WhatsApp integration",
    description: "WhatsApp channel connected successfully",
    time: "2 days ago",
    user: {
      name: "Sarah Miller",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      initials: "SM",
    },
  },
  {
    id: "6",
    type: "alert",
    title: "API rate limit reached",
    description: "Consider upgrading your plan for higher limits",
    time: "3 days ago",
    status: "error",
  },
];

export default RecentActivity;
