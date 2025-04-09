import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataFlowAnimation from "@/components/animations/DataFlowAnimation";
import IntegrationSection from "@/components/marketing/IntegrationSection";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import LoginModal from "@/components/auth/LoginModal";
import { Shield, Database, Lock, Server, CheckCircle, BarChart, Globe, ShieldCheck, UserCog, Building, BriefcaseBusiness, FileText, ArrowRight, Network, BookOpen, User, } from "lucide-react";
const HeroSection = ({ user }) => {
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
        let typeTimer1 = null;
        let typeTimer2 = null;
        let typeTimer3 = null;
        setTypedText1('');
        setTypedText2('');
        setTypedText3('');
        setShowSubElements(false);
        // Type first line
        typeTimer1 = window.setInterval(() => {
            setTypedText1((prev) => {
                const nextText = fullText1.slice(0, prev.length + 1);
                if (nextText === fullText1) {
                    clearInterval(typeTimer1);
                    // Type second line after a small delay
                    typeTimer2 = window.setInterval(() => {
                        setTypedText2((prev) => {
                            const nextText = fullText2.slice(0, prev.length + 1);
                            if (nextText === fullText2) {
                                clearInterval(typeTimer2);
                                // Type third line static part after a small delay
                                typeTimer3 = window.setInterval(() => {
                                    setTypedText3((prev) => {
                                        if (prev.length < staticPrefix.length) {
                                            return staticPrefix.slice(0, prev.length + 1);
                                        }
                                        else if (prev === staticPrefix) {
                                            clearInterval(typeTimer3);
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
            if (typeTimer1)
                clearInterval(typeTimer1);
            if (typeTimer2)
                clearInterval(typeTimer2);
            if (typeTimer3)
                clearInterval(typeTimer3);
        };
    }, [fullText1, fullText2, staticPrefix]);
    // Effect for the rotating words animation
    React.useEffect(() => {
        // Skip if static prefix isn't fully typed yet
        if (typedText3 !== staticPrefix)
            return;
        const targetWord = rotatingWords[currentWordIndex];
        let animationTimer = null;
        if (isTyping) {
            // Typing animation
            animationTimer = window.setInterval(() => {
                setCurrentWord((prev) => {
                    const nextText = targetWord.slice(0, prev.length + 1);
                    if (nextText === targetWord) {
                        clearInterval(animationTimer);
                        // Pause before starting to delete
                        setTimeout(() => setIsTyping(false), 1500);
                    }
                    return nextText;
                });
            }, 100);
        }
        else {
            // Deleting animation
            animationTimer = window.setInterval(() => {
                setCurrentWord((prev) => {
                    const nextText = prev.slice(0, prev.length - 1);
                    if (nextText === '') {
                        clearInterval(animationTimer);
                        // Move to next word
                        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
                        setIsTyping(true);
                    }
                    return nextText;
                });
            }, 50); // Deletion is slightly faster
        }
        return () => {
            if (animationTimer)
                clearInterval(animationTimer);
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
    return (_jsxs("section", { className: "py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" }), _jsx("div", { className: "container px-4 md:px-6 relative z-10", children: _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]", children: [_jsxs("div", { className: "flex flex-col justify-center space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h1", { className: "text-5xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none flex flex-col space-y-2", children: [_jsxs("span", { children: [typedText1, typedText1.length === fullText1.length || typedText1.length === 0 ? null : _jsx("span", { className: "cursor-blink" })] }), _jsxs("span", { children: [typedText2, typedText2.length === fullText2.length || typedText2.length === 0 ? null : _jsx("span", { className: "cursor-blink" })] }), _jsxs("span", { className: "text-primary", children: [typedText3, typedText3 === staticPrefix && (_jsxs(_Fragment, { children: [currentWord, _jsx("span", { className: "cursor-blink" })] })), typedText3 !== staticPrefix && typedText3.length > 0 && (_jsx("span", { className: "cursor-blink" }))] })] }), _jsx(motion.p, { className: "max-w-[600px] text-muted-foreground text-xl", initial: "hidden", animate: showSubElements ? "visible" : "hidden", variants: fadeInUpVariants, children: "Launch your own private AI \u2014 powered by Amazon Bedrock, fully isolated, trained on your data, and plug-and-play apps and integrations across web, mobile, API and more." })] }), _jsx(motion.div, { className: "flex flex-col gap-3 sm:flex-row", initial: "hidden", animate: showSubElements ? "visible" : "hidden", variants: fadeInUpVariants, children: user ? (_jsx(Button, { size: "lg", className: "bg-primary hover:bg-primary/90 text-lg py-6", asChild: true, children: _jsx(Link, { to: "/dashboard", children: "LAUNCH A PRIVATE AI IN 5 MINUTES" }) })) : (_jsxs(_Fragment, { children: [_jsx(Button, { size: "lg", className: "bg-primary hover:bg-primary/90 text-lg py-6", onClick: handleOpenLoginModal, children: "LAUNCH A PRIVATE AI IN 5 MINUTES" }), _jsx(Button, { size: "lg", variant: "outline", asChild: true, children: _jsx(Link, { to: "/plans", children: "See Plans" }) })] })) })] }), _jsx("div", { className: "flex items-center justify-center", children: _jsx("div", { className: "relative w-full h-[550px] sm:h-[620px] md:h-[650px] rounded-lg shadow-xl overflow-hidden bg-transparent", children: _jsx(DataFlowAnimation, {}) }) })] }) })] }));
};
const DataPrivacySection = () => {
    return (_jsx("section", { className: "py-16 md:py-24 bg-muted/20", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("div", { className: "flex flex-col items-center justify-center space-y-4 text-center mb-10", children: _jsxs("div", { className: "space-y-2 max-w-3xl", children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight md:text-4xl/tight", children: "Data privacy you can trust" }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Enterprise-grade security and isolation, ensuring your data remains yours alone." })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(ShieldCheck, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "No AI Data Leaks" }), _jsx("p", { className: "text-muted-foreground", children: "Your prompts are never stored or used to train public models. What happens in your AI, stays in your AI." })] }) }), _jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Server, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Private AI Instances" }), _jsx("p", { className: "text-muted-foreground", children: "Every customer gets a logically isolated AI instance with its own data, vector memory, and model configuration." })] }) }), _jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Database, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Zero Data Retention" }), _jsx("p", { className: "text-muted-foreground", children: "We enforce zero data retention policies with model providers. Your data is purged after processing." })] }) }), _jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(Lock, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Isolated Storage" }), _jsx("p", { className: "text-muted-foreground", children: "Dedicated storage with strict access controls and comprehensive audit logs for all data operations." })] }) }), _jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(UserCog, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "Team Access" }), _jsx("p", { className: "text-muted-foreground", children: "Manage access with precision. Easily invite team members and control who can view, train, or interact with each AI instance." })] }) }), _jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx(FileText, { className: "h-10 w-10 text-primary mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: "GDPR-Ready" }), _jsx("p", { className: "text-muted-foreground", children: "Built with compliance in mind. Enterprise-safe with data residency options and compliance features." })] }) })] })] }) }));
};
const WhatIsAkiiSection = () => {
    return (_jsx("section", { className: "py-16 md:py-24 bg-background", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "grid gap-10 lg:grid-cols-2", children: [_jsx("div", { className: "flex items-center justify-center", children: _jsxs("div", { className: "relative w-full max-w-[500px] h-[400px] rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center", children: [_jsx("div", { className: "absolute w-32 h-32 rounded-full bg-primary/20 animate-pulse top-20 left-20" }), _jsx("div", { className: "absolute w-24 h-24 rounded-full bg-primary/15 animate-pulse bottom-20 right-20" }), _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-xs relative z-10", children: [_jsx("h3", { className: "font-bold text-xl mb-2", children: "Akii AI Platform" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), _jsx("span", { className: "text-sm", children: "Private AI Instances" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), _jsx("span", { className: "text-sm", children: "Secure Data Training" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), _jsx("span", { className: "text-sm", children: "Multi-channel Deployment" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-primary" }), _jsx("span", { className: "text-sm", children: "Isolated Infrastructure" })] })] })] })] }) }), _jsxs("div", { className: "flex flex-col justify-center space-y-4", children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight md:text-4xl/tight", children: "What is Akii?" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Akii is a platform where companies launch their own AI, train it on internal or customer data, and deploy it securely across multiple touchpoints. No shared models. No open training. Just your data and your AI." }), _jsx("p", { className: "text-lg text-muted-foreground", children: "We've built Akii to ensure maximum data privacy and security while delivering powerful AI capabilities that integrate seamlessly with your existing systems and customer touchpoints." }), _jsx("div", { className: "flex items-center pt-4", children: _jsx(Button, { variant: "outline", className: "mr-4", asChild: true, children: _jsxs(Link, { to: "/about", children: ["Learn More ", _jsx(ArrowRight, { className: "ml-2 h-4 w-4" })] }) }) })] })] }) }) }));
};
const CoreFeaturesSection = () => {
    const features = [
        {
            icon: _jsx(Shield, { className: "h-8 w-8 text-primary" }),
            title: "Private by Design",
            description: "Every AI instance is logically isolated, with zero data retention and no cross-customer access. Dedicated infrastructure is available on Enterprise plans."
        },
        {
            icon: _jsx(Database, { className: "h-8 w-8 text-primary" }),
            title: "Secure Data Ingestion",
            description: "Upload your data or connect via secure integrations with your existing systems."
        },
        {
            icon: _jsx(Network, { className: "h-8 w-8 text-primary" }),
            title: "Built-in Apps & Integrations Ready to Launch",
            description: "Deploy your AI across Web, Mobile, WhatsApp, Telegram, Shopify, WordPress, and API."
        },
        {
            icon: _jsx(BookOpen, { className: "h-8 w-8 text-primary" }),
            title: "RAG & Fine-tuning",
            description: "RAG-based training for all plans with full model fine-tuning available on Enterprise tier."
        },
        {
            icon: _jsx(UserCog, { className: "h-8 w-8 text-primary" }),
            title: "Team Access",
            description: "Manage access with precision. Easily invite team members and control who can view, train, or interact with each AI instance."
        },
        {
            icon: _jsx(BarChart, { className: "h-8 w-8 text-primary" }),
            title: "Analytics & Insights",
            description: "Detailed reports on AI performance, usage patterns, and customer satisfaction."
        }
    ];
    return (_jsx("section", { className: "py-16 md:py-24 bg-muted/10", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "flex flex-col items-center justify-center space-y-4 text-center mb-10", children: [_jsx(Badge, { variant: "outline", className: "border-primary/20 text-primary px-3 py-1", children: "Features" }), _jsx("h2", { className: "text-3xl font-bold tracking-tight md:text-4xl/tight", children: "Core platform capabilities" }), _jsx("p", { className: "text-muted-foreground text-lg max-w-3xl", children: "Everything you need to create, deploy, and maintain private AI instances trained on your data." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: features.map((feature, index) => (_jsx(Card, { className: "bg-card border-muted hover:border-primary/20 transition-colors", children: _jsxs(CardContent, { className: "pt-6", children: [_jsx("div", { className: "bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center mb-4", children: feature.icon }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: feature.title }), _jsx("p", { className: "text-muted-foreground", children: feature.description })] }) }, index))) })] }) }));
};
const WhyAkiiSection = () => {
    const securityBadges = [
        { icon: _jsx(Shield, { className: "h-5 w-5 text-primary" }), label: "SOC 2 compliance in progress" },
        { icon: _jsx(Database, { className: "h-5 w-5 text-primary" }), label: "Powered by AWS Bedrock" },
        { icon: _jsx(Lock, { className: "h-5 w-5 text-primary" }), label: "GDPR-ready infrastructure" }
    ];
    return (_jsx("section", { className: "py-12 bg-gradient-to-r from-primary/5 to-primary/10", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-8", children: "Why Akii?" }), _jsx("p", { className: "text-xl font-medium max-w-3xl mb-8", children: "\"Akii is the only AI platform built with privacy-first architecture from day one.\"" }), _jsx("div", { className: "flex flex-wrap justify-center gap-4 mt-4", children: securityBadges.map((badge, index) => (_jsxs("div", { className: "flex items-center space-x-2 bg-background px-4 py-2 rounded-full border border-border", children: [badge.icon, _jsx("span", { className: "text-sm font-medium", children: badge.label })] }, index))) })] }) }) }));
};
const UseCasesSection = () => {
    const useCases = [
        {
            icon: _jsx(Globe, { className: "h-8 w-8 text-primary" }),
            title: "Website Support AI",
            description: "Provide instant, accurate support to website visitors 24/7 without compromising data security."
        },
        {
            icon: _jsx(Building, { className: "h-8 w-8 text-primary" }),
            title: "Internal Knowledge Bot",
            description: "Help employees access company information securely with a private AI assistant trained on internal documentation."
        },
        {
            icon: _jsx(User, { className: "h-8 w-8 text-primary" }),
            title: "Sales Chat Assistant",
            description: "Qualify leads and answer product questions instantly while protecting sensitive customer information."
        },
        {
            icon: _jsx(BriefcaseBusiness, { className: "h-8 w-8 text-primary" }),
            title: "White-labeled AI for Agencies",
            description: "Agencies can offer private AI bots to clients with complete data isolation between accounts."
        }
    ];
    return (_jsx("section", { className: "py-16 md:py-24 bg-muted/20", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsxs("div", { className: "flex flex-col items-center justify-center space-y-4 text-center mb-10", children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight md:text-4xl/tight", children: "Use cases & applications" }), _jsx("p", { className: "text-muted-foreground text-lg max-w-3xl", children: "Discover how organizations are using Akii's private AI instances for secure, powerful solutions." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: useCases.map((useCase, index) => (_jsx(Card, { className: "bg-card hover:shadow-md transition-shadow", children: _jsx(CardContent, { className: "pt-6 pb-6", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "bg-primary/10 rounded-full w-14 h-14 flex items-center justify-center flex-shrink-0", children: useCase.icon }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-2", children: useCase.title }), _jsx("p", { className: "text-muted-foreground", children: useCase.description })] })] }) }) }, index))) }), _jsxs("div", { className: "mt-10 text-center", children: [_jsx("p", { className: "text-lg font-medium mb-6", children: "All use cases feature AI trained on your data with no risk of leaks" }), _jsx(Button, { asChild: true, children: _jsx(Link, { to: "/use-cases", children: "Explore All Use Cases" }) })] })] }) }));
};
const CTASection = ({ user }) => {
    return (_jsx("section", { className: "py-16 md:py-24 bg-primary/5", children: _jsx("div", { className: "container px-4 md:px-6", children: _jsxs("div", { className: "flex flex-col items-center text-center max-w-3xl mx-auto space-y-4", children: [_jsx(Lock, { className: "h-12 w-12 text-primary mb-2" }), _jsx("h2", { className: "text-3xl font-bold tracking-tight md:text-4xl/tight", children: "Own your AI \u2014 and your data" }), _jsx("p", { className: "text-lg text-muted-foreground", children: "Take control of your AI strategy with a secure, private platform that keeps your data completely isolated." }), _jsx("div", { className: "flex flex-col sm:flex-row gap-4 mt-4", children: user ? (_jsx(Button, { size: "lg", className: "bg-primary hover:bg-primary/90", asChild: true, children: _jsx(Link, { to: "/dashboard", children: "Go to Dashboard" }) })) : (_jsxs(_Fragment, { children: [_jsx(Button, { size: "lg", className: "bg-primary hover:bg-primary/90 text-lg py-6", asChild: true, children: _jsx(Link, { to: "/signup", children: "YOUR AI IN 5 MINUTES" }) }), _jsx(Button, { size: "lg", variant: "outline", asChild: true, children: _jsx(Link, { to: "/security", children: "Request a Security Walkthrough" }) })] })) })] }) }) }));
};
const LandingPage = ({ searchValue }) => {
    const { user, isLoading } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    // Memoize user state to prevent unnecessary re-renders
    const effectiveUserState = useMemo(() => {
        return user
            ? Object.assign(Object.assign({}, user), { isAuthenticated: true }) : { id: null, isAuthenticated: false };
    }, [user]);
    return (_jsxs(_Fragment, { children: [_jsx(HeroSection, { user: effectiveUserState }), _jsx(IntegrationSection, {}), _jsx(CoreFeaturesSection, {}), _jsx(WhatIsAkiiSection, {}), _jsx(DataPrivacySection, {}), _jsx(WhyAkiiSection, {}), _jsx(UseCasesSection, {}), _jsx(CTASection, { user: effectiveUserState }), isLoginModalOpen && (_jsx(LoginModal, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false), onOpenJoin: () => { }, onOpenPasswordReset: () => { } }))] }));
};
export default LandingPage;
