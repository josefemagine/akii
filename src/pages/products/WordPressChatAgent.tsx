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
              WordPress Integration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-primary">AI Chat Trained On Your Company Data</span> & WordPress Content
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Deploy an AI assistant that's trained on your specific business data - understanding your unique products, policies, and company information to deliver personalized responses that increase conversions by up to 37%.
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
                <span>5-minute setup</span>
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
                <span className="text-white text-xs ml-2">WordPress Site</span>
              </div>
              <div className="relative">
                <div className="h-[340px] bg-gray-100 dark:bg-gray-800 relative">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[#21759b]/30 to-primary/30"></div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-[280px] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-border overflow-hidden">
                    <div className="bg-[#21759b] text-white p-3 flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <div className="font-medium text-sm">Site Assistant</div>
                    </div>
                    <div className="p-3 max-h-[300px] overflow-y-auto flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#21759b] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Hi there! Welcome to our site. How can I help you today?</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Do you offer delivery for your organic products?</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#21759b] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Yes! We offer free delivery for all orders over $35 in the local area. For other locations, we offer flat-rate shipping starting at $5.99. You can find our full delivery policy on our <span className="text-[#21759b] font-medium">Shipping page</span>.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 justify-end">
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Great! What about your top-selling product?</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#21759b] flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm">
                          <p>Our best-selling product is our Organic Starter Box, which includes a variety of seasonal produce. It's currently on sale for $24.99. Would you like me to add one to your cart?</p>
                          <div className="flex gap-2 mt-2">
                            <button className="bg-[#21759b] text-white text-xs py-1 px-3 rounded">Add to Cart</button>
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
                      <button className="bg-[#21759b] text-white p-2 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </button>
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
  const steps = [
    {
      number: "01",
      title: "Quick Installation",
      description:
        "Install our WordPress plugin with one click - no coding required. Works seamlessly with any theme or plugins.",
    },
    {
      number: "02",
      title: "Connect Your Data",
      description:
        "Akii automatically connects to your entire WordPress site, business documents, FAQs, and policies to build your company knowledge base.",
    },
    {
      number: "03",
      title: "Train On Your Business",
      description:
        "Your AI learns your specific products, company information, pricing, business rules, and brand voice to provide accurate answers.",
    },
    {
      number: "04",
      title: "Go Live & Grow Smarter",
      description:
        "Launch your company-trained AI and watch it continuously learn from customer interactions while maintaining your data privacy.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              How Your Company Training Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              In just minutes, your AI assistant is trained on your specific business data and ready to engage with visitors using your company knowledge.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div
                  className="absolute top-10 left-full w-full h-0.5 bg-border hidden lg:block"
                  style={{ width: "calc(100% - 3rem)" }}
                />
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
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
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about our AI chat system trained on your company data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-muted/30 rounded-lg p-6 border border-border"
            >
              <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const faqs = [
  {
    question: "How does the AI learn about my specific business?",
    answer: "Our AI scans your WordPress site content, products, policies, and any additional business documents you provide. It builds a knowledge base specific to your business, ensuring accurate responses that reflect your exact offerings and information."
  },
  {
    question: "Is my company data secure during the training process?",
    answer: "Absolutely. We use enterprise-grade encryption and secure data handling practices. Your data is only used to train your specific AI instance and is never shared with other customers or used to train other systems."
  },
  {
    question: "How long does the training process take?",
    answer: "Most businesses see their AI ready within 24-48 hours of connecting their WordPress site and business data. The AI continuously improves as it processes more of your content and interactions."
  },
  {
    question: "Can I update the AI's knowledge when my business changes?",
    answer: "Yes! The AI automatically syncs with your WordPress site to stay current with new content. For major business changes, you can also trigger a manual re-training process from your dashboard."
  },
  {
    question: "How accurate is the AI compared to generic chatbots?",
    answer: "Businesses report that our company-trained AI provides 78% more accurate responses than generic chatbots. This is because it's trained specifically on your business information rather than trying to provide general-purpose answers."
  },
  {
    question: "Can I customize the AI's voice to match my brand?",
    answer: "Yes, you can adjust the AI's tone and personality to align with your brand voice. Whether you prefer formal, casual, technical, or friendly communication, the AI can be configured to represent your brand appropriately."
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
