import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Badge } from "./badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "./tooltip";
import { Copy } from "lucide-react";
import { Button } from "./button";
import { useToast } from "./use-toast";
export function ProjectIdDisplay({ projectId = "injxxchotrvgvvzelhvj", className, }) {
    const { toast } = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(projectId);
        toast({
            title: "Project ID copied",
            description: "Project ID has been copied to clipboard",
        });
    };
    return (_jsxs("div", { className: `flex items-center gap-2 ${className}`, children: [_jsxs(Badge, { variant: "outline", className: "px-2 py-1 text-xs bg-muted/50", children: ["Project ID: ", projectId] }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: copyToClipboard, children: _jsx(Copy, { className: "h-3 w-3" }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Copy project ID" }) })] }) })] }));
}
