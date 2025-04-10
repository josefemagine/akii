import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AgentSetupStepper from "@/components/dashboard/agent-setup/AgentSetupStepper";
import AgentBasicInfo from "@/components/dashboard/agent-setup/AgentBasicInfo";
import AgentConfigSettings from "@/components/dashboard/agent-setup/AgentConfigSettings";
import TrainingDataSelector from "@/components/dashboard/agent-setup/TrainingDataSelector";
import PlatformSelector from "@/components/dashboard/agent-setup/PlatformSelector";
import AgentTester from "@/components/dashboard/agent-setup/AgentTester";
import DeploymentOptions from "@/components/dashboard/agent-setup/DeploymentOptions";

interface AgentData {
  basicInfo?: {
    name: string;
    description: string;
    purpose: string;
    avatarUrl?: string;
  };
  configSettings?: Record<string, any>;
  trainingData?: Array<any>;
  platforms?: Array<string>;
  testResults: {
    conversations: Array<any>;
    feedback: Array<any>;
  };
}

// Default empty test results
const DEFAULT_TEST_RESULTS = {
  conversations: [],
  feedback: []
};

const AgentSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [agentData, setAgentData] = useState<AgentData>({
    basicInfo: {
      name: "",
      description: "",
      purpose: "",
    },
    configSettings: {},
    trainingData: [],
    platforms: [],
    testResults: DEFAULT_TEST_RESULTS
  });

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleBasicInfoSubmit = (values: any) => {
    setAgentData((prev) => ({
      ...prev,
      basicInfo: values,
    }));
    setCurrentStep(1);
  };

  const handleConfigSettingsChange = (settings: any) => {
    setAgentData((prev) => ({
      ...prev,
      configSettings: settings,
    }));
  };

  const handleTrainingDataSelected = (data: any) => {
    setAgentData((prev) => ({
      ...prev,
      trainingData: data,
    }));
    setCurrentStep(3);
  };

  const handlePlatformToggle = (platformId: string, enabled: boolean) => {
    setAgentData((prev) => {
      const platforms = prev.platforms || [];
      if (enabled && !platforms.includes(platformId)) {
        return { ...prev, platforms: [...platforms, platformId] };
      } else if (!enabled && platforms.includes(platformId)) {
        return {
          ...prev,
          platforms: platforms.filter((id) => id !== platformId),
        };
      }
      return prev;
    });
  };

  const handleTestFeedback = (messageId: string, isPositive: boolean) => {
    setAgentData((prev) => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        feedback: [
          ...(prev.testResults?.feedback || []),
          { messageId, isPositive, timestamp: new Date() },
        ],
      },
    }));
  };

  const handleCompleteSetup = () => {
    // In a real implementation, this would save the agent to the database
    // and redirect to the agent management page
    console.log("Agent setup completed:", agentData);
    navigate("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <AgentBasicInfo
            onSubmit={handleBasicInfoSubmit}
            initialData={agentData.basicInfo}
          />
        );
      case 1:
        return (
          <AgentConfigSettings onSettingsChange={handleConfigSettingsChange} />
        );
      case 2:
        return (
          <TrainingDataSelector
            onDataSelected={handleTrainingDataSelected}
            existingData={agentData.trainingData}
          />
        );
      case 3:
        return (
          <PlatformSelector
            onPlatformToggle={handlePlatformToggle}
            platforms={[
              {
                id: "api",
                name: "Private AI API",
                description:
                  "Deploy your AI as a private API for custom integrations and applications.",
                icon: <div className="h-8 w-8 text-purple-500">🔌</div>,
                enabled: agentData.platforms?.includes("api") || true,
              },
              {
                id: "website",
                name: "Website",
                description:
                  "Embed your AI agent on your website for instant customer support.",
                icon: <div className="h-8 w-8 text-blue-500">🌐</div>,
                enabled: agentData.platforms?.includes("website") || false,
              },
              {
                id: "mobile",
                name: "Mobile App",
                description:
                  "Integrate your AI agent into your iOS and Android applications.",
                icon: <div className="h-8 w-8 text-green-500">📱</div>,
                enabled: agentData.platforms?.includes("mobile") || false,
              },
              {
                id: "whatsapp",
                name: "WhatsApp",
                description:
                  "Connect your AI agent to WhatsApp for messaging support.",
                icon: <div className="h-8 w-8 text-emerald-500">💬</div>,
                enabled: agentData.platforms?.includes("whatsapp") || false,
              },
              {
                id: "telegram",
                name: "Telegram",
                description:
                  "Deploy your AI agent as a Telegram bot for your customers.",
                icon: <div className="h-8 w-8 text-blue-400">📨</div>,
                enabled: agentData.platforms?.includes("telegram") || false,
              },
              {
                id: "shopify",
                name: "Shopify",
                description:
                  "Add your AI agent to your Shopify store for sales assistance.",
                icon: <div className="h-8 w-8 text-purple-500">🛍️</div>,
                enabled: agentData.platforms?.includes("shopify") || false,
              },
              {
                id: "wordpress",
                name: "WordPress",
                description:
                  "Install your AI agent on your WordPress site with our plugin.",
                icon: <div className="h-8 w-8 text-orange-500">📝</div>,
                enabled: agentData.platforms?.includes("wordpress") || false,
              },
            ]}
          />
        );
      case 4:
        return (
          <AgentTester
            agentName={agentData.basicInfo?.name || "AI Assistant"}
            agentAvatar={agentData.basicInfo?.avatarUrl || ""}
            onFeedback={handleTestFeedback}
          />
        );
      case 5:
        return (
          <DeploymentOptions
            agentId="agent-123"
            agentName={agentData.basicInfo?.name || "AI Assistant"}
            platforms={
              agentData.platforms?.map(
                (id) => id.charAt(0).toUpperCase() + id.slice(1),
              ) || []
            }
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteSetup();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Set Up Your AI Agent</h1>
        <p className="text-muted-foreground mt-2">
          Follow the steps below to create, configure, and deploy your AI agent.
        </p>
      </div>

      <AgentSetupStepper
        currentStep={currentStep}
        onStepChange={handleStepChange}
      />

      <div className="mb-8">{renderStepContent()}</div>

      {currentStep !== 0 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous Step
          </Button>
          {currentStep < 5 && (
            <Button onClick={handleNextStep}>Next Step</Button>
          )}
          {currentStep === 5 && (
            <Button onClick={handleCompleteSetup}>Complete Setup</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentSetup;
