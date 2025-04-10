import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../../../components/ui/card.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../components/ui/avatar.tsx";
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Mic,
  MicOff,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
}

interface AgentTesterProps {
  agentName?: string;
  agentAvatar?: string;
  initialMessages?: Message[];
  onFeedback?: (messageId: string, isPositive: boolean) => void;
  onReset?: () => void;
  onVoiceToggle?: (isActive: boolean) => void;
}

const AgentTester = ({
  agentName = "AI Assistant",
  agentAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=agent123",
  initialMessages = [
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ],
  onFeedback = () => {},
  onReset = () => {},
  onVoiceToggle = () => {},
}: AgentTesterProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        content:
          "This is a simulated response from the AI agent. In a real implementation, this would be the response from your trained AI model based on the training data you've provided.",
        sender: "agent",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    const newState = !isVoiceActive;
    setIsVoiceActive(newState);
    onVoiceToggle(newState);
    // In a real implementation, this would activate speech-to-text functionality
  };

  const handleReset = () => {
    setMessages(initialMessages);
    onReset();
  };

  const handleFeedback = (messageId: string, isPositive: boolean) => {
    onFeedback(messageId, isPositive);
    // In a real implementation, this would send feedback to improve the agent
  };

  return (
    <Card className="w-full h-full bg-background border-2 border-border">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={agentAvatar} alt={agentName} />
            <AvatarFallback>
              {agentName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{agentName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[400px] overflow-y-auto">
        <div className="flex flex-col p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{message.content}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {message.sender === "agent" && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleFeedback(message.id, true)}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleFeedback(message.id, false)}
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          title="Reset conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant={isVoiceActive ? "default" : "outline"}
          size="icon"
          onClick={toggleVoiceInput}
          title={isVoiceActive ? "Disable voice input" : "Enable voice input"}
        >
          {isVoiceActive ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        <Textarea
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-h-[40px] resize-none"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AgentTester;
