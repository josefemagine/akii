import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedText from "@/components/animations/AnimatedText";
import DataFlowAnimation from "@/components/animations/DataFlowAnimation";
import IntegrationSection from "@/components/marketing/IntegrationSection";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import LoginModal from "@/components/auth/LoginModal";
import {
  Zap,
  MessageSquare,
  PencilLine,
  FileCheck,
  Shield,
  Users,
  Monitor,
  Smartphone,
  Database,
  Lock,
  File,
  Share2,
  ShoppingCart,
  Cog,
  CreditCard,
  Gem,
  Server,
  Code,
  CheckCircle,
  BarChart,
  Globe,
  ShieldCheck,
  UserCog,
  CloudCog,
  BadgeCheck,
  Building,
  Brain,
  Bot,
  BriefcaseBusiness,
  FileText,
  ArrowRight,
  Network,
  BookOpen,
  User,
} from "lucide-react";

// Add interfaces for the section props
interface SectionWithUserProps {
  user: any; // Using 'any' for simplicity, but ideally should match your User type
}

const HeroSection = ({ user }: SectionWithUserProps) => {
  const [typedText1, setTypedText1] = React.useState("");
  const [typedText2, setTypedText2] = React.useState("");
  const [typedText3, setTypedText3] = React.useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [showSubElements, setShowSubElements] = React.useState(false);
  const fullText1 = "Your AI.";
  const fullText2 = "Your Data.";
  const staticPrefix = "Plug & ";
  
  // Words to cycle through in this order
  const rotatingWords = [
    "Play.",
    "Support.",
    "Sell.",
    "Train.",
    "Analyze.",
    "Create.",
    "Research.",
    "Learn."
  ];
  
  // State to track current word and animation status
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [isTyping, setIsTyping] = React.useState(true);
  const [currentWord, setCurrentWord] = React.useState("");
  
  React.useEffect(() => {
    let typeTimer1: number | null = null;
    let typeTimer2: number | null = null;
    let typeTimer3: number | null = null;
    
    setTypedText1('');
    setTypedText2('');
    setTypedText3('');
    setShowSubElements(false);
    
    // Type first line
    typeTimer1 = window.setInterval(() => {
      setTypedText1((prev) => {
        const nextText = fullText1.slice(0, prev.length + 1);
        if (nextText === fullText1) {
          clearInterval(typeTimer1!);
          
          // Type second line after a small delay
          typeTimer2 = window.setInterval(() => {
            setTypedText2((prev) => {
              const nextText = fullText2.slice(0, prev.length + 1);
              if (nextText === fullText2) {
                clearInterval(typeTimer2!);
                
                // Type third line static part after a small delay
                typeTimer3 = window.setInterval(() => {
                  setTypedText3((prev) => {
                    if (prev.length < staticPrefix.length) {
                      return staticPrefix.slice(0, prev.length + 1);
                    } else if (prev === staticPrefix) {
                      clearInterval(typeTimer3!);
                      // Show subtitle and button after typing the static prefix
                      setShowSubElements(true);
                      // Start the word rotation animation
                      setIsTyping(true);
                      setCurrentWord('');
                    }
                    return prev;
                  });
                }, 100);
              }
              return nextText;
            });
          }, 100);
        }
        return nextText;
      });
    }, 100);
    
    return () => {
      // Cleanup timers
      if (typeTimer1) clearInterval(typeTimer1);
      if (typeTimer2) clearInterval(typeTimer2);
      if (typeTimer3) clearInterval(typeTimer3);
    };
  }, [fullText1, fullText2, staticPrefix]);
  
  // Effect for the rotating words animation
  React.useEffect(() => {
    // Skip if static prefix isn't fully typed yet
    if (typedText3 !== staticPrefix) return;
    
    const targetWord = rotatingWords[currentWordIndex];
    let animationTimer: number | null = null;
    
    if (isTyping) {
      // Typing animation
      animationTimer = window.setInterval(() => {
        setCurrentWord((prev) => {
          const nextText = targetWord.slice(0, prev.length + 1);
          if (nextText === targetWord) {
            clearInterval(animationTimer!);
            // Pause before starting to delete
            setTimeout(() => setIsTyping(false), 1500);
          }
          return nextText;
        });
      }, 100);
    } else {
      // Deleting animation
      animationTimer = window.setInterval(() => {
        setCurrentWord((prev) => {
          const nextText = prev.slice(0, prev.length - 1);
          if (nextText === '') {
            clearInterval(animationTimer!);
            // Move to next word
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
            setIsTyping(true);
          }
          return nextText;
        });
      }, 50); // Deletion is slightly faster
    }
    
    return () => {
      if (animationTimer) clearInterval(animationTimer);
    };
  }, [isTyping, currentWordIndex, typedText3, rotatingWords, staticPrefix]);

  // Combine the static prefix with the current animated word
  const fullTypedText3 = typedText3 + (typedText3 === staticPrefix ? currentWord : '');
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1] // Custom ease to make it smooth
      }
    }
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };
  
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none flex flex-col space-y-2">
                <span>{typedText1}{typedText1.length === fullText1.length || typedText1.length === 0 ? null : <span className="cursor-blink"></span>}</span>
                <span>{typedText2}{typedText2.length === fullText2.length || typedText2.length === 0 ? null : <span className="cursor-blink"></span>}</span>
                <span className="text-primary">
                  {typedText3}
                  {typedText3 === staticPrefix && (
                    <>{currentWord}<span className="cursor-blink"></span></>
                  )}
                  {typedText3 !== staticPrefix && typedText3.length > 0 && (
                    <span className="cursor-blink"></span>
                  )}
                </span>
              </h1>
              <motion.p 
                className="max-w-[600px] text-muted-foreground text-xl"
                initial="hidden"
                animate={showSubElements ? "visible" : "hidden"}
                variants={fadeInUpVariants}
              >
                Launch your own private AI — powered by Amazon Bedrock, fully isolated, trained on your data, and plug-and-play apps and integrations across web, mobile, API and more.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col gap-3 sm:flex-row"
              initial="hidden"
              animate={showSubElements ? "visible" : "hidden"}
              variants={fadeInUpVariants}
            >
              {user ? (
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg py-6" asChild>
                  <Link to="/dashboard">LAUNCH A PRIVATE AI IN 5 MINUTES</Link>
                </Button>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-lg py-6"
                    onClick={handleOpenLoginModal}
                  >
                    LAUNCH A PRIVATE AI IN 5 MINUTES
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/plans">See Plans</Link>
                  </Button>
                </>
              )}
            </motion.div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[510px] h-[570px] sm:h-[620px] md:h-[650px] rounded-lg shadow-xl overflow-hidden bg-transparent">
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
              Data privacy you can trust
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
      title: "Built-in Apps & Integrations Ready to Launch",
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

  return (
    <section className="py-16 md:py-24 bg-muted/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <Badge variant="outline" className="border-primary/20 text-primary px-3 py-1">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl/tight">
            Core platform capabilities
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

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
            Use cases & applications
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
            Own your AI — and your data
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
  const { user, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Memoize user state to prevent unnecessary re-renders
  const effectiveUserState = useMemo(() => {
    return user 
      ? { ...user, isAuthenticated: true } 
      : { id: null, isAuthenticated: false };
  }, [user]);

  return (
    <>
      <HeroSection user={effectiveUserState} />
      <IntegrationSection />
      <CoreFeaturesSection />
      <WhatIsAkiiSection />
      <DataPrivacySection />
      <WhyAkiiSection />
      <UseCasesSection />
      <CTASection user={effectiveUserState} />
      
      {/* Login Modal */}
      {isLoginModalOpen && (
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)}
          onOpenJoin={() => {/* Handle join modal */}}
          onOpenPasswordReset={() => {/* Handle password reset */}}
        />
      )}
    </>
  );
};

export default LandingPage;
