import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Shield, AlertCircle, CheckCircle, Filter } from "lucide-react";

interface ContentModerationProps {
  totalModerated?: number;
  flaggedContent?: number;
  approvalRate?: number;
  moderationRules?: number;
  period?: string;
}

const ContentModeration = ({
  totalModerated = 5280,
  flaggedContent = 124,
  approvalRate = 97.6,
  moderationRules = 18,
  period = "Last 30 days",
}: ContentModerationProps) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Content Moderation
          </CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Moderated</p>
                <p className="text-xs text-muted-foreground">
                  Content pieces reviewed
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">
              {totalModerated.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Flagged Content</p>
                <p className="text-xs text-muted-foreground">
                  Potentially harmful content
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{flaggedContent}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Approval Rate</p>
                <p className="text-xs text-muted-foreground">
                  Content passing moderation
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{approvalRate}%</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Active Rules</p>
                <p className="text-xs text-muted-foreground">
                  Moderation rules in place
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{moderationRules}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentModeration;
