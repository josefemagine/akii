import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { Message } from "@/types/custom.ts";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";
import { useToast } from "@/components/ui/use-toast.ts";
import { supabase } from "@/lib/supabase.tsx";

type Agent = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
};

type Conversation = {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  agent: Agent | null;
};

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationView = ({
  conversationId,
  onBack = () => {},
}: ConversationViewProps) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversation = async () => {
    if (!user || !conversationId) return;

    setIsLoading(true);
    try {
      // Fetch conversation details using edge function
      const conversationData = await invokeServerFunction<{conversation: Conversation}>("get_conversation", {
        conversationId,
        userId: user.id
      });

      if (conversationData?.conversation) {
        setConversation(conversationData.conversation);
      } else {
        toast({
          title: "Error",
          description: "Conversation not found",
          variant: "destructive"
        });
        return;
      }

      // Fetch messages using edge function
      const messagesData = await invokeServerFunction<{messages: Message[]}>("get_conversation_messages", {
        conversationId,
        userId: user.id
      });

      if (messagesData?.messages) {
        setMessages(messagesData.messages);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive"
      });
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
          // Process the new message
          const newMsg = payload.new as any;
          const processedMessage = {
            role: newMsg.role,
            id: newMsg.id,
            conversation_id: newMsg.conversation_id,
            content: newMsg.content,
            created_at: newMsg.created_at,
            user_id: newMsg.user_id,
            sender_type: newMsg.sender_type,
            metadata: newMsg.metadata
          } as Message;
          
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
      // Send message using edge function
      const response = await invokeServerFunction<{message: Message, success: boolean}>("send_message", {
        conversationId,
        userId: user.id,
        content: newMessage,
        role: "user"
      });

      if (!response || !response.success) {
        throw new Error("Failed to send message");
      }

      // Clear input
      setNewMessage("");

      // The AI response will be added via the realtime subscription
      // We don't need to manually add the user message either, as it will come through the subscription
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
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
