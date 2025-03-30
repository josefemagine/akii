import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash,
  Upload,
} from "lucide-react";

const leadMagnets = [
  {
    id: "lm1",
    name: "10 Steps to Boosting Sales with AI Chatbots",
    type: "PDF Guide",
    status: "active",
    conversions: 245,
    impressions: 1250,
    lastUpdated: "2024-05-15",
  },
  {
    id: "lm2",
    name: "AI Customer Service Automation Checklist",
    type: "Checklist",
    status: "active",
    conversions: 187,
    impressions: 890,
    lastUpdated: "2024-05-10",
  },
  {
    id: "lm3",
    name: "The Future of AI in Business: 2024 Trends Report",
    type: "Report",
    status: "active",
    conversions: 312,
    impressions: 1580,
    lastUpdated: "2024-04-28",
  },
  {
    id: "lm4",
    name: "5 Case Studies: How AI Chatbots Increased Conversion Rates",
    type: "Case Studies",
    status: "draft",
    conversions: 0,
    impressions: 0,
    lastUpdated: "2024-05-18",
  },
];

const AdminLeadMagnets = () => {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lead Magnets</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create Lead Magnet
        </Button>
      </div>

      <Tabs defaultValue="magnets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="magnets">Lead Magnets</TabsTrigger>
          <TabsTrigger value="editor">Create/Edit</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="magnets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Lead Magnets</CardTitle>
                  <CardDescription>
                    Manage your lead generation content
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="search"
                    placeholder="Search lead magnets..."
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
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Conversions</th>
                      <th className="text-left p-3">Conv. Rate</th>
                      <th className="text-left p-3">Last Updated</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadMagnets.map((magnet) => (
                      <tr
                        key={magnet.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{magnet.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{magnet.type}</td>
                        <td className="p-3">
                          <Badge
                            className={`${magnet.status === "active" ? "bg-green-500" : magnet.status === "draft" ? "bg-yellow-500" : "bg-gray-500"}`}
                          >
                            {magnet.status.charAt(0).toUpperCase() +
                              magnet.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="p-3">{magnet.conversions}</td>
                        <td className="p-3">
                          {magnet.impressions > 0
                            ? `${((magnet.conversions / magnet.impressions) * 100).toFixed(1)}%`
                            : "N/A"}
                        </td>
                        <td className="p-3">{magnet.lastUpdated}</td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
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
              <CardTitle>Create Lead Magnet</CardTitle>
              <CardDescription>
                Create or edit a lead magnet to capture leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="magnet-name">Lead Magnet Name</Label>
                  <Input
                    id="magnet-name"
                    placeholder="Enter a descriptive name"
                    defaultValue="10 Steps to Boosting Sales with AI Chatbots"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="magnet-type">Type</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger id="magnet-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Guide</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="case-study">Case Study</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="webinar">Webinar Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="magnet-description">Description</Label>
                <Textarea
                  id="magnet-description"
                  placeholder="Enter a description of your lead magnet"
                  defaultValue="Learn how to boost your sales by up to 67% using AI chatbots with this comprehensive guide. Perfect for businesses looking to leverage AI for customer engagement and conversion optimization."
                />
              </div>

              <div className="space-y-2">
                <Label>Lead Magnet File</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-medium">
                      Upload your lead magnet file
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Input
                      type="file"
                      className="hidden"
                      id="lead-magnet-file"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="lead-magnet-file">Choose File</label>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">10-steps-ai-chatbots.pdf</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Form Fields</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">First Name</p>
                      <p className="text-sm text-muted-foreground">
                        Collect user's first name
                      </p>
                    </div>
                    <Switch id="field-first-name" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Last Name</p>
                      <p className="text-sm text-muted-foreground">
                        Collect user's last name
                      </p>
                    </div>
                    <Switch id="field-last-name" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">
                        Collect user's email (required)
                      </p>
                    </div>
                    <Switch id="field-email" defaultChecked disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Company Name</p>
                      <p className="text-sm text-muted-foreground">
                        Collect user's company name
                      </p>
                    </div>
                    <Switch id="field-company" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">
                        Collect user's phone number
                      </p>
                    </div>
                    <Switch id="field-phone" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Settings</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Delivery</p>
                      <p className="text-sm text-muted-foreground">
                        Send lead magnet via email
                      </p>
                    </div>
                    <Switch id="delivery-email" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Direct Download</p>
                      <p className="text-sm text-muted-foreground">
                        Allow immediate download after form submission
                      </p>
                    </div>
                    <Switch id="delivery-direct" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Add to Newsletter</p>
                      <p className="text-sm text-muted-foreground">
                        Add user to newsletter subscription
                      </p>
                    </div>
                    <Switch id="add-newsletter" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button>Save Lead Magnet</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Magnet Campaigns</CardTitle>
              <CardDescription>
                Configure how and where lead magnets are displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Homepage Popup</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Popup</p>
                        <p className="text-sm text-muted-foreground">
                          Show popup on homepage
                        </p>
                      </div>
                      <Switch id="enable-popup" defaultChecked />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="popup-lead-magnet">
                          Select Lead Magnet
                        </Label>
                        <Select defaultValue="lm1">
                          <SelectTrigger id="popup-lead-magnet">
                            <SelectValue placeholder="Select lead magnet" />
                          </SelectTrigger>
                          <SelectContent>
                            {leadMagnets.map((magnet) => (
                              <SelectItem key={magnet.id} value={magnet.id}>
                                {magnet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="popup-delay">
                          Popup Delay (seconds)
                        </Label>
                        <Input
                          id="popup-delay"
                          type="number"
                          defaultValue="5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="popup-headline">Popup Headline</Label>
                      <Input
                        id="popup-headline"
                        defaultValue="Boost Your Sales by 67% with AI Chatbots"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="popup-description">
                        Popup Description
                      </Label>
                      <Textarea
                        id="popup-description"
                        defaultValue="Enter your email to download our free guide on how to leverage AI chatbots to dramatically increase your sales and customer engagement."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="popup-button-text">Button Text</Label>
                      <Input
                        id="popup-button-text"
                        defaultValue="Get My Free Guide"
                      />
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Exit Intent Popup</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable Exit Intent</p>
                        <p className="text-sm text-muted-foreground">
                          Show popup when user tries to leave the site
                        </p>
                      </div>
                      <Switch id="enable-exit-intent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exit-lead-magnet">
                          Select Lead Magnet
                        </Label>
                        <Select defaultValue="lm2">
                          <SelectTrigger id="exit-lead-magnet">
                            <SelectValue placeholder="Select lead magnet" />
                          </SelectTrigger>
                          <SelectContent>
                            {leadMagnets.map((magnet) => (
                              <SelectItem key={magnet.id} value={magnet.id}>
                                {magnet.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exit-frequency">Show Frequency</Label>
                        <Select defaultValue="once-per-session">
                          <SelectTrigger id="exit-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once-per-session">
                              Once per session
                            </SelectItem>
                            <SelectItem value="once-per-day">
                              Once per day
                            </SelectItem>
                            <SelectItem value="once-per-week">
                              Once per week
                            </SelectItem>
                            <SelectItem value="always">Always</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Embedded Forms</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="embedded-lead-magnet">
                        Select Lead Magnet
                      </Label>
                      <Select defaultValue="lm1">
                        <SelectTrigger id="embedded-lead-magnet">
                          <SelectValue placeholder="Select lead magnet" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadMagnets.map((magnet) => (
                            <SelectItem key={magnet.id} value={magnet.id}>
                              {magnet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Embed Code</Label>
                      <div className="relative">
                        <Textarea
                          className="font-mono text-xs h-24"
                          readOnly
                          value={`<div id="akii-lead-magnet" data-id="lm1"></div>
<script src="https://akii.ai/js/lead-magnet.js"></script>`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Copy and paste this code into your website where you
                        want the lead magnet form to appear.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Magnet Analytics</CardTitle>
              <CardDescription>
                Track performance and conversion metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Total Impressions
                    </h3>
                    <p className="text-3xl font-bold mt-1">3,720</p>
                    <p className="text-sm text-green-600 mt-1">
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Total Conversions
                    </h3>
                    <p className="text-3xl font-bold mt-1">744</p>
                    <p className="text-sm text-green-600 mt-1">
                      +8.2% from last month
                    </p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Conversion Rate
                    </h3>
                    <p className="text-3xl font-bold mt-1">20.0%</p>
                    <p className="text-sm text-red-600 mt-1">
                      -2.1% from last month
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">
                    Performance by Lead Magnet
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Lead Magnet</th>
                        <th className="text-right p-2">Impressions</th>
                        <th className="text-right p-2">Conversions</th>
                        <th className="text-right p-2">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadMagnets.map((magnet) => (
                        <tr
                          key={magnet.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{magnet.name}</span>
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            {magnet.impressions}
                          </td>
                          <td className="p-2 text-right">
                            {magnet.conversions}
                          </td>
                          <td className="p-2 text-right">
                            {magnet.impressions > 0
                              ? `${((magnet.conversions / magnet.impressions) * 100).toFixed(1)}%`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Performance by Campaign</h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Campaign</th>
                        <th className="text-right p-2">Impressions</th>
                        <th className="text-right p-2">Conversions</th>
                        <th className="text-right p-2">Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="p-2">Homepage Popup</td>
                        <td className="p-2 text-right">1,850</td>
                        <td className="p-2 text-right">412</td>
                        <td className="p-2 text-right">22.3%</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="p-2">Exit Intent Popup</td>
                        <td className="p-2 text-right">980</td>
                        <td className="p-2 text-right">156</td>
                        <td className="p-2 text-right">15.9%</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="p-2">Embedded Forms</td>
                        <td className="p-2 text-right">890</td>
                        <td className="p-2 text-right">176</td>
                        <td className="p-2 text-right">19.8%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminLeadMagnets;
