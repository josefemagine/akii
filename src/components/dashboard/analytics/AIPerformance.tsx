import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Brain, Clock, ThumbsUp, AlertTriangle } from "lucide-react";

interface AIPerformanceProps {
  averageResponseTime?: number;
  satisfactionRate?: number;
  totalRequests?: number;
  errorRate?: number;
  period?: string;
}

const AIPerformance = ({
  averageResponseTime = 1.2,
  satisfactionRate = 92,
  totalRequests = 8750,
  errorRate = 0.8,
  period = "Last 30 days",
}: AIPerformanceProps) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">AI Performance</CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Total Requests</p>
                <p className="text-xs text-muted-foreground">
                  AI interactions processed
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">
              {totalRequests.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Avg. Response Time</p>
                <p className="text-xs text-muted-foreground">
                  Time to generate response
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{averageResponseTime}s</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Satisfaction Rate</p>
                <p className="text-xs text-muted-foreground">
                  Based on user feedback
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{satisfactionRate}%</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Error Rate</p>
                <p className="text-xs text-muted-foreground">
                  Failed responses
                </p>
              </div>
            </div>
            <p className="text-xl font-bold">{errorRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPerformance;
