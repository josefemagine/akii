import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Users, TrendingUp } from "lucide-react";

interface RevenueMetricsProps {
  totalRevenue?: number;
  monthlyRecurring?: number;
  activeSubscribers?: number;
  conversionRate?: number;
  period?: string;
}

const RevenueMetrics = ({
  totalRevenue = 12580,
  monthlyRecurring = 4350,
  activeSubscribers = 78,
  conversionRate = 3.2,
  period = "This month",
}: RevenueMetricsProps) => {
  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Revenue Metrics</CardTitle>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Total Revenue
              </span>
            </div>
            <p className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                Monthly Recurring
              </span>
            </div>
            <p className="text-2xl font-bold">
              ${monthlyRecurring.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">
                Active Subscribers
              </span>
            </div>
            <p className="text-2xl font-bold">{activeSubscribers}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Conversion Rate
              </span>
            </div>
            <p className="text-2xl font-bold">{conversionRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueMetrics;
