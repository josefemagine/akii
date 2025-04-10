import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button.tsx";
import MainLayout from "@/components/layout/MainLayout.tsx";
import {
  Smartphone,
  Check,
  ArrowRight,
  Code,
  Zap,
  Globe,
  Clock,
  Users,
  Bot,
  Settings,
  Star,
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
              <Smartphone className="mr-1 h-4 w-4" />
              Your Company's AI Assistant
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-powered <span className="text-primary">mobile chat</span> for your brand
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Launch an AI assistant trained on your company data in your mobile app in minutes, not months. No coding expertise required.
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
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">3-minute</p>
                <p className="text-sm text-muted-foreground">setup time</p>
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
              <div className="flex items-center gap-1.5 p-3 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">YourCompany Mobile App</span>
              </div>
              <div className="p-4 flex flex-col h-[360px] justify-between">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                      <p>Welcome to YourCompany! I'm trained on all our product information and company policies. How can I help you today?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                      <p>I need help finding a product that works with my existing equipment.</p>
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
                      <p>I'd be happy to help! Our SmartConnect Series is designed for compatibility with most existing systems. What specific equipment do you currently have?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                      <p>I have the HomeBase 2000 system from last year.</p>
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
                      <p>Perfect! The HomeBase 2000 works seamlessly with our SmartConnect Pro model. Would you like me to show you the specs and compatibility details?</p>
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
                  <div className="text-xs text-muted-foreground">AI trained on <span className="font-medium text-primary">YourCompany data</span></div>
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
  const features = [
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "Trained on Your Company Data",
      description:
        "AI assistant that knows your products, policies, and FAQs - providing accurate, company-specific answers to all customer questions.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Instant Setup",
      description:
        "Get up and running in minutes with our simple setup process - no coding, API configurations, or technical knowledge required.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Customer-First Experience",
      description:
        "Provide personalized support that remembers customer preferences and purchase history for a truly tailored experience.",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Works Offline",
      description:
        "Customers can still get answers even when offline - perfect for mobile users with intermittent connectivity.",
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Easy Updates",
      description:
        "Update your AI's knowledge instantly whenever you change products or policies - no app updates or approvals needed.",
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Boost Engagement",
      description:
        "Turn browsers into buyers with personalized product recommendations and proactive assistance that increases conversion rates.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
              Company-specific AI
            </div>
            <h2 className="text-3xl font-bold">
              Your data, your AI assistant
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mt-3 md:mt-0 max-w-xl">
            Unlike generic AI solutions, our mobile chat is trained on your specific company information.
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
              className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 relative p-8 border border-border rounded-xl bg-gradient-to-r from-background to-muted/30">
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Sample company data we can train on:</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Product Information</span>
                    <p className="text-sm text-muted-foreground">Specifications, pricing, compatibility, features and benefits</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Support Documentation</span>
                    <p className="text-sm text-muted-foreground">Troubleshooting guides, user manuals, FAQs</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Company Policies</span>
                    <p className="text-sm text-muted-foreground">Return policies, warranties, shipping information</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Historical Customer Interactions</span>
                    <p className="text-sm text-muted-foreground">Common questions, typical issues, and best responses</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <div className="bg-card border border-border p-4 rounded-lg shadow-sm">
                <div className="text-sm font-medium mb-2">Training Success Metrics</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Accuracy on Product Questions</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Policy Compliance</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "94%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time to Implementation</span>
                      <span className="font-medium">3-5 minutes</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full" style={{ width: "15%" }}></div>
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

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background/80 to-background/60 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Three simple steps to launch
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Add your company's AI assistant to your mobile app in minutes without any coding knowledge required.
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
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-x-6 -translate-y-6 blur-xl"></div>
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-primary text-xl mx-auto mb-6">1</div>
            <h3 className="text-xl font-semibold mb-4">Connect your mobile app</h3>
            <p className="text-muted-foreground">
              Simply register your app with our platform by providing your app's name and selecting iOS, Android, or both. No developer account or technical details needed.
            </p>
            <div className="mt-6 flex justify-center">
              <Smartphone className="h-16 w-16 text-primary/50" />
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
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-primary text-xl mx-auto mb-6">2</div>
            <h3 className="text-xl font-semibold mb-4">Upload your company data</h3>
            <p className="text-muted-foreground">
              Use our user-friendly interface to upload your product catalogs, FAQs, customer support documents, and more. Our AI will automatically learn from your data.
            </p>
            <div className="mt-6 flex justify-center">
              <Bot className="h-16 w-16 text-primary/50" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-6 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/10 rounded-full translate-x-6 -translate-y-6 blur-xl"></div>
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-primary text-xl mx-auto mb-6">3</div>
            <h3 className="text-xl font-semibold mb-4">Add to your app</h3>
            <p className="text-muted-foreground">
              We'll provide a simple activation code for your developer to add to your app - a 2-minute task. Or use our no-code plugin if you're on a platform like Shopify or WordPress.
            </p>
            <div className="mt-6 flex justify-center">
              <Zap className="h-16 w-16 text-primary/50" />
            </div>
          </motion.div>
        </div>

        <div className="mt-16 bg-muted/20 border border-border rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Zero Technical Knowledge Required</h3>
              <p className="text-muted-foreground mb-4">
                Our platform handles all the complex AI training and integration behind the scenes. There's no need for coding, machine learning expertise, or technical setup.
              </p>
              <ul className="space-y-2">
                {[
                  "No API keys or credentials to manage",
                  "No need for ML engineers or AI specialists",
                  "No server infrastructure to set up or maintain",
                  "Content updates are instantly available in your app"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="w-60 h-60 relative">
                <div className="absolute inset-0 border-8 border-gray-800 rounded-3xl shadow-lg bg-card overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-7 bg-gray-800 flex justify-center items-end pb-1">
                    <div className="w-16 h-1.5 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="h-full pt-7 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
                    <div className="text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <p className="font-medium">Your AI is live!</p>
                      <p className="text-xs text-muted-foreground mt-1">Trained on your company data</p>
                      <Button className="mt-3 text-xs h-7" size="sm">Take Tour</Button>
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
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-3">
            Business Impact
          </div>
          <h2 className="text-3xl font-bold mb-4">Real results from company-trained AI</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Companies using AI assistants trained on their specific data see measurable improvements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-7 space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-3xl font-bold text-primary mb-2">42%</div>
                <h3 className="text-xl font-semibold mb-2">Increased engagement</h3>
                <p className="text-muted-foreground">
                  Mobile app users interact 42% more with apps that have company-specific AI assistance.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-3xl font-bold text-primary mb-2">68%</div>
                <h3 className="text-xl font-semibold mb-2">Fewer support tickets</h3>
                <p className="text-muted-foreground">
                  Customers find answers through the AI, reducing the need for human support intervention.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-3xl font-bold text-primary mb-2">3 min</div>
                <h3 className="text-xl font-semibold mb-2">Implementation time</h3>
                <p className="text-muted-foreground">
                  From signup to live in your app in minutes, not the weeks or months of traditional AI solutions.
                </p>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="text-3xl font-bold text-primary mb-2">27%</div>
                <h3 className="text-xl font-semibold mb-2">Increased conversions</h3>
                <p className="text-muted-foreground">
                  Customers are 27% more likely to make a purchase when assisted by company-trained AI.
                </p>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg border border-border p-6">
              <h3 className="text-xl font-semibold mb-3">No technical complexity</h3>
              <p className="text-muted-foreground mb-4">
                Unlike traditional AI implementations that require data scientists, engineers, and months of work, our solution requires:
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">0</div>
                  <p className="text-sm text-muted-foreground">Engineers Needed</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">0</div>
                  <p className="text-sm text-muted-foreground">Lines of Code</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">0</div>
                  <p className="text-sm text-muted-foreground">Server Setup</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-5 relative"
          >
            <div className="relative z-10 rounded-lg overflow-hidden border bg-card p-6">
              <div className="text-xl font-bold mb-6">What our customers say</div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">AR</span>
                    </div>
                    <div>
                      <p className="italic text-muted-foreground mb-2">
                        "We were able to add AI to our app that actually knows our products perfectly without having to hire AI engineers. Setup took literally 5 minutes, and our customers love the personalized assistance."
                      </p>
                      <p className="font-medium">Alex Rivera, CPO at HealthFit App</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                    <Star className="h-5 w-5 text-yellow-500" fill="#eab308" />
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">PS</span>
                    </div>
                    <div>
                      <p className="italic text-muted-foreground mb-2">
                        "I'm not technical at all, but I was able to add a company-specific AI chat to our app that knows everything about our product catalog. Our support tickets dropped by over 60% in the first month!"
                      </p>
                      <p className="font-medium">Priya Sharma, CMO at ShopSquare</p>
                    </div>
                  </div>
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

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary mb-3">
            Common Questions
          </div>
          <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about adding your company's AI to your mobile app
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
            <h3 className="text-lg font-semibold mb-2">What company data can I use to train the AI?</h3>
            <p className="text-muted-foreground">
              You can train the AI on virtually any company information: product catalogs, FAQs, support documentation, company policies, user manuals, pricing information, and even historical customer conversations. The more data you provide, the more knowledgeable your AI becomes about your specific business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Do I need technical expertise to set this up?</h3>
            <p className="text-muted-foreground">
              Not at all! Our platform is designed for non-technical users. You simply upload your company documents and information through our user-friendly dashboard. The final implementation requires a simple activation code that your developer can add in minutes, or you can use our no-code plugins for platforms like Shopify or WordPress.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How long does it take to get up and running?</h3>
            <p className="text-muted-foreground">
              Most customers go from signing up to having a fully functioning AI in their app within 5-10 minutes. The training process happens instantly in the background, and implementing the activation code is a 2-minute task for your developer. Compare this to traditional AI implementations that can take months!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How do I update the AI when my products or information changes?</h3>
            <p className="text-muted-foreground">
              Simply log into your dashboard and update your content. Our system will automatically retrain the AI with your new information, and the changes will be immediately available in your app. There's no need to update your app or get app store approval for content changes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Is my company data secure?</h3>
            <p className="text-muted-foreground">
              Absolutely! Your data is encrypted both in transit and at rest. We never share your company information with other customers or use it to train general AI models. Your data is used exclusively to train your company's dedicated AI instance, ensuring your proprietary information remains secure and confidential.
            </p>
          </motion.div>
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center justify-center bg-background rounded-lg border border-border px-4 py-1.5 text-sm mb-4">
            <span className="mr-2">Still have questions?</span>
            <span className="text-primary font-medium">We're here to help</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Our Team</Link>
            </Button>
            <Button asChild>
              <Link to="/docs">Read Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              Get Started in Minutes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Company's AI in Your Mobile App
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Add an AI assistant trained exclusively on your company data to your mobile app today—no coding, no engineers, no complexity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-muted/20 rounded-lg p-6 text-center">
                <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-primary text-lg mx-auto mb-3">1</div>
                <h3 className="font-semibold mb-1">Upload Your Data</h3>
                <p className="text-sm text-muted-foreground">Product catalogs, FAQs, support docs</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-6 text-center">
                <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-primary text-lg mx-auto mb-3">2</div>
                <h3 className="font-semibold mb-1">Get Activation Code</h3>
                <p className="text-sm text-muted-foreground">Simple implementation for developers</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-6 text-center">
                <div className="bg-primary/20 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-primary text-lg mx-auto mb-3">3</div>
                <h3 className="font-semibold mb-1">Go Live</h3>
                <p className="text-sm text-muted-foreground">Your AI is ready to assist customers</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start Free 14-Day Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">
                  Schedule Demo
                </Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <Check className="h-4 w-4 text-primary" />
              <span>Full access to all features</span>
              <span className="mx-2">•</span>
              <Check className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MobileChatAgent = () => {
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

export default MobileChatAgent;
