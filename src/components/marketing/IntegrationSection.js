import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Monitor, Smartphone, MessageCircle, Send, ShoppingBag, Globe, Puzzle, ArrowRight, Workflow, Share } from "lucide-react";
// Individual integration card component with animation
const IntegrationCard = ({ icon, title, description, index, learnMoreLink }) => {
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
                delay: index * 0.1, // Stagger based on index
                ease: "easeOut"
            }
        }
    };
    return (_jsx(motion.div, { ref: ref, initial: "hidden", animate: controls, variants: cardVariants, className: "flex flex-col rounded-xl bg-secondary/20 border border-border/50 overflow-hidden hover-glow hover-tilt hover:border-primary/30 transition-all duration-300", children: _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary", children: icon }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: title }), _jsx("p", { className: "text-muted-foreground mb-4", children: description }), learnMoreLink && (_jsxs(Link, { to: learnMoreLink, className: "text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors", children: ["Learn more ", _jsx(ArrowRight, { className: "h-4 w-4" })] }))] }) }));
};
// Final CTA Card Component
const FinalCTACard = ({ visible }) => {
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
    return (_jsxs(motion.div, { ref: ref, initial: "hidden", animate: controls, variants: cardVariants, className: "mt-16 p-10 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-center hover-glow", children: [_jsx("h3", { className: "text-2xl font-bold mb-2", children: "Your AI. Wherever your users are." }), _jsx("p", { className: "text-muted-foreground mb-6 text-lg", children: "One instance. Infinite reach. All at akii.com" }), _jsx(Button, { size: "lg", className: "bg-primary hover:bg-primary/90 text-lg", onClick: handleGetStarted, children: "Get Started" })] }));
};
// Main Integration Section Component
export const IntegrationSection = () => {
    const [allCardsViewed, setAllCardsViewed] = useState(false);
    const sectionRef = useRef(null);
    // Integration data
    const integrations = [
        {
            icon: _jsx(Monitor, { className: "h-6 w-6" }),
            title: "Web Chat",
            description: "Boost conversions and resolve questions instantly with a branded AI chat widget trained on your products & services.",
            learnMoreLink: "/products/web-chat"
        },
        {
            icon: _jsx(Smartphone, { className: "h-6 w-6" }),
            title: "Mobile Chat",
            description: "Power your mobile apps with AI trained on your data — connect via SDK or API.",
            learnMoreLink: "/products/mobile-chat"
        },
        {
            icon: _jsx(MessageCircle, { className: "h-6 w-6" }),
            title: "WhatsApp",
            description: "Deliver smart, instant support on WhatsApp Business — powered by your custom-trained AI.",
            learnMoreLink: "/products/whatsapp-chat"
        },
        {
            icon: _jsx(Send, { className: "h-6 w-6" }),
            title: "Telegram",
            description: "Support customers, drive sales, and grow communities with AI-powered Telegram bots.",
            learnMoreLink: "/products/telegram-chat"
        },
        {
            icon: _jsx(ShoppingBag, { className: "h-6 w-6" }),
            title: "Shopify App",
            description: "AI chat that knows your products, supports your customers, and grows your Shopify sales.",
            learnMoreLink: "/products/shopify-chat"
        },
        {
            icon: _jsx(Globe, { className: "h-6 w-6" }),
            title: "WordPress Plugin",
            description: "Boost engagement and provide 24/7 sales and support through AI chat on your WordPress site.",
            learnMoreLink: "/products/wordpress-chat"
        },
        {
            icon: _jsx(Share, { className: "h-6 w-6" }),
            title: "Zapier",
            description: "Connect 8,000+ data sources via Zapier to train your AI on the tools your business already uses.",
            learnMoreLink: "/products/integrations/zapier"
        },
        {
            icon: _jsx(Workflow, { className: "h-6 w-6" }),
            title: "n8n",
            description: "Build powerful AI automation workflows with the open source n8n platform.",
            learnMoreLink: "/products/integrations/n8n"
        },
        {
            icon: _jsx(Puzzle, { className: "h-6 w-6" }),
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
    return (_jsxs("section", { className: "py-20 md:py-28 bg-gradient-to-b from-background/80 to-background relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" }), _jsxs("div", { className: "container px-4 md:px-6 relative z-10", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-4", children: "Private AI, trained on your data. Deployed anywhere." }), _jsx("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto", children: "Easily deploy your private AI instance across all major platforms \u2014 including Web, Mobile, WhatsApp, Telegram, Shopify, WordPress, Zapier, n8n, and REST API \u2014 with no complex setup required." })] }), _jsx("div", { ref: sectionRef, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: integrations.map((integration, index) => (_jsx(IntegrationCard, { icon: integration.icon, title: integration.title, description: integration.description, index: index, learnMoreLink: integration.learnMoreLink }, index))) }), _jsx(FinalCTACard, { visible: allCardsViewed })] })] }));
};
export default IntegrationSection;
