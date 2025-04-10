import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Search,
  MessageSquare,
  MoreVertical,
  Trash2,
  Eye,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase.tsx";
import { Database } from "@/types/supabase.tsx";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"] & {
  agent?: {
    name: string;
  } | null;
  message_count?: number;
  title?: string;
  status?: string;
  updated_at?: string;
};

interface ConversationsListProps {
  conversations: ConversationRow[];
  onRefresh: () => void;
  onViewConversation: (id: string) => void;
  isLoading: boolean;
}

const ConversationsList = ({
  conversations = [],
  onRefresh = () => {},
  onViewConversation = () => {},
  isLoading = false,
}: ConversationsListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ is_active: false } as any)
        .eq("id", id);
      if (error) throw error;
      onRefresh();
    } catch (error) {
      console.error("Error archiving conversation:", error);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.agent?.name &&
        conv.agent.name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Conversations</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No conversations
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start chatting with an agent to see your conversations here.
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No results found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No conversations matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span>{conv.title || "Untitled"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{conv.agent?.name || "Unknown Agent"}</TableCell>
                    <TableCell>{conv.message_count || 0}</TableCell>
                    <TableCell>
                      {conv.updated_at
                        ? format(new Date(conv.updated_at), "MMM d, yyyy h:mm a")
                        : format(new Date(conv.started_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewConversation(conv.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Conversation</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleArchive(conv.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Archive</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(conv.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationsList;
