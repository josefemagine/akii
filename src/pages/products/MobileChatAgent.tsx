import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import {
  Smartphone,
  Check,
  ArrowRight,
  Code,
  Zap,
  Globe,
  Clock,
  Users,
  Bot,
  Settings,
  Star,
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
              Mobile App Integration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI-Powered <span className="text-primary">Mobile Chat</span> For Your Apps
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your mobile apps with intelligent chat capabilities that deliver personalized experiences, automate support, and drive user engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/signup">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/demo">
                  View Live Demo
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-lg overflow-hidden border bg-card p-2"
          >
            <div className="rounded-md overflow-hidden bg-background/50">
              <div className="flex items-center gap-1 p-2 bg-black/90">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs ml-2">mobile app simulator</span>
              </div>
              <div className="p-4 flex flex-col h-[360px] justify-between">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                      <p>Welcome to the AcmeShop app! How can I assist you today?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 text-sm max-w-[80%]">
                      <p>I'm looking for a new running shoe with good cushioning.</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none p-3 text-sm max-w-[80%]">
                      <p>Great! Based on your preferences, I recommend the following:</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="bg-background rounded p-2">
                          <div className="h-16 bg-gray-200 rounded mb-1"></div>
                          <p className="text-xs font-medium">UltraBoost 5.0</p>
                          <p className="text-xs text-muted-foreground">$129.99</p>
                        </div>
                        <div className="bg-background rounded p-2">
                          <div className="h-16 bg-gray-200 rounded mb-1"></div>
                          <p className="text-xs font-medium">CloudRunner Pro</p>
                          <p className="text-xs text-muted-foreground">$149.99</p>
                        </div>
                      </div>
                      <p className="mt-2">Would you like to see more details on either of these?</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full rounded-full border border-border bg-background px-4 py-2 pr-10 text-sm" 
                  />
                  <Button size="icon" variant="ghost" className="absolute right-0 top-0 h-full aspect-square rounded-full text-primary">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="text-xs text-muted-foreground">Powered by <span className="font-medium text-primary">Akii</span></div>
                  <div className="flex gap-2">
                    <button className="text-muted-foreground hover:text-foreground">
                      <Settings className="h-3 w-3" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Zap className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full opacity-50" />
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
  return (
    <section className="py-20 bg-gradient-to-b from-background/80 to-background/60 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Get up and running with Akii Mobile Chat in minutes. Our SDK makes integration straightforward for iOS and Android developers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">1</div>
                <h3 className="text-xl font-semibold">Install our SDK</h3>
              </div>
              <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                <pre className="overflow-x-auto text-sm text-muted-foreground">
                  <code>{`// iOS - Add to your Podfile
pod 'AkiiChat', '~> 1.2.0'

// Android - Add to your build.gradle
implementation 'com.akii:chat-sdk:1.2.0'`}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">2</div>
                <h3 className="text-xl font-semibold">Initialize the SDK in your app</h3>
              </div>
              <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                <pre className="overflow-x-auto text-sm text-muted-foreground">
                  <code>{`// iOS - Swift
import AkiiChat

AkiiChat.shared.initialize(
    instanceId: "YOUR_INSTANCE_ID",
    primaryColor: UIColor(hex: "#16a34a"),
    userId: currentUser.id
)

// Android - Kotlin
import com.akii.chat.AkiiChat

AkiiChat.getInstance().initialize(
    context,
    "YOUR_INSTANCE_ID", 
    "#16a34a",
    currentUser.id
)`}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-primary">3</div>
                <h3 className="text-xl font-semibold">Launch the chat interface</h3>
              </div>
              <p className="text-muted-foreground">
                Display the chat interface with a single line of code. Customize the UI, behavior, and knowledge in your Akii.com dashboard.
              </p>
              <div className="bg-secondary/30 p-6 rounded-lg border border-border overflow-hidden">
                <pre className="overflow-x-auto text-sm text-muted-foreground">
                  <code>{`// iOS - Swift
AkiiChat.shared.presentChat(from: self)

// Android - Kotlin
AkiiChat.getInstance().startChat(activity)`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-border p-4 rounded-xl shadow-lg bg-background">
              <div className="border-b border-border pb-3 mb-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm text-muted-foreground">Mobile App Preview</span>
                </div>
              </div>
              <div className="h-[400px] relative">
                <div className="absolute inset-0 mx-auto w-[220px] border-8 border-gray-800 rounded-3xl shadow-lg bg-card overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-7 bg-gray-800 flex justify-center items-end pb-1">
                    <div className="w-16 h-1.5 bg-gray-600 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-7 bg-gray-800"></div>
                  <div className="h-full pt-7 pb-7 bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                      <div className="p-3 bg-primary text-white flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        <span className="font-medium">Akii Mobile Chat</span>
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="bg-muted/50 p-2 rounded-lg text-sm max-w-[80%]">
                          How can I help you today?
                        </div>
                        <div className="bg-primary/10 p-2 rounded-lg text-sm ml-auto max-w-[80%]">
                          I need to change my delivery address
                        </div>
                        <div className="bg-muted/50 p-2 rounded-lg text-sm max-w-[80%]">
                          I can help with that! Please provide your new address.
                        </div>
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

const BenefitsSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Akii Mobile Chat?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The smart choice for businesses looking to enhance mobile app engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Native Mobile Experience</h3>
                <p className="text-muted-foreground">
                  Offer a truly seamless experience with our native SDKs for iOS and Android. The chat interface feels like a natural part of your app, maintaining your brand identity.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Offline Capabilities</h3>
                <p className="text-muted-foreground">
                  Our SDK includes offline mode that caches responses to common questions, ensuring your users get help even when they're not connected to the internet.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-primary/10 p-3 rounded-full h-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Personalized User Experience</h3>
                <p className="text-muted-foreground">
                  Connect with your authentication system to provide truly personalized experiences. The AI remembers user preferences and past interactions.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-lg overflow-hidden border bg-card p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic text-muted-foreground mb-2">
                    "After integrating Akii Mobile Chat, our app's user retention increased by 42%. The AI assistant helps users discover features they didn't know existed, drastically improving overall engagement."
                  </p>
                  <p className="font-medium">Alex Rivera, CPO at HealthFit App</p>
                </div>
                
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="italic text-muted-foreground mb-2">
                    "Support tickets decreased by 68% after implementing Akii's mobile chat solution. Our developers were impressed with how easy it was to integrate, and our users love the instant responses."
                  </p>
                  <p className="font-medium">Priya Sharma, CTO at ShopSquare</p>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 -top-6 -left-6 w-24 h-24 bg-primary/30 rounded-full blur-xl"></div>
            <div className="absolute -z-10 -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Akii Mobile Chat
          </p>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How do I integrate the Mobile Chat into my app?</h3>
            <p className="text-muted-foreground">
              Integration is simple with our native SDKs. For iOS, you can use CocoaPods or Swift Package Manager. For Android, we provide a Gradle dependency. Our documentation includes step-by-step guides and sample code for both platforms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Can I customize the appearance of the chat interface?</h3>
            <p className="text-muted-foreground">
              Yes, you can fully customize the chat interface to match your app's design. You can change colors, fonts, button styles, and even create a completely custom UI using our headless API if needed. The SDK provides extensive styling options.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">Does the Mobile Chat work offline?</h3>
            <p className="text-muted-foreground">
              Yes, our SDK includes an offline mode that can provide basic responses to common questions even when the user doesn't have an internet connection. The SDK intelligently caches frequently asked questions and responses, and when connectivity is restored, the full AI capabilities become available again.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How does the Mobile Chat handle user authentication?</h3>
            <p className="text-muted-foreground">
              Our SDK integrates with your existing authentication system. You simply pass the user's identifier to our SDK during initialization, and we handle the rest. This allows for personalized experiences, conversation history across sessions, and user-specific data security.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold mb-2">How secure is the Mobile Chat?</h3>
            <p className="text-muted-foreground">
              We take security seriously. All conversations are encrypted in transit and at rest. We comply with GDPR, CCPA, and other privacy regulations. Our SDKs also support features like secure storage, automatic message expiration, and data minimization to protect user privacy.
            </p>
          </motion.div>
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
    <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-purple-500/10">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Mobile Experience Today
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join thousands of apps using Akii.com to provide exceptional AI-powered assistance and support to their mobile users.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/signup">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">
                Talk to Sales
              </Link>
            </Button>
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
      <FAQSection />
      <CTASection />
    </MainLayout>
  );
};

export default MobileChatAgent;
