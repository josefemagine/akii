import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { MessageSquare, Settings, BarChart3, Code } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

export default function WordPressChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [agentStatus, setAgentStatus] = useState("draft"); // draft, active
  const [visitorCount, setVisitorCount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [siteUrl, setSiteUrl] = useState("");

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed WordPress chat
    const isDeployed = localStorage.getItem("wordpressChatDeployed") === "true";

    if (isDeployed) {
      setAgentStatus("active");
      setVisitorCount(742);
      setConversionRate(12);
      setSiteUrl("demo.akii-wordpress.com");
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">WordPress Chat Agent</h1>
        <p className="text-muted-foreground">
          Add AI-powered chat to your WordPress site to engage visitors and increase conversions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              WordPress Integration Status
            </CardTitle>
            <CardDescription>
              Current status of your WordPress site integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {agentStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Not Connected
                </Badge>
              )}
              {agentStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Connected
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {siteUrl && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">WordPress Site</span>
                  <span className="text-sm font-medium">{siteUrl}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Visitors</span>
                <span className="text-sm font-medium">{visitorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversion Rate
                </span>
                <span className="text-sm font-medium">{conversionRate}%</span>
              </div>
              {agentStatus === "active" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("setup")}
                  >
                    Manage Integration
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">WordPress Chat Preview</CardTitle>
            <CardDescription>
              Preview how your AI chat will appear on your WordPress site
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <div className="absolute bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="h-16 bg-[#21759b] flex items-center px-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#21759b]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-medium block">Akii Chatbot</span>
                    <span className="text-white text-opacity-80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-88px)] bg-gray-50 dark:bg-gray-800 p-4 flex flex-col overflow-y-auto space-y-3">
                <div className="self-start bg-white dark:bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-sm border border-gray-100 dark:border-gray-600">
                  <p className="text-sm">👋 Hello! How can I help you with your WordPress site today?</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:21 AM</p>
                </div>
                <div className="self-end bg-[#21759b] p-3 rounded-lg max-w-[80%] shadow-sm">
                  <p className="text-sm text-white">How do I add a new blog post?</p>
                  <p className="text-[10px] text-white text-opacity-80 text-right mt-1">10:22 AM</p>
                </div>
                <div className="self-start bg-white dark:bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-sm border border-gray-100 dark:border-gray-600">
                  <p className="text-sm">To add a new blog post, log in to your WordPress dashboard, click on "Posts" in the left menu, then click "Add New". You can then enter your title, content, add images, and publish when ready!</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:22 AM</p>
                </div>
              </div>
              <div className="h-16 bg-white dark:bg-gray-900 border-t dark:border-gray-700 flex items-center gap-2 px-4">
                <Input className="flex-1" placeholder="Type your question..." />
                <Button size="sm" className="bg-[#21759b] hover:bg-[#135e7c]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup & Configuration
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Plugin & Shortcodes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>WordPress Integration</CardTitle>
              <CardDescription>
                Connect your WordPress site to enable AI-powered chat functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {agentStatus === "draft" ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-md">
                    <p className="text-sm">
                      To integrate with your WordPress site, you need to install our plugin and configure it with your API key.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border dark:border-gray-700 p-4">
                      <h3 className="text-base font-medium">Step 1: Install the Akii WordPress Plugin</h3>
                      <ol className="mt-2 space-y-2 text-sm text-muted-foreground ml-5 list-decimal">
                        <li>Download the Akii WordPress plugin from the <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">WordPress Plugin Directory</a></li>
                        <li>Upload and activate the plugin in your WordPress admin panel</li>
                        <li>Navigate to the Akii settings page in your WordPress admin</li>
                      </ol>
                    </div>
                    
                    <div className="rounded-md border dark:border-gray-700 p-4">
                      <h3 className="text-base font-medium">Step 2: Connect Your Site</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        After installing the plugin, enter your website URL and API key below to connect.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site-url">WordPress Site URL</Label>
                      <Input id="site-url" placeholder="https://yourdomain.com" />
                      <p className="text-xs text-muted-foreground">The full URL of your WordPress site</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" placeholder="••••••••••••••••••••" />
                      <p className="text-xs text-muted-foreground">Find this in your Akii dashboard under API Keys</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={() => {
                      setAgentStatus("active");
                      setSiteUrl("demo.akii-wordpress.com");
                    }}>
                      Connect Site
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <p className="text-sm">Your WordPress site is connected and the chat widget is active.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="chat-title">Chat Widget Title</Label>
                      <Input id="chat-title" defaultValue="Akii Chatbot" />
                      <p className="text-xs text-muted-foreground">The title displayed in the chat header</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chat-theme">Chat Theme</Label>
                      <Select defaultValue="wp-default">
                        <SelectTrigger id="chat-theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wp-default">WordPress Default</SelectItem>
                          <SelectItem value="dark">Dark Mode</SelectItem>
                          <SelectItem value="light">Light Mode</SelectItem>
                          <SelectItem value="custom">Match Site Theme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="greeting-message">Greeting Message</Label>
                      <Textarea id="greeting-message" defaultValue="👋 Hello! How can I help you with your WordPress site today?" className="resize-none h-24" />
                      <p className="text-xs text-muted-foreground">First message visitors see when opening the chat</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prompt-context">Knowledge Context</Label>
                      <Select defaultValue="wp-docs">
                        <SelectTrigger id="prompt-context">
                          <SelectValue placeholder="Select context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wp-docs">WordPress Documentation</SelectItem>
                          <SelectItem value="site-content">Your Site Content</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="custom">Custom Knowledge Base</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">What the AI should know about to help users</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">WordPress Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="site-search">Site Search Integration</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow AI to search your site content for answers
                          </p>
                        </div>
                        <Switch id="site-search" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="woocommerce">WooCommerce Support</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable product recommendations and cart help
                          </p>
                        </div>
                        <Switch id="woocommerce" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="post-comments">Post Comments</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow users to leave comments via chat
                          </p>
                        </div>
                        <Switch id="post-comments" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="contact-form">Contact Form</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable contact form submission via chat
                          </p>
                        </div>
                        <Switch id="contact-form" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="destructive" onClick={() => {
                      setAgentStatus("draft");
                      setSiteUrl("");
                    }}>
                      Disconnect
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>WordPress Chat Analytics</CardTitle>
              <CardDescription>
                Track engagement and performance metrics for your WordPress integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Visitors Engaged</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{visitorCount}</div>
                      <p className="text-xs text-muted-foreground">+9% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{conversionRate}%</div>
                      <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Avg. Session Length</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3:24</div>
                      <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Popular Pages with Chat</h3>
                  <Card>
                    <div className="divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Homepage</span>
                        <Badge variant="secondary">42%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Blog Posts</span>
                        <Badge variant="secondary">26%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Product Pages</span>
                        <Badge variant="secondary">18%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Contact Page</span>
                        <Badge variant="secondary">8%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">About Page</span>
                        <Badge variant="secondary">6%</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plugin & Shortcodes</CardTitle>
              <CardDescription>
                Advanced integration options for your WordPress site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Shortcodes</h3>
                <p className="text-sm text-muted-foreground">
                  Use these shortcodes to add the chat widget to specific locations on your site.
                </p>
                
                <Card className="border-dashed">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Basic Chat Widget</h4>
                      <div className="flex">
                        <Input readOnly value="[akii_chat]" className="font-mono rounded-r-none" />
                        <Button variant="secondary" className="rounded-l-none">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Add the default chat widget to any page or post</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Inline Chat</h4>
                      <div className="flex">
                        <Input readOnly value="[akii_chat type=&quot;inline&quot; height=&quot;400px&quot;]" className="font-mono rounded-r-none" />
                        <Button variant="secondary" className="rounded-l-none">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Embed an inline chat box within your content</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">FAQ Widget</h4>
                      <div className="flex">
                        <Input readOnly value="[akii_faq topic=&quot;general&quot;]" className="font-mono rounded-r-none" />
                        <Button variant="secondary" className="rounded-l-none">
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Add an AI-powered FAQ section with common questions and answers</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Plugin Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Access advanced plugin settings and check your integration status.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Plugin Version</p>
                    <Badge variant="outline">v2.1.4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Connection Status</p>
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Data Sync</p>
                    <Badge variant="outline">Last sync: Today at 10:42 AM</Badge>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline">
                    Check for Updates
                  </Button>
                  <Button>
                    Open Plugin Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 