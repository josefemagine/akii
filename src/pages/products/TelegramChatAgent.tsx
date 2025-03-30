import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle, MessageSquare, Send, Zap } from "lucide-react";

const TelegramChatAgent = () => {
  return (
    <MainLayout>
      <div className="bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Telegram Chat Agent
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Deploy intelligent AI agents on Telegram to engage with your
                    audience and provide instant support. Reach customers where
                    they already are.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-1">
                    Get Started
                    <Zap className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[450px] overflow-hidden rounded-xl border bg-background shadow-xl">
                  <div className="p-4 bg-blue-500 text-white flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    <span className="font-medium">Telegram Bot</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">
                          Hello! I'm your Akii AI assistant. How can I help you
                          today?
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Akii Bot
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">
                          Can you tell me about your product features?
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          User
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">
                          Our platform offers AI-powered chat agents for
                          multiple platforms including Web, Mobile, WhatsApp,
                          Telegram, Shopify, and WordPress. Each solution is
                          designed to help businesses automate customer support
                          and boost sales. Would you like to know more about a
                          specific feature?
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Akii Bot
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/40 py-20">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Key Features
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to provide exceptional customer service
                through Telegram
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Easy Setup</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Get your Telegram bot up and running in minutes with our
                    simple setup process.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Custom Commands</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Create custom commands to provide specific information or
                    trigger actions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Group Chat Support</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Deploy your AI agent in Telegram groups to assist multiple
                    users simultaneously.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Inline Queries</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Allow users to query your bot directly from any chat using
                    inline mode.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Interactive Buttons</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Create rich interactive experiences with buttons and menus.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-bold">Detailed Analytics</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Track user engagement and bot performance with comprehensive
                    analytics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Engage Your Audience on Telegram?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join businesses using Akii's Telegram Chat Agent to provide
                  instant support and boost engagement.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1">
                  Get Started Today
                  <Zap className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Contact Sales
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
