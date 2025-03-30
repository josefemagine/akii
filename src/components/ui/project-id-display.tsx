import React from "react";
import { Badge } from "./badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Copy } from "lucide-react";
import { Button } from "./button";
import { useToast } from "./use-toast";

interface ProjectIdDisplayProps {
  projectId?: string;
  className?: string;
}

export function ProjectIdDisplay({
  projectId = "injxxchotrvgvvzelhvj",
  className,
}: ProjectIdDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(projectId);
    toast({
      title: "Project ID copied",
      description: "Project ID has been copied to clipboard",
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className="px-2 py-1 text-xs bg-muted/50">
        Project ID: {projectId}
      </Badge>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyToClipboard}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy project ID</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
