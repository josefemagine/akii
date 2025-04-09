import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAnalyticsData, defaultAnalyticsData } from "@/lib/api";
import type { AnalyticsData } from "@/lib/api";
import { dashboardStyles, DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { supabase } from "@/lib/supabase";

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

// Custom hook for personalized greeting
const usePersonalizedGreeting = () => {
  const { profile, user } = useAuth();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  
  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Get name from profile or user email
  const name = useMemo(() => {
    // First try to get name from profile
    if (profile?.first_name) {
      return profile.first_name;
    }
    
    // Then try to get from email
    if (profile?.email || user?.email) {
      const email = profile?.email || user?.email || '';
      // Extract username part before the @ symbol
      return email.split('@')[0];
    }
    
    // Default fallback
    return "there";
  }, [profile, user]);
  
  return `${greeting}, ${name}!`;
};

// Stats card component
const StatCard = ({ 
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
);

// Dashboard content component
const DashboardContent = ({ analyticsData }: { analyticsData: AnalyticsData }) => {
  const personalizedGreeting = usePersonalizedGreeting();
  const data = analyticsData || defaultAnalyticsData;
  
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
            value={(data.totalMessages || 0).toLocaleString()} 
            subtitle="+12% from last period" 
          />
          <StatCard 
            title="Active Agents" 
            value={data.activeAgents || 0} 
            subtitle={(data.activeAgents || 0) > 0 ? "All running smoothly" : "No active agents"} 
          />
          <StatCard 
            title="Conversations" 
            value={(data.totalConversations || 0).toLocaleString()} 
            subtitle="+5% from last period" 
          />
          <StatCard 
            title="Average Rating" 
            value={(data.averageRating || 0).toLocaleString(undefined, {maximumFractionDigits: 1})} 
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
};

// Loading state component
const LoadingState = () => (
  <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      <p>Loading dashboard data...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard error boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <DashboardPageContainer>
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Dashboard Error</h2>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              Something went wrong loading the dashboard. Please try refreshing the page.
            </p>
            <pre className="mt-4 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-xs">
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded-md text-sm text-red-800 dark:text-red-200"
            >
              Refresh Page
            </button>
          </div>
        </DashboardPageContainer>
      );
    }

    return this.props.children;
  }
}

// Main Dashboard component with proper authentication handling
const Dashboard = () => {
  console.log("[Dashboard] Component rendering start");
  
  // Get auth state
  const { user, profile, isLoading: authLoading } = useAuth();
  console.log("[Dashboard] Auth state:", { 
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading
  });
  
  // Data state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data fetching with resilient error handling
  useEffect(() => {
    console.log("[Dashboard] Starting data fetch effect");
    let isMounted = true;
    
    // Start fetching data immediately
    console.log("[Dashboard] Fetching analytics data");
    
    fetchAnalyticsData("Last 7 days")
      .then((data) => {
        if (!isMounted) return;
        console.log("[Dashboard] Data received successfully");
        setAnalyticsData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("[Dashboard] Error fetching data:", err);
        // Use fallback data on error
        setAnalyticsData(defaultAnalyticsData);
        setError("Could not load analytics data. Using default values.");
        setIsLoading(false);
      });
    
    // Set a safety timeout to ensure we always exit loading state
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("[Dashboard] Safety timeout triggered, ensuring dashboard loads");
        setAnalyticsData(prev => prev || defaultAnalyticsData);
        setIsLoading(false);
      }
    }, 3000);
    
    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isLoading]);
  
  console.log("[Dashboard] Rendering with state:", {
    isLoading,
    hasError: !!error,
    hasData: !!analyticsData
  });

  // Show loading state or content
  return (
    <ErrorBoundary>
      <DashboardPageContainer>
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {error && (
              <div className="mb-4">
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                  <CardHeader className="pb-2">
                    <CardTitle>Notice</CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                      {error}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}
            
            <DashboardContent analyticsData={analyticsData || defaultAnalyticsData} />
          </>
        )}
      </DashboardPageContainer>
    </ErrorBoundary>
  );
};

export default Dashboard;
