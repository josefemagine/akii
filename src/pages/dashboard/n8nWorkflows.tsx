import React, { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Play,
  Plus,
  Settings,
  Workflow,
} from "lucide-react";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "error";
  lastRun: string | null;
  executions: number;
  triggers: string[];
  actions: string[];
}

const N8nWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([
    {
      id: "wf-1",
      name: "Lead Qualification",
      description:
        "Automatically qualify leads based on AI analysis of form submissions",
      status: "active",
      lastRun: "2023-10-20T14:22:10Z",
      executions: 128,
      triggers: ["Form Submission"],
      actions: ["AI Analysis", "CRM Update", "Email Notification"],
    },
    {
      id: "wf-2",
      name: "Support Ticket Triage",
      description:
        "Analyze support tickets and route to appropriate departments",
      status: "active",
      lastRun: "2023-10-21T09:15:30Z",
      executions: 56,
      triggers: ["New Support Ticket"],
      actions: ["AI Analysis", "Ticket Routing", "Slack Notification"],
    },
    {
      id: "wf-3",
      name: "Content Moderation",
      description: "Automatically moderate user-generated content using AI",
      status: "error",
      lastRun: "2023-10-19T11:30:45Z",
      executions: 342,
      triggers: ["New Content"],
      actions: ["AI Moderation", "Content Approval/Rejection"],
    },
    {
      id: "wf-4",
      name: "Customer Onboarding",
      description:
        "Automate customer onboarding process with personalized AI assistance",
      status: "inactive",
      lastRun: null,
      executions: 0,
      triggers: ["New Customer"],
      actions: ["Welcome Email", "AI Personalization", "Schedule Call"],
    },
  ]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: "active" | "inactive" | "error") => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800"
          >
            <Check className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
          >
            <Clock className="h-3 w-3 mr-1" /> Inactive
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
          >
            <AlertCircle className="h-3 w-3 mr-1" /> Error
          </Badge>
        );
    }
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(
      workflows.map((workflow) =>
        workflow.id === id
          ? {
              ...workflow,
              status: workflow.status === "active" ? "inactive" : "active",
            }
          : workflow,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">n8n Workflows</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-2 mb-4 sm:mb-0">
                      <div className="flex items-center gap-2">
                        <Workflow className="h-4 w-4 text-primary" />
                        <span className="font-medium">{workflow.name}</span>
                        {getStatusBadge(workflow.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {workflow.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {workflow.triggers.map((trigger, i) => (
                          <Badge
                            key={`trigger-${i}`}
                            variant="secondary"
                            className="text-xs"
                          >
                            Trigger: {trigger}
                          </Badge>
                        ))}
                        {workflow.actions.map((action, i) => (
                          <Badge
                            key={`action-${i}`}
                            variant="outline"
                            className="text-xs"
                          >
                            Action: {action}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last run: {formatDate(workflow.lastRun)} • Executions:{" "}
                        {workflow.executions}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <Switch
                          id={`toggle-${workflow.id}`}
                          checked={workflow.status === "active"}
                          onCheckedChange={() =>
                            toggleWorkflowStatus(workflow.id)
                          }
                          disabled={workflow.status === "error"}
                        />
                        <Label
                          htmlFor={`toggle-${workflow.id}`}
                          className="text-sm"
                        >
                          {workflow.status === "active"
                            ? "Enabled"
                            : "Disabled"}
                        </Label>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" /> Run
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </div>
                ))}

                {workflows.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No workflows found. Create your first workflow to get
                    started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Workflow className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">
                        Lead Qualification
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically qualify leads based on AI analysis of form
                        submissions
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Popular</Badge>
                        <Button size="sm" variant="ghost">
                          Use Template <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border hover:border-primary/20 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Workflow className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">
                        Support Ticket Triage
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Analyze support tickets and route to appropriate
                        departments
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Support</Badge>
                        <Button size="sm" variant="ghost">
                          Use Template <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border hover:border-primary/20 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Workflow className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium">
                        Content Moderation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically moderate user-generated content using AI
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Moderation</Badge>
                        <Button size="sm" variant="ghost">
                          Use Template <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        Success
                      </Badge>
                      <span className="font-medium">Lead Qualification</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Executed: {new Date().toLocaleString()} • Duration: 1.2s
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        Success
                      </Badge>
                      <span className="font-medium">Support Ticket Triage</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Executed:{" "}
                      {new Date(Date.now() - 3600000).toLocaleString()} •
                      Duration: 0.8s
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      >
                        Failed
                      </Badge>
                      <span className="font-medium">Content Moderation</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Executed:{" "}
                      {new Date(Date.now() - 7200000).toLocaleString()} •
                      Duration: 2.5s
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>n8n Connection Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="n8n-url">n8n Instance URL</Label>
                    <Input
                      id="n8n-url"
                      placeholder="https://n8n.yourdomain.com"
                      defaultValue="https://n8n.akii-demo.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="n8n-api-key">API Key</Label>
                    <Input
                      id="n8n-api-key"
                      type="password"
                      placeholder="Your n8n API key"
                      defaultValue="n8n_api_12345abcdef"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="webhook-active" defaultChecked />
                    <Label htmlFor="webhook-active">
                      Enable Webhook Triggers
                    </Label>
                  </div>

                  <Button className="w-full sm:w-auto mt-2">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default N8nWorkflows;
