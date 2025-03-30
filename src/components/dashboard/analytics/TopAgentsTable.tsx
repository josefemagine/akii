import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  avatar_url: string | null;
  messages: number;
  conversations: number;
  rating: number;
  type?: string;
}

interface TopAgentsTableProps {
  agents?: Agent[];
  period?: string;
}

const TopAgentsTable = ({
  agents = [
    {
      id: "agent-1",
      name: "Sales Assistant",
      avatar_url: null,
      messages: 3650,
      conversations: 842,
      rating: 4.8,
      type: "Sales",
    },
    {
      id: "agent-2",
      name: "Support Helper",
      avatar_url: null,
      messages: 2980,
      conversations: 756,
      rating: 4.7,
      type: "Support",
    },
    {
      id: "agent-3",
      name: "Product Guide",
      avatar_url: null,
      messages: 2450,
      conversations: 624,
      rating: 4.6,
      type: "Product",
    },
    {
      id: "agent-4",
      name: "Onboarding Agent",
      avatar_url: null,
      messages: 1980,
      conversations: 512,
      rating: 4.9,
      type: "Onboarding",
    },
  ],
  period = "Last 30 days",
}: TopAgentsTableProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Performing Agents</CardTitle>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              No agent data available
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Messages</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={agent.avatar_url || ""}
                          alt={agent.name}
                        />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.messages.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.conversations.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span>{agent.rating.toFixed(1)}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-4 w-4 ${star <= Math.round(agent.rating) ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TopAgentsTable;
