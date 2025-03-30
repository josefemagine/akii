import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import {
  CheckCircle,
  Code,
  Zap,
  Globe,
  Clock,
  Users,
  ArrowRight,
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
              <Code className="mr-1 h-4 w-4" />
              WordPress Chat Agent
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Chat for Your{" "}
              <span className="text-primary">WordPress Site</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Enhance your WordPress website with an intelligent AI chat agent
              that engages visitors, answers questions, and boosts conversions.
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
                src="https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&q=80"
                alt="WordPress Chat Agent Interface"
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
      title: "Easy Installation",
      description:
        "Install our WordPress plugin in seconds with no coding required. Just activate and configure.",
    },
    {
      icon: <Globe className="h-6 w-6 text-primary" />,
      title: "WooCommerce Integration",
      description:
        "Seamlessly integrates with WooCommerce to provide product information and support.",
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Content Awareness",
      description:
        "Automatically learns from your WordPress content to provide accurate responses.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "24/7 Availability",
      description:
        "Provide round-the-clock support to your website visitors without increasing staffing costs.",
    },
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: "Theme Compatibility",
      description:
        "Works with any WordPress theme and adapts to your site's design automatically.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: "Form Integration",
      description:
        "Connects with popular WordPress form plugins to capture leads and inquiries.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            WordPress-Specific Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our WordPress Chat Agent is designed specifically for WordPress
            websites to enhance user experience and boost engagement.
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
      title: "Install Plugin",
      description:
        "Download and install our WordPress plugin from the WordPress plugin directory.",
    },
    {
      number: "02",
      title: "Configure Settings",
      description:
        "Customize the appearance, behavior, and knowledge base of your AI agent.",
    },
    {
      number: "03",
      title: "Train with Content",
      description:
        "Your agent automatically learns from your WordPress pages, posts, and products.",
    },
    {
      number: "04",
      title: "Go Live & Monitor",
      description:
        "Activate your agent and track its performance through our analytics dashboard.",
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
              Get your AI chat agent up and running on your WordPress site in
              just a few simple steps.
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
                src="https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=800&q=80"
                alt="WordPress Site Benefits"
                className="relative z-10 w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Benefits for Your WordPress Site
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Our WordPress Chat Agent delivers measurable results for
                websites of all sizes and industries.
              </p>
            </div>
            <ul className="grid gap-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Increase User Engagement</p>
                  <p className="text-sm text-muted-foreground">
                    WordPress sites using our AI agents see an average 45%
                    increase in time spent on site.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Boost Lead Generation</p>
                  <p className="text-sm text-muted-foreground">
                    Capture more leads with proactive chat engagement and
                    intelligent form integration.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Improve Content Discovery</p>
                  <p className="text-sm text-muted-foreground">
                    Help visitors find relevant content on your site, increasing
                    page views by up to 30%.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Reduce Support Burden</p>
                  <p className="text-sm text-muted-foreground">
                    Automate responses to common questions and reduce your
                    support tickets by up to 50%.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Enhance WooCommerce Sales</p>
                  <p className="text-sm text-muted-foreground">
                    For e-commerce sites, our agent can help increase
                    conversions by answering product questions instantly.
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

const CTASection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12 border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to transform your WordPress site?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>
          </div>
        </div>
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
      <CTASection />
    </MainLayout>
  );
};

export default WordPressChatAgent;
