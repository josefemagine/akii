import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Search,
  Calendar,
  MessageSquare,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Download,
} from "lucide-react";

interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  userName: string;
  userEmail?: string;
  platform: string;
  date: string;
  time: string;
  messageCount: number;
  status: "completed" | "ongoing" | "flagged";
  rating?: "positive" | "negative" | null;
  summary?: string;
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    agentId: "agent-1",
    agentName: "Sales Assistant",
    agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sales",
    userName: "John Smith",
    userEmail: "john.smith@example.com",
    platform: "website",
    date: "2023-06-15",
    time: "14:32",
    messageCount: 12,
    status: "completed",
    rating: "positive",
    summary:
      "Customer inquired about product pricing and features. Provided information and directed to pricing page.",
  },
  {
    id: "conv-2",
    agentId: "agent-2",
    agentName: "Support Bot",
    agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
    userName: "Sarah Johnson",
    userEmail: "sarah.j@example.com",
    platform: "whatsapp",
    date: "2023-06-15",
    time: "10:15",
    messageCount: 8,
    status: "completed",
    rating: "negative",
    summary:
      "Customer had issue with account login. Troubleshooting steps provided but issue not resolved. Escalated to support team.",
  },
  {
    id: "conv-3",
    agentId: "agent-1",
    agentName: "Sales Assistant",
    agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sales",
    userName: "Michael Brown",
    userEmail: "m.brown@example.com",
    platform: "website",
    date: "2023-06-15",
    time: "09:47",
    messageCount: 5,
    status: "completed",
    rating: "positive",
    summary:
      "Customer requested product demo. Scheduled demo for next week and sent calendar invite.",
  },
  {
    id: "conv-4",
    agentId: "agent-3",
    agentName: "E-commerce Assistant",
    agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ecommerce",
    userName: "Emily Davis",
    userEmail: "emily.d@example.com",
    platform: "telegram",
    date: "2023-06-14",
    time: "16:20",
    messageCount: 15,
    status: "ongoing",
    rating: null,
    summary:
      "Customer browsing product catalog and asking about shipping options.",
  },
  {
    id: "conv-5",
    agentId: "agent-2",
    agentName: "Support Bot",
    agentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
    userName: "David Wilson",
    userEmail: "d.wilson@example.com",
    platform: "website",
    date: "2023-06-14",
    time: "11:05",
    messageCount: 7,
    status: "flagged",
    rating: "negative",
    summary:
      "Customer complained about billing issue. Needs review by billing department.",
  },
];

const ConversationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [filteredConversations, setFilteredConversations] =
    useState(mockConversations);

  // Filter conversations based on search term and selected tab
  const filterConversations = () => {
    let filtered = mockConversations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (conv) =>
          conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.summary?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by tab
    if (selectedTab === "completed") {
      filtered = filtered.filter((conv) => conv.status === "completed");
    } else if (selectedTab === "ongoing") {
      filtered = filtered.filter((conv) => conv.status === "ongoing");
    } else if (selectedTab === "flagged") {
      filtered = filtered.filter((conv) => conv.status === "flagged");
    }

    setFilteredConversations(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  // Apply filters when search term or selected tab changes
  React.useEffect(() => {
    filterConversations();
  }, [searchTerm, selectedTab]);

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex space-x-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="mt-6">
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flagged" className="mt-6">
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ConversationCardProps {
  conversation: Conversation;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
}) => {
  const {
    agentName,
    agentAvatar,
    userName,
    platform,
    date,
    time,
    messageCount,
    status,
    rating,
    summary,
  } = conversation;

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "flagged":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "website":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 13.12V14C8 15.1 8.9 16 10 16H14V17.87C13.37 17.95 12.69 18 12 18C7.59 18 4 15.41 4 12ZM17.93 16.51C17.63 15.66 16.85 15 16 15H14V13C14 12.45 13.55 12 13 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 13.82 19.2 15.46 17.93 16.51Z"
              fill="currentColor"
            />
          </svg>
        );
      case "whatsapp":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.6 14.0001C16.4 13.9001 15.1 13.3001 14.9 13.2001C14.7 13.1001 14.5 13.1001 14.3 13.3001C14.1 13.5001 13.7 14.1001 13.5 14.3001C13.4 14.5001 13.2 14.5001 13 14.4001C12.3 14.1001 11.6 13.7001 11 13.2001C10.5 12.7001 10 12.1001 9.6 11.5001C9.5 11.3001 9.6 11.1001 9.7 11.0001C9.8 10.9001 9.9 10.7001 10.1 10.6001C10.2 10.5001 10.3 10.3001 10.3 10.2001C10.4 10.1001 10.4 9.9001 10.3 9.8001C10.2 9.7001 9.7 8.5001 9.5 8.0001C9.4 7.3001 9.2 7.3001 9 7.3001C8.9 7.3001 8.7 7.3001 8.5 7.3001C8.3 7.3001 8 7.5001 7.9 7.6001C7.3 8.2001 7 8.9001 7 9.7001C7.1 10.6001 7.4 11.5001 8 12.3001C9.1 13.9001 10.5 15.2001 12.2 16.0001C12.7 16.2001 13.1 16.4001 13.6 16.5001C14.1 16.7001 14.6 16.7001 15.2 16.6001C15.9 16.5001 16.5 16.0001 16.9 15.4001C17.1 15.0001 17.1 14.6001 17 14.2001C17 14.2001 16.8 14.1001 16.6 14.0001ZM19.1 4.9001C15.2 1.0001 8.9 1.0001 5 4.9001C1.8 8.1001 1.2 13.0001 3.4 16.9001L2 22.0001L7.3 20.6001C8.8 21.4001 10.4 21.8001 12 21.8001C17.5 21.8001 21.9 17.4001 21.9 11.9001C22 9.3001 20.9 6.8001 19.1 4.9001ZM16.4 18.9001C15.1 19.7001 13.6 20.2001 12 20.2001C10.5 20.2001 9.1 19.8001 7.8 19.1001L7.5 18.9001L4.4 19.7001L5.2 16.7001L5 16.4001C2.6 12.4001 3.8 7.4001 7.7 4.9001C11.6 2.4001 16.6 3.7001 19 7.5001C21.4 11.4001 20.3 16.5001 16.4 18.9001Z"
              fill="currentColor"
            />
          </svg>
        );
      case "telegram":
        return (
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z"
              fill="currentColor"
            />
          </svg>
        );
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 flex items-start gap-4">
          <div className="flex-shrink-0">
            {agentAvatar ? (
              <img
                src={agentAvatar}
                alt={agentName}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm">{agentName}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  <span className="truncate">{userName}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {messageCount}
                </span>

                <span className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {date} {time}
                </span>

                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(status)}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>

            {summary && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {summary}
              </p>
            )}

            <div className="mt-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs bg-secondary/50 px-2 py-1 rounded-md">
                  {getPlatformIcon(platform)}
                  <span className="ml-1 capitalize">{platform}</span>
                </span>
              </div>

              {rating && (
                <div>
                  {rating === "positive" ? (
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationsPage;
