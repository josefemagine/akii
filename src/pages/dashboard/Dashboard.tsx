import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAnalyticsData } from "@/lib/api";
import type { AnalyticsData } from "@/lib/api";

const Dashboard = () => {
  console.log("Dashboard component rendering");
  const [timePeriod, setTimePeriod] = useState("Last 7 days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log("Dashboard - Fetching analytics data");
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchAnalyticsData(timePeriod);
        console.log("Dashboard - Analytics data fetched:", data);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error loading analytics data:", error);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timePeriod]);

  // Show error state
  if (error) {
    console.log("Dashboard - Rendering error state with message:", error);
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>We're experiencing some technical difficulties. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    console.log("Dashboard - Rendering loading state");
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // If no data
  if (!analyticsData) {
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>No data available</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No analytics data is currently available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Dashboard - Rendering main content");
  
  try {
    const { totalMessages, activeAgents, totalConversations, averageRating } = analyticsData;
    
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your AI assistant performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="p-2 border rounded-md bg-background"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                {activeAgents > 0 ? "All running smoothly" : "No active agents"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5.0</div>
              <p className="text-xs text-muted-foreground">
                From {totalConversations} ratings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional content section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Access your most important resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h3 className="font-medium">AI Agents</h3>
                <p className="text-sm text-muted-foreground">Manage your AI assistants</p>
              </div>
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 className="font-medium">Conversations</h3>
                <p className="text-sm text-muted-foreground">View chat history</p>
              </div>
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-muted-foreground">Performance metrics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">New conversation started</p>
                    <p className="text-sm text-muted-foreground">Customer Support AI handled 15 messages</p>
                    <p className="text-xs text-muted-foreground mt-1">{i * 2} hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (renderError) {
    console.error("Dashboard - Fatal rendering error:", renderError);
    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-red-500">
              Failed to render dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>An unexpected error occurred while rendering the dashboard.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Error details: {renderError instanceof Error ? renderError.message : String(renderError)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default Dashboard;
