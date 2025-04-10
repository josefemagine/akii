import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  MessageSquare,
  CreditCard,
  Circle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Bell,
  Settings,
} from "lucide-react";
import { dashboardStyles } from "@/components/layout/DashboardPageContainer.tsx";
import { PageHeader } from "@/components/layout/PageHeader.tsx";
import { DashboardSection } from "@/components/layout/DashboardSection.tsx";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import withAdminInit from "@/components/admin/withAdminInit.tsx";
import { runDashboardHealthCheck, fixCommonDashboardIssues } from '@/lib/dashboard-health.ts';

// TODO: Remove this when admin dashboard issues are fixed
const DEBUG_ADMIN = true;

const DebugAdminDashboard: React.FC = () => {
  const { user, isLoading, isAdmin, profile, refreshAuthState } = useAuth();
  const [healthResults, setHealthResults] = useState<Record<string, any> | null>(null);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  
  const timestamp = () => new Date().toISOString();
  const renderTime = useRef(timestamp());
  
  useEffect(() => {
    console.log(`[DebugAdminDashboard] Rendered at ${renderTime.current}`);
    console.log(`[DebugAdminDashboard] Auth state:`, { 
      isLoading, 
      hasUser: !!user, 
      isAdmin,
      email: user?.email 
    });
  }, [isLoading, user, isAdmin]);

  const runHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    try {
      const results = await runDashboardHealthCheck();
      setHealthResults(results);
    } catch (error) {
      console.error("[DebugAdminDashboard] Health check error:", error);
      setHealthResults({ error: String(error) });
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  const applyFixes = () => {
    try {
      fixCommonDashboardIssues();
      setTimeout(() => {
        runHealthCheck();
        if (refreshAuthState) {
          refreshAuthState();
        }
      }, 500);
    } catch (error) {
      console.error("[DebugAdminDashboard] Fix error:", error);
    }
  };

  const forceAdminStatus = () => {
    localStorage.setItem('akii-is-admin', 'true');
    localStorage.setItem('akii-auth-emergency', 'true');
    localStorage.setItem('akii-auth-emergency-time', Date.now().toString());
    if (refreshAuthState) {
      refreshAuthState();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard Debug</h1>
      
      <div className="bg-card border-border border rounded p-4 mb-4 dark:bg-card">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <div className="mb-2">
          <p><strong>Render time:</strong> {renderTime.current}</p>
          <p><strong>Current time:</strong> {timestamp()}</p>
        </div>
      </div>

      <div className="bg-card border-border border rounded p-4 mb-4 dark:bg-card">
        <h2 className="text-lg font-semibold mb-2">Authentication State</h2>
        <div className="mb-2">
          <p><strong>Loading:</strong> {isLoading ? '⏳' : '✅'}</p>
          <p><strong>User:</strong> {user ? user.email : 'Not signed in'}</p>
          <p><strong>Admin:</strong> {isAdmin ? '✅' : '❌'}</p>
          <p><strong>Profile:</strong> {profile ? '✅' : '❌'}</p>
        </div>
      </div>
      
      <div className="bg-card border-primary/20 border rounded p-4 mb-4 dark:bg-card">
        <h2 className="text-lg font-semibold mb-2">Dashboard Health</h2>
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={runHealthCheck}
            disabled={isRunningHealthCheck}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:bg-primary/50"
          >
            {isRunningHealthCheck ? 'Running Check...' : 'Run Health Check'}
          </button>
          <button 
            onClick={applyFixes}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700"
          >
            Fix Common Issues
          </button>
        </div>
        
        {healthResults && (
          <div className="bg-background border-border border rounded p-3 mb-3 max-h-60 overflow-auto">
            <pre className="text-xs">{JSON.stringify(healthResults, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="bg-card border-purple-500/20 border rounded p-4 mb-4 dark:bg-card">
        <h2 className="text-lg font-semibold mb-2">Admin Actions</h2>
        <div className="flex space-x-2">
          <button 
            onClick={forceAdminStatus}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-700"
          >
            Force Admin Status
          </button>
          <button 
            onClick={() => refreshAuthState && refreshAuthState()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700"
          >
            Refresh Auth State
          </button>
        </div>
      </div>
      
      <div className="bg-card border-red-500/20 border rounded p-4 dark:bg-card">
        <h2 className="text-lg font-semibold mb-2">Actions</h2>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  
  console.log("[AdminDashboard] Component rendering start");
  
  // Log auth state for debugging
  useEffect(() => {
    console.log("[AdminDashboard] Auth state:", {
      user: user?.email,
      isAdmin,
      localStorage: {
        isAdmin: localStorage.getItem('akii-is-admin') === 'true',
        userEmail: localStorage.getItem('akii-auth-user-email')
      }
    });
  }, [user, isAdmin]);

  // Use debug admin dashboard when enabled
  if (DEBUG_ADMIN) {
    return <DebugAdminDashboard />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor platform performance and manage system settings"
      >
        <Button asChild>
          <Link to="/admin/run-migration">Database Migrations</Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          Project ID: <span className="font-mono">injxxchotrvgvvzelhvj</span>
        </div>
      </PageHeader>

      <DashboardSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <h3 className="text-2xl font-bold mt-1">2,543</h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">12%</span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Agents
                  </p>
                  <h3 className="text-2xl font-bold mt-1">1,247</h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Circle className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">8%</span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Messages
                  </p>
                  <h3 className="text-2xl font-bold mt-1">3.2M</h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">24%</span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Revenue
                  </p>
                  <h3 className="text-2xl font-bold mt-1">$48,254</h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">3%</span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">User Growth Chart</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                  <p className="text-muted-foreground">Message Volume Chart</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">High Error Rate</p>
                      <p className="text-sm text-muted-foreground">
                        Error rate exceeded 5% threshold on Agent #1247
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Moderation Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Content flagged for review in conversation #8721
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">System Update</p>
                      <p className="text-sm text-muted-foreground">
                        AI model updated to version 2.4.1
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Yesterday
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Circle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sales Assistant</p>
                        <p className="text-xs text-muted-foreground">
                          E-commerce
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">98%</p>
                      <p className="text-xs text-muted-foreground">
                        Satisfaction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Circle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Support Bot</p>
                        <p className="text-xs text-muted-foreground">SaaS</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">95%</p>
                      <p className="text-xs text-muted-foreground">
                        Satisfaction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Circle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Product Advisor</p>
                        <p className="text-xs text-muted-foreground">Retail</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">92%</p>
                      <p className="text-xs text-muted-foreground">
                        Satisfaction
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <Users className="h-5 w-5 mb-1" />
                    <span>Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <Settings className="h-5 w-5 mb-1" />
                    <span>System Settings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    asChild
                  >
                    <Link to="/admin/run-migration">
                      <FileText className="h-5 w-5 mb-1" />
                      <span>Database Migrations</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                  >
                    <BarChart3 className="h-5 w-5 mb-1" />
                    <span>View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  User Analytics Dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  Agent Performance Dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  Revenue Analytics Dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">
                  Content Moderation Dashboard
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Use the HOC to enhance the component with admin initialization and error handling
export default withAdminInit(AdminDashboard);
