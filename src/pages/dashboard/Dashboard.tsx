import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAnalyticsData } from "@/lib/api";
import type { AnalyticsData } from "@/lib/api";
import { dashboardStyles, DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { useAuth } from "@/contexts/auth-compatibility";
import { useDirectAuth } from "@/contexts/direct-auth-context";

// Helper function to get time-appropriate greeting
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

// Custom hook for time-based greeting that updates when time period changes
const useTimeBasedGreeting = () => {
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const previousGreetingRef = React.useRef(greeting);
  
  useEffect(() => {
    // Update greeting when appropriate
    const updateGreeting = () => {
      const newGreeting = getTimeBasedGreeting();
      if (newGreeting !== previousGreetingRef.current) {
        previousGreetingRef.current = newGreeting;
        setGreeting(newGreeting);
      }
    };
    
    // Check for greeting change every minute
    const intervalId = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once on mount
  
  return greeting;
};

// Custom hook to get user's first name
const useUserFirstName = () => {
  const { profile } = useDirectAuth();
  
  return useMemo(() => {
    if (profile?.first_name) return profile.first_name;
    if (profile?.name) {
      // Split name and return first part
      return profile.name.split(' ')[0];
    }
    return "there"; // Default if no name found
  }, [profile]);
};

// Combined hook for personalized greeting
const usePersonalizedGreeting = () => {
  const timeGreeting = useTimeBasedGreeting();
  const firstName = useUserFirstName();
  
  return `${timeGreeting}, ${firstName}!`;
};

// Memoized stats card to prevent re-rendering when parent re-renders
const StatCard = React.memo(({ 
  title, 
  value, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
));

// Memoized dashboard content to avoid re-renders when data doesn't change
const DashboardContent = React.memo(({ analyticsData }: { analyticsData: AnalyticsData }) => {
  // Use safe defaults for analytics data
  const totalMessages = analyticsData.totalMessages || 0;
  const activeAgents = analyticsData.activeAgents || 0;
  const totalConversations = analyticsData.totalConversations || 0;
  const averageRating = analyticsData.averageRating || 0;
  const { isAdmin } = useAuth();
  const personalizedGreeting = usePersonalizedGreeting();

  return (
    <div>
      <PageHeader
        title={personalizedGreeting}
        description="Overview of your private AI Instances and performance"
      >
        <select
          className="p-2 border rounded-md bg-background"
          defaultValue="Last 7 days"
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </PageHeader>

      {/* Stats Overview Cards */}
      <DashboardSection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Messages" 
            value={totalMessages.toLocaleString()} 
            subtitle="+12% from last period" 
          />
          <StatCard 
            title="Active Agents" 
            value={activeAgents} 
            subtitle={activeAgents > 0 ? "All running smoothly" : "No active agents"} 
          />
          <StatCard 
            title="Conversations" 
            value={totalConversations.toLocaleString()} 
            subtitle="+5% from last period" 
          />
          <StatCard 
            title="Average Rating" 
            value={averageRating.toLocaleString(undefined, {maximumFractionDigits: 1})} 
            subtitle="Based on user feedback" 
          />
        </div>
      </DashboardSection>

      {/* Additional content section */}
      <DashboardSection>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <h3 className="font-medium">AI Agents</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your AI assistants
                </p>
              </div>
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 className="font-medium">Conversations</h3>
                <p className="text-sm text-muted-foreground">View chat history</p>
              </div>
              <div className="p-4 border rounded-lg flex flex-col items-center justify-center text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Performance metrics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Recent Activity Card */}
      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">New conversation started</p>
                    <p className="text-sm text-muted-foreground">
                      Customer Support AI handled 15 messages
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {i * 2} hours ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DashboardSection>
    </div>
  );
});

// Error state component
const ErrorState = React.memo(({ error, analyticsData }: { error: string, analyticsData: AnalyticsData }) => {
  const personalizedGreeting = usePersonalizedGreeting();

  return (
    <div>
      <div className={dashboardStyles.sectionSpacing}>
        <Card>
          <CardHeader>
            <CardTitle>{personalizedGreeting}</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              We're experiencing some technical difficulties. Showing limited
              data.
            </p>
          </CardContent>
        </Card>
      </div>
      <DashboardContent analyticsData={analyticsData} />
    </div>
  );
});

// Loading state component
const LoadingState = React.memo(() => (
  <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      <p>Loading dashboard data...</p>
    </div>
  </div>
));

// Empty state component
const EmptyState = React.memo(() => {
  const personalizedGreeting = usePersonalizedGreeting();
  
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{personalizedGreeting}</CardTitle>
          <CardDescription>Overview of your private AI Instances and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p>No analytics data is currently available.</p>
        </CardContent>
      </Card>
    </div>
  );
});

// Main Dashboard component with optimized rendering
const Dashboard = () => {
  // Only log on initial render, not on re-renders
  const isFirstRender = React.useRef(true);
  if (isFirstRender.current) {
    console.log("Dashboard component initial render");
    isFirstRender.current = false;
  }
  
  const [timePeriod, setTimePeriod] = useState("Last 7 days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [renderAttempt, setRenderAttempt] = useState(0);
  const dataFetchedRef = React.useRef(false);

  // Default data for fallback
  const defaultData = useMemo(() => ({
    totalMessages: 0,
    activeAgents: 0,
    totalConversations: 0,
    averageRating: 0,
  }), []);

  // Handle data fetching logic
  const fetchData = useCallback(async () => {
    if (dataFetchedRef.current) return;
    
    console.log("Dashboard - Fetching analytics data for period:", timePeriod);
    setLoading(true);
    setError(null);
    dataFetchedRef.current = true;

    try {
      // Set default data immediately to ensure we have something to render
      setAnalyticsData(defaultData);

      const data = await fetchAnalyticsData(timePeriod);
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [timePeriod, defaultData]);

  // Add a safety timeout to ensure we always render something
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && renderAttempt < 2) {
        console.log("Dashboard - Safety timeout triggered, forcing data load");
        setRenderAttempt((prev) => prev + 1);
        setLoading(false);

        // Set default data if none exists
        if (!analyticsData) {
          setAnalyticsData(defaultData);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [loading, renderAttempt, analyticsData, defaultData]);

  // Fetch data once on mount or when time period changes
  useEffect(() => {
    let isMounted = true;
    dataFetchedRef.current = false;
    
    // Reset state when time period changes
    if (timePeriod) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [timePeriod, fetchData]);

  // Determine which component to render based on current state
  // Use conditional rendering instead of multiple returns for better performance
  const content = useMemo(() => {
    // Show error state but with data
    if (error && analyticsData) {
      return <ErrorState error={error} analyticsData={analyticsData} />;
    }
    
    // Show loading state
    if (loading && renderAttempt < 2) {
      return <LoadingState />;
    }
    
    // If no data after loading, show empty state
    if (!analyticsData) {
      return <EmptyState />;
    }
    
    // Show main content
    return <DashboardContent analyticsData={analyticsData} />;
  }, [error, analyticsData, loading, renderAttempt]);

  // Wrap all rendered content in the DashboardPageContainer for consistent width and styling
  return (
    <DashboardPageContainer>
      {content}
    </DashboardPageContainer>
  );
};

export default Dashboard;
