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

  // Amazon Bedrock box component
  const AmazonBedrockBox = ({ className = "" }) => (
    <div className={`flex items-center justify-center bg-[#FF9900]/20 rounded-b-lg border-t-0 border border-[#FF9900] px-2 py-1 w-full text-white text-xs font-medium ${className}`}>
      <Cloud className="h-3.5 w-3.5 mr-1.5 text-white" />
      Powered by Amazon Bedrock
    </div>
  );

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
      style={{ minHeight: "530px" }}
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
      <div className="relative w-full h-full p-4 flex flex-col justify-between min-h-[490px] pt-2">
        {/* First stage: Data Sources flowing to Akii Vault */}
        <div className="flex flex-col items-center">
          <motion.div 
            variants={dataSourceVariants}
            className="text-white text-base font-medium mb-3"
          >
            Upload training data from 8000+ sources
          </motion.div>

          <div className="flex justify-center space-x-5 mb-3">
            {dataSources.map((source, index) => (
              <motion.div
                key={index}
                variants={dataSourceVariants}
                custom={index}
                className="flex flex-col items-center"
              >
                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center mb-1">
                  {source.icon}
                </div>
                <span className="text-gray-400 text-[9px]">{source.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Animated data flow lines */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-blue-500 to-primary flow-line my-2"
          />
          
          {/* AI Training module with Amazon box */}
          <div className="w-64 flex flex-col mb-3">
            <motion.div
              variants={vaultVariants}
              className="bg-gray-800 py-2.5 px-4 rounded-t-lg border border-b-0 border-primary/50 w-full flex flex-col items-center"
            >
              <div className="flex items-center mb-1">
                <Lock className="h-5 w-5 text-primary mr-2" />
                <span className="text-white font-medium text-base">AI Training</span>
              </div>
              <span className="text-gray-400 text-xs">Isolated & Encrypted</span>
            </motion.div>
            
            {/* Amazon Bedrock box - attached below */}
            <motion.div
              variants={vaultVariants}
              custom={1}
            >
              <AmazonBedrockBox />
            </motion.div>
          </div>

          {/* Flow line from AI Training to Private AI Instance */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-primary to-green-500 flow-line my-2"
          />

          {/* Private AI Instance with Amazon box */}
          <div className="w-64 flex flex-col mb-3">
            <motion.div
              variants={vaultVariants}
              className="bg-gray-800 py-2.5 px-4 rounded-t-lg border border-b-0 border-green-500/50 w-full flex flex-col items-center"
            >
              <div className="flex items-center mb-1">
                <Shield className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-white font-medium text-base">Private AI Instance</span>
              </div>
              <span className="text-gray-400 text-xs">Secure & Isolated</span>
            </motion.div>
            
            {/* Amazon Bedrock box - attached below */}
            <motion.div
              variants={vaultVariants}
              custom={1}
            >
              <AmazonBedrockBox />
            </motion.div>
          </div>

          {/* Flow line from Private AI Instance to deployment platforms */}
          <motion.div
            variants={flowLineVariants}
            className="w-[2px] bg-gradient-to-b from-green-500 to-gray-400 flow-line my-2"
          />

          <motion.div
            variants={platformVariants}
            className="text-white text-base font-medium mb-3"
          >
            Akii plug-and-play apps & integrations
          </motion.div>

          <div className="flex justify-center flex-wrap gap-x-5 gap-y-2 max-w-lg mt-0">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                variants={platformVariants}
                custom={index}
                className="flex flex-col items-center"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-800 flex items-center justify-center mb-1">
                  {platform.icon}
                </div>
                <span className="text-gray-400 text-[9px]">{platform.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataFlowAnimation; 