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
                  3-Minute Telegram Setup
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  AI-powered <span className="text-primary">Telegram chat</span> for your business
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Connect your Telegram bot in minutes with just a BotFather token. No coding or technical expertise required to train AI on your data.
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
                    <p className="text-sm text-muted-foreground">BotFather setup</p>
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
                          <p>Hello! I'm your YourCompany AI assistant. I'm trained on all our products, policies, and FAQs. How can I help you today?</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                          <p>What are your shipping options for international orders?</p>
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
                          <p>For international orders, we offer three shipping options:</p>
                          <ol className="list-decimal pl-5 mt-2 space-y-1">
                            <li>Standard (7-10 business days)</li>
                            <li>Express (3-5 business days)</li>
                            <li>Priority (1-2 business days)</li>
                          </ol>
                          <p className="mt-2">All options include tracking. Would you like more details about pricing for a specific country?</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                          <p>Yes, what's the cost for express shipping to France?</p>
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
                      <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full aspect-square rounded-full text-blue-500">
                        <Send className="h-4 w-4" />
                      </Button>
                      </div>
                    
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="text-xs text-muted-foreground">AI trained on <span className="font-medium text-blue-500">your company data</span></div>
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
              <h2 className="text-3xl font-bold mb-4">Key features</h2>
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
                <h3 className="text-xl font-semibold mb-2">Seamless Telegram integration</h3>
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
                <h3 className="text-xl font-semibold mb-2">Intelligent responses</h3>
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
                <h3 className="text-xl font-semibold mb-2">Conversation history</h3>
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
                <h3 className="text-xl font-semibold mb-2">Rich media support</h3>
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
                <h3 className="text-xl font-semibold mb-2">Bot commands</h3>
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
                <h3 className="text-xl font-semibold mb-2">Performance analytics</h3>
                  <p className="text-muted-foreground">
                    Track user engagement and bot performance with comprehensive
                    analytics.
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
                Connect Telegram in Minutes
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Just create a bot with BotFather and paste your token. No developers, no coding, and no technical setup required.
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
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-x-6 -translate-y-6 blur-xl"></div>
                <div className="bg-blue-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-blue-600 text-xl mx-auto mb-6">1</div>
                <h3 className="text-xl font-semibold mb-4">Create a Telegram Bot with BotFather</h3>
                <p className="text-muted-foreground">
                  Open Telegram, search for @BotFather, and follow the simple prompts to create your bot and get your token.
                </p>
                <div className="mt-6 flex justify-center">
                  <Send className="h-16 w-16 text-blue-600/50" />
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
                <div className="bg-blue-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-blue-600 text-xl mx-auto mb-6">2</div>
                <h3 className="text-xl font-semibold mb-4">Paste Your Bot Token</h3>
                <p className="text-muted-foreground">
                  Copy your bot token from BotFather and paste it into our dashboard. We'll handle the technical integration automatically.
                </p>
                <div className="mt-6 flex justify-center">
                  <Bot className="h-16 w-16 text-blue-600/50" />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-500/10 rounded-full translate-x-6 -translate-y-6 blur-xl"></div>
                <div className="bg-blue-600/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-blue-600 text-xl mx-auto mb-6">3</div>
                <h3 className="text-xl font-semibold mb-4">Train AI on Your Data</h3>
                <p className="text-muted-foreground">
                  Upload your company data, and our AI will automatically learn from it. Your bot is now ready to assist your customers.
                </p>
                <div className="mt-6 flex justify-center">
                  <Zap className="h-16 w-16 text-blue-600/50" />
                </div>
              </motion.div>
            </div>

            <div className="mt-16 bg-white/5 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold mb-4">Getting Your Bot Token is Easy</h3>
                  <p className="text-muted-foreground mb-6">
                    Creating a bot with Telegram's BotFather takes less than a minute:
                  </p>
                  
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="font-bold text-sm text-blue-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Open @BotFather in Telegram</h4>
                          <p className="text-sm text-muted-foreground">Type "/newbot" to start the creation process</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="font-bold text-sm text-blue-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Name Your Bot</h4>
                          <p className="text-sm text-muted-foreground">Choose a name and username for your bot</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600/20 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="font-bold text-sm text-blue-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Copy the API Token</h4>
                          <p className="text-sm text-muted-foreground">BotFather will give you a token like "5555555555:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">No programming knowledge needed</span>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="bg-card border-2 border-blue-600/20 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-600/10 rounded-lg mr-3">
                        <Send className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold">Telegram Bot Connection</h4>
                      <div className="ml-auto px-2.5 py-0.5 bg-blue-600/20 text-blue-600 text-xs rounded-full">
                        Connected
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Bot Name</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-muted px-3 py-1.5 rounded text-sm flex-1">
                            YourCompanyBot
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Bot Token</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="bg-muted px-3 py-1.5 rounded text-sm font-mono text-muted-foreground flex-1">
                            •••••••••••••••••••••••••••••••••••
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Check className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
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

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 z-0"></div>
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
                  Connect Telegram in Minutes <br /> Not Days or Weeks
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Stop struggling with complex Telegram integrations. Our simple BotFather setup gets your company's AI on Telegram today - with just a few clicks.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">3-Minute Setup</h3>
                      <p className="text-muted-foreground">Just copy-paste your BotFather token - no coding required</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Pre-built Bot Connection</h3>
                      <p className="text-muted-foreground">Our dashboard includes a ready-to-use Telegram API integration</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-full mt-1">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Same-day Deployment</h3>
                      <p className="text-muted-foreground">Go live with your AI Telegram assistant today</p>
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
                      <Send className="mr-2 h-5 w-5" />
                      See BotFather Setup Demo
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-6 text-sm text-muted-foreground flex items-center">
                  <Check className="h-4 w-4 mr-2" />
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
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Create Bot with BotFather</h4>
                        <p className="text-sm text-muted-foreground">Simple chat commands in Telegram</p>
                      </div>
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">1 min</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="font-medium">Paste Bot Token</h4>
                        <p className="text-sm text-muted-foreground">We automatically verify the connection</p>
                      </div>
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">1 min</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">3</div>
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
                      WORKS WITH ANY TELEGRAM BOT
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Whether you're creating a new bot or enhancing an existing one, our platform seamlessly integrates with any Telegram bot created through BotFather.
                    </p>
                  </div>
                </div>
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
              <div className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
                Common Questions
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Frequently asked questions
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Everything you need to know about Akii Telegram chat
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
              {[
                {
                  question: "What is BotFather and how do I use it?",
                  answer: "BotFather is Telegram's official bot for creating and managing other bots. To use it, simply search for @BotFather in Telegram, send the command /newbot, and follow the prompts to name your bot and get your API token. The entire process takes less than a minute."
                },
                {
                  question: "Do I need coding skills to set up a Telegram bot?",
                  answer: "Not at all! Our platform is designed for non-technical users. You only need to create a bot with BotFather and copy-paste the token into our dashboard. We handle all the technical configuration and programming automatically."
                },
                {
                  question: "What happens if I lose my bot token?",
                  answer: "If you lose your bot token, you can easily retrieve it from BotFather. Just message @BotFather in Telegram, send the command /mybots, select your bot, and then click 'API Token' to view it again. You can then update it in our dashboard."
                },
                {
                  question: "Can I customize my bot's appearance in Telegram?",
                  answer: "Yes! Through BotFather, you can customize your bot's profile picture, description, and about section. Just use the /setuserpic, /setdescription, and /setabouttext commands in BotFather. All these changes will be reflected in your bot immediately."
                },
                {
                  question: "How long does it take to set up a Telegram bot?",
                  answer: "The entire process takes about 3 minutes: 1 minute to create your bot with BotFather, 1 minute to paste the token into our platform, and 1 minute to upload your company data for AI training. Your bot will be ready to assist customers immediately after setup."
                },
                {
                  question: "Can I connect multiple Telegram bots to one account?",
                  answer: "Yes! You can create and connect multiple Telegram bots to our platform. This is useful if you want different bots for different departments, products, or languages. Each bot can be trained on specific data relevant to its purpose."
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
                <span className="mr-2">Need more help with your BotFather setup?</span>
                <span className="text-primary font-medium">We're here to help</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/docs/telegram-setup">
                    View BotFather Guide
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
      </div>
    </MainLayout>
  );
};

export default TelegramChatAgent;
