import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Lock, 
  Database, 
  Server, 
  ShieldCheck, 
  AlertTriangle,
  HelpCircle
} from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
  };

  const annualDiscount = 0.16; // 16% discount

  const plans = [
    {
      name: "Free Trial",
      description: "Try Akii without any commitment. No credit card required.",
      monthlyPrice: 0,
      outputMessages: "500 total",
      storage: "10 MB",
      aiInstances: 1,
      features: {
        customTraining: true,
        dedicatedInfra: false,
        apiAccess: false,
        multiChannel: false,
        support: "Email only",
        overageRate: "Upgrade required"
      },
      popularChoice: false,
      ctaText: "Start Free",
      ctaLink: "/signup"
    },
    {
      name: "Starter",
      description: "For individuals and small teams just getting started with AI.",
      monthlyPrice: 49,
      outputMessages: "50,000/mo",
      storage: "1 GB",
      aiInstances: 1,
      features: {
        customTraining: true,
        branding: false,
        accessControl: "Basic",
        dedicatedInfra: false,
        apiAccess: false,
        multiChannel: true,
        support: "Email only",
        overageRate: "$0.02 per 1K tokens"
      },
      popularChoice: false,
      ctaText: "Get Started",
      ctaLink: "/signup"
    },
    {
      name: "Pro",
      description: "For growing businesses ready to scale their AI capabilities.",
      monthlyPrice: 149,
      outputMessages: "250,000/mo",
      storage: "5 GB",
      aiInstances: 3,
      features: {
        customTraining: true,
        branding: true,
        accessControl: "Advanced",
        dedicatedInfra: false,
        apiAccess: true,
        multiChannel: true,
        support: "Chat Support",
        overageRate: "$0.015 per 1K tokens"
      },
      popularChoice: true,
      ctaText: "Get Started",
      ctaLink: "/signup"
    },
    {
      name: "Business",
      description: "For established companies with sophisticated AI needs.",
      monthlyPrice: 499,
      outputMessages: "750,000/mo",
      storage: "20 GB",
      aiInstances: 5,
      features: {
        customTraining: true,
        branding: true,
        accessControl: "Advanced",
        dedicatedInfra: false,
        apiAccess: true,
        multiChannel: true,
        support: "Priority Support",
        overageRate: "$0.012 per 1K tokens"
      },
      popularChoice: false,
      ctaText: "Get Started",
      ctaLink: "/signup"
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations with complex requirements.",
      monthlyPrice: 5000,
      outputMessages: "Unlimited",
      storage: "100+ GB",
      aiInstances: "10+",
      features: {
        customTraining: true,
        branding: true,
        accessControl: "Role-Based",
        dedicatedInfra: true,
        apiAccess: true,
        multiChannel: true,
        support: "Dedicated Slack + SLA",
        overageRate: "Flat rate or custom SLA"
      },
      popularChoice: false,
      ctaText: "Contact Sales",
      ctaLink: "/contact"
    }
  ];

  const securityFeatures = [
    {
      icon: <Lock className="h-6 w-6 text-green-500" />,
      text: "Zero data retention"
    },
    {
      icon: <Server className="h-6 w-6 text-green-500" />,
      text: "Hosted on Amazon Bedrock"
    },
    {
      icon: <Shield className="h-6 w-6 text-green-500" />,
      text: "GDPR-compliant"
    },
    {
      icon: <Database className="h-6 w-6 text-green-500" />,
      text: "Private AI Instances"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
      text: "Secure by design"
    }
  ];

  const faqs = [
    {
      question: "Can I switch between monthly and annual?",
      answer: "Yes. You can switch plans at any time from your dashboard. We'll automatically prorate billing."
    },
    {
      question: "Are AI Instances really private?",
      answer: "Yes. Each instance is logically isolated. Enterprise plans offer dedicated infrastructure."
    },
    {
      question: "What happens if I exceed my plan's output message limit?",
      answer: "You'll receive alerts and can top up usage or upgrade easily. No surprise charges."
    },
    {
      question: "Can I try Akii before paying?",
      answer: "Yes. We offer a free trial with no credit card required."
    },
    {
      question: "Do you offer SLAs or enterprise onboarding?",
      answer: "Yes. Enterprise customers get custom SLAs, onboarding, and security reviews."
    },
    {
      question: "Can I host Akii on-premise or in my own cloud?",
      answer: "Contact us to discuss self-hosted or private cloud options for regulated environments."
    }
  ];

  const calculateAnnualPrice = (monthlyPrice) => {
    if (!monthlyPrice) return null;
    const annualPrice = monthlyPrice * 12 * (1 - annualDiscount);
    return Math.round(annualPrice);
  };

  return (
    <MainLayout>
      {/* Hero Section - Simplified for clarity */}
      <section className="py-16 bg-gradient-to-b from-background via-background/95 to-muted/30 border-b border-border/40">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Secure, Private AI for Your Business
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose a plan that works for your business. All plans include private AI instances with 
              zero data retention and enterprise-grade security.
            </p>

            <div className="bg-green-500/10 rounded-lg p-4 mb-10 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-500 mb-1">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-semibold">Data Privacy Guarantee</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your data never trains other models. Private instances keep your information secure and compliant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section - Made more prominent */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl">Pay monthly or save 16% with annual billing. No hidden fees or surprise charges.</p>
            
            <div className="flex items-center space-x-2 mt-6">
              <span className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === "annual"}
                onCheckedChange={toggleBillingCycle}
              />
              <span className={billingCycle === "annual" ? "font-medium" : "text-muted-foreground"}>
                Annual
                <span className="ml-1 text-xs text-green-500">Save 16%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`flex flex-col ${plan.popularChoice ? "border-green-500 shadow-lg relative overflow-visible" : ""}`}
              >
                {plan.popularChoice && (
                  <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-t-md text-center">
                    Most Popular
                  </div>
                )}
                <CardHeader className={plan.popularChoice ? "pt-4" : ""}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="min-h-[60px]">{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <span className="text-4xl font-bold">
                          ${billingCycle === "monthly" ? plan.monthlyPrice : calculateAnnualPrice(plan.monthlyPrice)}
                        </span>
                        <span className="text-muted-foreground">
                          {plan.monthlyPrice === 0 ? "" : billingCycle === "monthly" ? "/mo" : "/year"}
                        </span>
                        {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-green-500 mt-1">
                            Save ${Math.round(plan.monthlyPrice * 12 * annualDiscount)}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl font-bold">Custom Quote</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Messages
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-56">Number of total AI messages included per month.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                      <span className="font-medium">{plan.outputMessages}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">{plan.storage}</span>
                    </div>
                    {plan.name === "Free Trial" && (
                      <div className="mt-2 text-xs text-green-500 font-medium">
                        No credit card required
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      {plan.features.customTraining ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <span className={!plan.features.customTraining ? "text-muted-foreground" : ""}>
                        Custom Training
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>
                        {plan.name === "Free Trial" ? "1" : 
                         plan.name === "Starter" ? "1" : 
                         plan.name === "Pro" ? "3" : 
                         plan.name === "Business" ? "5" : 
                         "Unlimited"} Team {plan.name === "Free Trial" || plan.name === "Starter" ? "Seat" : "Seats"}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      {plan.features.dedicatedInfra ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <span className={!plan.features.dedicatedInfra ? "text-muted-foreground" : ""}>
                        Dedicated Infrastructure
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      {plan.features.apiAccess ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <span className={!plan.features.apiAccess ? "text-muted-foreground" : ""}>
                        API Access
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      {plan.features.multiChannel ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      )}
                      <span>{plan.features.multiChannel ? "Multi-channel" : "Single-channel"} Deployment</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{plan.features.support}</span>
                    </div>
                    
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span className="text-sm">Overage: {plan.features.overageRate}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full font-medium ${plan.popularChoice ? "bg-green-500 hover:bg-green-600 text-white" : ""}`} 
                    asChild
                  >
                    <Link to={plan.ctaLink}>{plan.ctaText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">Enterprise-Grade Security, Standard</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                {feature.icon}
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compare Features Table (Mobile Hidden) */}
      <section className="py-12 md:py-16 hidden md:block">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Compare All Features
          </h2>
          
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Feature</TableHead>
                <TableHead>Free Trial</TableHead>
                <TableHead>Starter</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell>
                  Free
                </TableCell>
                <TableCell>
                  ${billingCycle === "monthly" ? "49/mo" : "499/year"}
                </TableCell>
                <TableCell>
                  ${billingCycle === "monthly" ? "149/mo" : "1,499/year"}
                </TableCell>
                <TableCell>
                  ${billingCycle === "monthly" ? "499/mo" : "4,999/year"}
                </TableCell>
                <TableCell>
                  ${billingCycle === "monthly" ? "5,000/mo" : "50,400/year"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    Output Messages
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-56">Number of total AI messages included per month.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
                <TableCell>500 total</TableCell>
                <TableCell>50,000/mo</TableCell>
                <TableCell>250,000/mo</TableCell>
                <TableCell>750,000/mo</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Storage</TableCell>
                <TableCell>10 MB</TableCell>
                <TableCell>1 GB</TableCell>
                <TableCell>5 GB</TableCell>
                <TableCell>20 GB</TableCell>
                <TableCell>100+ GB</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Custom Training</TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Team Seats</TableCell>
                <TableCell>1</TableCell>
                <TableCell>1</TableCell>
                <TableCell>3</TableCell>
                <TableCell>5</TableCell>
                <TableCell>Unlimited</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dedicated Infrastructure</TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">API Access</TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
                <TableCell>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Support</TableCell>
                <TableCell>Email only</TableCell>
                <TableCell>Email only</TableCell>
                <TableCell>Chat Support</TableCell>
                <TableCell>Priority Support</TableCell>
                <TableCell>Dedicated Slack + SLA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overage Rate</TableCell>
                <TableCell>Upgrade required</TableCell>
                <TableCell>$0.02 per 1K tokens</TableCell>
                <TableCell>$0.015 per 1K tokens</TableCell>
                <TableCell>$0.012 per 1K tokens</TableCell>
                <TableCell>Flat rate or custom SLA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Deployment Channels</TableCell>
                <TableCell>Single-channel</TableCell>
                <TableCell>Multi-channel</TableCell>
                <TableCell>Multi-channel</TableCell>
                <TableCell>Multi-channel</TableCell>
                <TableCell>Multi-channel</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-16 bg-muted/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to get started with Akii?
            </h2>
            <p className="text-muted-foreground">
              Choose a plan above or contact us to discuss your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Pricing;
