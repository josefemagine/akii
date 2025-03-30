import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import {
  CheckCircle,
  MessageSquare,
  Smartphone,
  Zap,
  Globe,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";

const WhatsAppChatAgent = () => {
  return (
    <MainLayout>
      <div className="bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-4">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    WhatsApp Chat Agent
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    AI Chat for Your{" "}
                    <span className="text-primary">WhatsApp Business</span>
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8">
                    Enhance your WhatsApp Business experience with an AI-powered
                    chat agent that engages customers, answers questions, and
                    drives sales.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline">
                      View Documentation
                    </Button>
                  </div>
                </motion.div>
              </div>
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-black/5 dark:bg-white/5 rounded-xl p-6 border border-border shadow-lg"
                >
                  <div className="relative rounded-md overflow-hidden bg-black">
                    <div className="flex items-center gap-1 p-2 bg-black/90">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="bg-gray-800 rounded p-3 text-sm">
                        <p className="text-white">
                          How can I integrate the WhatsApp chatbot with my
                          business account?
                        </p>
                      </div>
                      <div className="bg-green-900/30 rounded p-3 text-sm">
                        <p className="text-white">
                          You can easily integrate our WhatsApp chatbot using
                          our official WhatsApp Business API integration. Would
                          you like me to explain the setup process?
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <div className="bg-gray-700 rounded-full flex-1 p-2 text-sm text-gray-300">
                          Type your message...
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50" />
              </div>
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
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
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

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl font-bold mb-6">
                  Ready to transform your WhatsApp Business?
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Get started today and deploy your first WhatsApp AI agent in
                  minutes. No credit card required for trial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default WhatsAppChatAgent;
