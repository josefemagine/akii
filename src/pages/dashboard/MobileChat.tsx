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
import { Smartphone, Settings, BarChart3, Code, AppWindow } from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Slider } from "@/components/ui/slider.tsx";

export default function MobileChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [agentStatus, setAgentStatus] = useState("draft"); // draft, active
  const [userCount, setUserCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed mobile chat
    const isDeployed = localStorage.getItem("mobileChatDeployed") === "true";

    if (isDeployed) {
      setAgentStatus("active");
      setUserCount(867);
      setConversationCount(523);
      setSatisfactionRate(88);
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mobile Chat Agent</h1>
        <p className="text-muted-foreground">
          Integrate AI chat capabilities into your iOS and Android mobile applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Mobile Agent Status
            </CardTitle>
            <CardDescription>
              Current status of your mobile chat deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {agentStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 hover:dark:bg-amber-900/30"
                >
                  Not Deployed
                </Badge>
              )}
              {agentStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100 hover:dark:bg-green-900/30"
                >
                  Deployed
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Users</span>
                <span className="text-sm font-medium">{userCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversations
                </span>
                <span className="text-sm font-medium">{conversationCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Satisfaction
                </span>
                <span className="text-sm font-medium">{satisfactionRate}%</span>
              </div>
              {agentStatus === "active" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setActiveTab("setup")}
                  >
                    Edit Configuration
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Mobile Preview</CardTitle>
            <CardDescription>
              Preview how your mobile chat will appear in your app
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[240px] h-[480px] bg-white dark:bg-gray-900 rounded-3xl border-8 border-gray-800 overflow-hidden shadow-xl">
              <div className="h-6 bg-gray-800"></div>
              <div className="h-full bg-gray-100 dark:bg-gray-800 p-2">
                <div className="h-full bg-white dark:bg-gray-900 rounded-lg flex flex-col">
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-xs font-medium">Akii Mobile Chat</span>
                  </div>
                  <div className="flex-1 p-2 flex flex-col">
                    <div className="bg-primary/10 self-start rounded-lg p-2 mb-2 max-w-[80%]">
                      <p className="text-[10px]">Hi there! How can I help you today?</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 self-end rounded-lg p-2 mb-2 max-w-[80%]">
                      <p className="text-[10px]">I need help with my account</p>
                    </div>
                    <div className="bg-primary/10 self-start rounded-lg p-2 max-w-[80%]">
                      <p className="text-[10px]">I'd be happy to help with your account. What specific issue are you having?</p>
                    </div>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-6"></div>
                    <div className="ml-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    </div>
                  </div>
                </div>
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
            SDK Integration
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Chat Configuration</CardTitle>
              <CardDescription>
                Customize how your mobile chat agent looks and behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input id="agent-name" placeholder="Akii Mobile Assistant" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Input id="welcome-message" placeholder="Hi there! How can I help you today?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input id="primary-color" type="color" defaultValue="#4f46e5" className="w-12 h-9 p-1" />
                    <Input defaultValue="#4f46e5" className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform Support</Label>
                  <Select defaultValue="both">
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platforms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ios">iOS Only</SelectItem>
                      <SelectItem value="android">Android Only</SelectItem>
                      <SelectItem value="both">iOS & Android</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="history">Conversation History</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable conversation history storage
                      </p>
                    </div>
                    <Switch id="history" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="voice">Voice Input</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow voice commands and dictation
                      </p>
                    </div>
                    <Switch id="voice" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="files">File Attachments</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to send files and images
                      </p>
                    </div>
                    <Switch id="files" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications for new messages
                      </p>
                    </div>
                    <Switch id="push" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label htmlFor="memory">Memory Context (messages)</Label>
                      <span className="text-sm text-muted-foreground">10</span>
                    </div>
                    <Slider defaultValue={[10]} max={50} step={1} id="memory" />
                    <p className="text-sm text-muted-foreground">
                      Number of previous messages to include for context
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button onClick={() => setAgentStatus("active")}>
                  {agentStatus === "active" ? "Update Configuration" : "Deploy Mobile Chat"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Track engagement and performance of your mobile chat agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userCount}</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{conversationCount}</div>
                      <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{satisfactionRate}%</div>
                      <p className="text-xs text-muted-foreground">+2% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Platform Distribution</h3>
                  <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics charts will appear here once your agent is active</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Top User Queries</h3>
                  <Card>
                    <div className="divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">How do I reset my password?</span>
                        <Badge variant="secondary">18%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">What are your business hours?</span>
                        <Badge variant="secondary">14%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">How do I track my order?</span>
                        <Badge variant="secondary">11%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Can I change my subscription?</span>
                        <Badge variant="secondary">9%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">How do I contact support?</span>
                        <Badge variant="secondary">7%</Badge>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integration" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SDK Integration</CardTitle>
              <CardDescription>
                Instructions for integrating the chat agent into your mobile applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">iOS Integration</h3>
                  <div className="bg-muted rounded-md p-4">
                    <p className="text-sm mb-2">1. Add the SDK to your project via Swift Package Manager:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`// Package.swift
dependencies: [
    .package(url: "https://github.com/akii/mobile-chat-ios.git", from: "1.0.0")
]`}
                    </pre>
                    
                    <p className="text-sm mt-4 mb-2">2. Initialize the SDK in your app:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`import AkiiMobileChat

// In your AppDelegate or SceneDelegate
AkiiMobileChat.initialize(
    apiKey: "${agentStatus === "active" ? "ak_" + Math.random().toString(36).substring(2, 15) : "YOUR_API_KEY"}",
    agentId: "${agentStatus === "active" ? "mc_" + Math.random().toString(36).substring(2, 10) : "YOUR_AGENT_ID"}"
)`}
                    </pre>
                    
                    <p className="text-sm mt-4 mb-2">3. Present the chat UI:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`// In your view controller
let chatViewController = AkiiChatViewController()
present(chatViewController, animated: true)`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Android Integration</h3>
                  <div className="bg-muted rounded-md p-4">
                    <p className="text-sm mb-2">1. Add the dependency to your build.gradle:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`// build.gradle
dependencies {
    implementation 'ai.akii:mobile-chat:1.0.0'
}`}
                    </pre>
                    
                    <p className="text-sm mt-4 mb-2">2. Initialize the SDK in your Application class:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`// In your Application class
AkiiMobileChat.initialize(
    context,
    "${agentStatus === "active" ? "ak_" + Math.random().toString(36).substring(2, 15) : "YOUR_API_KEY"}",
    "${agentStatus === "active" ? "mc_" + Math.random().toString(36).substring(2, 10) : "YOUR_AGENT_ID"}"
);`}
                    </pre>
                    
                    <p className="text-sm mt-4 mb-2">3. Launch the chat activity:</p>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                      {`// In your activity
Intent intent = new Intent(this, AkiiChatActivity.class);
startActivity(intent);`}
                    </pre>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Download Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 