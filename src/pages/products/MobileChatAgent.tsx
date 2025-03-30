import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import {
  Smartphone,
  CheckCircle,
  ArrowRight,
  Code,
  Zap,
  Globe,
  Clock,
  Users,
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
              Mobile Chat Agent
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Chat for Your <span className="text-primary">Mobile Apps</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Integrate powerful AI chat capabilities into your iOS and Android
              apps to enhance user experience and provide instant support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">See Demo</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80"
                alt="Mobile Chat Agent Interface"
                className="relative z-10 w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Native Integration",
      description:
        "Seamlessly integrate with iOS and Android apps using our native SDKs for a smooth user experience.",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "Offline Support",
      description:
        "Provide basic responses even when users are offline, with full functionality when connection is restored.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "User Authentication",
      description:
        "Easily connect with your existing user authentication system for personalized experiences.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Push Notifications",
      description:
        "Send timely notifications to re-engage users and provide updates on their queries.",
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: "Customizable UI",
      description:
        "Fully customize the chat interface to match your app's design language and branding.",
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: "Cross-Platform",
      description:
        "One API to support both iOS and Android platforms, with consistent behavior across devices.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Mobile-First Chat Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our Mobile Chat Agent is designed specifically for native mobile
            applications with features that mobile users expect.
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
      title: "Install SDK",
      description:
        "Add our lightweight SDK to your iOS or Android project using CocoaPods, Swift Package Manager, or Gradle.",
    },
    {
      number: "02",
      title: "Configure & Customize",
      description:
        "Set up your agent's appearance, behavior, and knowledge base through our dashboard.",
    },
    {
      number: "03",
      title: "Integrate Authentication",
      description:
        "Connect with your existing user authentication system to personalize the experience.",
    },
    {
      number: "04",
      title: "Launch & Monitor",
      description:
        "Deploy to your users and track performance, engagement, and satisfaction through our analytics.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Get your AI chat agent integrated into your mobile apps in just a
              few simple steps.
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
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:gap-12 xl:grid-cols-[600px_1fr]">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80"
                alt="Mobile App Benefits"
                className="relative z-10 w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Benefits for Your Mobile App
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Our Mobile Chat Agent delivers measurable improvements to your
                app's user experience and business metrics.
              </p>
            </div>
            <ul className="grid gap-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Increased User Retention</p>
                  <p className="text-sm text-muted-foreground">
                    Keep users engaged with your app longer by providing instant
                    assistance and reducing frustration.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Reduced Support Tickets</p>
                  <p className="text-sm text-muted-foreground">
                    Decrease the volume of support tickets by up to 40% by
                    resolving common issues automatically.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Higher App Store Ratings</p>
                  <p className="text-sm text-muted-foreground">
                    Improve your app store ratings with better user experiences
                    and faster issue resolution.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Valuable User Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Gain insights into user needs and pain points through
                    conversation analytics.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Increased In-App Conversions</p>
                  <p className="text-sm text-muted-foreground">
                    Guide users to premium features or purchases with
                    contextual, helpful suggestions.
                  </p>
                </div>
              </li>
            </ul>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
              <Button asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/case-studies">View Case Studies</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "$59",
      description:
        "Perfect for small apps with limited user base and chat volume.",
      features: [
        "1,500 messages per month",
        "Basic customization",
        "Email support",
        "iOS & Android SDKs",
        "Standard response time",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      price: "$129",
      description: "Ideal for growing apps with moderate chat volume.",
      features: [
        "7,500 messages per month",
        "Advanced customization",
        "Priority email support",
        "iOS & Android SDKs",
        "Faster response time",
        "Push notification integration",
        "Analytics dashboard",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale apps with high volume requirements.",
      features: [
        "Unlimited messages",
        "Full customization",
        "24/7 phone & email support",
        "iOS & Android SDKs",
        "Fastest response time",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Choose the plan that's right for your mobile app. All plans
              include a 14-day free trial.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardContent className="p-6 flex flex-col flex-1">
                <div className="flex flex-col space-y-4 flex-1">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.name === "Enterprise"
                        ? "Custom pricing"
                        : "per month"}
                    </p>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-auto"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link
                      to={
                        plan.name === "Enterprise"
                          ? "/contact-sales"
                          : "/signup"
                      }
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: "How do I integrate the Mobile Chat Agent into my app?",
      answer:
        "Integration is simple with our native SDKs. For iOS, you can use CocoaPods or Swift Package Manager. For Android, we provide a Gradle dependency. Our documentation includes step-by-step guides and sample code for both platforms.",
    },
    {
      question: "Can I customize the appearance of the chat interface?",
      answer:
        "Yes, you can fully customize the chat interface to match your app's design. You can change colors, fonts, button styles, and even create a completely custom UI using our headless API if needed.",
    },
    {
      question: "Does the Mobile Chat Agent work offline?",
      answer:
        "Yes, our SDK includes an offline mode that can provide basic responses to common questions even when the user doesn't have an internet connection. When connectivity is restored, the full AI capabilities become available again.",
    },
    {
      question: "How does the Mobile Chat Agent handle user authentication?",
      answer:
        "Our SDK integrates with your existing authentication system. You simply pass the user's identifier to our SDK, and we handle the rest. This allows for personalized experiences and conversation history across sessions.",
    },
    {
      question: "Is there a limit to the number of conversations?",
      answer:
        "Each plan comes with a specific number of messages per month. A message is counted each time the AI agent responds to a user. You can upgrade your plan at any time if you need more capacity.",
    },
    {
      question: "How secure is the Mobile Chat Agent?",
      answer:
        "We take security seriously. All conversations are encrypted in transit and at rest. We comply with GDPR, CCPA, and other privacy regulations. Our SDKs also support features like secure storage and automatic message expiration.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Have questions? We've got answers.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to enhance your mobile app?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 14-day free trial today and see how our Mobile Chat
              Agent can transform your app experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">Schedule Demo</Link>
              </Button>
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
      <PricingSection />
      <FAQSection />
      <CTASection />
    </MainLayout>
  );
};

export default MobileChatAgent;
