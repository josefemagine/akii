import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedText from "@/components/animations/AnimatedText";
import DataFlowAnimation from "@/components/animations/DataFlowAnimation";
import { useAuth } from "@/contexts/auth-compatibility";
import {
  Zap,
  MessageSquare,
  Smartphone,
  Share2,
  ShoppingCart,
  Code,
  ArrowRight,
  CheckCircle,
  BarChart,
  Users,
  Globe,
  Lock,
  Shield,
  Database,
  ShieldCheck,
  UserCog,
  Network,
  Building,
  User,
  Headphones,
  PieChart,
  Server,
  BookOpen,
  FileText,
  BriefcaseBusiness,
  CreditCard,
  Monitor,
} from "lucide-react";

// Add interfaces for the section props
interface SectionWithUserProps {
  user: any; // Using 'any' for simplicity, but ideally should match your User type
}

const HeroSection = ({ user }: SectionWithUserProps) => {
  const [typedText1, setTypedText1] = React.useState("");
  const [typedText2, setTypedText2] = React.useState("");
  const [typedText3, setTypedText3] = React.useState("");
  const fullText1 = "Your AI.";
  const fullText2 = "Your Data.";
  const fullText3 = "No Leaks.";
  
  React.useEffect(() => {
    // Animate first line
    let i = 0;
    const typeTimer1 = setInterval(() => {
      if (i < fullText1.length) {
        setTypedText1(fullText1.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeTimer1);
        
        // Start animating second line
        let j = 0;
        const typeTimer2 = setInterval(() => {
          if (j < fullText2.length) {
            setTypedText2(fullText2.substring(0, j + 1));
            j++;
          } else {
            clearInterval(typeTimer2);
            
            // Start animating third line
            let k = 0;
            const typeTimer3 = setInterval(() => {
              if (k < fullText3.length) {
                setTypedText3(fullText3.substring(0, k + 1));
                k++;
              } else {
                clearInterval(typeTimer3);
              }
            }, 100);
          }
        }, 100);
      }
    }, 100);
    
    return () => {
      // Cleanup timers
      clearInterval(typeTimer1);
    };
  }, []);
  
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none flex flex-col space-y-2">
                <span>{typedText1}<span className={typedText1.length === fullText1.length || typedText1.length === 0 ? "opacity-0" : "animate-blink"}>|</span></span>
                <span>{typedText2}<span className={typedText2.length === fullText2.length || typedText2.length === 0 ? "opacity-0" : "animate-blink"}>|</span></span>
                <span className="text-primary">{typedText3}<span className={typedText3.length === fullText3.length || typedText3.length === 0 ? "opacity-0" : "animate-blink"}>|</span></span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-xl">
                Launch your own private AI instance, fully isolated and trained on your data — not anyone else's.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg py-6" asChild>
                  <Link to="/dashboard">YOUR AI IN 5 MINUTES</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg py-6" asChild>
                    <Link to="/signup">YOUR AI IN 5 MINUTES</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/pricing">See Pricing</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] h-[380px] sm:h-[410px] md:h-[430px] rounded-lg shadow-xl overflow-hidden bg-transparent">
              <DataFlowAnimation />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const DataPrivacySection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
              Data Privacy You Can Trust
            </h2>
            <p className="text-muted-foreground text-lg">
              Enterprise-grade security and isolation, ensuring your data remains yours alone.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">No AI Data Leaks</h3>
              <p className="text-muted-foreground">
                Your prompts are never stored or used to train public models. What happens in your AI, stays in your AI.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Server className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Private AI Instances</h3>
              <p className="text-muted-foreground">
                Every customer gets a logically isolated AI instance with its own data, vector memory, and model configuration.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Database className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Zero Data Retention</h3>
              <p className="text-muted-foreground">
                We enforce zero data retention policies with model providers. Your data is purged after processing.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <Lock className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Isolated Storage</h3>
              <p className="text-muted-foreground">
                Dedicated storage with strict access controls and comprehensive audit logs for all data operations.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <UserCog className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Access</h3>
              <p className="text-muted-foreground">
                Manage access with precision. Easily invite team members and control who can view, train, or interact with each AI instance.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <FileText className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">GDPR-Ready</h3>
              <p className="text-muted-foreground">
                Built with compliance in mind. Enterprise-safe with data residency options and compliance features.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const WhatIsAkiiSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] h-[400px] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full bg-primary/20 animate-pulse top-20 left-20"></div>
              <div className="absolute w-24 h-24 rounded-full bg-primary/15 animate-pulse bottom-20 right-20"></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xs relative z-10">
                <h3 className="font-bold text-xl mb-2">Akii AI Platform</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">Private AI Instances</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">Secure Data Training</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">Multi-channel Deployment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm">Isolated Infrastructure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">What is Akii?</h2>
            <p className="text-lg text-muted-foreground">
              Akii is a platform where companies launch their own AI, train it on internal or customer data, and deploy it securely across multiple touchpoints. No shared models. No open training. Just your data and your AI.
            </p>
            <p className="text-lg text-muted-foreground">
              We've built Akii to ensure maximum data privacy and security while delivering powerful AI capabilities that integrate seamlessly with your existing systems and customer touchpoints.
            </p>
            <div className="flex items-center pt-4">
              <Button variant="outline" className="mr-4" asChild>
                <Link to="/about">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CoreFeaturesSection = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Private by Design",
      description: "Every AI instance is logically isolated, with zero data retention and no cross-customer access. Dedicated infrastructure is available on Enterprise plans."
    },
    {
      icon: <Database className="h-8 w-8 text-primary" />,
      title: "Secure Data Ingestion",
      description: "Upload your data or connect via secure integrations with your existing systems."
    },
    {
      icon: <Network className="h-8 w-8 text-primary" />,
      title: "Multi-platform Deployment",
      description: "Deploy your AI across Web, Mobile, WhatsApp, Telegram, Shopify, WordPress, and API."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "RAG & Fine-tuning",
      description: "RAG-based training for all plans with full model fine-tuning available on Enterprise tier."
    },
    {
      icon: <UserCog className="h-8 w-8 text-primary" />,
      title: "Team Access",
      description: "Manage access with precision. Easily invite team members and control who can view, train, or interact with each AI instance."
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "Analytics & Insights",
      description: "Detailed reports on AI performance, usage patterns, and customer satisfaction."
    }
  ];

  // App deployment tiles to showcase different channels
  const deploymentApps = [
    { icon: <Monitor className="h-6 w-6 text-primary" />, name: "Web Chat" },
    { icon: <Smartphone className="h-6 w-6 text-primary" />, name: "Mobile" },
    { icon: <MessageSquare className="h-6 w-6 text-primary" />, name: "WhatsApp" },
    { icon: <Share2 className="h-6 w-6 text-primary" />, name: "Telegram" },
    { icon: <ShoppingCart className="h-6 w-6 text-primary" />, name: "Shopify" },
    { icon: <Globe className="h-6 w-6 text-primary" />, name: "WordPress" },
    { icon: <Code className="h-6 w-6 text-primary" />, name: "API" }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <Badge variant="outline" className="border-primary/20 text-primary px-3 py-1">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
            Core Platform Capabilities
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Everything you need to create, deploy, and maintain private AI instances trained on your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-muted hover:border-primary/20 transition-colors">
              <CardContent className="pt-6">
                <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>

                {/* Add deployment app tiles only for the Multi-platform Deployment feature */}
                {feature.title === "Multi-platform Deployment" && (
                  <div className="mt-4 overflow-hidden relative">
                    <div className="animate-scroll flex py-2">
                      {/* First set of icons - will be shown initially */}
                      {deploymentApps.map((app, i) => (
                        <div key={i} className="flex-shrink-0 flex flex-col items-center justify-center mx-4 first:ml-0">
                          <div className="bg-muted/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center">
                            {app.icon}
                          </div>
                          <span className="text-xs mt-1 text-center whitespace-nowrap">{app.name}</span>
                        </div>
                      ))}
                      {/* Duplicate icons twice to ensure smooth looping */}
                      {[...Array(2)].map((_, dupIndex) => (
                        deploymentApps.map((app, i) => (
                          <div key={`dup-${dupIndex}-${i}`} className="flex-shrink-0 flex flex-col items-center justify-center mx-4">
                            <div className="bg-muted/20 p-2 rounded-lg w-10 h-10 flex items-center justify-center">
                              {app.icon}
                            </div>
                            <span className="text-xs mt-1 text-center whitespace-nowrap">{app.name}</span>
                          </div>
                        ))
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// New "Why Akii?" section with security badges
const WhyAkiiSection = () => {
  const securityBadges = [
    { icon: <Shield className="h-5 w-5 text-primary" />, label: "SOC 2 compliance in progress" },
    { icon: <Database className="h-5 w-5 text-primary" />, label: "Powered by AWS Bedrock" },
    { icon: <Lock className="h-5 w-5 text-primary" />, label: "GDPR-ready infrastructure" }
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-8">Why Akii?</h2>
          
          <p className="text-xl font-medium max-w-3xl mb-8">
            "Akii is the only AI platform built with privacy-first architecture from day one."
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {securityBadges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-2 bg-background px-4 py-2 rounded-full border border-border"
              >
                {badge.icon}
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const pricingTiers = [
    {
      name: "Starter",
      price: "$99",
      period: "per month",
      description: "For small businesses getting started with AI",
      features: [
        "1 Private AI Instance",
        "10GB Data Storage",
        "5,000 Chat Messages/month",
        "Web Chat Integration",
        "RAG-based Training",
        "Email Support",
        "Data Privacy Included"
      ],
      mostPopular: false,
      ctaText: "Get Started"
    },
    {
      name: "Pro",
      price: "$299",
      period: "per month",
      description: "For growing businesses with moderate AI needs",
      features: [
        "3 Private AI Instances",
        "50GB Data Storage",
        "25,000 Chat Messages/month",
        "Web, Mobile, WhatsApp Integration",
        "RAG-based Training",
        "Priority Support",
        "Data Privacy Included",
        "Advanced Analytics"
      ],
      mostPopular: true,
      ctaText: "Get Started"
    },
    {
      name: "Business",
      price: "$699",
      period: "per month",
      description: "For larger organizations with advanced needs",
      features: [
        "10 Private AI Instances",
        "200GB Data Storage",
        "100,000 Chat Messages/month",
        "All Integration Channels",
        "RAG-based Training",
        "24/7 Support",
        "Data Privacy Included",
        "Custom Training Schedule",
        "Enterprise SSO"
      ],
      mostPopular: false,
      ctaText: "Get Started"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For organizations with specific security requirements",
      features: [
        "Unlimited AI Instances",
        "Unlimited Storage",
        "Unlimited Messages",
        "All Integration Channels",
        "Full Model Fine-tuning",
        "Dedicated Support Manager",
        "Data Privacy Included",
        "Custom Security Controls",
        "Dedicated Infrastructure",
        "On-premises Option"
      ],
      mostPopular: false,
      ctaText: "Contact Sales"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
            Transparent, Simple Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            All plans include data privacy as standard. Choose the plan that works for your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`flex flex-col ${tier.mostPopular ? 'border-primary shadow-md' : 'border-muted'}`}>
              <CardHeader>
                {tier.mostPopular && (
                  <Badge className="self-start mb-2 bg-primary text-white">Most Popular</Badge>
                )}
                <CardTitle>{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">{tier.period}</span>
                </div>
                <CardDescription className="mt-2">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={tier.mostPopular ? "default" : "outline"} 
                  className={`w-full ${tier.mostPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  asChild
                >
                  <Link to={tier.name === "Enterprise" ? "/contact" : "/signup"}>{tier.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const UseCasesSection = () => {
  const useCases = [
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Website Support AI",
      description: "Provide instant, accurate support to website visitors 24/7 without compromising data security."
    },
    {
      icon: <Building className="h-8 w-8 text-primary" />,
      title: "Internal Knowledge Bot",
      description: "Help employees access company information securely with a private AI assistant trained on internal documentation."
    },
    {
      icon: <User className="h-8 w-8 text-primary" />,
      title: "Sales Chat Assistant",
      description: "Qualify leads and answer product questions instantly while protecting sensitive customer information."
    },
    {
      icon: <BriefcaseBusiness className="h-8 w-8 text-primary" />,
      title: "White-labeled AI for Agencies",
      description: "Agencies can offer private AI bots to clients with complete data isolation between accounts."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
            Use Cases & Applications
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Discover how organizations are using Akii's private AI instances for secure, powerful solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0">
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-lg font-medium mb-6">All use cases feature AI trained on your data with no risk of leaks</p>
          <Button asChild>
            <Link to="/use-cases">Explore All Use Cases</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ user }: SectionWithUserProps) => {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          <Lock className="h-12 w-12 text-primary mb-2" />
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
            Own Your AI — and Your Data
          </h2>
          <p className="text-lg text-muted-foreground">
            Take control of your AI strategy with a secure, private platform that keeps your data completely isolated.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {user ? (
              <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg py-6" asChild>
                  <Link to="/signup">YOUR AI IN 5 MINUTES</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/security">Request a Security Walkthrough</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface LandingPageProps {
  searchValue?: string;
}

const LandingPage = ({ searchValue }: LandingPageProps) => {
  const { user, isLoading, session } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  // Listen for auth reset events from GlobalErrorHandler
  useEffect(() => {
    const handleAuthReset = () => {
      console.log("LandingPage: Received auth reset event, refreshing state");
      // Clear authentication state on reset
      setIsAuthenticated(null);
      // Force re-check on next render cycle
      authCheckCompletedRef.current = false;
    };
    
    window.addEventListener('akii:auth:reset', handleAuthReset);
    
    return () => {
      window.removeEventListener('akii:auth:reset', handleAuthReset);
    };
  }, []);
  
  // Reduce dependency in logging to only essential state changes
  useEffect(() => {
    // Only log when loading completes and auth state has been determined
    if (!isLoading && isAuthenticated !== null) {
      // Limit frequency of logging to avoid console spam
      console.log("LandingPage auth state:", { 
        userId: user?.id,
        isLogged: !!user,
        isLoading,
        isAuthenticated: isAuthenticated,
        hasSession: !!session
      });
    }
  }, [user?.id, isLoading, isAuthenticated, session]);

  // Use a ref to track if we've completed an auth check to avoid multiple checks
  const authCheckCompletedRef = useRef(false);
  
  // One-time auth check that only runs once auth loading is complete
  useEffect(() => {
    // Skip this check if we're still loading or have already set isAuthenticated
    if (isLoading || authCheckCompletedRef.current) return;
    
    // Debounce the check to avoid rapid state changes
    const timeoutId = setTimeout(() => {
      const hasAuth = !!user || !!session;
      setIsAuthenticated(hasAuth);
      authCheckCompletedRef.current = true;
      
      if (!hasAuth) {
        console.log("LandingPage: No valid user session found, treating as unauthenticated");
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, session, isLoading]);

  // Memoize user state to prevent unnecessary re-renders
  const effectiveUserState = useMemo(() => {
    return user 
      ? { ...user, isAuthenticated: true } 
      : { id: null, isAuthenticated: false };
  }, [user]);
  
  // Handle redirect after authentication - with debounce to avoid flash
  useEffect(() => {
    // Only redirect once loading is complete and we have a user
    if (!isLoading && user) {
      // Small delay to ensure all auth state is settled before redirect
      const redirectTimer = setTimeout(() => {
        console.log('LandingPage: User is authenticated with real session, redirecting to dashboard');
        navigate('/dashboard');
      }, 50);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, isLoading, navigate]);

  return (
    <>
      <HeroSection user={effectiveUserState} />
      <DataPrivacySection />
      <WhatIsAkiiSection />
      <CoreFeaturesSection />
      <WhyAkiiSection />
      <PricingSection />
      <UseCasesSection />
      <CTASection user={effectiveUserState} />
    </>
  );
};

export default LandingPage;
