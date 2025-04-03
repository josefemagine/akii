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
  PlayCircle,
  Info,
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
                3-Minute WhatsApp Setup
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Add <span className="text-primary">Your Company's AI</span> To WhatsApp Business
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Connect your WhatsApp Business account in minutes with just your Meta API keys. No coding or technical expertise required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">3-minute</p>
                  <p className="text-sm text-muted-foreground">Meta API setup</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">Zero</p>
                  <p className="text-sm text-muted-foreground">coding needed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">your company data</p>
                </div>
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
                        <p>Hello! I'm your YourCompany AI assistant. I'm trained on all our products, policies, and FAQs. How can I help you today?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                        <p>I need to return an item I purchased last week. What's your return policy?</p>
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
                        <p>I'd be happy to help with your return! According to our policy, you can return any item within 30 days of purchase with the original receipt for a full refund. Would you like me to guide you through the return process?</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                        <p>Yes, please. Do I need to bring it to a store or can I mail it?</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-500" />
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
                    <div className="text-xs text-muted-foreground">AI trained on <span className="font-medium text-green-600">your company data</span></div>
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
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
              Simple 3-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Connect WhatsApp in Minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Just paste your Meta API keys and we'll handle the rest. No developers, no coding, and no technical setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-x-6 -translate-y-6 blur-xl"></div>
              <div className="bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-green-600 text-xl mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold mb-4">Connect Meta Business Account</h3>
              <p className="text-muted-foreground">
                Simply copy your Meta Business ID and access token from the WhatsApp Business Platform and paste them into our dashboard.
              </p>
              <div className="mt-6 flex justify-center">
                <MessageSquare className="h-16 w-16 text-green-600/50" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full translate-x-6 translate-y-6 blur-xl"></div>
              <div className="bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-green-600 text-xl mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Company Data</h3>
              <p className="text-muted-foreground">
                Upload your product catalogs, FAQs, customer support documents, and company policies. Our AI will automatically learn from your data.
              </p>
              <div className="mt-6 flex justify-center">
                <Bot className="h-16 w-16 text-green-600/50" />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-green-500/10 rounded-full translate-x-6 -translate-y-6 blur-xl"></div>
              <div className="bg-green-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-green-600 text-xl mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold mb-4">Go Live</h3>
              <p className="text-muted-foreground">
                Click "Activate" and your AI assistant will immediately be available on your WhatsApp Business number, ready to assist your customers.
              </p>
              <div className="mt-6 flex justify-center">
                <Zap className="h-16 w-16 text-green-600/50" />
              </div>
            </motion.div>
          </div>

          <div className="mt-16 bg-white/5 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-4">Simple Meta API Integration</h3>
                <p className="text-muted-foreground mb-6">
                  Just two pieces of information are all you need to connect WhatsApp to our platform:
                </p>
                
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600/20 h-8 w-8 rounded-full flex items-center justify-center">
                        <span className="font-bold text-sm text-green-600">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Meta Business ID</h4>
                        <p className="text-sm text-muted-foreground">Found in your Meta Business Dashboard</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600/20 h-8 w-8 rounded-full flex items-center justify-center">
                        <span className="font-bold text-sm text-green-600">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">WhatsApp Access Token</h4>
                        <p className="text-sm text-muted-foreground">Generated from your Meta Developer portal</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm">No advanced configuration needed</span>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="bg-card border-2 border-green-600/20 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-600/10 rounded-lg mr-3">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold">WhatsApp Connection</h4>
                    <div className="ml-auto px-2.5 py-0.5 bg-green-600/20 text-green-600 text-xs rounded-full">
                      Connected
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Meta Business ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-muted px-3 py-1.5 rounded text-sm font-mono text-muted-foreground flex-1">
                          •••••••••••••••••••
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">WhatsApp Access Token</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="bg-muted px-3 py-1.5 rounded text-sm font-mono text-muted-foreground flex-1">
                          •••••••••••••••••••••••••••••••••••
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Connected Successfully
                      </Button>
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
            <div className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
              Common Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about connecting your WhatsApp Business account
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: "Where do I find my Meta API keys?",
                answer: "Your Meta API keys can be found in your Meta Business Manager account. Go to the WhatsApp Business Platform dashboard, navigate to Settings, and you'll find your Business ID and be able to generate an access token. We provide step-by-step screenshot instructions in our setup guide."
              },
              {
                question: "Do I need to be a developer to set up the WhatsApp integration?",
                answer: "Not at all! Our platform is designed for non-technical users. You simply copy and paste your Meta API keys into our dashboard, and we handle all the technical configuration. The entire setup process typically takes less than 3 minutes."
              },
              {
                question: "Will my existing WhatsApp Business number still work?",
                answer: "Yes, your WhatsApp Business number continues to work exactly as before. Our AI simply becomes available on that number, responding to customer inquiries according to the rules you set. You can still manually respond to messages at any time."
              },
              {
                question: "How do I know my Meta API connection is working properly?",
                answer: "Our system automatically tests the connection as soon as you enter your API keys and displays a confirmation message with a green checkmark. We also provide a test message feature that lets you send a test message to verify everything is working correctly."
              },
              {
                question: "Can I connect multiple WhatsApp Business numbers?",
                answer: "Yes! You can connect unlimited WhatsApp Business numbers to our platform. Each number can have its own dedicated AI assistant with custom training data and separate analytics. This is perfect for businesses with multiple departments or locations."
              },
              {
                question: "What happens if my WhatsApp API keys expire?",
                answer: "We proactively monitor your WhatsApp API connection and will notify you via email before your access token expires. Our dashboard also shows the expiration date, and we provide one-click token renewal that takes just seconds to complete."
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
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center bg-background rounded-lg border border-border px-4 py-1.5 text-sm mb-4">
              <span className="mr-2">Need more help with your Meta API setup?</span>
              <span className="text-primary font-medium">We're here to help</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/docs/meta-api-setup">
                  View Setup Guide
                </Link>
              </Button>
              <Button asChild>
                <Link to="/contact">
                  Contact Support
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Connect WhatsApp in Minutes <br /> Not Days or Weeks
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Stop struggling with complex WhatsApp integrations. Our simple Meta API setup gets your company's AI on WhatsApp today - with just a few clicks.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">3-Minute Setup</h3>
                    <p className="text-muted-foreground">Just copy-paste your Meta API keys - no coding required</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Pre-built Meta Connection</h3>
                    <p className="text-muted-foreground">Our dashboard includes a ready-to-use Meta API integration</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Same-day Deployment</h3>
                    <p className="text-muted-foreground">Go live with your AI WhatsApp assistant today</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Start Free 14-Day Trial
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/demo">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    See Meta API Setup Demo
                  </Link>
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-2" />
                No credit card required for trial. Cancel anytime.
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative bg-background border border-border rounded-lg p-6 shadow-lg">
                <div className="bg-secondary/10 rounded-lg p-4 mb-6">
                  <h3 className="text-xl font-medium mb-2">Connect in 3 Simple Steps</h3>
                  <p className="text-sm text-muted-foreground">Here's how quickly you can go live:</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
                    <div className="flex-1">
                      <h4 className="font-medium">Copy Meta Business API Keys</h4>
                      <p className="text-sm text-muted-foreground">From your Meta Business Manager</p>
                    </div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">1 min</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
                    <div className="flex-1">
                      <h4 className="font-medium">Paste into Akii Dashboard</h4>
                      <p className="text-sm text-muted-foreground">We automatically verify the connection</p>
                    </div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">1 min</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
                    <div className="flex-1">
                      <h4 className="font-medium">Upload Company Data & Go Live</h4>
                      <p className="text-sm text-muted-foreground">Your AI starts responding immediately</p>
                    </div>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">1 min</span>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-border pt-6 text-center">
                  <div className="inline-flex items-center justify-center bg-secondary/10 rounded-full px-3 py-1 text-xs font-medium text-secondary mb-2">
                    TRUSTED BY BUSINESSES WORLDWIDE
                  </div>
                  <div className="flex justify-center items-center gap-6 flex-wrap mt-2">
                    <img src="/logos/company1.svg" alt="Company Logo" width={80} height={30} className="opacity-70" />
                    <img src="/logos/company2.svg" alt="Company Logo" width={80} height={30} className="opacity-70" />
                    <img src="/logos/company3.svg" alt="Company Logo" width={80} height={30} className="opacity-70" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default WhatsAppChatAgent;
