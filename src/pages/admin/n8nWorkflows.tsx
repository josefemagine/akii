import React, { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Search,
  MoreVertical,
  Plus,
  Download,
  Filter,
  ExternalLink,
  Edit,
  Trash2,
  PlayCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Activity,
  Clock,
  Settings,
  Workflow,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog.tsx";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "error";
  createdAt: string;
  lastRun: string;
  totalRuns: number;
  successRate: number;
  averageTime: string;
  owner: string;
  triggers: string[];
  rateLimited: boolean;
}

const mockWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Customer Onboarding",
    description: "Automate the customer onboarding process with welcome emails and data synchronization",
    status: "active",
    createdAt: "2023-04-05",
    lastRun: "2023-06-28 15:22",
    totalRuns: 1248,
    successRate: 99.5,
    averageTime: "1.2s",
    owner: "John Doe",
    triggers: ["New User Registration", "Subscription Update"],
    rateLimited: false,
  },
  {
    id: "wf-2",
    name: "Document Processing",
    description: "Extract data from uploaded documents and create training data",
    status: "active",
    createdAt: "2023-04-10",
    lastRun: "2023-06-28 14:47",
    totalRuns: 867,
    successRate: 98.2,
    averageTime: "3.5s",
    owner: "Jane Smith",
    triggers: ["Document Upload", "Manual Trigger"],
    rateLimited: true,
  },
  {
    id: "wf-3",
    name: "AI Training Pipeline",
    description: "Process and prepare data for AI model training",
    status: "error",
    createdAt: "2023-05-12",
    lastRun: "2023-06-27 09:15",
    totalRuns: 152,
    successRate: 87.3,
    averageTime: "12.4s",
    owner: "Robert Johnson",
    triggers: ["Scheduled (Daily)", "Manual Trigger"],
    rateLimited: false,
  },
  {
    id: "wf-4",
    name: "Customer Feedback Analysis",
    description: "Analyze customer feedback and generate reports",
    status: "inactive",
    createdAt: "2023-05-20",
    lastRun: "2023-06-20 11:30",
    totalRuns: 45,
    successRate: 95.5,
    averageTime: "5.7s",
    owner: "Emily Davis",
    triggers: ["Scheduled (Weekly)", "Webhook"],
    rateLimited: false,
  },
  {
    id: "wf-5",
    name: "User Activity Monitoring",
    description: "Track and analyze user activities for security and optimization",
    status: "active",
    createdAt: "2023-06-01",
    lastRun: "2023-06-28 15:05",
    totalRuns: 720,
    successRate: 99.8,
    averageTime: "0.8s",
    owner: "Michael Wilson",
    triggers: ["User Login", "User Action"],
    rateLimited: true,
  },
];

const getStatusBadge = (status: Workflow["status"]) => {
  switch (status) {
    case "active":
      return (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="font-medium text-green-700 dark:text-green-500">Active</span>
        </div>
      );
    case "inactive":
      return (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          <span className="font-medium text-gray-600 dark:text-gray-400">Inactive</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span className="font-medium text-red-700 dark:text-red-500">Error</span>
        </div>
      );
    default:
      return null;
  }
};

const N8nWorkflows = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusFilteredWorkflows = selectedTab === "all" 
    ? filteredWorkflows 
    : filteredWorkflows.filter(workflow => workflow.status === selectedTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">n8n Workflow Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage, monitor, and debug automated workflows across the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Start building a new automation workflow for your application
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="workflow-name">Workflow Name</Label>
                  <Input id="workflow-name" placeholder="Enter workflow name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workflow-description">Description</Label>
                  <Input id="workflow-description" placeholder="Enter workflow description" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workflow-owner">Owner</Label>
                  <Input id="workflow-owner" placeholder="Workflow owner" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workflow-trigger">Primary Trigger</Label>
                  <Input id="workflow-trigger" placeholder="Select trigger type" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Workflow</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open n8n Editor
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search workflows..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          <Card>
            <CardHeader className="px-6 py-4">
              <CardTitle>Workflows</CardTitle>
              <CardDescription>
                {selectedTab === "all"
                  ? "All workflows in the system"
                  : selectedTab === "active"
                  ? "Currently active workflows"
                  : selectedTab === "inactive"
                  ? "Disabled or inactive workflows"
                  : "Workflows with errors"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">Workflow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Avg. Time</TableHead>
                      <TableHead>Rate Limited</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statusFilteredWorkflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {workflow.description.length > 60
                                ? `${workflow.description.substring(0, 60)}...`
                                : workflow.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{workflow.lastRun}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-medium ${
                                workflow.successRate >= 99
                                  ? "text-green-600"
                                  : workflow.successRate >= 90
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {workflow.successRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{workflow.averageTime}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={workflow.rateLimited} 
                            onCheckedChange={(checked) => {
                              // Handle rate limit toggle
                              setWorkflows(
                                workflows.map((w) =>
                                  w.id === workflow.id ? { ...w, rateLimited: checked } : w
                                )
                              );
                            }} 
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Run workflow"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit workflow"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Open in Editor
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  Configure
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  Reset Statistics
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {statusFilteredWorkflows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Workflow className="h-12 w-12 mb-2 text-muted-foreground/50" />
                            <p>No workflows found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{statusFilteredWorkflows.length}</span> of{" "}
                <span className="font-medium">{workflows.length}</span> workflows
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Activity</CardTitle>
          <CardDescription>Recent activity from all workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Customer Onboarding - Success</p>
                  <p className="text-sm text-muted-foreground">
                    Workflow completed successfully for user john.doe@example.com
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">AI Training Pipeline - Failed</p>
                  <p className="text-sm text-muted-foreground">
                    Error: Unable to connect to AI training service - timeout
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    15 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b">
                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Document Processing - Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Workflow completed with warning: Large document (25MB) may cause performance issues
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    45 minutes ago
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default N8nWorkflows; 