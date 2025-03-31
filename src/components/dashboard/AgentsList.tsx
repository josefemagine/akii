import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Play,
  Pause,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  type: string;
  platform: string;
  lastUpdated: string;
  messageCount: number;
  avatar: string;
}

interface AgentsListProps {
  agents?: Agent[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, newStatus: "active" | "paused") => void;
  onDuplicate?: (id: string) => void;
  onView?: (id: string) => void;
}

const AgentsList = ({
  agents = [
    {
      id: "1",
      name: "Sales Assistant",
      description: "Handles product inquiries and sales questions",
      status: "active",
      type: "Sales",
      platform: "Website",
      lastUpdated: "2023-06-15",
      messageCount: 1243,
      avatar: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
      id: "2",
      name: "Support Bot",
      description: "Provides technical support and troubleshooting",
      status: "active",
      type: "Support",
      platform: "WhatsApp",
      lastUpdated: "2023-06-10",
      messageCount: 856,
      avatar: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
      id: "3",
      name: "Product Recommender",
      description: "Suggests products based on customer preferences",
      status: "paused",
      type: "Sales",
      platform: "Shopify",
      lastUpdated: "2023-06-05",
      messageCount: 421,
      avatar: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
    },
    {
      id: "4",
      name: "FAQ Assistant",
      description: "Answers frequently asked questions",
      status: "draft",
      type: "Support",
      platform: "Telegram",
      lastUpdated: "2023-06-01",
      messageCount: 0,
      avatar: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
    },
  ],
  onEdit = () => {},
  onDelete = () => {},
  onToggleStatus = () => {},
  onDuplicate = () => {},
  onView = () => {},
}: AgentsListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "draft":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "website":
        return "🌐";
      case "whatsapp":
        return "📱";
      case "shopify":
        return "🛒";
      case "telegram":
        return "📨";
      case "wordpress":
        return "📝";
      case "mobile":
        return "📲";
      default:
        return "💬";
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">AI Agents</CardTitle>
        <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
          <Link to="/dashboard/agents/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Agent
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Platform
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Last Updated
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                  Messages
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {agent.description}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`${getStatusColor(agent.status)} capitalize`}
                    >
                      {agent.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">{agent.type}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <span>{getPlatformIcon(agent.platform)}</span>
                      <span>{agent.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {agent.lastUpdated}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {agent.messageCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(agent.id)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(agent.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        {agent.status !== "draft" && (
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleStatus(
                                agent.id,
                                agent.status === "active" ? "paused" : "active",
                              )
                            }
                          >
                            {agent.status === "active" ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                <span>Activate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onDuplicate(agent.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(agent.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentsList;
