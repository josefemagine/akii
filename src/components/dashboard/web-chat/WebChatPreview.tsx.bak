import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, Maximize2, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface WebChatPreviewProps {
  chatName?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  agentName?: string;
  agentAvatar?: string;
}

export default function WebChatPreview({
  chatName = "My Web Chat",
  welcomeMessage = "Hello! How can I help you today?",
  primaryColor = "#4f46e5",
  position = "bottom-right",
  agentName = "AI Assistant",
  agentAvatar = "",
}: WebChatPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: welcomeMessage,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I'd be happy to help with that!",
        "Let me check that for you.",
        "Great question! Here's what you need to know...",
        "Thanks for reaching out. I can definitely assist with this.",
        "I understand what you're looking for. Here's my recommendation...",
      ];

      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <div className="relative h-full w-full">
      {/* Chat button */}
      {!isOpen && (
        <button
          className={`absolute ${positionClasses[position]} flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105`}
          style={{ backgroundColor: primaryColor }}
          onClick={toggleChat}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`absolute ${positionClasses[position]} w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden transition-all`}
          style={{ height: isMinimized ? "48px" : "400px" }}
        >
          <Card className="h-full flex flex-col dark:border-gray-700">
            {/* Chat header */}
            <div
              className="p-3 flex items-center justify-between cursor-pointer"
              style={{ backgroundColor: primaryColor }}
              onClick={toggleMinimize}
            >
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={agentAvatar} />
                  <AvatarFallback className="text-xs bg-white/20 text-white">
                    {agentName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white font-medium">{chatName}</div>
              </div>
              <div className="flex items-center">
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4 text-white" />
                ) : (
                  <Minimize2 className="h-4 w-4 text-white" />
                )}
                <X
                  className="h-5 w-5 text-white ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Chat content */}
            {!isMinimized && (
              <CardContent className="flex-1 p-0 flex flex-col dark:bg-gray-800">
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-end">
                          {message.sender === "bot" && (
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={agentAvatar} />
                              <AvatarFallback className="text-xs dark:bg-gray-700">
                                {agentName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted dark:bg-gray-700"}`}
                            style={{
                              backgroundColor:
                                message.sender === "user"
                                  ? primaryColor
                                  : undefined,
                            }}
                          >
                            <div>{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}
                            >
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t dark:border-gray-700">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      className="flex-1 mx-2"
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
