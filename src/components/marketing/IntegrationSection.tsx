import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Monitor, 
  Smartphone, 
  MessageCircle,
  Send,
  ShoppingBag,
  Globe,
  Puzzle,
  ArrowRight,
  Workflow,
  Share
} from "lucide-react";

// Interface for integration card data
interface IntegrationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  learnMoreLink?: string;
}

// Individual integration card component with animation
const IntegrationCard: React.FC<IntegrationCardProps> = ({ 
  icon, 
  title, 
  description, 
  index, 
  learnMoreLink 
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.1,  // Stagger based on index
        ease: "easeOut" 
      } 
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      className="flex flex-col rounded-xl bg-secondary/20 border border-border/50 overflow-hidden hover-glow hover-tilt hover:border-primary/30 transition-all duration-300"
    >
      <div className="p-6">
        <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {learnMoreLink && (
          <Link 
            to={learnMoreLink} 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

// Final CTA Card Component
const FinalCTACard: React.FC<{ visible: boolean }> = ({ visible }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (inView && visible) {
      controls.start("visible");
    }
  }, [controls, inView, visible]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: 0.3,
        ease: "easeOut" 
      } 
    }
  };

  const handleGetStarted = () => {
    // Trigger login modal through event for better decoupling
    window.dispatchEvent(new CustomEvent('akii:open:login'));
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      className="mt-16 p-10 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-center hover-glow"
    >
      <h3 className="text-2xl font-bold mb-2">Your AI. Wherever your users are.</h3>
      <p className="text-muted-foreground mb-6 text-lg">One instance. Infinite reach. All at akii.com</p>
      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-lg" 
        onClick={handleGetStarted}
      >
        Get Started
      </Button>
    </motion.div>
  );
};

// Main Integration Section Component
export const IntegrationSection: React.FC = () => {
  const [allCardsViewed, setAllCardsViewed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Integration data
  const integrations = [
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Web Chat",
      description: "Deploy a branded AI chat widget on your website in minutes.",
      learnMoreLink: "/products/web-chat"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile Chat",
      description: "Connect your AI to iOS and Android apps via SDK or API.",
      learnMoreLink: "/products/mobile-chat"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "WhatsApp",
      description: "Launch private AI-powered conversations in WhatsApp.",
      learnMoreLink: "/products/whatsapp-chat"
    },
    {
      icon: <Send className="h-6 w-6" />,
      title: "Telegram",
      description: "Create public or private Telegram bots powered by your AI.",
      learnMoreLink: "/products/telegram-chat"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Shopify App",
      description: "Boost sales with product-aware sales and support chat on your Shopify store.",
      learnMoreLink: "/products/shopify-chat"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "WordPress Plugin",
      description: "Boost engagement and provide 24/7 sales and support through AI chat on your WordPress site.",
      learnMoreLink: "/products/wordpress-chat"
    },
    {
      icon: <Share className="h-6 w-6" />,
      title: "Zapier",
      description: "Connect your AI to thousands of apps via Zapier automations and workflows.",
      learnMoreLink: "/products/integrations/zapier"
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "n8n",
      description: "Build powerful AI automation workflows with the open source n8n platform.",
      learnMoreLink: "/products/integrations/n8n"
    },
    {
      icon: <Puzzle className="h-6 w-6" />,
      title: "REST API",
      description: "Build anything you want with secure, full-featured API access.",
      learnMoreLink: "/products/private-ai-api"
    }
  ];

  // Check if all cards have been viewed to show the final CTA
  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const sectionBottom = sectionRef.current.getBoundingClientRect().bottom;
        // If we've scrolled almost to the bottom of the cards section
        if (sectionBottom < window.innerHeight + 200) {
          setAllCardsViewed(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background/80 to-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your AI. Plug & Play Across Web, Mobile, and More.
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Easily deploy your private AI Instance across all major platforms — including Web, Mobile, WhatsApp, 
            Telegram, Shopify, WordPress, and REST API — with no complex setup required.
          </p>
        </div>
        
        <div ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              icon={integration.icon}
              title={integration.title}
              description={integration.description}
              index={index}
              learnMoreLink={integration.learnMoreLink}
            />
          ))}
        </div>
        
        <FinalCTACard visible={allCardsViewed} />
      </div>
    </section>
  );
};

export default IntegrationSection; 