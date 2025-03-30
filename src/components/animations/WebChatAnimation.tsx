import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  delay: number;
  isCode?: boolean;
  isFeature?: boolean;
  isHighlighted?: boolean;
  isTyping?: boolean;
}

const WebChatAnimation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const [showFeatureList, setShowFeatureList] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string>("support");
  const [demoChangeTimer, setDemoChangeTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Different conversation scenarios
  const supportConversation: Message[] = [
    {
      id: 1,
      text: "I need to build an AI assistant for my company that can handle customer support and sales inquiries.",
      sender: "user",
      delay: 1000,
    },
    {
      id: 2,
      text: "Perfect timing! With Akii, you can create your own private AI instance trained on your specific business data. What kind of data would you like to train it with?",
      sender: "bot",
      delay: 2000,
    },
    {
      id: 3,
      text: "We have product manuals, FAQs, and past customer support conversations. Can we use all of these?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 4,
      text: "Absolutely! Akii can ingest all those document types. Your AI will learn from your product information, support history, and company voice to provide accurate, branded responses.",
      sender: "bot",
      delay: 2500,
    },
    {
      id: 5,
      text: "That sounds great. Where can we deploy this AI assistant once it's trained?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 6,
      text: "You can deploy your Akii AI assistant across multiple platforms:",
      sender: "bot",
      delay: 1800,
      isFeature: true,
    },
    {
      id: 7,
      text: "✓ Website chat widget",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 8,
      text: "✓ Mobile apps (iOS & Android)",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 9,
      text: "✓ WhatsApp & Telegram",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 10,
      text: "✓ Shopify & WordPress",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 11,
      text: "✓ Custom API integration",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
  ];

  const salesConversation: Message[] = [
    {
      id: 1,
      text: "I'm looking for a solution to boost our sales team's performance with AI. Can Akii help?",
      sender: "user",
      delay: 1000,
    },
    {
      id: 2,
      text: "Absolutely! Akii can transform your sales operations by creating a private AI trained on your product catalog, pricing, and past successful sales conversations.",
      sender: "bot",
      delay: 2000,
    },
    {
      id: 3,
      text: "How would this help our sales reps specifically?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 4,
      text: "Your sales team will benefit in multiple ways:",
      sender: "bot",
      delay: 1800,
      isFeature: true,
    },
    {
      id: 5,
      text: "✓ 24/7 lead qualification & nurturing",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 6,
      text: "✓ Instant product recommendations",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 7,
      text: "✓ Automated follow-ups & scheduling",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 8,
      text: "✓ Deal analytics & forecasting",
      sender: "bot",
      delay: 800,
      isHighlighted: true,
    },
    {
      id: 9,
      text: "Can we integrate this with our existing CRM?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 10,
      text: "Yes! Akii connects seamlessly with popular CRMs like Salesforce, HubSpot, and Pipedrive. We also offer a flexible API for custom integrations.",
      sender: "bot",
      delay: 2500,
    },
  ];

  const developerConversation: Message[] = [
    {
      id: 1,
      text: "I'm a developer looking to build custom AI applications. Does Akii offer an API?",
      sender: "user",
      delay: 1000,
    },
    {
      id: 2,
      text: "Yes! Akii provides a comprehensive Private AI API that gives you full control to build custom applications with your own AI instance.",
      sender: "bot",
      delay: 2000,
    },
    {
      id: 3,
      text: "Great! Can you show me a code example of how I would use it?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 4,
      text: "Here's a simple example of querying your private AI instance:",
      sender: "bot",
      delay: 1500,
    },
    {
      id: 5,
      text: "// Initialize the Akii client\nconst akii = new AkiiClient({\n  apiKey: 'your_api_key',\n  privateInstanceId: 'your_instance_id'\n});\n\n// Query your private AI\nasync function askPrivateAI(question) {\n  const response = await akii.privateAI.query({\n    prompt: question,\n    context: 'customer_support',\n    temperature: 0.7\n  });\n\n  return response.text;\n}\n\n// Example usage\nconst answer = await askPrivateAI('How do I reset my password?');\nconsole.log(answer);",
      sender: "bot",
      delay: 1500,
      isCode: true,
    },
    {
      id: 6,
      text: "What about streaming responses for a chat interface?",
      sender: "user",
      delay: 2000,
    },
    {
      id: 7,
      text: "Absolutely! Here's how you'd implement streaming:",
      sender: "bot",
      delay: 1500,
    },
    {
      id: 8,
      text: "// Stream responses for real-time chat\nakii.privateAI.streamQuery({\n  prompt: userQuestion,\n  context: 'sales',\n  temperature: 0.5\n}, {\n  onToken: (token) => {\n    // Append token to UI in real-time\n    chatInterface.appendText(token);\n  },\n  onComplete: (fullResponse) => {\n    // Handle completion (e.g., enable input)\n    chatInterface.setLoading(false);\n  },\n  onError: (error) => {\n    console.error('Stream error:', error);\n  }\n});\n",
      sender: "bot",
      delay: 1500,
      isCode: true,
    },
  ];

  // Reference to the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current conversation based on active demo
  const getCurrentConversation = () => {
    switch (activeDemo) {
      case "support":
        return supportConversation;
      case "sales":
        return salesConversation;
      case "developer":
        return developerConversation;
      default:
        return supportConversation;
    }
  };

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  // Handle demo change
  const changeDemoType = () => {
    const demos = ["support", "sales", "developer"];
    const currentIndex = demos.indexOf(activeDemo);
    const nextIndex = (currentIndex + 1) % demos.length;
    setActiveDemo(demos[nextIndex]);
    setMessages([]);
    setCurrentMessageIndex(0);
    setShowFeatureList(false);
    setTyping(false);
  };

  useEffect(() => {
    const conversation = getCurrentConversation();

    if (currentMessageIndex < conversation.length) {
      const currentMessage = conversation[currentMessageIndex];

      // Show typing indicator
      setTyping(true);

      const timer = setTimeout(() => {
        setMessages((prev) => [...prev, currentMessage]);
        setTyping(false);

        // If this is the feature message, set the flag to show feature list
        if (currentMessage.isFeature) {
          setShowFeatureList(true);
        }

        setCurrentMessageIndex((prev) => prev + 1);
      }, currentMessage.delay);

      return () => clearTimeout(timer);
    } else {
      // Restart the animation after a pause and change demo type
      const resetTimer = setTimeout(() => {
        changeDemoType();
      }, 3000);

      return () => clearTimeout(resetTimer);
    }
  }, [currentMessageIndex, activeDemo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Demo title based on active demo
  const getDemoTitle = () => {
    switch (activeDemo) {
      case "support":
        return "Akii Support Assistant";
      case "sales":
        return "Akii Sales Assistant";
      case "developer":
        return "Akii Developer API";
      default:
        return "Akii AI Assistant";
    }
  };

  return (
    <div className="w-full h-full bg-card rounded-lg shadow-xl overflow-hidden flex flex-col border border-primary/20">
      {/* Chat header */}
      <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
          <h3 className="font-medium">{getDemoTitle()}</h3>
        </div>
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-primary-foreground/70"></div>
          <div className="h-2 w-2 rounded-full bg-primary-foreground/70"></div>
          <div className="h-2 w-2 rounded-full bg-primary-foreground/70"></div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4 bg-muted/20">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={`${activeDemo}-${message.id}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              className={cn(
                "max-w-[85%] p-3 rounded-lg",
                message.sender === "user"
                  ? "bg-muted self-end rounded-br-none"
                  : message.isCode
                    ? "bg-black text-green-400 font-mono text-sm self-start rounded-bl-none overflow-x-auto w-full"
                    : message.isHighlighted
                      ? "bg-primary/80 text-primary-foreground self-start rounded-bl-none"
                      : "bg-primary text-primary-foreground self-start rounded-bl-none",
              )}
            >
              {message.isCode ? (
                <pre className="whitespace-pre-wrap">{message.text}</pre>
              ) : (
                message.text
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-primary text-primary-foreground self-start rounded-lg rounded-bl-none max-w-[80%] p-3"
          >
            <div className="flex space-x-2">
              <motion.div
                className="h-2 w-2 rounded-full bg-primary-foreground"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  repeatType: "loop",
                }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-primary-foreground"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: 0.3,
                  repeatType: "loop",
                }}
              />
              <motion.div
                className="h-2 w-2 rounded-full bg-primary-foreground"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  delay: 0.6,
                  repeatType: "loop",
                }}
              />
            </div>
          </motion.div>
        )}
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Demo indicator */}
      <div className="px-4 py-2 bg-muted/10 border-t border-border/50 flex justify-center">
        <div className="flex space-x-2">
          <motion.div
            className={`h-2 w-2 rounded-full ${activeDemo === "support" ? "bg-primary" : "bg-muted"}`}
            animate={activeDemo === "support" ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className={`h-2 w-2 rounded-full ${activeDemo === "sales" ? "bg-primary" : "bg-muted"}`}
            animate={activeDemo === "sales" ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.div
            className={`h-2 w-2 rounded-full ${activeDemo === "developer" ? "bg-primary" : "bg-muted"}`}
            animate={activeDemo === "developer" ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </div>

      {/* Chat input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-muted/30 p-2 rounded-l-md focus:outline-none"
            disabled
          />
          <button className="bg-primary text-primary-foreground p-2 rounded-r-md hover:bg-primary/90 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebChatAnimation;
