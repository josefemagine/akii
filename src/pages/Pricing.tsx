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
import { CheckCircle, XCircle } from "lucide-react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
  };

  const plans = [
    {
      name: "Basic",
      description: "Perfect for small businesses just getting started with AI.",
      price: billingCycle === "monthly" ? 29 : 23,
      messageLimit: 1000,
      features: [
        { name: "Web Chat Integration", included: true },
        { name: "3 AI Agents", included: true },
        { name: "Basic Analytics", included: true },
        { name: "Document Training (5 MB)", included: true },
        { name: "Email Support", included: true },
        { name: "Zapier & Webhooks", included: true },
        { name: "API Access", included: false },
        { name: "Advanced Integrations", included: false },
      ],
    },
    {
      name: "Pro",
      description: "Ideal for growing businesses with multiple channels.",
      price: billingCycle === "monthly" ? 99 : 79,
      messageLimit: 5000,
      popular: true,
      features: [
        { name: "Web Chat Integration", included: true },
        { name: "10 AI Agents", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Document Training (20 MB)", included: true },
        { name: "Priority Email Support", included: true },
        { name: "All Integrations", included: true },
        { name: "Team Collaboration (3 users)", included: true },
        { name: "Full API Access", included: true },
      ],
    },
    {
      name: "Scale",
      description: "For growing companies that need volume and performance.",
      price: billingCycle === "monthly" ? 499 : 399,
      messageLimit: 25000,
      features: [
        { name: "All Integrations", included: true },
        { name: "25 AI Agents", included: true },
        { name: "Custom Analytics", included: true },
        { name: "Document Training (100 MB)", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Model Tuning", included: true },
        { name: "Team Collaboration (unlimited)", included: true },
        { name: "SDKs & Custom Support", included: true },
      ],
    },
    {
      name: "Enterprise",
      description: "Enterprise-grade AI with compliance and custom support.",
      price: null,
      messageLimit: 50000,
      features: [
        { name: "All Integrations", included: true },
        { name: "Unlimited AI Agents", included: true },
        { name: "Custom Analytics", included: true },
        { name: "Unlimited Document Training", included: true },
        { name: "24/7 Priority Support", included: true },
        { name: "Dedicated Account Manager", included: true },
        { name: "VPC/On-Prem Deployment", included: true },
        { name: "Enterprise Compliance", included: true },
      ],
    },
  ];

  return (
    <MainLayout>
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that's right for your business. All plans
                include a 7-day free trial with no credit card required.
              </p>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <span
                className={
                  billingCycle === "monthly"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                Monthly
              </span>
              <Switch
                checked={billingCycle === "annual"}
                onCheckedChange={toggleBillingCycle}
              />
              <span
                className={
                  billingCycle === "annual"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                Annual
                <span className="ml-1 text-xs text-primary">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    {plan.price ? (
                      <>
                        <span className="text-4xl font-bold">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
                    )}
                    {billingCycle === "annual" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed annually
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>{plan.messageLimit.toLocaleString()}</strong>{" "}
                    messages per month
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        {feature.included ? (
                          <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "" : "text-muted-foreground"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/signup">
                      {plan.name === "Enterprise"
                        ? "Contact Sales"
                        : "Start 7-Day Free Trial"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto max-w-3xl grid gap-6 md:grid-cols-2">
              <div className="text-left">
                <h3 className="font-medium mb-2">
                  What happens when I reach my message limit?
                </h3>
                <p className="text-sm text-muted-foreground">
                  You can continue using the service at a per-message rate, or
                  upgrade to a higher plan at any time.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Can I change plans later?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect at the start of your next billing cycle.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">
                  How does the free trial work?
                </h3>
                <p className="text-sm text-muted-foreground">
                  All plans include a 7-day free trial with access to all Pro
                  plan features and 100 AI messages. No credit card required to
                  start.
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-medium mb-2">Do you offer add-ons?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer add-ons like +$10/month per extra 1,000
                  messages, +$15/month per extra AI agent, +$100/month for
                  HIPAA/BAA compliance, and +$50/month for priority support (Pro
                  users).
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Sales for Custom Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Pricing;
