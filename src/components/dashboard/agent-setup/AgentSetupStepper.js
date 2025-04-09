import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
const AgentSetupStepper = ({ steps = [
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
], currentStep = 0, onStepChange = () => { }, }) => {
    var _a, _b;
    const [activeStep, setActiveStep] = useState(currentStep);
    const handleStepClick = (index) => {
        setActiveStep(index);
        onStepChange(index);
    };
    return (_jsx("div", { className: "w-full bg-background border rounded-lg p-4 mb-8", children: _jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsx("div", { className: "flex flex-wrap items-center gap-2 w-full", children: steps.map((step, index) => (_jsxs(React.Fragment, { children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Button, { onClick: () => handleStepClick(index), variant: index === activeStep
                                            ? "default"
                                            : index < activeStep
                                                ? "outline"
                                                : "ghost", className: cn("rounded-full h-10 w-10 p-0 flex items-center justify-center", index === activeStep
                                            ? "bg-primary text-primary-foreground"
                                            : "", index < activeStep ? "text-primary border-primary" : ""), children: index < activeStep ? (_jsx(Check, { className: "h-5 w-5" })) : (_jsx("span", { children: index + 1 })) }), _jsx("span", { className: cn("ml-2 hidden md:inline-block font-medium", index === activeStep
                                            ? "text-primary"
                                            : "text-muted-foreground"), children: step.label }), index < steps.length - 1 && (_jsx("div", { className: "hidden md:block mx-2", children: _jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" }) }))] }), index < steps.length - 1 && (_jsx("div", { className: "md:hidden w-8 h-[1px] bg-border mx-1" }))] }, step.id))) }), _jsxs("div", { className: "w-full md:w-auto", children: [_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Step ", activeStep + 1, ": ", (_a = steps[activeStep]) === null || _a === void 0 ? void 0 : _a.label] }), ((_b = steps[activeStep]) === null || _b === void 0 ? void 0 : _b.description) && (_jsx("p", { className: "text-xs text-muted-foreground mt-1", children: steps[activeStep].description }))] })] }) }));
};
export default AgentSetupStepper;
