import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Eye, Plus, Send, Trash } from "lucide-react";

const emailTemplates = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Akii AI - Get Started Today!",
    description: "Sent to new users after registration",
    category: "onboarding",
    lastUpdated: "2024-05-10",
  },
  {
    id: "password-reset",
    name: "Password Reset",
    subject: "Reset Your Akii AI Password",
    description: "Sent when a user requests a password reset",
    category: "account",
    lastUpdated: "2024-05-05",
  },
  {
    id: "subscription-confirmation",
    name: "Subscription Confirmation",
    subject: "Your Akii AI Subscription is Active",
    description: "Sent after a successful subscription payment",
    category: "billing",
    lastUpdated: "2024-04-28",
  },
  {
    id: "payment-failed",
    name: "Payment Failed",
    subject: "Action Required: Payment Failed for Your Akii AI Subscription",
    description: "Sent when a subscription payment fails",
    category: "billing",
    lastUpdated: "2024-04-15",
  },
  {
    id: "agent-created",
    name: "Agent Created",
    subject: "Your New AI Agent is Ready to Use",
    description: "Sent when a user creates a new AI agent",
    category: "product",
    lastUpdated: "2024-05-12",
  },
  {
    id: "document-processed",
    name: "Document Processing Complete",
    subject: "Your Documents Have Been Processed",
    description: "Sent when document processing is complete",
    category: "product",
    lastUpdated: "2024-05-08",
  },
];

const AdminEmailTemplates = () => {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Template Editor</TabsTrigger>
          <TabsTrigger value="settings">Email Settings</TabsTrigger>
          <TabsTrigger value="test">Test & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Manage and customize email templates sent to users
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="search"
                    placeholder="Search templates..."
                    className="w-[250px]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Template Name</th>
                      <th className="text-left p-3">Subject</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Last Updated</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailTemplates.map((template) => (
                      <tr
                        key={template.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">{template.subject}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                            {template.category.charAt(0).toUpperCase() +
                              template.category.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{template.lastUpdated}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Editor</CardTitle>
              <CardDescription>
                Edit email template content and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    defaultValue="Welcome Email"
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <Select defaultValue="onboarding">
                    <SelectTrigger id="template-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Email Subject</Label>
                <Input
                  id="email-subject"
                  defaultValue="Welcome to Akii AI - Get Started Today!"
                  placeholder="Enter email subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-sender">Sender Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="email-sender-name"
                    defaultValue="Akii AI Team"
                    placeholder="Sender name"
                  />
                  <Input
                    id="email-sender-email"
                    defaultValue="welcome@akii.ai"
                    placeholder="Sender email"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email-content">Email Content</Label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      HTML
                    </Button>
                    <Button variant="outline" size="sm">
                      Visual Editor
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="email-content"
                  className="min-h-[300px] font-mono"
                  defaultValue={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Akii AI</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://akii.ai/logo.png" alt="Akii AI Logo" width="150">
    </div>
    <h1 style="color: #4f46e5;">Welcome to Akii AI!</h1>
    <p>Hello {{user.firstName}},</p>
    <p>Thank you for joining Akii AI! We're excited to have you on board.</p>
    <p>With Akii AI, you can:</p>
    <ul>
      <li>Create powerful AI agents for your business</li>
      <li>Train them with your own data</li>
      <li>Deploy them across multiple platforms</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardUrl}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Get Started Now</a>
    </div>
    <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
    <p>Best regards,<br>The Akii AI Team</p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p>© 2024 Akii AI. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> |
        <a href="{{privacyPolicyUrl}}" style="color: #666;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>`}
                />
              </div>

              <div className="space-y-2">
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{user.firstName}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{user.email}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{dashboardUrl}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{unsubscribeUrl}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{privacyPolicyUrl}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{companyName}"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    {"{currentDate}"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" /> Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>
                Configure global email settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-sender-name">
                    Default Sender Name
                  </Label>
                  <Input id="default-sender-name" defaultValue="Akii AI Team" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-sender-email">
                    Default Sender Email
                  </Label>
                  <Input
                    id="default-sender-email"
                    defaultValue="no-reply@akii.ai"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-to-email">Reply-To Email</Label>
                  <Input
                    id="reply-to-email"
                    defaultValue="support@akii.ai"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-footer">Default Email Footer</Label>
                  <Textarea
                    id="email-footer"
                    defaultValue="© 2024 Akii AI. All rights reserved."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Delivery</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Track Email Opens</p>
                      <p className="text-sm text-muted-foreground">
                        Track when recipients open emails
                      </p>
                    </div>
                    <Switch id="track-opens" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Track Link Clicks</p>
                      <p className="text-sm text-muted-foreground">
                        Track when recipients click links in emails
                      </p>
                    </div>
                    <Switch id="track-clicks" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Unsubscribe Link</p>
                      <p className="text-sm text-muted-foreground">
                        Include unsubscribe link in all marketing emails
                      </p>
                    </div>
                    <Switch id="unsubscribe-link" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Throttling</p>
                      <p className="text-sm text-muted-foreground">
                        Limit the number of emails sent per hour
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email-throttle"
                        type="number"
                        defaultValue="100"
                        className="w-[100px]"
                      />
                      <span className="text-sm text-muted-foreground">
                        per hour
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test & Preview</CardTitle>
              <CardDescription>
                Preview and send test emails to verify templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="test-template">Select Template</Label>
                <Select defaultValue="welcome">
                  <SelectTrigger id="test-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email Address</Label>
                <div className="flex space-x-2">
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1"
                  />
                  <Button>
                    <Send className="h-4 w-4 mr-2" /> Send Test
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Email Preview</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Desktop
                    </Button>
                    <Button variant="outline" size="sm">
                      Mobile
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-4 bg-white min-h-[400px] overflow-auto">
                  <div className="max-w-[600px] mx-auto">
                    <div className="text-center mb-4">
                      <div className="w-[150px] h-[40px] bg-primary/20 mx-auto mb-2"></div>
                    </div>
                    <h1 className="text-xl font-bold text-primary mb-4">
                      Welcome to Akii AI!
                    </h1>
                    <p className="mb-2">Hello John,</p>
                    <p className="mb-2">
                      Thank you for joining Akii AI! We're excited to have you
                      on board.
                    </p>
                    <p className="mb-2">With Akii AI, you can:</p>
                    <ul className="list-disc pl-5 mb-4">
                      <li>Create powerful AI agents for your business</li>
                      <li>Train them with your own data</li>
                      <li>Deploy them across multiple platforms</li>
                    </ul>
                    <div className="text-center my-6">
                      <button className="bg-primary text-white px-6 py-2 rounded">
                        Get Started Now
                      </button>
                    </div>
                    <p className="mb-2">
                      If you have any questions, feel free to reply to this
                      email or contact our support team.
                    </p>
                    <p className="mb-4">
                      Best regards,
                      <br />
                      The Akii AI Team
                    </p>
                    <div className="text-xs text-muted-foreground text-center border-t pt-4 mt-6">
                      <p>© 2024 Akii AI. All rights reserved.</p>
                      <p className="mt-1">
                        <a href="#" className="text-muted-foreground underline">
                          Unsubscribe
                        </a>{" "}
                        |
                        <a
                          href="#"
                          className="text-muted-foreground underline ml-1"
                        >
                          Privacy Policy
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmailTemplates;

const Save = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
};
