import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { PhoneIcon, SendIcon, BookOpenIcon, SettingsIcon } from "lucide-react";

export default function WhatsAppChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [agentStatus, setAgentStatus] = useState<"draft" | "active">("draft");
  const [userCount, setUserCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timeout = setTimeout(() => {
      // Check if WhatsApp chat is deployed (simulate from localStorage)
      const isDeployed = localStorage.getItem("whatsapp_chat_deployed") === "true";
      
      if (isDeployed) {
        setAgentStatus("active");
        setUserCount(128);
        setMessageCount(546);
        setResponseRate(94);
        setPhoneNumber("+1 (555) 123-4567");
      }
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleConnect = () => {
    setLoading(true);
    
    // Simulate deployment process
    setTimeout(() => {
      setAgentStatus("active");
      setUserCount(1);
      setMessageCount(0);
      setResponseRate(0);
      localStorage.setItem("whatsapp_chat_deployed", "true");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Chat Agent</h1>
        <p className="text-muted-foreground">
          Connect your business WhatsApp number to an AI-powered assistant that responds to customer inquiries 24/7.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Integration</CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">WhatsApp Business API</div>
            {agentStatus === "active" && (
              <div className="text-xs text-muted-foreground">
                Connected to: {phoneNumber}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Users</div>
                <div className="text-xl font-bold">{userCount}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Messages</div>
                <div className="text-xl font-bold">{messageCount}</div>
              </div>
              <div className="col-span-1">
                <div className="text-xs text-muted-foreground">Response Rate</div>
                <div className="text-xl font-bold">{responseRate}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted p-3 dark:bg-muted/50">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <PhoneIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted-foreground/20 p-2">
                    <p className="text-sm">Hi, I'm interested in your product. Can you tell me more?</p>
                  </div>
                </div>
                <div className="flex items-start justify-end space-x-3">
                  <div className="rounded-lg bg-primary p-2">
                    <p className="text-sm text-primary-foreground">
                      Hello! I'd be happy to tell you more about our products. What specific information are you looking for?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="whatsapp-business">WhatsApp Business Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Connect Your WhatsApp Business Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">WhatsApp Business Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    placeholder="+1 (555) 123-4567" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={agentStatus === "active"}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the phone number associated with your WhatsApp Business account.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="webhook" 
                      value="https://api.yourdomain.com/webhooks/whatsapp" 
                      readOnly
                    />
                    <Button variant="outline" size="sm">
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this webhook URL in your WhatsApp Business API settings.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={handleConnect}
                    disabled={loading || agentStatus === "active" || !phoneNumber}
                  >
                    {loading ? "Connecting..." : agentStatus === "active" ? "Connected" : "Connect WhatsApp"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{messageCount}</div>
                        <p className="text-xs text-muted-foreground">+24% from last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{responseRate}%</div>
                        <p className="text-xs text-muted-foreground">+3% from last month</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h3 className="text-sm font-medium mb-2">Common User Inquiries</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Product Information</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Order Status</span>
                        <span className="text-sm font-medium">28%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Support Issues</span>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Pricing Questions</span>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whatsapp-business">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business Setup Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Step 1: Register for WhatsApp Business API</h3>
                  <p className="text-sm text-muted-foreground">
                    Visit the Meta Business Platform to register your business for the WhatsApp Business API.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Step 2: Set Up Webhooks</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your WhatsApp Business API to use our webhook URL: 
                    <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">
                      https://api.yourdomain.com/webhooks/whatsapp
                    </code>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Step 3: Configure Message Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and submit message templates for approval in the WhatsApp Business Manager.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Step 4: Test Your Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a test message to your WhatsApp Business number to verify the integration.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline">
                    <BookOpenIcon className="mr-2 h-4 w-4" />
                    View Full Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 