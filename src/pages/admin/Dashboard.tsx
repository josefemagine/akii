import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform performance and manage system settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/admin/run-migration">Database Migrations</Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Project ID: <span className="font-mono">injxxchotrvgvvzelhvj</span>
          </div>
        </div>
      </div>

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

export default AdminDashboard;
