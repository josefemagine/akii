import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
  Send,
  Paperclip,
  X,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Search,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface ShopifyPreviewProps {
  chatName?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  agentName?: string;
  agentAvatar?: string;
}

// Mock products data
const mockProducts = [
  {
    id: "prod_1",
    name: "Premium Cotton T-Shirt",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80",
  },
  {
    id: "prod_2",
    name: "Slim Fit Jeans",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80",
  },
  {
    id: "prod_3",
    name: "Classic Leather Wallet",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
  },
];

export default function ShopifyPreview({
  chatName = "Shop Assistant",
  welcomeMessage = "Hello! How can I help you find the perfect product today?",
  primaryColor = "#4f46e5",
  position = "bottom-right",
  agentName = "Shop AI",
  agentAvatar = "",
}: ShopifyPreviewProps) {
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
      // Check if the message contains product-related keywords
      const productKeywords = [
        "shirt",
        "t-shirt",
        "tshirt",
        "tee",
        "jeans",
        "pants",
        "wallet",
        "leather",
      ];
      const hasProductKeyword = productKeywords.some((keyword) =>
        inputValue.toLowerCase().includes(keyword),
      );

      let botResponse: Message;

      if (hasProductKeyword) {
        // If product keywords are detected, include product recommendations
        const matchingProducts = mockProducts.filter((product) =>
          productKeywords.some(
            (keyword) =>
              product.name.toLowerCase().includes(keyword) &&
              inputValue.toLowerCase().includes(keyword),
          ),
        );

        const productsToShow =
          matchingProducts.length > 0 ? matchingProducts : [mockProducts[0]];

        botResponse = {
          id: (Date.now() + 1).toString(),
          content:
            matchingProducts.length > 0
              ? "I found these items that might interest you:"
              : "Here's one of our popular items you might like:",
          sender: "bot",
          timestamp: new Date(),
          products: productsToShow,
        };
      } else {
        // Generic responses for non-product queries
        const botResponses = [
          "I'd be happy to help you find the perfect product!",
          "Let me show you some of our best sellers.",
          "Is there a specific category you're interested in?",
          "Would you like me to recommend something based on your preferences?",
          "We have some great new arrivals that I think you'll love.",
        ];

        const randomResponse =
          botResponses[Math.floor(Math.random() * botResponses.length)];

        botResponse = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: "bot",
          timestamp: new Date(),
        };
      }

      setMessages((prevMessages) => [...prevMessages, botResponse]);
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
          <ShoppingBag className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`absolute ${positionClasses[position]} w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden transition-all`}
          style={{ height: isMinimized ? "48px" : "500px" }}
        >
          <Card className="h-full flex flex-col">
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
              <CardContent className="flex-1 p-0 flex flex-col">
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
                              <AvatarFallback className="text-xs">
                                {agentName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
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

                    {/* Product recommendations */}
                    {messages
                      .filter((m) => m.products && m.products.length > 0)
                      .map((message) => (
                        <div key={`${message.id}-products`} className="ml-10">
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {message.products?.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center border rounded-md p-2 bg-white"
                              >
                                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="text-sm font-medium">
                                    {product.name}
                                  </div>
                                  <div className="text-sm font-bold mt-1">
                                    ${product.price.toFixed(2)}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  className="ml-2"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  View
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Input
                      className="flex-1 mx-2"
                      placeholder="Ask about products..."
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
