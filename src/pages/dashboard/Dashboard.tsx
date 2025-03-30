import React, { useState, useEffect } from "react";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import StatCards from "@/components/dashboard/StatCards";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AgentsList from "@/components/dashboard/AgentsList";
import AnalyticsOverview from "@/components/dashboard/analytics/AnalyticsOverview";
import UsageStatistics from "@/components/dashboard/analytics/UsageStatistics";
import RevenueMetrics from "@/components/dashboard/analytics/RevenueMetrics";
import AIPerformance from "@/components/dashboard/analytics/AIPerformance";
import ContentModeration from "@/components/dashboard/analytics/ContentModeration";
import TopAgentsPerformance from "@/components/dashboard/analytics/TopAgentsPerformance";
import MessagesChart from "@/components/dashboard/analytics/MessagesChart";
import TopAgentsTable from "@/components/dashboard/analytics/TopAgentsTable";
import { fetchAnalyticsData, AnalyticsData } from "@/lib/analytics";

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Last 7 days");
  const [chartPeriod, setChartPeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchAnalyticsData(timePeriod);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timePeriod]);

  // Prepare default values for analytics data to avoid conditional rendering issues
  const totalMessages = analyticsData?.totalMessages || 0;
  const activeAgents = analyticsData?.activeAgents || 0;
  const totalConversations = analyticsData?.totalConversations || 0;
  const averageRating = analyticsData?.averageRating || 0;
  const dailyMessages = analyticsData?.dailyMessages;
  const dailyUsers = analyticsData?.dailyUsers;
  const dailySessions = analyticsData?.dailySessions;
  const growthRate = analyticsData?.growthRate;
  const totalRevenue = analyticsData?.totalRevenue;
  const monthlyRecurring = analyticsData?.monthlyRecurring;
  const activeSubscribers = analyticsData?.activeSubscribers;
  const conversionRate = analyticsData?.conversionRate;
  const averageResponseTime = analyticsData?.averageResponseTime;
  const satisfactionRate = analyticsData?.satisfactionRate;
  const totalRequests = analyticsData?.totalRequests;
  const errorRate = analyticsData?.errorRate;
  const totalModerated = analyticsData?.totalModerated;
  const flaggedContent = analyticsData?.flaggedContent;
  const approvalRate = analyticsData?.approvalRate;
  const moderationRules = analyticsData?.moderationRules;
  const messageData = analyticsData?.messageData;
  const topAgents = analyticsData?.topAgents;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>
          <select
            className="bg-background border rounded-md px-3 py-1.5 text-sm"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            disabled={loading}
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <AnalyticsOverview
            totalMessages={totalMessages}
            activeAgents={activeAgents}
            totalConversations={totalConversations}
            averageRating={averageRating}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UsageStatistics
              period={timePeriod}
              dailyMessages={dailyMessages}
              dailyUsers={dailyUsers}
              dailySessions={dailySessions}
              growthRate={growthRate}
            />
            <RevenueMetrics
              period={timePeriod}
              totalRevenue={totalRevenue}
              monthlyRecurring={monthlyRecurring}
              activeSubscribers={activeSubscribers}
              conversionRate={conversionRate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AIPerformance
              period={timePeriod}
              averageResponseTime={averageResponseTime}
              satisfactionRate={satisfactionRate}
              totalRequests={totalRequests}
              errorRate={errorRate}
            />
            <ContentModeration
              period={timePeriod}
              totalModerated={totalModerated}
              flaggedContent={flaggedContent}
              approvalRate={approvalRate}
              moderationRules={moderationRules}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MessagesChart
              data={messageData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
            <TopAgentsPerformance period={timePeriod} agents={topAgents} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <TopAgentsTable period={timePeriod} agents={topAgents} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <AgentsList />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
