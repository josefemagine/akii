import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { fetchAnalyticsData, defaultAnalyticsData } from "@/lib/api";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { useAuth } from "@/contexts/UnifiedAuthContext";
// Helper function to get time-appropriate greeting
const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return "Good morning";
    }
    else if (hour >= 12 && hour < 18) {
        return "Good afternoon";
    }
    else {
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
        if (profile === null || profile === void 0 ? void 0 : profile.first_name) {
            return profile.first_name;
        }
        // Then try to get from email
        if ((profile === null || profile === void 0 ? void 0 : profile.email) || (user === null || user === void 0 ? void 0 : user.email)) {
            const email = (profile === null || profile === void 0 ? void 0 : profile.email) || (user === null || user === void 0 ? void 0 : user.email) || '';
            // Extract username part before the @ symbol
            return email.split('@')[0];
        }
        // Default fallback
        return "there";
    }, [profile, user]);
    return `${greeting}, ${name}!`;
};
// Stats card component
const StatCard = ({ title, value, subtitle }) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: title }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: value }), _jsx("p", { className: "text-xs text-muted-foreground", children: subtitle })] })] }));
// Dashboard content component
const DashboardContent = ({ analyticsData }) => {
    const personalizedGreeting = usePersonalizedGreeting();
    const data = analyticsData || defaultAnalyticsData;
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: personalizedGreeting, description: "Overview of your private AI Instances and performance", children: _jsxs("select", { className: "p-2 border rounded-md bg-background", defaultValue: "Last 7 days", children: [_jsx("option", { children: "Last 7 days" }), _jsx("option", { children: "Last 30 days" }), _jsx("option", { children: "Last 90 days" })] }) }), _jsx(DashboardSection, { children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [_jsx(StatCard, { title: "Total Messages", value: (data.totalMessages || 0).toLocaleString(), subtitle: "+12% from last period" }), _jsx(StatCard, { title: "Active Agents", value: data.activeAgents || 0, subtitle: (data.activeAgents || 0) > 0 ? "All running smoothly" : "No active agents" }), _jsx(StatCard, { title: "Conversations", value: (data.totalConversations || 0).toLocaleString(), subtitle: "+5% from last period" }), _jsx(StatCard, { title: "Average Rating", value: (data.averageRating || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }), subtitle: "Based on user feedback" })] }) }), _jsx(DashboardSection, { children: _jsxs(Card, { className: "mb-8", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Access" }), _jsx(CardDescription, { children: "Access your most important resources" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 border rounded-lg flex flex-col items-center justify-center text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mb-2", children: _jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }) }), _jsx("h3", { className: "font-medium", children: "AI Agents" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your AI assistants" })] }), _jsxs("div", { className: "p-4 border rounded-lg flex flex-col items-center justify-center text-center", children: [_jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mb-2", children: _jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }), _jsx("h3", { className: "font-medium", children: "Conversations" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "View chat history" })] }), _jsxs("div", { className: "p-4 border rounded-lg flex flex-col items-center justify-center text-center", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mb-2", children: [_jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }), _jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }), _jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })] }), _jsx("h3", { className: "font-medium", children: "Analytics" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Performance metrics" })] })] }) })] }) }), _jsx(DashboardSection, { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Activity" }), _jsx(CardDescription, { children: "Latest events from your agents" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0", children: [_jsx("div", { className: "rounded-full bg-primary/10 p-2", children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "New conversation started" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Customer Support AI handled 15 messages" }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [i * 2, " hours ago"] })] })] }, i))) }) })] }) })] }));
};
// Loading state component
const LoadingState = () => (_jsx("div", { className: "flex items-center justify-center h-[calc(100vh-16rem)]", children: _jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx("div", { className: "animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full" }), _jsx("p", { children: "Loading dashboard data..." })] }) }));
// Error boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Dashboard error boundary caught error:", error, errorInfo);
    }
    render() {
        var _a;
        if (this.state.hasError) {
            return (_jsx(DashboardPageContainer, { children: _jsxs("div", { className: "p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold text-red-800 dark:text-red-300", children: "Dashboard Error" }), _jsx("p", { className: "mt-2 text-sm text-red-700 dark:text-red-300", children: "Something went wrong loading the dashboard. Please try refreshing the page." }), _jsx("pre", { className: "mt-4 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto text-xs", children: (_a = this.state.error) === null || _a === void 0 ? void 0 : _a.toString() }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded-md text-sm text-red-800 dark:text-red-200", children: "Refresh Page" })] }) }));
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
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // Data fetching with resilient error handling
    useEffect(() => {
        console.log("[Dashboard] Starting data fetch effect");
        let isMounted = true;
        // Start fetching data immediately
        console.log("[Dashboard] Fetching analytics data");
        fetchAnalyticsData("Last 7 days")
            .then((data) => {
            if (!isMounted)
                return;
            console.log("[Dashboard] Data received successfully");
            setAnalyticsData(data);
            setIsLoading(false);
        })
            .catch((err) => {
            if (!isMounted)
                return;
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
    return (_jsx(ErrorBoundary, { children: _jsx(DashboardPageContainer, { children: isLoading ? (_jsx(LoadingState, {})) : (_jsxs(_Fragment, { children: [error && (_jsx("div", { className: "mb-4", children: _jsx(Card, { className: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20", children: _jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { children: "Notice" }), _jsx(CardDescription, { className: "text-orange-700 dark:text-orange-300", children: error })] }) }) })), _jsx(DashboardContent, { analyticsData: analyticsData || defaultAnalyticsData })] })) }) }));
};
export default Dashboard;
