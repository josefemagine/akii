import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WebChatAnimation from "@/components/animations/WebChatAnimation";
import AnimatedText from "@/components/animations/AnimatedText";
import LeadMagnetButton from "@/components/marketing/LeadMagnetButton";
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
} from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-wide sm:text-5xl xl:text-6xl/none">
                Your Company's Own AI{" "}
                <span className="text-akii">
                  <AnimatedText
                    words={[
                      "Assistant",
                      "Sales Support",
                      "Researcher",
                      "Data Analyst",
                      "Customer Support",
                      "Compliance Analyst",
                      "Order Fulfillment",
                      "Technical Support",
                      "Internal IT Support",
                      "Helpdesk Agent",
                      "Inventory Manager",
                      "HR Coordinator",
                      "Customer Onboarding",
                      "Live Chat Agent",
                      "Billing Support",
                      "Account Executive",
                      "Data Entry Clerk",
                      "Lead Qualification",
                      "Survey & Feedback",
                    ]}
                    interval={1000}
                  />
                </span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Train it. Own it. Build on top of it. Deploy your own private AI
                instance for sales, support, operations, compliance, HR, and
                analytics. Secure, scalable, private, and easy to use.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <div className="relative z-10 w-full h-full rounded-lg shadow-xl overflow-hidden">
                <WebChatAnimation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductsSection = () => {
  const products = [
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "Private AI API",
      description:
        "Deploy, train, and scale your own private AI instance. Build anything on top of it with our powerful API platform.",
      link: "/products/private-ai-api",
      featured: true,
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Web Chat Agent",
      description:
        "Integrate AI chat agents directly into your website to engage visitors 24/7.",
      link: "/products/web-chat-agent",
    },
    {
      icon: <Smartphone className="h-10 w-10 text-primary" />,
      title: "Mobile Chat Agent",
      description:
        "Native mobile SDK for iOS and Android to provide AI support in your apps.",
      link: "/products/mobile-chat-agent",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "WhatsApp Chat Agent",
      description:
        "Connect your AI agents to WhatsApp for seamless customer interactions.",
      link: "/products/whatsapp-chat-agent",
    },
    {
      icon: <Share2 className="h-10 w-10 text-primary" />,
      title: "Telegram Chat Agent",
      description:
        "Deploy AI agents on Telegram to reach customers on their preferred platform.",
      link: "/products/telegram-chat-agent",
    },
    {
      icon: <ShoppingCart className="h-10 w-10 text-primary" />,
      title: "Shopify Chat Agent",
      description:
        "Boost sales with AI agents specifically designed for Shopify stores.",
      link: "/products/shopify-chat-agent",
    },
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "WordPress Chat Agent",
      description:
        "Easy-to-install WordPress plugin for adding AI agents to your site.",
      link: "/products/wordpress-chat-agent",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Our AI Agent Solutions
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Integrate AI agents across multiple platforms to provide seamless
              customer experiences.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {products.map((product, index) => (
            <Card
              key={index}
              className={`flex flex-col h-full ${product.featured ? "border-primary/50 shadow-lg" : ""}`}
            >
              <CardContent className="flex flex-col items-start space-y-4 p-6">
                <div
                  className={`p-2 ${product.featured ? "bg-primary/20" : "bg-primary/10"} rounded-lg`}
                >
                  {product.icon}
                </div>
                <div className="space-y-2">
                  <h3
                    className={`font-bold ${product.featured ? "text-lg text-primary" : ""}`}
                  >
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>
                <div className="mt-auto pt-4">
                  <Link
                    to={product.link}
                    className={`inline-flex items-center text-sm font-medium ${product.featured ? "text-primary" : "text-primary"}`}
                  >
                    Learn more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const ResearchSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Proven Results with AI Agents
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Recent research shows that companies using AI agents on their
                websites see remarkable improvements in key metrics.
              </p>
            </div>
            <ul className="grid gap-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">67% Increase in Sales</p>
                  <p className="text-sm text-muted-foreground">
                    Companies reported an average 67% increase in conversion
                    rates after implementing AI chat agents.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">30% Reduction in HR Costs</p>
                  <p className="text-sm text-muted-foreground">
                    Businesses reduced customer support staffing costs by an
                    average of 30% while maintaining or improving service
                    quality.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">24/7 Customer Support</p>
                  <p className="text-sm text-muted-foreground">
                    AI agents provide round-the-clock support, answering 92% of
                    common customer questions without human intervention.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">5x Faster Response Times</p>
                  <p className="text-sm text-muted-foreground">
                    Customer inquiries are addressed 5 times faster on average,
                    leading to higher satisfaction rates.
                  </p>
                </div>
              </li>
            </ul>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link to="/case-studies">View Case Studies</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/research">Read Full Research</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-3xl" />
              <div className="relative z-10 overflow-hidden rounded-lg border bg-background shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">Sales Performance</h3>
                      <p className="text-xs text-muted-foreground">
                        Monthly comparison
                      </p>
                    </div>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="pt-4 grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Before AI Implementation
                        </p>
                        <p className="text-2xl font-bold">$24,500</p>
                        <div className="flex items-center text-xs text-red-500">
                          <span>↓ 2.3%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          After AI Implementation
                        </p>
                        <p className="text-2xl font-bold">$41,200</p>
                        <div className="flex items-center text-xs text-green-500">
                          <span>↑ 67.1%</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[200px] w-full bg-gradient-to-b from-primary/20 to-transparent rounded-lg flex items-end p-4">
                      <div className="w-full flex items-end justify-between gap-2">
                        <div className="w-8 bg-muted-foreground/30 rounded-t h-[40px]"></div>
                        <div className="w-8 bg-muted-foreground/30 rounded-t h-[60px]"></div>
                        <div className="w-8 bg-muted-foreground/30 rounded-t h-[90px]"></div>
                        <div className="w-8 bg-muted-foreground/30 rounded-t h-[70px]"></div>
                        <div className="w-8 bg-muted-foreground/30 rounded-t h-[100px]"></div>
                        <div className="w-8 bg-primary rounded-t h-[120px]"></div>
                        <div className="w-8 bg-primary rounded-t h-[170px]"></div>
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

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "Implementing Akii's AI agents on our website increased our conversion rate by 58% in just two months. The ROI has been incredible.",
      author: "Sarah Johnson",
      role: "CMO, TechSolutions Inc.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    {
      quote:
        "Our customer satisfaction scores improved by 42% after deploying Akii's WhatsApp integration. Our customers love getting instant responses 24/7.",
      author: "Michael Chen",
      role: "Customer Success Director, Retail Connect",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    },
    {
      quote:
        "The WordPress integration was seamless. We were up and running in less than a day, and now our support team can focus on complex issues while the AI handles routine questions.",
      author: "Jessica Miller",
      role: "CTO, ContentFirst",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What Our Customers Say
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Don't just take our word for it. Here's what businesses using Akii
              have to say.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to Transform Your Business?
            </h2>
            <p className="mx-auto max-w-[700px] md:text-xl">
              Join thousands of businesses already using Akii to boost sales and
              reduce costs.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent"
              asChild
            >
              <Link to="/contact-sales">Contact Sales</Link>
            </Button>
          </div>
          <div className="mt-6">
            <LeadMagnetButton
              variant="link"
              className="text-primary-foreground underline underline-offset-4"
              title="Boost Your Sales by 67% with AI Chat Agents"
              description="Download our free guide with 10 proven strategies to increase your sales using AI chat agents."
            >
              Download our free guide: 10 steps to boost sales by 67% with AI
            </LeadMagnetButton>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Easy Setup",
      description:
        "Get up and running in minutes with our no-code setup process.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-platform",
      description:
        "Deploy your AI agents across web, mobile, WhatsApp, Telegram, and more.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Manage your AI agents with role-based team access.",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Advanced Analytics",
      description:
        "Track performance and optimize your AI agents with detailed insights.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
                alt="AI Features"
                className="relative z-10 w-full h-full object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Powerful Features for Your Business
              </h2>
              <p className="text-muted-foreground md:text-xl">
                Akii provides everything you need to create, deploy, and manage
                AI agents across multiple platforms.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link to="/features">Explore All Features</Link>
              </Button>
            </div>
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
  return (
    <>
      <HeroSection />
      <ProductsSection />
      <FeaturesSection />
      <ResearchSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default LandingPage;
