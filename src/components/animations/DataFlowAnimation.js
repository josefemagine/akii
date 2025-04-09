var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Database, Lock, Shield, Zap, Monitor, Smartphone, Globe, ShoppingBag, MessageCircle, Send, Code, ShoppingCart, Cloud, Upload, } from "lucide-react";
const DataFlowAnimation = () => {
    const containerRef = useRef(null);
    const controls = useAnimation();
    // Data source icons
    const dataSources = [
        {
            icon: (_jsx("div", { className: "flex items-center justify-center text-blue-400", children: _jsxs("svg", { width: "22", height: "20", viewBox: "0 0 18 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M5.82353 1.76471L2.47059 8.47059H8.47059L11.8235 1.76471H5.82353Z", fill: "#4285F4" }), _jsx("path", { d: "M12.1765 1.76471L8.82353 8.47059H14.8235L18.1765 1.76471H12.1765Z", fill: "#1FBCFD" }), _jsx("path", { d: "M0 10.5882L3.35294 3.88235L6.70588 10.5882L3.35294 17.2941L0 10.5882Z", fill: "#27A85F" }), _jsx("path", { d: "M6.70588 10.5882L10.0588 3.88235L13.4118 10.5882L10.0588 17.2941L6.70588 10.5882Z", fill: "#FFCD40" })] }) })),
            label: "Google Drive"
        },
        { icon: _jsx(Upload, { className: "text-blue-400", size: 20 }), label: "File Upload" },
        { icon: _jsx(Database, { className: "text-purple-400", size: 20 }), label: "CRM Data" },
        { icon: _jsx(Zap, { className: "text-yellow-400", size: 20 }), label: "Zapier" },
        { icon: _jsx(ShoppingCart, { className: "text-green-400", size: 20 }), label: "Ecommerce" },
    ];
    // Deployment platform icons
    const platforms = [
        { icon: _jsx(Monitor, { className: "text-gray-100", size: 20 }), label: "Website" },
        { icon: _jsx(Smartphone, { className: "text-gray-100", size: 20 }), label: "Mobile" },
        { icon: _jsx(MessageCircle, { className: "text-gray-100", size: 20 }), label: "WhatsApp" },
        { icon: _jsx(Send, { className: "text-gray-100", size: 20 }), label: "Telegram" },
        { icon: _jsx(ShoppingBag, { className: "text-gray-100", size: 20 }), label: "Shopify" },
        { icon: _jsx(Globe, { className: "text-gray-100", size: 20 }), label: "WordPress" },
        { icon: _jsx(Code, { className: "text-gray-100", size: 20 }), label: "API" },
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
    const AmazonBedrockBox = ({ className = "" }) => (_jsxs("div", { className: `flex items-center justify-center bg-[#FF9900]/20 rounded-b-lg border-t-0 border border-[#FF9900] px-2 py-1 w-full text-white text-xs font-medium ${className}`, children: [_jsx(Cloud, { className: "h-3.5 w-3.5 mr-1.5 text-white" }), "Powered by Amazon Bedrock"] }));
    // Run the animation once
    useEffect(() => {
        const startAnimation = () => __awaiter(void 0, void 0, void 0, function* () {
            yield controls.start("animate");
        });
        startAnimation();
    }, [controls]);
    return (_jsxs(motion.div, { ref: containerRef, className: "w-full h-full rounded-lg overflow-hidden relative data-flow-animation", initial: "initial", animate: controls, variants: containerVariants, style: { height: "100%", width: "100%", minHeight: "550px" }, children: [_jsx("div", { className: "absolute inset-0 bg-grid-pattern opacity-10" }), _jsx(motion.div, { className: "absolute inset-0", animate: {
                    background: [
                        "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, rgba(0, 0, 0, 0) 70%)",
                        "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
                        "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, rgba(0, 0, 0, 0) 70%)"
                    ]
                }, transition: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                } }), _jsx("div", { className: "relative w-full h-full p-4 flex flex-col justify-between min-h-[490px] pt-2", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(motion.div, { variants: dataSourceVariants, className: "text-white text-base font-medium mb-3", children: "Upload training data from 8000+ sources" }), _jsx("div", { className: "flex justify-center space-x-5 mb-3", children: dataSources.map((source, index) => (_jsxs(motion.div, { variants: dataSourceVariants, custom: index, className: "flex flex-col items-center", children: [_jsx("div", { className: "h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gray-800 flex items-center justify-center mb-1", children: source.icon }), _jsx("span", { className: "text-gray-400 text-[11px]", children: source.label })] }, index))) }), _jsx(motion.div, { variants: flowLineVariants, className: "w-[2px] bg-gradient-to-b from-blue-500 to-primary flow-line my-2" }), _jsxs("div", { className: "w-64 flex flex-col mb-3", children: [_jsxs(motion.div, { variants: vaultVariants, className: "bg-gray-800 py-2.5 px-4 rounded-t-lg border border-b-0 border-primary/50 w-full flex flex-col items-center", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx(Lock, { className: "h-5 w-5 text-primary mr-2" }), _jsx("span", { className: "text-white font-medium text-base", children: "AI Training" })] }), _jsx("span", { className: "text-gray-400 text-xs", children: "Isolated & Encrypted" })] }), _jsx(motion.div, { variants: vaultVariants, custom: 1, children: _jsx(AmazonBedrockBox, {}) })] }), _jsx(motion.div, { variants: flowLineVariants, className: "w-[2px] bg-gradient-to-b from-primary to-green-500 flow-line my-2" }), _jsxs("div", { className: "w-64 flex flex-col mb-3", children: [_jsxs(motion.div, { variants: vaultVariants, className: "bg-gray-800 py-2.5 px-4 rounded-t-lg border border-b-0 border-green-500/50 w-full flex flex-col items-center", children: [_jsxs("div", { className: "flex items-center mb-1", children: [_jsx(Shield, { className: "h-5 w-5 text-green-500 mr-2" }), _jsx("span", { className: "text-white font-medium text-base", children: "Private AI Instance" })] }), _jsx("span", { className: "text-gray-400 text-xs", children: "Secure & Isolated" })] }), _jsx(motion.div, { variants: vaultVariants, custom: 1, children: _jsx(AmazonBedrockBox, {}) })] }), _jsx(motion.div, { variants: flowLineVariants, className: "w-[2px] bg-gradient-to-b from-green-500 to-gray-400 flow-line my-2" }), _jsx(motion.div, { variants: platformVariants, className: "text-white text-base font-medium mb-3", children: "Akii plug-and-play apps & integrations" }), _jsx("div", { className: "flex justify-center flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 max-w-lg mt-0", children: platforms.map((platform, index) => (_jsxs(motion.div, { variants: platformVariants, custom: index, className: "flex flex-col items-center", children: [_jsx("div", { className: "h-9 w-9 sm:h-11 sm:w-11 rounded-lg bg-gray-800 flex items-center justify-center mb-1", children: platform.icon }), _jsx("span", { className: "text-gray-400 text-[9px] sm:text-[11px]", children: platform.label })] }, index))) })] }) })] }));
};
export default DataFlowAnimation;
