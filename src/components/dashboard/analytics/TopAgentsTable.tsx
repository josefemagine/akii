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
      avatar_url: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
      messages: 3650,
      conversations: 842,
      rating: 4.8,
      type: "Sales",
    },
    {
      id: "agent-2",
      name: "Support Helper",
      avatar_url: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
      messages: 2980,
      conversations: 756,
      rating: 4.7,
      type: "Support",
    },
    {
      id: "agent-3",
      name: "Product Guide",
      avatar_url: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
      messages: 2450,
      conversations: 624,
      rating: 4.6,
      type: "Product",
    },
    {
      id: "agent-4",
      name: "Onboarding Agent",
      avatar_url: "https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png",
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
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.avatar_url} alt={agent.name} />
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.type}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.messages.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.conversations.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.rating.toFixed(1)}
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
