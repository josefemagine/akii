import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import {
  Check,
  MessageSquare,
  Send,
  Zap,
  Bot,
  Shield,
  Settings,
  Star,
  ArrowRight,
  Globe,
  Users,
  Clock,
  Phone
} from "lucide-react";

const TelegramChatAgent = () => {
  return (
    <MainLayout>
      <div className="bg-background">
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
                  <Send className="mr-1 h-4 w-4" />
                  Telegram Integration
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  AI-Powered <span className="text-primary">Telegram Chat</span> For Your Business
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Connect with your audience instantly through Telegram with intelligent AI that automates support, answers questions, and drives engagement.
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
                  <div className="flex items-center gap-1 p-2 bg-blue-500">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-white text-xs ml-2">Telegram Bot</span>
                  </div>
                  <div className="p-4 flex flex-col h-[360px] justify-between">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                          <p>Hello! I'm your Akii AI assistant. How can I help you today?</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                          <p>I need information about your summer promotion. Do you have any discounts for new customers?</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                          <p>Yes! We have a special summer offer for new customers. You can get 25% off your first purchase with code SUMMER25. Would you like me to send you our latest catalog?</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                          <p>Yes, please send the catalog. Also, do you offer same-day delivery?</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                          <p>Here's our summer catalog:</p>
                          <div className="mt-2 h-24 bg-gray-200 dark:bg-gray-600 rounded mb-1 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Summer_2023_Catalog.pdf</span>
                          </div>
                          <p className="mt-2">And yes, we do offer same-day delivery for orders placed before 2pm in select areas. Would you like me to check if your location is eligible?</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="w-full rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm" 
                      />
                      <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full aspect-square rounded-full text-blue-500">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="text-xs text-muted-foreground">Powered by <span className="font-medium text-blue-500">Akii</span></div>
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
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-blue-500/20 to-primary/20 blur-3xl rounded-full opacity-50" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Powerful Telegram Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build powerful AI conversations on
                Telegram for your business.
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
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Easy Setup
                </h3>
                <p className="text-muted-foreground">
                  Get your Telegram bot up and running in minutes with our
                  simple setup process.
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
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Custom Commands
                </h3>
                <p className="text-muted-foreground">
                  Create custom commands to provide specific information or
                  trigger actions.
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
                  Group Chat Support
                </h3>
                <p className="text-muted-foreground">
                  Deploy your AI agent in Telegram groups to assist multiple
                  users simultaneously.
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
                  <Send className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Inline Queries
                </h3>
                <p className="text-muted-foreground">
                  Allow users to query your bot directly from any chat using
                  inline mode.
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
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Interactive Buttons
                </h3>
                <p className="text-muted-foreground">
                  Create rich interactive experiences with buttons and menus.
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
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Detailed Analytics
                </h3>
                <p className="text-muted-foreground">
                  Track user engagement and bot performance with comprehensive
                  analytics.
                </p>
              </motion.div>
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
                Transform Your Telegram Engagement Today
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join businesses that have increased customer satisfaction by 40% and reduced support costs by 60% with Akii Telegram Chat.
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
                Why Choose Akii Telegram Chat
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Transform your customer engagement on Telegram with powerful AI-driven messaging that delivers real results for your business.
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
                <h3 className="text-xl font-semibold mb-3">Instant Responses</h3>
                <p className="text-muted-foreground">
                  Provide immediate answers to customer inquiries 24/7, dramatically reducing wait times and improving satisfaction.
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
                <h3 className="text-xl font-semibold mb-3">Secure Conversations</h3>
                <p className="text-muted-foreground">
                  Leverage Telegram's end-to-end encryption while adding your own enterprise-grade security layer for complete data protection.
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
                <h3 className="text-xl font-semibold mb-3">Easy Integration</h3>
                <p className="text-muted-foreground">
                  Connect with your existing business systems like CRM, helpdesk, and e-commerce platforms for seamless data flow.
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
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multilingual Support</h3>
                <p className="text-muted-foreground">
                  Communicate with your global audience in their preferred language with automatic translation capabilities.
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
                <h3 className="text-xl font-semibold mb-3">Enhanced Engagement</h3>
                <p className="text-muted-foreground">
                  Increase user interactions with rich media sharing, interactive buttons, and personalized recommendations.
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
                  Seamlessly transfer complex conversations to human agents when needed, preserving the full conversation context.
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
                    "After implementing Akii's Telegram Chat Bot, our customer response time dropped from hours to seconds. Our team can now focus on complex issues while the AI handles routine inquiries."
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full mr-4"></div>
                    <div>
                      <div className="font-semibold">Alex Chen</div>
                      <div className="text-sm text-muted-foreground">Head of Digital Support, TechSolutions Inc.</div>
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
                      "Our customer satisfaction scores increased by 40% within the first month of using Akii's Telegram solution."
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Maria Rodriguez, Customer Success Manager
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
                      "The bot handles over 80% of our customer inquiries automatically. It's like adding 10 new support staff without the overhead costs."
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      James Wilson, Operations Director
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
                Get answers to common questions about the Akii Telegram Chat solution
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {[
                {
                  question: "Do I need technical skills to set up a Telegram bot?",
                  answer: "Not at all. Our platform makes it easy to create and deploy your Telegram bot even if you have no coding experience. We provide a simple interface and step-by-step guidance throughout the process."
                },
                {
                  question: "Can I customize the AI's responses?",
                  answer: "Yes, you have full control over your AI assistant's knowledge base and responses. You can train it using your own FAQs, product information, and company guidelines to ensure it represents your brand voice accurately."
                },
                {
                  question: "How does the Telegram bot handle complex inquiries?",
                  answer: "When a conversation becomes too complex for the AI to handle, it can seamlessly transfer the chat to a human agent. The transfer includes the full conversation history, ensuring a smooth transition without the customer having to repeat information."
                },
                {
                  question: "Can the bot handle multiple languages?",
                  answer: "Yes, our Telegram bot supports multiple languages and can automatically detect and respond in the language the customer is using. This makes it ideal for businesses with an international customer base."
                },
                {
                  question: "What kind of analytics will I receive?",
                  answer: "Our comprehensive analytics dashboard provides insights on conversation volume, frequently asked questions, resolution rates, customer satisfaction, and bot performance. You can use this data to continuously improve your customer experience."
                },
                {
                  question: "How does pricing work for the Telegram bot?",
                  answer: "We offer flexible pricing plans based on your business needs. All plans include the core features, with higher tiers offering increased message volume, advanced analytics, and additional customization options. Contact our sales team for a custom quote."
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
      </div>
    </MainLayout>
  );
};

export default TelegramChatAgent;
