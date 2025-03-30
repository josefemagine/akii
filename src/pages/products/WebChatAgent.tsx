import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { Check, ArrowRight, MessageSquare, Code, Zap } from "lucide-react";

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-primary">Web Chat</span> Integration
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Empower your website with AI-driven conversations that convert
              visitors into customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden border bg-card p-2"
          >
            <div className="rounded-md overflow-hidden bg-black">
              <div className="flex items-center gap-1 p-2 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-800 rounded p-3 text-sm">
                  <p className="text-white">
                    How can I integrate the chatbot with my website?
                  </p>
                </div>
                <div className="bg-green-900/30 rounded p-3 text-sm">
                  <p className="text-white">
                    You can easily integrate our chatbot using our JavaScript
                    snippet or API. Would you like me to explain both options?
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
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Seamless Customer Support</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Akii's Web Chat integration provides your customers with instant
            AI-powered support directly on your website.
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
            <h3 className="text-xl font-semibold mb-2">Customizable Widget</h3>
            <p className="text-muted-foreground">
              Fully customize the chat widget to match your brand's design and
              voice.
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
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
            <p className="text-muted-foreground">
              Implement with just a few lines of code using our JavaScript
              snippet or API.
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
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dual-AI Moderation</h3>
            <p className="text-muted-foreground">
              Ensure all responses are accurate, on-brand, and compliant with
              your industry regulations.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-2 border-muted">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Basic</h3>
                <div className="mt-4 text-4xl font-bold">
                  $29
                  <span className="text-base font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>1,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Email support</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/signup?plan=basic">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
              Popular
            </div>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Pro</h3>
                <div className="mt-4 text-4xl font-bold">
                  $99
                  <span className="text-base font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>5,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Analytics dashboard</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button className="w-full" asChild>
                  <Link to="/signup?plan=pro">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-muted">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Scale</h3>
                <div className="mt-4 text-4xl font-bold">
                  $499
                  <span className="text-base font-normal text-muted-foreground">
                    /mo
                  </span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>25,000 messages/month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Full customization</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <div className="mt-8">
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/signup?plan=scale">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-primary/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your customer support?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start engaging with your website visitors today with our AI-powered
            chat solution.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/signup">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default function WebChatAgent() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </MainLayout>
  );
}
