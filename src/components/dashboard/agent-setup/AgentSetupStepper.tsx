import React, { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface AgentSetupStepperProps {
  steps?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
}

const AgentSetupStepper = ({
  steps = [
    {
      id: "create",
      label: "Create Agent",
      description: "Set up basic agent information",
    },
    {
      id: "configure",
      label: "Configure Settings",
      description: "Customize agent behavior",
    },
    {
      id: "training",
      label: "Select Training Data",
      description: "Add knowledge to your agent",
    },
    {
      id: "platforms",
      label: "Choose Platforms",
      description: "Select integration channels",
    },
    {
      id: "test",
      label: "Test Agent",
      description: "Verify agent performance",
    },
    { id: "deploy", label: "Deploy", description: "Make your agent live" },
  ],
  currentStep = 0,
  onStepChange = () => {},
}: AgentSetupStepperProps) => {
  const [activeStep, setActiveStep] = useState(currentStep);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    onStepChange(index);
  };

  return (
    <div className="w-full bg-background border rounded-lg p-4 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <Button
                  onClick={() => handleStepClick(index)}
                  variant={
                    index === activeStep
                      ? "default"
                      : index < activeStep
                        ? "outline"
                        : "ghost"
                  }
                  className={cn(
                    "rounded-full h-10 w-10 p-0 flex items-center justify-center",
                    index === activeStep
                      ? "bg-primary text-primary-foreground"
                      : "",
                    index < activeStep ? "text-primary border-primary" : "",
                  )}
                >
                  {index < activeStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </Button>
                <span
                  className={cn(
                    "ml-2 hidden md:inline-block font-medium",
                    index === activeStep
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="hidden md:block mx-2">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="md:hidden w-8 h-[1px] bg-border mx-1"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="w-full md:w-auto">
          <p className="text-sm text-muted-foreground">
            Step {activeStep + 1}: {steps[activeStep]?.label}
          </p>
          {steps[activeStep]?.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {steps[activeStep].description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentSetupStepper;
