import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Search, Download, FileText, Shield, UserCheck } from "lucide-react";

export default function Compliance() {
  const [activeTab, setActiveTab] = useState("privacy");

  // Sample data rights requests
  const dataRequests = [
    {
      id: 1,
      user: "john.doe@example.com",
      type: "Access",
      status: "Completed",
      submitted: "2024-03-15",
      completed: "2024-03-18",
    },
    {
      id: 2,
      user: "sarah.smith@example.com",
      type: "Deletion",
      status: "In Progress",
      submitted: "2024-03-20",
      completed: null,
    },
    {
      id: 3,
      user: "michael.brown@example.com",
      type: "Correction",
      status: "Pending",
      submitted: "2024-03-22",
      completed: null,
    },
    {
      id: 4,
      user: "emily.jones@example.com",
      type: "Access",
      status: "Completed",
      submitted: "2024-03-10",
      completed: "2024-03-14",
    },
    {
      id: 5,
      user: "david.wilson@example.com",
      type: "Deletion",
      status: "Completed",
      submitted: "2024-03-05",
      completed: "2024-03-09",
    },
  ];

  // Sample audit logs
  const auditLogs = [
    {
      id: 1,
      action: "User data exported",
      performer: "admin@akii.ai",
      timestamp: "2024-03-22 14:35:22",
      details: "Exported data for user ID 12345",
    },
    {
      id: 2,
      action: "Privacy policy updated",
      performer: "admin@akii.ai",
      timestamp: "2024-03-20 10:12:45",
      details: "Updated GDPR compliance section",
    },
    {
      id: 3,
      action: "Data deletion request processed",
      performer: "system",
      timestamp: "2024-03-19 08:30:11",
      details: "Processed deletion request for user ID 10982",
    },
    {
      id: 4,
      action: "Consent settings modified",
      performer: "admin@akii.ai",
      timestamp: "2024-03-18 16:45:33",
      details: "Updated cookie consent options",
    },
    {
      id: 5,
      action: "Data retention policy changed",
      performer: "admin@akii.ai",
      timestamp: "2024-03-15 11:20:05",
      details: "Changed conversation history retention to 90 days",
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" /> Generate Compliance Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
          <TabsTrigger value="data-requests">Data Rights Requests</TabsTrigger>
          <TabsTrigger value="audit">Audit Trails</TabsTrigger>
          <TabsTrigger value="documents">Compliance Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Consent Settings</CardTitle>
              <CardDescription>
                Configure privacy settings and user consent options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Collection</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymous usage data to improve service
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="conversation-history">
                      Conversation History
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Store chat conversations for training and improvement
                    </p>
                  </div>
                  <Switch id="conversation-history" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="third-party">
                      Third-Party Data Sharing
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share data with trusted third-party services
                    </p>
                  </div>
                  <Switch id="third-party" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Retention</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-data">User Account Data</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="user-data"
                        type="number"
                        defaultValue="365"
                        className="w-20"
                      />
                      <span className="flex items-center text-sm">
                        days after account deletion
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conversation-data">Conversation Data</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="conversation-data"
                        type="number"
                        defaultValue="90"
                        className="w-20"
                      />
                      <span className="flex items-center text-sm">days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="analytics-data">Analytics Data</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="analytics-data"
                        type="number"
                        defaultValue="180"
                        className="w-20"
                      />
                      <span className="flex items-center text-sm">days</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="log-data">System Logs</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="log-data"
                        type="number"
                        defaultValue="30"
                        className="w-20"
                      />
                      <span className="flex items-center text-sm">days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Compliance Frameworks</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="gdpr">GDPR Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable features required for GDPR compliance
                    </p>
                  </div>
                  <Switch id="gdpr" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ccpa">CCPA Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable features required for CCPA compliance
                    </p>
                  </div>
                  <Switch id="ccpa" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hipaa">HIPAA Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable features required for HIPAA compliance
                    </p>
                  </div>
                  <Switch id="hipaa" />
                </div>
              </div>

              <Button>Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Rights Request Management</CardTitle>
              <CardDescription>
                Handle user requests for data access, deletion, and correction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search requests..." className="pl-8" />
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          {request.user}
                        </TableCell>
                        <TableCell>{request.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "Completed"
                                ? "default"
                                : request.status === "In Progress"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.submitted}</TableCell>
                        <TableCell>{request.completed || "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Process
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trails</CardTitle>
              <CardDescription>
                Review system activity logs for compliance and security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search audit logs..." className="pl-8" />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button variant="outline">Filter</Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.action}
                        </TableCell>
                        <TableCell>{log.performer}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Documents</CardTitle>
              <CardDescription>
                Manage legal and compliance documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Privacy Policy</CardTitle>
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>
                      Last updated: March 15, 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Comprehensive privacy policy detailing data collection,
                      usage, and user rights.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Terms of Service
                      </CardTitle>
                      <FileText className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>
                      Last updated: March 15, 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Terms governing the use of the platform and services
                      provided.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Cookie Policy</CardTitle>
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>
                      Last updated: February 28, 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Details on cookies used, their purpose, and how users can
                      control them.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Data Processing Agreement
                      </CardTitle>
                      <UserCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardDescription>
                      Last updated: January 10, 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      Agreement for processing personal data in compliance with
                      regulations.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button>
                <FileText className="mr-2 h-4 w-4" /> Add New Document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
