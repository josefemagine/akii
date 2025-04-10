import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, Activity, TrendingUp } from "lucide-react";

interface UsageStatisticsProps {
  dailyMessages?: number[];
  dailyUsers?: number[];
  dailySessions?: number[];
  growthRate?: number;
  period?: string;
}

const UsageStatistics = ({
  dailyMessages = [120, 230, 310, 290, 350, 420, 480],
  dailyUsers = [45, 52, 68, 74, 83, 90, 95],
  dailySessions = [78, 132, 190, 230, 260, 310, 350],
  growthRate = 23.5,
  period = "Last 7 days",
}: UsageStatisticsProps) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            Usage Statistics
          </CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Daily Messages</span>
              </div>
              <span className="text-sm font-medium">
                {dailyMessages[dailyMessages.length - 1].toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${(dailyMessages[dailyMessages.length - 1] / 500) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Active Users</span>
              </div>
              <span className="text-sm font-medium">
                {dailyUsers[dailyUsers.length - 1].toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(dailyUsers[dailyUsers.length - 1] / 100) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Total Sessions</span>
              </div>
              <span className="text-sm font-medium">
                {dailySessions[dailySessions.length - 1].toLocaleString()}
              </span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{
                  width: `${(dailySessions[dailySessions.length - 1] / 400) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Growth Rate</span>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">{growthRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStatistics;
