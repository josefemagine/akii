import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";

interface ChartData {
  date: string;
  messages: number;
}

interface MessagesChartProps {
  data?: ChartData[];
  period?: string;
  onPeriodChange?: (period: "daily" | "weekly" | "monthly") => void;
}

const MessagesChart = ({
  data = [
    { date: "Mon", messages: 320 },
    { date: "Tue", messages: 420 },
    { date: "Wed", messages: 380 },
    { date: "Thu", messages: 450 },
    { date: "Fri", messages: 520 },
    { date: "Sat", messages: 480 },
    { date: "Sun", messages: 550 },
  ],
  period = "daily",
  onPeriodChange = () => {},
}: MessagesChartProps) => {
  // Find the maximum value to scale the chart
  const maxValue = Math.max(...data.map((item) => item.messages), 10);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Message Volume</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded-md bg-muted p-1 text-xs font-medium">
            <button
              onClick={() => onPeriodChange("daily")}
              className={`rounded px-2.5 py-1.5 ${period === "daily" ? "bg-background shadow-sm" : ""}`}
            >
              Daily
            </button>
            <button
              onClick={() => onPeriodChange("weekly")}
              className={`rounded px-2.5 py-1.5 ${period === "weekly" ? "bg-background shadow-sm" : ""}`}
            >
              Weekly
            </button>
            <button
              onClick={() => onPeriodChange("monthly")}
              className={`rounded px-2.5 py-1.5 ${period === "monthly" ? "bg-background shadow-sm" : ""}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          ) : (
            <div className="flex h-full items-end space-x-2">
              {data.map((item, index) => {
                const height = (item.messages / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className="relative flex h-full flex-1 flex-col justify-end"
                  >
                    <div
                      className="bg-primary rounded-t w-full transition-all duration-300"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="mt-2 text-xs text-center truncate">
                      {item.date}
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-background border rounded px-2 py-1">
                      {item.messages} messages
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesChart;
