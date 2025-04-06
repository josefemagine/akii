import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import {
  Check,
  ShoppingCart,
  Zap,
  Globe,
  Clock,
  Users,
  Code,
  ArrowRight,
  Bot,
  Shield,
  Settings,
  Star,
  Phone,
  MessageSquare
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
              <ShoppingCart className="mr-1 h-4 w-4" />
              Shopify Integration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-primary">AI Chat That Knows Your Store</span> Inside & Out
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Easily train your own AI assistant that understands your products, policies, and brand voice - providing personalized support that boosts sales by up to 35%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">See It In Action</Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>No coding required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>Set up in minutes</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>Works instantly</span>
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
              <div className="flex items-center gap-1 p-2 bg-[#96bf48]">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">Shopify Store</span>
              </div>
              <div className="relative">
                <div className="h-[340px] bg-gray-100 dark:bg-gray-800 relative">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[#96bf48]/30 to-primary/30"></div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-[280px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border overflow-hidden">
                    <div className="bg-[#96bf48] text-white p-3 flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      <div className="font-medium text-sm">Store Assistant</div>
                    </div>
                    <div className="p-3 max-h-[300px] overflow-y-auto flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#96bf48] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Hi there! Welcome to our store. How can I help you today?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>I'm looking for a summer dress in size medium</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#96bf48] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Great! I found several medium summer dresses that just arrived in our new collection:</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white dark:bg-gray-700 rounded p-1">
                              <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                              <div className="text-xs font-medium truncate">Floral Maxi Dress</div>
                              <div className="text-xs text-green-600">$49.99</div>
                            </div>
                            <div className="bg-white dark:bg-gray-700 rounded p-1">
                              <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                              <div className="text-xs font-medium truncate">Linen Midi Dress</div>
                              <div className="text-xs text-green-600">$59.99</div>
                            </div>
                          </div>
                          <p className="mt-2">Would you like to see more details about any of these?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>I like the Floral Maxi Dress. Do you have it in stock?</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#96bf48] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Yes! The Floral Maxi Dress is currently in stock in size medium. Would you like to add it to your cart?</p>
                          <div className="flex gap-2 mt-2">
                            <button className="bg-[#96bf48] text-white text-xs py-1 px-3 rounded">Add to Cart</button>
                            <button className="bg-white dark:bg-gray-700 text-xs py-1 px-3 rounded border">More Info</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2 border-t border-border flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none" 
                      />
                      <button className="bg-[#96bf48] text-white p-2 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[#96bf48]/20 to-primary/20 blur-3xl rounded-full opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Trained On Your Store",
      description:
        "Akii automatically learns your entire product catalog, pricing, policies, and FAQs to provide accurate, store-specific information.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Speaks Your Brand Voice",
      description:
        "Customize your AI's personality to match your brand's tone and style, creating consistent customer experiences.",
    },
    {
      icon: <ShoppingCart className="h-6 w-6 text-primary" />,
      title: "Boosts Conversion Rates",
      description:
        "Instantly answers product questions and objections that typically cause customers to abandon their purchase.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Remembers Customer Preferences",
      description:
        "Maintains context across conversations to deliver personalized recommendations based on preferences and history.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Updates Automatically",
      description:
        "Stays in sync with your inventory, pricing changes, and new products without requiring manual updates.",
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Human-Like Understanding",
      description:
        "Comprehends complex customer queries, nuanced questions, and even responds to multiple questions at once.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">AI That Truly Understands Your Business</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlike generic chatbots, Akii learns everything about your specific Shopify store to create 
            meaningful conversations that convert browsers into buyers.
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Getting started with Akii Shopify Chat is incredibly simple. Just three easy steps and you're ready to go!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center bg-background/60 p-8 rounded-xl border border-border"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <div className="text-primary font-bold text-2xl">1</div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Install the App</h3>
            <p className="text-muted-foreground">
              Simply add the Akii Chat app from the Shopify App Store with one click. No technical knowledge needed!
            </p>
            <div className="mt-6 rounded-lg h-36 w-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <ShoppingCart className="h-12 w-12 text-primary/40" />
          </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center text-center bg-background/60 p-8 rounded-xl border border-border"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <div className="text-primary font-bold text-2xl">2</div>
        </div>
            <h3 className="text-xl font-semibold mb-3">Connect Your Store</h3>
            <p className="text-muted-foreground">
              Authorize access to your store data. Akii automatically learns about your products, pricing, and policies.
            </p>
            <div className="mt-6 rounded-lg h-36 w-full bg-secondary/5 flex items-center justify-center border border-secondary/10">
              <Settings className="h-12 w-12 text-secondary/40" />
                </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center text-center bg-background/60 p-8 rounded-xl border border-border"
          >
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <div className="text-primary font-bold text-2xl">3</div>
              </div>
            <h3 className="text-xl font-semibold mb-3">Select AI Instance</h3>
            <p className="text-muted-foreground">
              Choose your AI instance and go live! Your AI assistant is immediately ready to help customers and boost sales.
            </p>
            <div className="mt-6 rounded-lg h-36 w-full bg-green-50 dark:bg-green-900/5 flex items-center justify-center border border-green-100 dark:border-green-900/10">
              <Bot className="h-12 w-12 text-green-400/40" />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="inline-block bg-secondary/20 px-6 py-3 rounded-lg border border-border"
          >
            <p className="text-lg font-medium">That's it! Your AI assistant is now live on your Shopify store.</p>
            <p className="text-muted-foreground mt-2">No coding. No complex setup. Just powerful AI working for your business.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">The Impact of AI That Knows Your Store</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            When your AI chat assistant understands your specific products and policies, it creates measurable improvements in key business metrics.
              </p>
            </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">35%</div>
            <h3 className="text-xl font-semibold mb-2">Increased Conversion Rate</h3>
            <p className="text-muted-foreground">
              When customers get immediate, accurate answers about products, they're more likely to complete their purchase.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">28%</div>
            <h3 className="text-xl font-semibold mb-2">Cart Recovery Rate</h3>
            <p className="text-muted-foreground">
              Your trained AI proactively addresses concerns that lead to cart abandonment, recovering lost sales.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="font-bold text-4xl text-primary mb-2">42%</div>
            <h3 className="text-xl font-semibold mb-2">Reduction in Support Tickets</h3>
            <p className="text-muted-foreground">
              When your AI knows your return policies, shipping details, and product specifications, customers get answers without waiting.
            </p>
          </motion.div>
                </div>

        <div className="bg-muted/30 rounded-xl p-8 border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
              <h3 className="text-2xl font-bold mb-4">What Our Customers Are Saying</h3>
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <p className="italic mb-2">
                    "The AI instantly knew all of our products, sizes, materials, and even our shipping policies. Customers love getting immediate answers, and we've seen a 42% increase in our conversion rate."
                  </p>
                  <div className="font-medium">Emma Thompson, Fashion Boutique Owner</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-background p-4 rounded-lg border border-border"
                >
                  <p className="italic mb-2">
                    "Setup took 10 minutes, and the AI immediately started recommending the right products based on customer questions. We're seeing a 38% recovery rate on abandoned carts."
                  </p>
                  <div className="font-medium">Michael Chen, Electronics Store Owner</div>
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
                    See Akii Chat in Action
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    Watch how easily Akii learns your store's products and policies
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
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Common Questions About Your AI Assistant
            </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Akii learns about your specific Shopify store and helps drive sales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              How does the AI learn about my specific products?
            </h3>
            <p className="text-muted-foreground">
              Akii automatically connects to your Shopify store and learns your entire product catalog - including names, descriptions, prices, variants, images, and availability. It updates in real-time as your inventory changes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              Can I customize how the AI represents my brand?
            </h3>
            <p className="text-muted-foreground">
              Absolutely! You can customize the AI's tone, personality, and response style to match your brand voice. Whether professional, friendly, playful, or formal - your AI will communicate consistently with your brand identity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              Do I need technical skills to train the AI?
            </h3>
            <p className="text-muted-foreground">
              Not at all! The entire setup process is designed for non-technical store owners. Akii handles all the technical aspects of connecting to your store data, learning your products, and implementing the chat interface.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              How does the AI boost conversion rates?
            </h3>
            <p className="text-muted-foreground">
              By instantly answering product questions, addressing concerns, making personalized recommendations, and guiding customers through the purchase process - all with knowledge specific to your store and products.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              Can the AI handle custom store policies?
            </h3>
            <p className="text-muted-foreground">
              Yes! Akii learns your specific shipping policies, return terms, promotional offers, and store-specific information. This ensures customers get accurate answers about your particular business practices.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-xl font-semibold mb-2">
              How quickly can I get started?
            </h3>
            <p className="text-muted-foreground">
              Most store owners are up and running in less than 15 minutes. Install the app, connect your store data, choose your AI preferences, and your intelligent assistant is ready to engage with customers.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
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
                Get Your Store's Own AI Assistant Today
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Transform your Shopify store with an AI assistant that truly understands your products, policies, and customers. Set up in minutes, see results immediately.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Automatically learns your entire product catalog</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Answers questions in your brand's unique voice</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Zero technical skills required to implement</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Start seeing increased sales in days, not months</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                    Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                  <Link to="/demo">Schedule Live Demo</Link>
              </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required. Cancel anytime.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6 rounded-lg border border-border">
              <div className="text-center mb-6">
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Customer Success Story
                </div>
                <h3 className="text-xl font-bold">From Struggling to Thriving</h3>
              </div>
              <blockquote className="text-muted-foreground italic mb-6">
                "Before Akii, we struggled with cart abandonment and customer questions going unanswered. Within a week of installing the AI chat, our conversion rate increased by 31% and customer satisfaction scores improved dramatically. The AI knew our products better than some of our staff!"
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="font-semibold">James Wilson</div>
                  <div className="text-sm text-muted-foreground">Home Goods Direct</div>
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

const ShopifyChatAgent = () => {
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

export default ShopifyChatAgent;
