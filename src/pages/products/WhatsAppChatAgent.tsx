import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import {
  Check,
  MessageSquare,
  Smartphone,
  Zap,
  Globe,
  Clock,
  Users,
  ArrowRight,
  Bot,
  Shield,
  Settings,
  Star,
  Phone,
} from "lucide-react";

const WhatsAppChatAgent = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
                <MessageSquare className="mr-1 h-4 w-4" />
                WhatsApp Integration
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AI-Powered <span className="text-primary">WhatsApp Chat</span> For Your Business
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Transform customer interactions on WhatsApp with an intelligent chat solution that automates support, personalizes conversations, and drives conversions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/signup">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">
                    View Live Demo
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative rounded-lg overflow-hidden border bg-card p-2"
            >
              <div className="rounded-md overflow-hidden bg-background/50">
                <div className="flex items-center gap-1 p-2 bg-green-800">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-white text-xs ml-2">WhatsApp Business</span>
                </div>
                <div className="p-4 flex flex-col h-[360px] justify-between">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                        <p>Hello! Welcome to Acme Store. How can I assist you today?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                        <p>I'm looking for information about your summer sale. Do you have any discounts on outdoor furniture?</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                        <p>Yes! Our summer sale is on now with 30% off all patio furniture. Here are some popular items:</p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                            <p className="text-xs font-medium">Lounge Set</p>
                            <p className="text-xs text-muted-foreground">$399 $279</p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 rounded p-2">
                            <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                            <p className="text-xs font-medium">Patio Table</p>
                            <p className="text-xs text-muted-foreground">$249 $174</p>
                          </div>
                        </div>
                        <p className="mt-2">Would you like to learn more about any of these items?</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="w-full rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm" 
                    />
                    <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full aspect-square rounded-full text-green-600">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 px-1">
                    <div className="text-xs text-muted-foreground">Powered by <span className="font-medium text-green-600">Akii</span></div>
                    <div className="flex gap-2">
                      <button className="text-muted-foreground hover:text-foreground">
                        <Settings className="h-3 w-3" />
                      </button>
                      <button className="text-muted-foreground hover:text-foreground">
                        <Zap className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-green-500/20 to-primary/20 blur-3xl rounded-full opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Powerful WhatsApp Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build powerful AI conversations on
              WhatsApp for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Official WhatsApp API
              </h3>
              <p className="text-muted-foreground">
                Seamlessly integrate with the official WhatsApp Business API
                for reliable and compliant messaging.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Multi-language Support
              </h3>
              <p className="text-muted-foreground">
                Communicate with your customers in their preferred language
                with automatic translation capabilities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Customer Segmentation
              </h3>
              <p className="text-muted-foreground">
                Target specific customer segments with personalized messaging
                based on their preferences and behavior.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                24/7 Availability
              </h3>
              <p className="text-muted-foreground">
                Provide round-the-clock support to your WhatsApp customers
                without increasing staffing costs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Rich Media Support
              </h3>
              <p className="text-muted-foreground">
                Send and receive images, documents, and other media types to
                enhance the customer experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Ready</h3>
              <p className="text-muted-foreground">
                Built with WhatsApp's messaging policies in mind to ensure
                your business stays compliant.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-background/80 to-background/60 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Get up and running with Akii WhatsApp Chat in minutes. Our simple integration process connects your WhatsApp Business account to our intelligent AI system.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div className="lg:col-span-3 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">1</div>
                  <h3 className="text-xl font-semibold">Connect your WhatsApp Business account</h3>
                </div>
                <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                  <pre className="overflow-x-auto text-sm text-muted-foreground">
                    <code>{`// Register your WhatsApp Business account with Akii
const whatsappConfig = {
  phoneNumberId: "YOUR_WHATSAPP_PHONE_NUMBER_ID",
  businessAccountId: "YOUR_BUSINESS_ACCOUNT_ID",
  accessToken: "YOUR_WHATSAPP_ACCESS_TOKEN"
};

// Initialize the WhatsApp connection
await akii.whatsapp.connect(whatsappConfig);`}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">2</div>
                  <h3 className="text-xl font-semibold">Configure your AI agent with custom knowledge</h3>
                </div>
                <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                  <pre className="overflow-x-auto text-sm text-muted-foreground">
                    <code>{`// Define your agent's knowledge and behavior
const agent = akii.whatsapp.createAgent({
  name: "Sales Assistant",
  welcomeMessage: "Hello! I'm your shopping assistant. How can I help you today?",
  knowledgeBase: ["products.csv", "faq.md", "policies.md"],
  languages: ["en", "es", "fr"],
  handoffConditions: {
    sentiment: "negative",
    specificIntents: ["refund", "complaint"]
  }
});`}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">3</div>
                  <h3 className="text-xl font-semibold">Deploy and monitor your WhatsApp AI</h3>
                </div>
                <p className="text-muted-foreground">
                  With just a few clicks, your WhatsApp AI is ready to engage with customers. Monitor performance, conversations, and insights through your Akii.com dashboard.
                </p>
                <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                  <pre className="overflow-x-auto text-sm text-muted-foreground">
                    <code>{`// Deploy your agent
await agent.deploy();

// Get real-time analytics and logs
const analytics = await akii.whatsapp.getAnalytics({
  timeframe: "last_7_days",
  metrics: ["conversations", "resolution_rate", "sentiment", "handoffs"]
});

console.log(\`Average sentiment score: \${analytics.sentiment.average}\`);
console.log(\`Conversation volume: \${analytics.conversations.total}\`);`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="border border-border p-4 rounded-xl shadow-lg bg-background">
                <div className="border-b border-border pb-3 mb-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-muted-foreground">WhatsApp Business Dashboard</span>
                  </div>
                </div>
                <div className="h-[400px] relative">
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex border-b border-border p-2 bg-green-50 dark:bg-green-900/20">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex-shrink-0 mr-3 flex items-center justify-center text-white font-bold text-xs">A</div>
                      <div>
                        <div className="text-sm font-medium">Akii Sales Assistant</div>
                        <div className="text-xs text-muted-foreground">Active now</div>
                      </div>
                    </div>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                      <div className="flex justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-xs text-sm">
                          I'm interested in your new summer collection
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 max-w-xs text-sm">
                          Great choice! Our summer collection just launched. Here are some of our bestsellers:
                          <div className="mt-2 border-t border-border pt-2">
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                            <div className="text-xs font-medium">Summer 2023 Catalog</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 max-w-xs text-sm">
                          Do you have the blue dress in size M?
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 max-w-xs text-sm">
                          Let me check that for you... Yes! The blue summer dress is available in size M. Would you like me to help you place an order?
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border p-2 flex">
                      <input 
                        type="text" 
                        placeholder="Type a message" 
                        className="flex-1 bg-transparent border-0 focus:outline-none text-sm" 
                      />
                      <button className="text-green-600 p-1">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              WhatsApp Business Use Cases
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your WhatsApp AI agent powers endless possibilities for your
              business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-8 border border-border shadow-sm"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Customer Support
              </h3>
              <p className="text-muted-foreground mb-6">
                Provide instant answers to customer inquiries, troubleshoot
                issues, and resolve complaints directly through WhatsApp.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Instant responses to common questions</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Automated issue resolution</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Seamless human agent handoff</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-8 border border-border shadow-sm"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Sales & Marketing
              </h3>
              <p className="text-muted-foreground mb-6">
                Drive conversions with personalized product recommendations,
                promotions, and interactive shopping experiences.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Personalized product recommendations</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Automated follow-ups and reminders</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Abandoned cart recovery</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-8 border border-border shadow-sm"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Order Management
              </h3>
              <p className="text-muted-foreground mb-6">
                Allow customers to place orders, track shipments, and manage
                returns directly through WhatsApp conversations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Real-time order status updates</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Simplified return processing</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Delivery notifications</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-8 border border-border shadow-sm"
            >
              <h3 className="text-2xl font-semibold mb-4">
                Appointment Scheduling
              </h3>
              <p className="text-muted-foreground mb-6">
                Enable customers to book, reschedule, or cancel appointments
                through natural language conversations on WhatsApp.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Automated scheduling assistant</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Appointment reminders</span>
                </li>
                <li className="flex items-start gap-2">
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
                    className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>Calendar integration</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Akii WhatsApp Chat
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Transform your customer interactions with powerful AI-driven WhatsApp messaging that delivers real results for your business.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Automated Support</h3>
              <p className="text-muted-foreground">
                Deliver instant responses to customer inquiries around the clock, reducing wait times and increasing satisfaction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Enterprise-Grade Security</h3>
              <p className="text-muted-foreground">
                End-to-end encryption and robust data protection ensure all customer conversations remain private and secure.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seamless Integration</h3>
              <p className="text-muted-foreground">
                Easily connect with your existing CRM, e-commerce platform, and internal systems for a unified business workflow.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multimedia Support</h3>
              <p className="text-muted-foreground">
                Send and receive images, documents, location data, and rich media to enhance the customer experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Interactions</h3>
              <p className="text-muted-foreground">
                Leverage customer data to provide highly relevant recommendations and create tailored shopping experiences.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-gradient-to-br from-background to-secondary/20 border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Human Handoff</h3>
              <p className="text-muted-foreground">
                Seamlessly transfer complex conversations to human agents when needed, with full conversation context preserved.
              </p>
            </motion.div>
          </div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-secondary/20 border border-border rounded-xl p-8 md:p-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">What Our Customers Say</h3>
                <blockquote className="text-lg italic mb-6">
                  "Since implementing Akii WhatsApp Chat, our response time has decreased by 80% and customer satisfaction ratings have increased by 35%. It's been a game-changer for our business."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full mr-4"></div>
                  <div>
                    <div className="font-semibold">Sarah Johnson</div>
                    <div className="text-sm text-muted-foreground">Director of Customer Experience, Retail Inc.</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="ml-2 text-sm font-medium">5.0</span>
                  </div>
                  <p className="text-sm">
                    "We've been able to handle a 300% increase in customer inquiries without adding any additional support staff."
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Michael Chen, E-commerce Manager
                  </div>
                </div>
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="ml-2 text-sm font-medium">5.0</span>
                  </div>
                  <p className="text-sm">
                    "Our WhatsApp conversion rates have doubled since implementing Akii. The AI understands our products and can effectively answer customer questions."
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Amelia Rodriguez, Marketing Director
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/10 relative">
        <div className="container px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Get answers to common questions about the Akii WhatsApp Chat solution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "How long does it take to set up Akii WhatsApp Chat?",
                answer: "Setup typically takes less than a day. Our team will guide you through the process of connecting your WhatsApp Business account, configuring your AI assistant, and testing before going live."
              },
              {
                question: "Can I customize the AI assistant's responses?",
                answer: "Yes, you have full control over your AI assistant's knowledge base, tone, and responses. You can train it using your own content, FAQs, product information, and company policies."
              },
              {
                question: "How does the human handoff feature work?",
                answer: "The AI can detect when a conversation requires human intervention based on customer sentiment, specific keywords, or complex issues. It will seamlessly transfer the conversation to a human agent with full context preservation."
              },
              {
                question: "Is Akii WhatsApp Chat compliant with WhatsApp's policies?",
                answer: "Yes, Akii is fully compliant with WhatsApp's Business Solution Provider policies and messaging guidelines. We help ensure your business follows all required rules for engagement."
              },
              {
                question: "Can I integrate Akii WhatsApp Chat with my existing CRM?",
                answer: "Absolutely. We offer integrations with popular CRM systems like Salesforce, HubSpot, and Zoho, as well as custom API integrations for your specific business needs."
              },
              {
                question: "What kind of analytics and reporting are available?",
                answer: "Our comprehensive dashboard provides insights on conversation volume, resolution rates, common queries, sentiment analysis, handoff rates, and customer satisfaction metrics."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border border-border rounded-lg p-6 bg-background shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-secondary/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transform Your WhatsApp Marketing & Support Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join businesses that have increased customer engagement by 70% and reduced support costs by 50% with Akii WhatsApp Chat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Schedule a Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default WhatsAppChatAgent;
