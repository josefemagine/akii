import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import {
  Check,
  Code,
  Zap,
  Globe,
  Clock,
  Users,
  ArrowRight,
  Bot,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Star,
  Blocks,
  Database,
  ShoppingCart
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
              <Blocks className="mr-1 h-4 w-4" />
              2-Minute WordPress Setup
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-powered <span className="text-primary">WordPress chat</span> for your website
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect your WordPress site in just minutes with a simple API key. No coding or developer skills required to train AI on your website content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">See It In Action</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">2-minute</p>
                <p className="text-sm text-muted-foreground">API key setup</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">Zero</p>
                <p className="text-sm text-muted-foreground">coding needed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">your site content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>Simple plugin install</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>API key connection</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>WooCommerce compatible</span>
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
              <div className="flex items-center gap-1 p-2 bg-[#21759b]">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">WordPress Admin</span>
              </div>
              <div className="relative">
                <div className="h-[340px] bg-gray-100 dark:bg-gray-800 relative">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[#21759b]/30 to-primary/30"></div>
                  </div>
                  
                  <div className="absolute top-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border overflow-hidden">
                    <div className="bg-[#21759b] text-white p-3 flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <div className="font-medium text-sm">Akii WordPress Chat Setup</div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div>
                        <h3 className="font-medium text-lg mb-2">Connect Your WordPress Site</h3>
                        <p className="text-muted-foreground text-sm mb-4">Paste your API key to connect your WordPress site to Akii AI</p>
                        
                        <div className="bg-muted p-4 rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">API Key</span>
                            <span className="text-xs bg-green-500/20 text-green-600 px-2.5 py-0.5 rounded-full">Connected</span>
                          </div>
                          <div className="flex gap-2">
                            <div className="bg-background rounded border border-border px-3 py-2 text-sm font-mono text-muted-foreground flex-1">
                              ak_wp1_••••••••••••••••••••••••••••
                            </div>
                            <button className="bg-[#21759b] text-white p-2 rounded">
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Site connected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Plugin installed</span>
                          </div>
                        </div>
                        
                        <div className="bg-green-500/10 border border-green-600/20 rounded-lg p-3 text-sm text-green-600 flex items-center gap-2">
                          <Check className="h-5 w-5" />
                          Your AI is now learning from your WordPress content
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="bg-[#21759b] hover:bg-[#21759b]/90">
                          Go to Dashboard
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow border border-border p-3 max-w-[180px]">
                    <div className="text-center text-sm mb-3">
                      <p className="font-medium mb-1">Setup Progress</p>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-[#21759b] w-[90%]"></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Almost there!</p>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-xs bg-[#21759b]/20 text-[#21759b] px-2 py-1 rounded-full">
                        Live in 2 minutes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[#21759b]/20 to-primary/20 blur-3xl rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Database className="h-6 w-6 text-primary" />,
      title: "Trained On Your Data",
      description:
        "AI that automatically learns your specific company content, products, policies, and FAQs to provide accurate, personalized responses.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Speaks Your Brand Voice",
      description:
        "Customizable to match your company's unique tone and communication style, ensuring consistent brand experience.",
    },
    {
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      title: "WooCommerce Expert",
      description:
        "Knows your entire product catalog, including prices, variations, stock status and shipping policies for accurate shopping assistance.",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-primary" />,
      title: "Always Up-To-Date",
      description:
        "Automatically syncs with your WordPress content updates, ensuring responses always reflect your latest business information.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-primary" />,
      title: "Privacy Focused",
      description:
        "Your company data is used only to train your AI. Information remains secure and exclusive to your business.",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Customer Insights",
      description:
        "Analyze which company information customers ask about most, revealing opportunities to improve your website content.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            AI That Truly Understands Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlike generic chatbots, Akii learns everything about your specific company to create 
            meaningful conversations that convert visitors into customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 border border-border shadow-sm"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background/80 to-background/60 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            Simple 3-Step Process
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connect WordPress in Minutes
            </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Just install our lightweight plugin and paste your API key. No developers, no coding, and no technical setup required.
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#21759b]/10 rounded-full -translate-x-6 -translate-y-6 blur-xl"></div>
            <div className="bg-[#21759b]/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-[#21759b] text-xl mx-auto mb-6">1</div>
            <h3 className="text-xl font-semibold mb-4">Install the WordPress Plugin</h3>
            <p className="text-muted-foreground">
              Download our plugin from the WordPress repository or upload the zip file directly to your site. One-click installation with no configuration needed.
            </p>
            <div className="mt-6 flex justify-center">
              <Blocks className="h-16 w-16 text-[#21759b]/50" />
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
            <div className="bg-[#21759b]/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-[#21759b] text-xl mx-auto mb-6">2</div>
            <h3 className="text-xl font-semibold mb-4">Paste Your API Key</h3>
            <p className="text-muted-foreground">
              Copy your API key from your Akii dashboard and paste it into the plugin settings. We'll automatically verify the connection.
            </p>
            <div className="mt-6 flex justify-center">
              <Code className="h-16 w-16 text-[#21759b]/50" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-20 h-20 bg-[#21759b]/10 rounded-full translate-x-6 -translate-y-6 blur-xl"></div>
            <div className="bg-[#21759b]/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-[#21759b] text-xl mx-auto mb-6">3</div>
            <h3 className="text-xl font-semibold mb-4">Go Live in Minutes</h3>
            <p className="text-muted-foreground">
              Our system automatically scans and learns from your WordPress content. Your AI chat widget will be live and ready to assist visitors immediately.
            </p>
            <div className="mt-6 flex justify-center">
              <Zap className="h-16 w-16 text-[#21759b]/50" />
          </div>
          </motion.div>
        </div>

        <div className="mt-16 bg-white/5 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">The Easiest WordPress Integration</h3>
              <p className="text-muted-foreground mb-6">
                We've simplified the process to get AI on your WordPress site in just minutes:
              </p>
              
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#21759b]/20 h-8 w-8 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm text-[#21759b]">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Install from WordPress Dashboard</h4>
                      <p className="text-sm text-muted-foreground">Go to Plugins {' > '} Add New {' > '} Search "Akii AI Chat"</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#21759b]/20 h-8 w-8 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm text-[#21759b]">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Access Plugin Settings</h4>
                      <p className="text-sm text-muted-foreground">Navigate to Akii Chat in your WordPress admin menu</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#21759b]/20 h-8 w-8 rounded-full flex items-center justify-center">
                      <span className="font-bold text-sm text-[#21759b]">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Enter Your API Key</h4>
                      <p className="text-sm text-muted-foreground">Paste your key and click "Connect" - that's it!</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2">
                <Check className="h-5 w-5 text-[#21759b]" />
                <span className="text-sm">Compatible with any WordPress theme</span>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-card border-2 border-[#21759b]/20 rounded-xl p-5 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-[#21759b]/10 rounded-lg mr-3">
                    <Blocks className="h-6 w-6 text-[#21759b]" />
                  </div>
                  <h4 className="font-semibold">WordPress Connection</h4>
                  <div className="ml-auto px-2.5 py-0.5 bg-[#21759b]/20 text-[#21759b] text-xs rounded-full">
                    Connected
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">WordPress Site</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-muted px-3 py-1.5 rounded text-sm flex-1 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        yourwebsite.com
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">API Key</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-muted px-3 py-1.5 rounded text-sm font-mono text-muted-foreground flex-1">
                        ak_wp1_••••••••••••••••••••••••••••
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Content Scanning</span>
                      <span className="text-xs text-muted-foreground">90% Complete</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#21759b] w-[90%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>178 pages processed</span>
                      <span>~2 min remaining</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">42%</div>
            <h3 className="text-xl font-semibold mb-2">More Accurate Responses</h3>
            <p className="text-muted-foreground">
              When your AI is trained on your specific company data, it provides dramatically more accurate answers than generic chatbots.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">37%</div>
            <h3 className="text-xl font-semibold mb-2">Higher Conversion Rate</h3>
            <p className="text-muted-foreground">
              Visitors convert to customers more often when your AI provides business-specific information that addresses their exact concerns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">65%</div>
            <h3 className="text-xl font-semibold mb-2">Reduced Support Tickets</h3>
            <p className="text-muted-foreground">
              When your AI understands your specific policies, products, and processes, it resolves customer questions without human intervention.
            </p>
          </motion.div>
            </div>

        <div className="bg-muted/30 rounded-xl p-8 border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
              <h3 className="text-2xl font-bold mb-4">How Companies Use Their Trained AI</h3>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <p className="italic mb-2">
                    "We trained our AI on our entire catalog of 500+ specialty products and their unique specifications. Now it answers detailed technical questions that previously required our most experienced staff members."
                  </p>
                  <div className="font-medium">TechGear Manufacturing</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <p className="italic mb-2">
                    "Our AI knows our complex shipping policies for 27 different countries. It handles international order questions 24/7, which has dramatically improved our global sales conversion rate by 43%."
                  </p>
                  <div className="font-medium">Global Commerce Solutions</div>
                </motion.div>
              </div>
                </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-lg overflow-hidden border border-border bg-background p-4"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-md flex items-center justify-center relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h4 className="text-xl font-bold mb-2">
                    See Company-Trained AI in Action
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Watch how easily Akii learns your business data to provide personalized customer assistance
                  </p>
                  <Button variant="default" className="gap-2" asChild>
                    <Link to="/demo">
                      Watch Demo <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/10 relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
            Common Questions
          </div>
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about setting up your WordPress site with our simple API key process
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wpFaqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-lg p-6 border border-border shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
                </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center bg-background rounded-lg border border-border px-4 py-1.5 text-sm mb-4">
            <span className="mr-2">Need more help with your WordPress API setup?</span>
            <span className="text-primary font-medium">We're here to help</span>
                </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/docs/wordpress-setup">
                View WordPress Guide
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
  );
};

const wpFaqs = [
  {
    question: "How do I get my API key for WordPress?",
    answer: "You can get your API key by signing up on our website and going to your dashboard. Under 'Integrations', select 'WordPress' and click 'Generate API Key'. This unique key connects your WordPress site to our AI system."
  },
  {
    question: "Do I need to know how to code to install the plugin?",
    answer: "Not at all! Our WordPress plugin requires zero coding knowledge. It's a standard WordPress plugin installation - just upload the plugin ZIP file or install directly from the WordPress plugin repository, then activate it and paste your API key."
  },
  {
    question: "Where do I paste my API key in WordPress?",
    answer: "After activating the plugin, you'll see 'Akii Chat' in your WordPress admin menu. Click on it, and you'll find a field labeled 'API Key'. Simply paste your key there and click 'Connect' - the system will verify it automatically."
  },
  {
    question: "How long does it take for the AI to learn my WordPress content?",
    answer: "The initial content scan usually takes 2-5 minutes depending on your site size. A small business site with 50-100 pages can be fully processed in about 2 minutes. Larger sites with hundreds of pages might take 5-10 minutes to complete."
  },
  {
    question: "Will the AI chat work with my WordPress theme?",
    answer: "Yes! Our plugin is compatible with all standard WordPress themes. The chat widget is designed to adapt to your site's design and can be customized to match your brand colors. It works seamlessly with popular themes like Divi, Avada, and Elementor-built sites."
  },
  {
    question: "Does it work with WooCommerce products?",
    answer: "Absolutely! The AI automatically scans and learns your entire WooCommerce product catalog, including prices, variations, inventory status, and shipping details. It can answer customer questions about specific products and even help with purchase recommendations."
  }
];

const CTASection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-[#21759b]/20"></div>
      <div className="container mx-auto relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-background rounded-xl p-8 md:p-12 border border-border shadow-md"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Transform Your Business With AI Trained On Your Company Data
            </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Deploy an AI assistant that truly understands your business - providing accurate, personalized responses that convert visitors into customers.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Learns your specific company knowledge</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>5-minute setup with your WordPress site</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Complete data privacy and security</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Start seeing increased sales within days</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                    Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">Request Demo</Link>
              </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required. Cancel anytime.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-[#21759b]/5 p-6 rounded-lg border border-border">
              <div className="text-center mb-6">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Customer Success Story
                </div>
                <h3 className="text-xl font-bold">Training Makes All The Difference</h3>
              </div>
              <blockquote className="text-muted-foreground italic mb-6">
                "Before Akii, we tried a generic AI chat solution that couldn't answer specific questions about our unique services. After training Akii on our business data, it now handles 87% of pre-sales questions accurately, featuring our exact packages, pricing tiers, and business policies. Sales increased 41% in the first month alone."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold">Sarah Martinez</div>
                  <div className="text-sm text-muted-foreground">Creative Agency Owner</div>
                  <div className="flex justify-center mt-2 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const WordPressChatAgent = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <BenefitsSection />
      <FAQSection />
      <CTASection />
    </MainLayout>
  );
};

export default WordPressChatAgent;
