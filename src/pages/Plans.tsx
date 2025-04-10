import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";
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

const Plans = () => {
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

  const calculateAnnualPrice = (monthlyPrice: number) => {
    return Math.floor(monthlyPrice * 12 * 0.8);  // 20% discount for annual
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
            
            <div className="flex items-center gap-3 mt-6">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch checked={billingCycle === "annual"} onCheckedChange={toggleBillingCycle} />
              <span className={`text-sm font-medium flex items-center gap-1 ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
                Annual <span className="text-xs bg-green-500/20 text-green-500 px-1 py-0.5 rounded">Save 16%</span>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {plans.map((plan, index) => {
              const priceToShow = billingCycle === "annual" ? calculateAnnualPrice(plan.monthlyPrice) : plan.monthlyPrice;
              
              return (
                <Card 
                  key={index} 
                  className={`flex flex-col ${plan.popularChoice ? "border-green-500/50 relative shadow-lg" : ""}`}
                >
                  {plan.popularChoice && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="mb-4">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">
                          {priceToShow === 0 ? "Free" : `$${priceToShow}`}
                        </span>
                        {priceToShow !== 0 && (
                          <span className="text-muted-foreground ml-1 text-sm">
                            /{billingCycle === "annual" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                      {billingCycle === "annual" && plan.monthlyPrice > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          (${plan.monthlyPrice}/month value)
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI Instances:</span>
                        <span className="font-medium">{plan.aiInstances}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Output Messages:</span>
                        <span className="font-medium">{plan.outputMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Storage:</span>
                        <span className="font-medium">{plan.storage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Support:</span>
                        <span className="font-medium">{plan.features.support}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Custom Training:</span>
                        <span>
                          {plan.features.customTraining ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channels:</span>
                        <span className="font-medium">
                          {plan.features.multiChannel ? "Multiple" : "Web only"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          API Access:
                        </span>
                        <span>
                          {plan.features.apiAccess ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button asChild className="w-full" variant={plan.name === "Enterprise" ? "outline" : "default"}>
                      <Link to={plan.ctaLink}>{plan.ctaText}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Plan Comparison Table */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare Plan Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Detailed comparison of all available features across our plans
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-1/4">Feature</TableHead>
                  <TableHead>Free Trial</TableHead>
                  <TableHead>Starter</TableHead>
                  <TableHead>Pro</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Enterprise</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Private AI Instances</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>5</TableCell>
                  <TableCell>10+</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Output Messages</TableCell>
                  <TableCell>500 total</TableCell>
                  <TableCell>50K/mo</TableCell>
                  <TableCell>250K/mo</TableCell>
                  <TableCell>750K/mo</TableCell>
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
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Remove AI Branding</TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Multi-channel Deployment</TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API Access</TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Access Control</TableCell>
                  <TableCell>None</TableCell>
                  <TableCell>Basic</TableCell>
                  <TableCell>Advanced</TableCell>
                  <TableCell>Advanced</TableCell>
                  <TableCell>Role-Based</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Dedicated Infrastructure</TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><XCircle className="h-4 w-4 text-red-500 mx-auto" /></TableCell>
                  <TableCell><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Support</TableCell>
                  <TableCell>Email only</TableCell>
                  <TableCell>Email only</TableCell>
                  <TableCell>Chat Support</TableCell>
                  <TableCell>Priority Support</TableCell>
                  <TableCell>Dedicated + SLA</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Data Security Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All plans include advanced security features that keep your data private and secure
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 text-center flex flex-col items-center">
                <div className="mb-4">{feature.icon}</div>
                <div className="font-medium">{feature.text}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-500 p-4 rounded-lg mb-4">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Public AI services can leak your data</span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlike public AI services that use your conversations to train their models, 
              Akii's private AI instances ensure your data never leaves your control.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Common questions about our plans and features
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Deploy your private AI instance in minutes. Start with our free trial or 
              contact us for a personalized demo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">Start for Free</Link>
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

export default Plans; 