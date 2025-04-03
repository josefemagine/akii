import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Check, 
  ArrowRight, 
  MessageSquare, 
  Code, 
  Zap,
  Monitor,
  Palette,
  PieChart,
  ShieldCheck,
  Users,
  Rocket,
  Workflow,
  Bot,
  Globe,
  Settings,
  Star,
  Lock
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
              <Monitor className="mr-1 h-4 w-4" />
              Website Integration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered <span className="text-primary">Web Chat</span> For Your Website
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Turn website visitors into customers with an intelligent chat solution that delivers personalized experiences, automates support, and drives conversions.
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
              <div className="flex items-center gap-1 p-2 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">mywebsite.com</span>
              </div>
              <div className="p-4 flex flex-col h-[360px] justify-between">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                      <p>Hello! Welcome to Acme Inc. How can I assist you today?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                      <p>I'm looking for information about your enterprise pricing plans.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                      <p>Our Enterprise plans start at $499/month and include:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Unlimited agents</li>
                        <li>Dedicated account manager</li>
                        <li>99.9% uptime SLA</li>
                        <li>Custom AI training</li>
                      </ul>
                      <p className="mt-2">Would you like me to send you our detailed pricing PDF or connect you with a sales representative?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                      <p>I'd like to see the detailed pricing PDF please.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm" 
                  />
                  <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full aspect-square rounded-full text-primary">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="text-xs text-muted-foreground">Powered by <span className="font-medium text-primary">Akii</span></div>
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
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to engage visitors and provide exceptional support
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
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">White-Label Customization</h3>
            <p className="text-muted-foreground">
              Completely customize the chat interface to match your brand with custom colors, logos, and chat styles.
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
            <h3 className="text-xl font-semibold mb-2">One-Line Installation</h3>
            <p className="text-muted-foreground">
              Add our chat widget to your website with a single line of code. No complex configuration required.
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
              <Rocket className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
            <p className="text-muted-foreground">
              From signup to live implementation in under 5 minutes. Get up and running with minimal setup.
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
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Analytics</h3>
            <p className="text-muted-foreground">
              Track engagement, conversation quality, conversion rates, and customer satisfaction with detailed insights.
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
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Moderation Controls</h3>
            <p className="text-muted-foreground">
              Our dual-AI moderation ensures all responses are accurate, appropriate and compliant with your guidelines.
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
              <Workflow className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Integration Ecosystem</h3>
            <p className="text-muted-foreground">
              Connect with your CRM, help desk, and marketing tools to streamline workflows and data sharing.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Akii Web Chat?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The smart choice for businesses looking to enhance customer engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">24/7 Customer Support</h3>
                <p className="text-muted-foreground">
                  Provide round-the-clock support without increasing headcount. Your AI assistant never sleeps, ensuring customers get immediate help whenever they need it.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Multilingual Support</h3>
                <p className="text-muted-foreground">
                  Speak your customers' language with support for over 95 languages. Break down language barriers and expand your global reach without additional resources.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground">
                  Protect sensitive customer information with end-to-end encryption, SOC 2 compliance, and GDPR-ready data handling processes.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-lg overflow-hidden border bg-card p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic text-muted-foreground mb-2">
                    "Implementing Akii Web Chat was a game-changer for our e-commerce business. Customer satisfaction increased by 35% and we've seen a 28% boost in conversion rates."
                  </p>
                  <p className="font-medium">Sarah Chen, CMO at FashionRetail.com</p>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic text-muted-foreground mb-2">
                    "Our support team was overwhelmed with repetitive questions. Akii now handles 78% of our support queries automatically, letting our agents focus on complex issues."
                  </p>
                  <p className="font-medium">Mark Johnson, CTO at TechSolutions Inc.</p>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -top-6 -left-6 w-24 h-24 bg-primary/30 rounded-full blur-xl"></div>
            <div className="absolute -z-10 -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          </motion.div>
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
            Get up and running with Akii Web Chat in minutes. Our simple installation process requires just a few lines of code.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">1</div>
                <h3 className="text-xl font-semibold">Add one script tag to your website</h3>
              </div>
              <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                <pre className="overflow-x-auto text-sm text-muted-foreground">
                  <code>{`<script src="https://chat.akii.com/widget.js?instanceId=YOUR_INSTANCE_ID"></script>`}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">2</div>
                <h3 className="text-xl font-semibold">Customize your chat widget (optional)</h3>
              </div>
              <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                <pre className="overflow-x-auto text-sm text-muted-foreground">
                  <code>{`<script>
  AkiiChat.init({
    instanceId: 'YOUR_INSTANCE_ID',
    title: 'Chat with our AI assistant',
    primaryColor: '#16a34a',
    position: 'right',
    welcomeMessage: 'Hi there! How can I help you today?',
    domain: 'yourdomain.com'
  });
</script>`}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">3</div>
                <h3 className="text-xl font-semibold">Your web chat is live!</h3>
              </div>
              <p className="text-muted-foreground">
                That's it! Your AI chat widget is now live on your website. Customize its appearance, behavior, and knowledge in your Akii.com dashboard.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-border p-4 rounded-xl shadow-lg bg-background">
              <div className="border-b border-border pb-3 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">yourwebsite.com</span>
                </div>
              </div>
              <div className="h-[300px] relative">
                <div className="absolute bottom-6 right-6 w-[280px] border border-border rounded-lg shadow-lg bg-card overflow-hidden">
                  <div className="bg-primary p-3 text-white flex items-center justify-between">
                    <span className="font-medium">Chat with us</span>
                    <span className="text-xs">powered by akii.com</span>
                  </div>
                  <div className="p-3 h-[180px] bg-white dark:bg-card flex flex-col">
                    <div className="mb-2 bg-muted/50 p-2 rounded-lg text-sm self-start max-w-[80%]">
                      Hi there! How can I help you today?
                    </div>
                    <div className="mt-auto border-t border-border pt-2">
                      <div className="bg-muted rounded-full flex items-center px-3 py-1">
                        <input type="text" className="bg-transparent border-none w-full text-sm" placeholder="Type a message..." disabled />
                      </div>
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

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Akii Web Chat
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How accurate is the AI chatbot?</h3>
            <p className="text-muted-foreground">
              Akii's web chat achieves over 95% accuracy for customer inquiries within your knowledge domain. Our dual-AI verification system checks each response before delivery, ensuring information is accurate, relevant, and contextually appropriate.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Can I customize the appearance of the chat widget?</h3>
            <p className="text-muted-foreground">
              Yes, absolutely! You can customize colors, fonts, button styles, chat bubble shapes, and even the chat icon. The widget can be positioned anywhere on your site and can be configured to match your brand's look and feel perfectly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How long does it take to set up?</h3>
            <p className="text-muted-foreground">
              Most customers are up and running within 5-10 minutes. Once you sign up, you'll have access to our dashboard where you can customize your chatbot, upload your knowledge base, and get your embed code. The actual installation on your website takes less than a minute.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Will the chatbot work on mobile devices?</h3>
            <p className="text-muted-foreground">
              Yes, our chat widget is fully responsive and works perfectly on all devices including desktops, tablets, and mobile phones. The interface automatically adapts to different screen sizes to provide an optimal user experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Can I connect it to my existing help desk or CRM?</h3>
            <p className="text-muted-foreground">
              Yes, we offer integrations with popular platforms like Zendesk, Salesforce, HubSpot, Intercom, and many others. Our API also allows for custom integrations with any system you're currently using.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Customer Experience Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of businesses using Akii.com to provide exceptional AI-powered customer service and support 24/7/365.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/signup">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
          </div>
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
      <BenefitsSection />
      <HowItWorksSection />
      <FAQSection />
      <CTASection />
    </MainLayout>
  );
}
