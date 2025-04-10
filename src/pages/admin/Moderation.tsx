import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  AlertTriangle,
  Check,
  Flag,
  MessageSquare,
  Search,
  Shield,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

const flaggedMessages = [
  {
    id: "msg1",
    content:
      "I need help accessing my account but I forgot my password and security questions.",
    user: "john.doe@example.com",
    agent: "Support Agent",
    timestamp: "2024-05-20T14:32:00",
    reason: "Potential phishing attempt",
    severity: "medium",
    status: "pending",
  },
  {
    id: "msg2",
    content:
      "Can you help me find information about competitive products in the market?",
    user: "marketing@company.com",
    agent: "Sales Agent",
    timestamp: "2024-05-19T09:15:00",
    reason: "Competitive intelligence gathering",
    severity: "low",
    status: "approved",
  },
  {
    id: "msg3",
    content:
      "I'm extremely frustrated with your service and want to speak to a manager immediately!",
    user: "angry.customer@gmail.com",
    agent: "Support Agent",
    timestamp: "2024-05-18T16:45:00",
    reason: "Abusive language detected",
    severity: "high",
    status: "rejected",
  },
];

const AdminModeration = () => {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>

      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="rules">Moderation Rules</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Flagged Messages</CardTitle>
                  <CardDescription>
                    Review messages that have been flagged by the moderation
                    system
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search messages..."
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedMessages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {message.agent}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <Badge
                            className={`${message.status === "pending" ? "bg-yellow-500" : message.status === "approved" ? "bg-green-500" : "bg-red-500"}`}
                          >
                            {message.status.charAt(0).toUpperCase() +
                              message.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm">{message.content}</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center space-x-2">
                              <AlertTriangle
                                className={`h-4 w-4 ${message.severity === "high" ? "text-red-500" : message.severity === "medium" ? "text-yellow-500" : "text-orange-300"}`}
                              />
                              <span className="text-sm font-medium">
                                {message.reason}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {message.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              From: {message.user}
                            </p>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Shield className="h-4 w-4 mr-1" /> Review
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Rules</CardTitle>
              <CardDescription>
                Configure the rules that trigger content moderation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Text Content Rules</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Profanity Filter</p>
                        <p className="text-sm text-muted-foreground">
                          Flag messages containing profanity or offensive
                          language
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select defaultValue="strict">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch id="profanity-filter" defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">
                          Personal Information Detection
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Flag messages containing PII (emails, phone numbers,
                          etc.)
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select defaultValue="moderate">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch id="pii-detection" defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Harmful Content Detection</p>
                        <p className="text-sm text-muted-foreground">
                          Flag potentially harmful instructions or guidance
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select defaultValue="strict">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch id="harmful-content" defaultChecked />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Sentiment Analysis</p>
                        <p className="text-sm text-muted-foreground">
                          Flag messages with extremely negative sentiment
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select defaultValue="moderate">
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                        <Switch id="sentiment-analysis" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Custom Keywords</h3>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter keywords or phrases to flag, one per line"
                      className="min-h-[100px]"
                      defaultValue="confidential\nsecret\npassword\ncredit card\nsocial security"
                    />
                    <div className="flex justify-end">
                      <Button variant="outline">Save Keywords</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Dual-AI Review System</h3>
                  <div className="p-3 border rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Dual-AI Review</p>
                        <p className="text-sm text-muted-foreground">
                          Use a secondary AI to review flagged content
                        </p>
                      </div>
                      <Switch id="dual-ai" defaultChecked />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-ai">Primary AI Model</Label>
                        <Select defaultValue="gpt-4o">
                          <SelectTrigger id="primary-ai">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="claude-3-opus">
                              Claude 3 Opus
                            </SelectItem>
                            <SelectItem value="gemini-pro">
                              Gemini Pro
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary-ai">Secondary AI Model</Label>
                        <Select defaultValue="claude-3-sonnet">
                          <SelectTrigger id="secondary-ai">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="claude-3-sonnet">
                              Claude 3 Sonnet
                            </SelectItem>
                            <SelectItem value="gemini-pro">
                              Gemini Pro
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          Human-in-the-loop for Disagreements
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Require human review when AI models disagree
                        </p>
                      </div>
                      <Switch id="human-review" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>
                Configure general moderation settings and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-reject High Severity</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically reject content flagged as high severity
                    </p>
                  </div>
                  <Switch id="auto-reject" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-approve Low Severity</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve content flagged as low severity
                    </p>
                  </div>
                  <Switch id="auto-approve" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for high severity flags
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dashboard Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Show notifications in the admin dashboard
                    </p>
                  </div>
                  <Switch id="dashboard-notifications" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-emails">
                  Notification Recipients
                </Label>
                <Input
                  id="notification-emails"
                  placeholder="Enter email addresses, separated by commas"
                  defaultValue="moderation@akii.ai, admin@akii.ai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-timeout">Review Timeout (hours)</Label>
                <Input
                  id="review-timeout"
                  type="number"
                  defaultValue="24"
                  className="w-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Time before flagged content is automatically reviewed by the
                  system
                </p>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Moderation Audit Logs</CardTitle>
                  <CardDescription>
                    View a history of all moderation actions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search logs..."
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">Content ID</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Moderator</th>
                      <th className="text-left p-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 text-sm">2024-05-20 14:45:12</td>
                      <td className="p-2 text-sm">
                        <Badge className="bg-red-500">Rejected</Badge>
                      </td>
                      <td className="p-2 text-sm">msg3</td>
                      <td className="p-2 text-sm">angry.customer@gmail.com</td>
                      <td className="p-2 text-sm">admin@akii.ai</td>
                      <td className="p-2 text-sm">Abusive language</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm">2024-05-19 10:22:35</td>
                      <td className="p-2 text-sm">
                        <Badge className="bg-green-500">Approved</Badge>
                      </td>
                      <td className="p-2 text-sm">msg2</td>
                      <td className="p-2 text-sm">marketing@company.com</td>
                      <td className="p-2 text-sm">system</td>
                      <td className="p-2 text-sm">
                        Auto-approved (low severity)
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 text-sm">2024-05-18 09:15:47</td>
                      <td className="p-2 text-sm">
                        <Badge className="bg-yellow-500">Flagged</Badge>
                      </td>
                      <td className="p-2 text-sm">msg1</td>
                      <td className="p-2 text-sm">john.doe@example.com</td>
                      <td className="p-2 text-sm">system</td>
                      <td className="p-2 text-sm">
                        Potential phishing attempt
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
