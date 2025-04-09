import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AgentSetupStepper from "@/components/dashboard/agent-setup/AgentSetupStepper";
import AgentBasicInfo from "@/components/dashboard/agent-setup/AgentBasicInfo";
import AgentConfigSettings from "@/components/dashboard/agent-setup/AgentConfigSettings";
import TrainingDataSelector from "@/components/dashboard/agent-setup/TrainingDataSelector";
import PlatformSelector from "@/components/dashboard/agent-setup/PlatformSelector";
import AgentTester from "@/components/dashboard/agent-setup/AgentTester";
import DeploymentOptions from "@/components/dashboard/agent-setup/DeploymentOptions";
const AgentSetup = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [agentData, setAgentData] = useState({
        basicInfo: {
            name: "",
            description: "",
            purpose: "",
        },
        configSettings: {},
        trainingData: [],
        platforms: [],
        testResults: {
            conversations: [],
            feedback: [],
        },
    });
    const handleStepChange = (stepIndex) => {
        setCurrentStep(stepIndex);
    };
    const handleBasicInfoSubmit = (values) => {
        setAgentData((prev) => (Object.assign(Object.assign({}, prev), { basicInfo: values })));
        setCurrentStep(1);
    };
    const handleConfigSettingsChange = (settings) => {
        setAgentData((prev) => (Object.assign(Object.assign({}, prev), { configSettings: settings })));
    };
    const handleTrainingDataSelected = (data) => {
        setAgentData((prev) => (Object.assign(Object.assign({}, prev), { trainingData: data })));
        setCurrentStep(3);
    };
    const handlePlatformToggle = (platformId, enabled) => {
        setAgentData((prev) => {
            const platforms = prev.platforms || [];
            if (enabled && !platforms.includes(platformId)) {
                return Object.assign(Object.assign({}, prev), { platforms: [...platforms, platformId] });
            }
            else if (!enabled && platforms.includes(platformId)) {
                return Object.assign(Object.assign({}, prev), { platforms: platforms.filter((id) => id !== platformId) });
            }
            return prev;
        });
    };
    const handleTestFeedback = (messageId, isPositive) => {
        setAgentData((prev) => {
            var _a;
            return (Object.assign(Object.assign({}, prev), { testResults: Object.assign(Object.assign({}, prev.testResults), { feedback: [
                        ...(((_a = prev.testResults) === null || _a === void 0 ? void 0 : _a.feedback) || []),
                        { messageId, isPositive, timestamp: new Date() },
                    ] }) }));
        });
    };
    const handleCompleteSetup = () => {
        // In a real implementation, this would save the agent to the database
        // and redirect to the agent management page
        console.log("Agent setup completed:", agentData);
        navigate("/dashboard");
    };
    const renderStepContent = () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        switch (currentStep) {
            case 0:
                return (_jsx(AgentBasicInfo, { onSubmit: handleBasicInfoSubmit, initialData: agentData.basicInfo }));
            case 1:
                return (_jsx(AgentConfigSettings, { onSettingsChange: handleConfigSettingsChange }));
            case 2:
                return (_jsx(TrainingDataSelector, { onDataSelected: handleTrainingDataSelected, existingData: agentData.trainingData }));
            case 3:
                return (_jsx(PlatformSelector, { onPlatformToggle: handlePlatformToggle, platforms: [
                        {
                            id: "api",
                            name: "Private AI API",
                            description: "Deploy your AI as a private API for custom integrations and applications.",
                            icon: _jsx("div", { className: "h-8 w-8 text-purple-500", children: "\uD83D\uDD0C" }),
                            enabled: ((_a = agentData.platforms) === null || _a === void 0 ? void 0 : _a.includes("api")) || true,
                        },
                        {
                            id: "website",
                            name: "Website",
                            description: "Embed your AI agent on your website for instant customer support.",
                            icon: _jsx("div", { className: "h-8 w-8 text-blue-500", children: "\uD83C\uDF10" }),
                            enabled: ((_b = agentData.platforms) === null || _b === void 0 ? void 0 : _b.includes("website")) || false,
                        },
                        {
                            id: "mobile",
                            name: "Mobile App",
                            description: "Integrate your AI agent into your iOS and Android applications.",
                            icon: _jsx("div", { className: "h-8 w-8 text-green-500", children: "\uD83D\uDCF1" }),
                            enabled: ((_c = agentData.platforms) === null || _c === void 0 ? void 0 : _c.includes("mobile")) || false,
                        },
                        {
                            id: "whatsapp",
                            name: "WhatsApp",
                            description: "Connect your AI agent to WhatsApp for messaging support.",
                            icon: _jsx("div", { className: "h-8 w-8 text-emerald-500", children: "\uD83D\uDCAC" }),
                            enabled: ((_d = agentData.platforms) === null || _d === void 0 ? void 0 : _d.includes("whatsapp")) || false,
                        },
                        {
                            id: "telegram",
                            name: "Telegram",
                            description: "Deploy your AI agent as a Telegram bot for your customers.",
                            icon: _jsx("div", { className: "h-8 w-8 text-blue-400", children: "\uD83D\uDCE8" }),
                            enabled: ((_e = agentData.platforms) === null || _e === void 0 ? void 0 : _e.includes("telegram")) || false,
                        },
                        {
                            id: "shopify",
                            name: "Shopify",
                            description: "Add your AI agent to your Shopify store for sales assistance.",
                            icon: _jsx("div", { className: "h-8 w-8 text-purple-500", children: "\uD83D\uDECD\uFE0F" }),
                            enabled: ((_f = agentData.platforms) === null || _f === void 0 ? void 0 : _f.includes("shopify")) || false,
                        },
                        {
                            id: "wordpress",
                            name: "WordPress",
                            description: "Install your AI agent on your WordPress site with our plugin.",
                            icon: _jsx("div", { className: "h-8 w-8 text-orange-500", children: "\uD83D\uDCDD" }),
                            enabled: ((_g = agentData.platforms) === null || _g === void 0 ? void 0 : _g.includes("wordpress")) || false,
                        },
                    ] }));
            case 4:
                return (_jsx(AgentTester, { agentName: ((_h = agentData.basicInfo) === null || _h === void 0 ? void 0 : _h.name) || "AI Assistant", agentAvatar: ((_j = agentData.basicInfo) === null || _j === void 0 ? void 0 : _j.avatarUrl) || "", onFeedback: handleTestFeedback }));
            case 5:
                return (_jsx(DeploymentOptions, { agentId: "agent-123", agentName: ((_k = agentData.basicInfo) === null || _k === void 0 ? void 0 : _k.name) || "AI Assistant", platforms: ((_l = agentData.platforms) === null || _l === void 0 ? void 0 : _l.map((id) => id.charAt(0).toUpperCase() + id.slice(1))) || [] }));
            default:
                return _jsx("div", { children: "Unknown step" });
        }
    };
    const handleNextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
        else {
            handleCompleteSetup();
        }
    };
    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    return (_jsxs("div", { className: "container mx-auto py-8 px-4 bg-background min-h-screen", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Set Up Your AI Agent" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Follow the steps below to create, configure, and deploy your AI agent." })] }), _jsx(AgentSetupStepper, { currentStep: currentStep, onStepChange: handleStepChange }), _jsx("div", { className: "mb-8", children: renderStepContent() }), currentStep !== 0 && (_jsxs("div", { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", onClick: handlePreviousStep, children: "Previous Step" }), currentStep < 5 && (_jsx(Button, { onClick: handleNextStep, children: "Next Step" })), currentStep === 5 && (_jsx(Button, { onClick: handleCompleteSetup, children: "Complete Setup" }))] }))] }));
};
export default AgentSetup;
