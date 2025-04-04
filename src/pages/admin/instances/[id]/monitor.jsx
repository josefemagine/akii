import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Users,
  MessageSquare,
  Bot,
  Zap,
  Trash,
} from "lucide-react";

// Status badge component (same as in ManageInstances)
const StatusBadge = ({ status }) => {
  const statusConfig = {
    InService: { color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4 mr-1" /> },
    Creating: { color: "bg-blue-500", icon: <Clock className="h-4 w-4 mr-1" /> },
    Pending: { color: "bg-yellow-500", icon: <Clock className="h-4 w-4 mr-1" /> },
    Failed: { color: "bg-red-500", icon: <XCircle className="h-4 w-4 mr-1" /> },
    Deleted: { color: "bg-gray-500", icon: <Trash className="h-4 w-4 mr-1" /> },
    default: { color: "bg-gray-500", icon: <AlertCircle className="h-4 w-4 mr-1" /> },
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge className={`${config.color} text-white flex items-center`}>
      {config.icon} {status}
    </Badge>
  );
};

// Mock data generator for usage metrics
const generateMockMetrics = () => {
  return {
    currentUsage: {
      requestsPerSecond: (Math.random() * 0.8 + 0.1).toFixed(2),
      activeUsers: Math.floor(Math.random() * 25) + 5,
      averageResponseTime: Math.floor(Math.random() * 800) + 200, // ms
    },
    dailyStats: {
      totalRequests: Math.floor(Math.random() * 5000) + 1000,
      uniqueUsers: Math.floor(Math.random() * 100) + 20,
      totalTokens: Math.floor(Math.random() * 500000) + 100000,
    },
    errorRate: (Math.random() * 0.02).toFixed(4), // 0-2% error rate
    health: Math.random() > 0.05 ? "Healthy" : "Degraded", // 5% chance of degraded
  };
};

const InstanceMonitor = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [instance, setInstance] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState({
    instance: true,
    metrics: true,
  });
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch instance details
  const fetchInstance = async () => {
    if (!id) return;
    
    setLoading(prev => ({ ...prev, instance: true }));
    try {
      const response = await fetch(`/api/bedrock/instances/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch instance details");
      }
      
      const data = await response.json();
      setInstance(data);
    } catch (error) {
      console.error("Error fetching instance:", error);
      toast({
        title: "Error fetching instance details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, instance: false }));
    }
  };

  // Fetch mock metrics (in a real app, would connect to CloudWatch or other metrics service)
  const fetchMetrics = async () => {
    if (!id) return;
    
    setLoading(prev => ({ ...prev, metrics: true }));
    try {
      // Simulating API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock metrics
      const mockMetrics = generateMockMetrics();
      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error fetching metrics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchInstance();
      fetchMetrics();
    }
  }, [id]);

  // Set up auto-refresh for metrics
  useEffect(() => {
    if (id) {
      const interval = setInterval(() => {
        fetchMetrics();
      }, 15000); // Refresh every 15 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [id]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchInstance();
    fetchMetrics();
    
    toast({
      title: "Refreshing data",
      description: "The instance data and metrics are being refreshed",
    });
  };

  // Handle back button click
  const handleBack = () => {
    router.push("/admin/ManageInstances");
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Instances
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading.instance || loading.metrics}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading.instance || loading.metrics ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <PageHeader
        title={instance ? `Monitoring: ${instance.name}` : "Instance Monitor"}
        description={instance ? `Real-time monitoring for ${instance.modelId}` : "Loading instance details..."}
      />

      {/* Instance Overview Card */}
      <DashboardSection>
        <Card>
          <CardHeader>
            <CardTitle>Instance Overview</CardTitle>
            <CardDescription>Current status and basic instance information</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.instance ? (
              <div className="flex items-center justify-center p-6">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span>Loading instance details...</span>
              </div>
            ) : instance ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Status</div>
                  <div><StatusBadge status={instance.status} /></div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Model</div>
                  <div className="font-mono text-sm">{instance.modelId}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Throughput</div>
                  <div>{instance.throughput} TPS</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Plan</div>
                  <div>
                    <Badge variant="outline" className="bg-primary/10">
                      {instance.plan}
                    </Badge>
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Creation Time</div>
                  <div>{new Date(instance.creationTime).toLocaleString()}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Expiration</div>
                  <div>{instance.expirationTime ? new Date(instance.expirationTime).toLocaleString() : "N/A"}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">Commitment</div>
                  <div>{instance.commitmentDuration === "1mo" ? "1 Month" : "6 Months"}</div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-1.5">ID</div>
                  <div className="font-mono text-xs truncate">{instance.id}</div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                Failed to load instance details
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardSection>

      {/* Metrics Cards */}
      <DashboardSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Current Usage Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>Live usage statistics for this instance</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.metrics ? (
                <div className="flex items-center justify-center p-6">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading metrics...</span>
                </div>
              ) : metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm">Requests Per Second</span>
                    </div>
                    <div className="font-medium">{metrics.currentUsage.requestsPerSecond} RPS</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">Active Users</span>
                    </div>
                    <div className="font-medium">{metrics.currentUsage.activeUsers}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Avg. Response Time</span>
                    </div>
                    <div className="font-medium">{metrics.currentUsage.averageResponseTime} ms</div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  Failed to load metrics
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Statistics</CardTitle>
              <CardDescription>Cumulative metrics for today</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.metrics ? (
                <div className="flex items-center justify-center p-6">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading metrics...</span>
                </div>
              ) : metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">Total Requests</span>
                    </div>
                    <div className="font-medium">{metrics.dailyStats.totalRequests.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm">Unique Users</span>
                    </div>
                    <div className="font-medium">{metrics.dailyStats.uniqueUsers.toLocaleString()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-cyan-500" />
                      <span className="text-sm">Total Tokens</span>
                    </div>
                    <div className="font-medium">{metrics.dailyStats.totalTokens.toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  Failed to load metrics
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health & Errors */}
          <Card>
            <CardHeader>
              <CardTitle>Health & Errors</CardTitle>
              <CardDescription>Reliability metrics for this instance</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.metrics ? (
                <div className="flex items-center justify-center p-6">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span>Loading metrics...</span>
                </div>
              ) : metrics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">Error Rate</span>
                    </div>
                    <div className="font-medium">{(parseFloat(metrics.errorRate) * 100).toFixed(2)}%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm">System Health</span>
                    </div>
                    <div>
                      <Badge className={metrics.health === "Healthy" ? "bg-green-500" : "bg-amber-500"}>
                        {metrics.health}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg mt-4">
                    <p className="text-sm text-center">
                      Auto-refreshing metrics every 15 seconds
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  Failed to load metrics
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {/* Recommendations Card */}
      {!loading.instance && !loading.metrics && instance && metrics && (
        <DashboardSection>
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Suggestions to improve performance and cost-efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.currentUsage.requestsPerSecond < 0.5 * instance.throughput && (
                  <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 rounded-lg">
                    <div className="font-medium flex items-center text-amber-800 dark:text-amber-400">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Low Utilization Detected
                    </div>
                    <p className="text-sm mt-1 text-amber-700 dark:text-amber-300">
                      Current usage ({metrics.currentUsage.requestsPerSecond} RPS) is less than 50% of your provisioned throughput ({instance.throughput} TPS).
                      Consider reducing your provisioned capacity to save costs.
                    </p>
                  </div>
                )}

                {metrics.currentUsage.requestsPerSecond > 0.85 * instance.throughput && (
                  <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg">
                    <div className="font-medium flex items-center text-red-800 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      High Utilization Warning
                    </div>
                    <p className="text-sm mt-1 text-red-700 dark:text-red-300">
                      Current usage ({metrics.currentUsage.requestsPerSecond} RPS) is approaching your provisioned throughput ({instance.throughput} TPS).
                      Consider increasing capacity to prevent throttling.
                    </p>
                  </div>
                )}

                {parseFloat(metrics.errorRate) > 0.01 && (
                  <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg">
                    <div className="font-medium flex items-center text-red-800 dark:text-red-400">
                      <XCircle className="h-4 w-4 mr-2" />
                      Elevated Error Rate
                    </div>
                    <p className="text-sm mt-1 text-red-700 dark:text-red-300">
                      Error rate of {(parseFloat(metrics.errorRate) * 100).toFixed(2)}% exceeds recommended threshold of 1%.
                      Check integration code and input validation.
                    </p>
                  </div>
                )}

                {metrics.currentUsage.averageResponseTime > 700 && (
                  <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 rounded-lg">
                    <div className="font-medium flex items-center text-blue-800 dark:text-blue-400">
                      <Clock className="h-4 w-4 mr-2" />
                      Slow Response Times
                    </div>
                    <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                      Average response time ({metrics.currentUsage.averageResponseTime}ms) is higher than optimal.
                      Consider optimizing prompts or evaluating different models.
                    </p>
                  </div>
                )}

                {parseFloat(metrics.errorRate) <= 0.01 && 
                  metrics.currentUsage.averageResponseTime <= 700 && 
                  metrics.currentUsage.requestsPerSecond >= 0.5 * instance.throughput && 
                  metrics.currentUsage.requestsPerSecond <= 0.85 * instance.throughput && (
                  <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-lg">
                    <div className="font-medium flex items-center text-green-800 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Optimal Performance
                    </div>
                    <p className="text-sm mt-1 text-green-700 dark:text-green-300">
                      All metrics are within optimal ranges. Your instance is performing well and properly sized for current workloads.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </DashboardSection>
      )}
    </div>
  );
};

export default InstanceMonitor; 