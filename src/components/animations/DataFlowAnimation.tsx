import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  Database,
  FileText,
  MessageSquare,
  Lock,
  Shield,
  Zap,
  Monitor,
  Smartphone,
  Globe,
  ShoppingBag,
  MessageCircle,
  Send,
  Code,
  ShoppingCart,
  Cloud,
  Upload,
} from "lucide-react";

const DataFlowAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Data source icons
  const dataSources = [
    { 
      icon: (
        <div className="flex items-center justify-center text-blue-400">
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.82353 1.76471L2.47059 8.47059H8.47059L11.8235 1.76471H5.82353Z" fill="#4285F4"/>
            <path d="M12.1765 1.76471L8.82353 8.47059H14.8235L18.1765 1.76471H12.1765Z" fill="#1FBCFD"/>
            <path d="M0 10.5882L3.35294 3.88235L6.70588 10.5882L3.35294 17.2941L0 10.5882Z" fill="#27A85F"/>
            <path d="M6.70588 10.5882L10.0588 3.88235L13.4118 10.5882L10.0588 17.2941L6.70588 10.5882Z" fill="#FFCD40"/>
          </svg>
        </div>
      ), 
      label: "Google Drive" 
    },
    { icon: <Upload className="text-blue-400" />, label: "File Upload" },
    { icon: <Database className="text-purple-400" />, label: "CRM Data" },
    { icon: <Zap className="text-yellow-400" />, label: "Zapier" },
    { icon: <ShoppingCart className="text-green-400" />, label: "Ecommerce" },
  ];

  // Deployment platform icons
  const platforms = [
    { icon: <Monitor className="text-gray-100" />, label: "Website" },
    { icon: <Smartphone className="text-gray-100" />, label: "Mobile" },
    { icon: <MessageCircle className="text-gray-100" />, label: "WhatsApp" },
    { icon: <Send className="text-gray-100" />, label: "Telegram" },
    { icon: <ShoppingBag className="text-gray-100" />, label: "Shopify" },
    { icon: <Globe className="text-gray-100" />, label: "WordPress" },
    { icon: <Code className="text-gray-100" />, label: "API" },
  ];
  
  // Animation variants
  const containerVariants = {
    initial: {
      opacity: 1
    },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const flowLineVariants = {
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: 30,
      opacity: 1,
      transition: { duration: 0.6 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };
  
  const dataSourceVariants = {
    initial: { y: -15, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: -10, opacity: 0, transition: { duration: 0.3 } }
  };
  
  const vaultVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 200 }
    },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.3 } }
  };
  
  const platformVariants = {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { y: 10, opacity: 0, transition: { duration: 0.3 } }
  };

  // Run the animation once
  useEffect(() => {
    const startAnimation = async () => {
      await controls.start("animate");
    };
    
    startAnimation();
  }, [controls]);

  return (
    <motion.div 
      ref={containerRef} 
      className="w-full h-full rounded-lg overflow-hidden relative data-flow-animation"
      initial="initial"
      animate={controls}
      variants={containerVariants}
      style={{ minHeight: "500px" }}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Pulsing backdrop */}
      <motion.div
        className="absolute inset-0"
        animate={{ 
          background: [
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, rgba(0, 0, 0, 0) 70%)"
          ]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Animation content */}
      <div className="relative w-full h-full p-4 flex flex-col justify-between min-h-[450px] pt-2">
        {/* First stage: Data Sources flowing to Akii Vault */}
        <div className="flex flex-col items-center">
          <motion.div 
            variants={dataSourceVariants}
            className="text-white text-base font-medium mb-1 pb-[10px]"
          >
            Upload training data from 8000+ sources
          </motion.div>

          <div className="flex justify-center space-x-5 mb-2">
            {dataSources.map((source, index) => (
              <motion.div
                key={index}
                variants={dataSourceVariants}
                custom={index}
                className="flex flex-col items-center"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-800 flex items-center justify-center mb-1">
                  {source.icon}
                </div>
                <span className="text-gray-400 text-[10px]">{source.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Animated data flow lines */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-blue-500 to-[#FF9900] flow-line my-1"
          />

          {/* Amazon Bedrock */}
          <motion.div
            variants={vaultVariants}
            className="relative flex justify-center items-center my-1"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 0px rgba(255, 153, 0, 0)", "0 0 10px rgba(255, 153, 0, 0.4)", "0 0 0px rgba(255, 153, 0, 0)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 rounded-md"
            />
            <div className="bg-transparent py-1 px-3 rounded-md border border-[#FF9900] text-white text-xs font-medium whitespace-nowrap">
              Powered by Amazon Bedrock
            </div>
          </motion.div>
          
          {/* Flow line from Amazon Bedrock to AI Training */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-[#FF9900] to-primary flow-line my-1"
          />
          
          {/* AI Training module */}
          <motion.div
            variants={vaultVariants}
            className="bg-gray-800 py-2 px-3 rounded-lg border border-primary/50 w-44 flex flex-col items-center my-1"
          >
            <div className="flex items-center mb-1">
              <Lock className="h-5 w-5 text-primary mr-2" />
              <span className="text-white font-medium text-sm">AI Training</span>
            </div>
            <span className="text-gray-400 text-[10px]">Isolated & Encrypted</span>
            
            {/* Animated pulse around the vault */}
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(59, 130, 246, 0)",
                  "0 0 0 3px rgba(59, 130, 246, 0.2)",
                  "0 0 0 0 rgba(59, 130, 246, 0)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          </motion.div>

          {/* Flow line from AI Training to Private AI Instance */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-primary to-green-500 flow-line my-1"
          />

          {/* Private AI Instance */}
          <motion.div
            variants={vaultVariants}
            className="relative my-1"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 15px rgba(59, 130, 246, 0.4)", "0 0 0px rgba(59, 130, 246, 0)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 rounded-lg"
            />
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 py-2 px-3 rounded-lg border border-primary/50 w-52 flex items-center">
              <div className="bg-primary/20 p-1 rounded-full mr-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-white font-medium text-sm">Private AI Instance</span>
                <span className="text-gray-400 text-[10px] block">Secure & Isolated</span>
              </div>
            </div>
          </motion.div>

          {/* Flow line from Private AI to Integrations */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-green-500 to-green-400 flow-line my-0.5"
          />
        </div>

        {/* Final stage: Akii plug-and-play apps & integrations */}
        <div className="mt-[2px] mb-2">
          <motion.div 
            variants={platformVariants}
            className="text-white text-base font-medium mb-1 text-center"
          >
            Akii plug-and-play apps & integrations
          </motion.div>

          {/* Flow arrows connecting Private AI with platforms */}
          <div className="relative h-6 mb-2">
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.5, delay: 1.8 }}
              className="absolute left-1/2 top-0 w-px h-3 bg-gradient-to-b from-green-500 to-green-400 origin-top"
              style={{ transform: 'translateX(-50%)' }}
            />
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '84%' }}
              transition={{ duration: 0.5, delay: 2 }}
              className="absolute left-1/2 top-3 h-px bg-gradient-to-r from-green-400 to-green-400"
              style={{ transform: 'translateX(-50%)' }}
            />
            
            {/* Individual vertical lines precisely positioned */}
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.2 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '7.5%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.3 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '21.5%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.4 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '35.5%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.5 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '50%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.6 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '64.5%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.7 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '78.5%', top: '3px' }}
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ duration: 0.3, delay: 2.8 }}
              className="absolute h-4 w-px bg-green-400 origin-top"
              style={{ left: '92.5%', top: '3px' }}
            />
          </div>

          <div className="grid grid-cols-7 gap-1 px-2">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                variants={platformVariants}
                custom={index}
                className="flex flex-col items-center"
              >
                <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center mb-1">
                  {platform.icon}
                </div>
                <span className="text-gray-400 text-[10px] text-center">{platform.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataFlowAnimation; 