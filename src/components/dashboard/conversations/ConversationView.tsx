import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types/custom";
import { Database } from "@/types/supabase";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
};

type ConversationWithAgent =
  Database["public"]["Tables"]["conversations"]["Row"] & {
    agent: Agent | null;
    title?: string;
    status?: string;
    updated_at?: string;
  };

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationView = ({
  conversationId,
  onBack = () => {},
}: ConversationViewProps) => {
  const [conversation, setConversation] =
    useState<ConversationWithAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const fetchConversation = async () => {
    if (!user || !conversationId) return;

    setIsLoading(true);
    try {
      // Fetch conversation details
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select(
          `
          *,
          agent:agents(
            id,
            name,
            description,
            avatar_url
          )
        `,
        )
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .single();

      if (convError) throw convError;

      const isValidAgent = (obj: any): obj is Agent => {
        return (
          obj &&
          typeof obj === "object" &&
          "id" in obj &&
          typeof obj.id === "string" &&
          "name" in obj &&
          typeof obj.name === "string" &&
          "description" in obj &&
          "avatar_url" in obj
        );
      };

      // Process the conversation data to match our type
      const processedConversation = {
        ...(convData as any),
        agent: Array.isArray((convData as any).agent)
          ? (convData as any).agent[0] &&
            isValidAgent((convData as any).agent[0])
            ? (convData as any).agent[0]
            : null
          : isValidAgent((convData as any).agent)
            ? (convData as any).agent
            : null,
      } as ConversationWithAgent;

      setConversation(processedConversation);

      // Fetch messages
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (msgError) throw msgError;
      const processedMessages = (msgData || []).map((msg) => {
        const typedMsg =
          msg as unknown as Database["public"]["Tables"]["messages"]["Row"];
        return {
          ...typedMsg,
          role: typedMsg.sender_type as "user" | "assistant" | "system",
        };
      }) as Message[];
      setMessages(processedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();

    // Set up realtime subscription for new messages
    const subscription = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg =
            payload.new as Database["public"]["Tables"]["messages"]["Row"];
          const processedMessage: Message = {
            ...newMsg,
            role: newMsg.sender_type as "user" | "assistant" | "system",
          };
          setMessages((prev) => [...prev, processedMessage]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [conversationId, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation) return;

    setIsSending(true);
    try {
      // Insert user message
      const { error: messageError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "user",
        role: "user",
        user_id: user?.id || "",
        content: newMessage,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      if (messageError) throw messageError;

      // Clear input
      setNewMessage("");

      // In a real implementation, you would call the AI service here
      // For demo purposes, we'll simulate an AI response after a delay
      setTimeout(async () => {
        try {
          const aiMessageData = {
            conversation_id: conversationId,
            sender_type: "assistant",
            role: "assistant",
            user_id: user?.id || "",
            content: `This is a simulated response to: "${newMessage}". In a real implementation, this would be generated by the AI agent.`,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any;

          await supabase.from("messages").insert(aiMessageData as any);
        } catch (error) {
          console.error("Error sending AI response:", error);
        } finally {
          setIsSending(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSending(false);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === "user";

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div className="flex items-start max-w-[80%]">
          {!isUser && (
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage
                src={conversation?.agent?.avatar_url || ""}
                alt={conversation?.agent?.name || "AI"}
              />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={`px-4 py-2 rounded-lg ${
              isUser ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            <div className="text-sm">{message.content}</div>
            <div className="text-xs mt-1 opacity-70">
              {format(new Date(message.created_at), "h:mm a")}
            </div>
          </div>
          {isUser && (
            <Avatar className="h-8 w-8 ml-2">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`}
                alt="You"
              />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Loading conversation...</h3>
        </div>
      </Card>
    );
  }

  if (!conversation) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium">Conversation not found</h3>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Conversations
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={conversation.agent?.avatar_url || ""}
                alt={conversation.agent?.name || "AI"}
              />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{conversation.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {conversation.agent?.name || "Unknown Agent"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">
                No messages in this conversation
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start the conversation by sending a message below.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="flex-shrink-0"
          >
            {isSending ? "Sending..." : "Send"}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ConversationView;
