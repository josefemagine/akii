import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardFooter } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Bot,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Globe,
  Smartphone,
  MessageCircle,
  ShoppingBag,
  FileCode,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  platforms: string[];
  status: "active" | "inactive" | "draft";
  lastUpdated: string;
  messageCount: number;
  avatar?: string;
  version?: string;
  parentId?: string;
  isCloned?: boolean;
  industry?: string;
  languages?: string[];
  trainingDocuments?: string[];
  responseStyle?: string;
  contextMemory?: {
    shortTerm: boolean;
    longTerm: boolean;
  };
  handoffIntegration?: string;
}

const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Customer Support AI",
    description: "Handles customer inquiries and support tickets",
    platforms: ["website", "mobile"],
    status: "active",
    lastUpdated: "2023-07-01",
    messageCount: 1234,
    avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    version: "1.0",
  },
  {
    id: "agent-2",
    name: "Sales Assistant",
    description: "Helps with product recommendations and sales",
    platforms: ["whatsapp", "telegram"],
    status: "active",
    lastUpdated: "2023-06-25",
    messageCount: 856,
    avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    version: "1.0",
  },
  {
    id: "agent-3",
    name: "E-commerce Assistant",
    description: "Helps shoppers find products and complete purchases",
    platforms: ["shopify", "website"],
    status: "active",
    lastUpdated: "2023-06-15",
    messageCount: 567,
    avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    version: "1.0",
  },
  {
    id: "agent-4",
    name: "Blog Content Helper",
    description: "Assists with content creation and blog management",
    platforms: ["wordpress"],
    status: "draft",
    lastUpdated: "2023-06-18",
    messageCount: 0,
    avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    version: "1.0",
  },
  {
    id: "agent-3-clone",
    name: "E-commerce Assistant (Clone)",
    description:
      "Helps shoppers find products and complete purchases - cloned version",
    platforms: ["shopify", "website"],
    status: "draft",
    lastUpdated: "2023-06-01",
    messageCount: 0,
    avatar: "https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png",
    version: "1.0",
    parentId: "agent-3",
    isCloned: true,
  },
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "website":
      return <Globe className="h-4 w-4 text-blue-500" />;
    case "mobile":
      return <Smartphone className="h-4 w-4 text-green-500" />;
    case "whatsapp":
      return <MessageCircle className="h-4 w-4 text-emerald-500" />;
    case "telegram":
      return <MessageCircle className="h-4 w-4 text-blue-400" />;
    case "shopify":
      return <ShoppingBag className="h-4 w-4 text-purple-500" />;
    case "wordpress":
      return <FileCode className="h-4 w-4 text-orange-500" />;
    default:
      return <Bot className="h-4 w-4" />;
  }
};

const getStatusColor = (status: Agent["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-amber-500";
    case "draft":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};

const Agents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteAgent = (agentId: string) => {
    setAgents(agents.filter((agent) => agent.id !== agentId));
  };

  const handleCloneAgent = (agentId: string) => {
    const agentToClone = agents.find((agent) => agent.id === agentId);
    if (!agentToClone) return;

    const clonedAgent: Agent = {
      ...agentToClone,
      id: `${agentId}-clone-${Date.now()}`,
      name: `${agentToClone.name} (Clone)`,
      status: "draft",
      lastUpdated: new Date().toISOString().split("T")[0],
      messageCount: 0,
      parentId: agentId,
      isCloned: true,
    };

    setAgents([...agents, clonedAgent]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <Button asChild>
          <Link to="/dashboard/agent-setup">
            <Plus className="h-4 w-4 mr-2" /> Create Agent
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search agents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="bg-background border rounded-md px-3 py-2 text-sm">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Draft</option>
        </select>
        <select className="bg-background border rounded-md px-3 py-2 text-sm">
          <option>All Platforms</option>
          <option>Website</option>
          <option>Mobile</option>
          <option>WhatsApp</option>
          <option>Telegram</option>
          <option>Shopify</option>
          <option>WordPress</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10">
                    <img
                      src="https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png"
                      alt={agent.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{agent.name}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <span
                        className={`h-2 w-2 rounded-full ${getStatusColor(agent.status)}`}
                      ></span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/agent-setup?id=${agent.id}`}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCloneAgent(agent.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                {agent.description}
              </p>

              <div className="mt-4">
                <div className="text-xs text-muted-foreground mb-1">
                  Platforms
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.platforms.map((platform) => (
                    <div
                      key={platform}
                      className="flex items-center space-x-1 bg-muted px-2 py-1 rounded-md text-xs"
                    >
                      {getPlatformIcon(platform)}
                      <span className="capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              {agent.languages && agent.languages.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    Languages
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {agent.languages.map((language) => (
                      <div
                        key={language}
                        className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md text-xs"
                      >
                        {language}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agent.industry && (
                <div className="mt-3 text-xs">
                  <span className="text-muted-foreground">Industry: </span>
                  <span className="font-medium">{agent.industry}</span>
                </div>
              )}

              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <div>Messages: {agent.messageCount.toLocaleString()}</div>
                <div className="flex items-center gap-2">
                  {agent.version && (
                    <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full text-[10px]">
                      v{agent.version}
                    </span>
                  )}
                  {agent.isCloned && (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-[10px]">
                      Clone
                    </span>
                  )}
                  <span>Updated: {agent.lastUpdated}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/dashboard/agent/${agent.id}/analytics`}>
                  Analytics
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`/dashboard/agent/${agent.id}/conversations`}>
                  View Conversations
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
          <h3 className="mt-4 text-lg font-medium">No agents found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? `No agents matching "${searchQuery}"`
              : "Create your first AI agent to get started"}
          </p>
          <Button className="mt-4" asChild>
            <Link to="/dashboard/agent-setup">
              <Plus className="h-4 w-4 mr-2" /> Create Agent
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Agents;
