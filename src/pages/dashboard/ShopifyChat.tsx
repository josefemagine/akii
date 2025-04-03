import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Settings, BarChart3, Code, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ShopifyChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [agentStatus, setAgentStatus] = useState("draft"); // draft, active
  const [visitorCount, setVisitorCount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [shopifyStore, setShopifyStore] = useState("");

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed Shopify chat
    const isDeployed = localStorage.getItem("shopifyChatDeployed") === "true";

    if (isDeployed) {
      setAgentStatus("active");
      setVisitorCount(856);
      setConversionRate(15);
      setShopifyStore("akii-demo-store.myshopify.com");
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Shopify Chat Agent</h1>
        <p className="text-muted-foreground">
          Enhance your Shopify store with AI-powered customer support and sales assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Shopify Integration Status
            </CardTitle>
            <CardDescription>
              Current status of your Shopify store integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {agentStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 hover:dark:bg-amber-900/30"
                >
                  Not Connected
                </Badge>
              )}
              {agentStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-100 hover:dark:bg-green-900/30"
                >
                  Connected
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              {shopifyStore && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shopify Store</span>
                  <span className="text-sm font-medium">{shopifyStore}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Store Visitors</span>
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
            <CardTitle className="text-lg font-medium">Shopify Chat Preview</CardTitle>
            <CardDescription>
              Preview how your AI chat will appear on your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <div className="absolute bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="h-16 bg-[#5c6ac4] flex items-center px-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#5c6ac4]">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  <div>
                    <span className="text-white font-medium block">Akii Assistant</span>
                    <span className="text-white text-opacity-80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-88px)] bg-gray-50 dark:bg-gray-800 p-4 flex flex-col overflow-y-auto space-y-3">
                <div className="self-start bg-white dark:bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-sm border border-gray-100 dark:border-gray-600">
                  <p className="text-sm">👋 Hello! Welcome to our store. How can I help you today?</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:21 AM</p>
                </div>
                <div className="self-end bg-[#5c6ac4] p-3 rounded-lg max-w-[80%] shadow-sm">
                  <p className="text-sm text-white">Do you have the blue t-shirt in size large?</p>
                  <p className="text-[10px] text-white text-opacity-80 text-right mt-1">10:22 AM</p>
                </div>
                <div className="self-start bg-white dark:bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-sm border border-gray-100 dark:border-gray-600">
                  <p className="text-sm">Let me check that for you. Yes, we do have the Classic Blue T-shirt in size large. There are 5 currently in stock. Would you like to add it to your cart?</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:22 AM</p>
                </div>
              </div>
              <div className="h-16 bg-white dark:bg-gray-900 border-t dark:border-gray-700 flex items-center gap-2 px-4">
                <Input className="flex-1" placeholder="Type your question..." />
                <Button size="sm" className="bg-[#5c6ac4] hover:bg-[#4959bd]">
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
            Store Integration
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shopify Store Integration</CardTitle>
              <CardDescription>
                Connect your Shopify store to enable AI-powered chat functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {agentStatus === "draft" ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 rounded-md">
                    <p className="text-sm">
                      To integrate with your Shopify store, you'll need to install our app from the Shopify App Store
                      and complete the setup process.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="rounded-md border dark:border-gray-700 p-4">
                      <h3 className="text-base font-medium">Step 1: Install the Akii Shopify App</h3>
                      <ol className="mt-2 space-y-2 text-sm text-muted-foreground ml-5 list-decimal">
                        <li>Go to the <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Akii App on Shopify App Store</a></li>
                        <li>Click "Add app" and follow the installation steps</li>
                        <li>Accept the permissions required</li>
                      </ol>
                    </div>
                    
                    <div className="rounded-md border dark:border-gray-700 p-4">
                      <h3 className="text-base font-medium">Step 2: Connect Your Store</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        After installing the app, enter your Shopify store URL below to connect your store to Akii.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="shop-url">Shopify Store URL</Label>
                      <div className="flex">
                        <Input id="shop-url" placeholder="your-store" className="rounded-r-none" />
                        <div className="flex items-center bg-muted px-3 rounded-r-md border border-l-0 border-input">
                          .myshopify.com
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Your Shopify store's URL (e.g., your-store.myshopify.com)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input id="api-key" type="password" placeholder="••••••••••••••••••••" />
                      <p className="text-xs text-muted-foreground">Available in your Shopify admin under Apps {'->'} Akii {'->'} API Access</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-secret">API Secret Key</Label>
                      <Input id="api-secret" type="password" placeholder="••••••••••••••••••••" />
                      <p className="text-xs text-muted-foreground">Available in your Shopify admin under Apps {'->'} Akii {'->'} API Access</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button onClick={() => {
                      setAgentStatus("active");
                      setShopifyStore("akii-demo-store.myshopify.com");
                    }}>
                      Connect Store
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
                    <p className="text-sm">Your Shopify store is connected and the chat widget is active.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Store Name</Label>
                      <Input id="shop-name" defaultValue="Akii Demo Store" />
                      <p className="text-xs text-muted-foreground">The name displayed in the chat widget</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chat-theme">Chat Theme</Label>
                      <Select defaultValue="default">
                        <SelectTrigger id="chat-theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default (Shopify Blue)</SelectItem>
                          <SelectItem value="dark">Dark Mode</SelectItem>
                          <SelectItem value="light">Light Mode</SelectItem>
                          <SelectItem value="custom">Custom (Brand Colors)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="greeting-message">Greeting Message</Label>
                      <Textarea id="greeting-message" defaultValue="👋 Hello! Welcome to our store. How can I help you today?" className="resize-none h-24" />
                      <p className="text-xs text-muted-foreground">First message visitors see when opening the chat</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="away-message">Away Message</Label>
                      <Textarea id="away-message" defaultValue="Thanks for your message! We're currently away, but our AI assistant can help you with many questions, or we'll respond when we're back online." className="resize-none h-24" />
                      <p className="text-xs text-muted-foreground">Shown when outside of business hours (if enabled)</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Chat Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="product-recommendations">Product Recommendations</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow AI to suggest products based on conversation
                          </p>
                        </div>
                        <Switch id="product-recommendations" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="cart-management">Cart Management</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow AI to add products to customer's cart
                          </p>
                        </div>
                        <Switch id="cart-management" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="order-tracking">Order Tracking</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to track orders via chat
                          </p>
                        </div>
                        <Switch id="order-tracking" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="human-handoff">Human Handoff</Label>
                          <p className="text-sm text-muted-foreground">
                            Transfer complex conversations to human agents
                          </p>
                        </div>
                        <Switch id="human-handoff" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="business-hours">Business Hours Only</Label>
                          <p className="text-sm text-muted-foreground">
                            Show different message outside business hours
                          </p>
                        </div>
                        <Switch id="business-hours" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-popup">Auto Popup</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically open chat after page load delay
                          </p>
                        </div>
                        <Switch id="auto-popup" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="destructive" onClick={() => {
                      setAgentStatus("draft");
                      setShopifyStore("");
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
              <CardTitle>Shopify Chat Analytics</CardTitle>
              <CardDescription>
                Track engagement and conversion metrics for your store's chat integration
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
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{conversionRate}%</div>
                      <p className="text-xs text-muted-foreground">+3% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Revenue Attributed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$12,450</div>
                      <p className="text-xs text-muted-foreground">+22% from last month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Chat Engagement</h3>
                  <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground">Engagement analytics chart will appear here</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Top Customer Inquiries</h3>
                  <Card>
                    <div className="divide-y">
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Product Availability</span>
                        <Badge variant="secondary">34%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Shipping Information</span>
                        <Badge variant="secondary">26%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Product Recommendations</span>
                        <Badge variant="secondary">18%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Order Status</span>
                        <Badge variant="secondary">14%</Badge>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium">Returns & Refunds</span>
                        <Badge variant="secondary">8%</Badge>
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
              <CardTitle>Store Integration</CardTitle>
              <CardDescription>
                Configure where and how the chat widget appears on your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 rounded-md flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p className="text-sm">Chat widget is installed and active on your Shopify store.</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Widget Placement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="widget-position">Widget Position</Label>
                    <Select defaultValue="bottom-right">
                      <SelectTrigger id="widget-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="display-pages">Display Pages</Label>
                    <Select defaultValue="all">
                      <SelectTrigger id="display-pages">
                        <SelectValue placeholder="Select pages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pages</SelectItem>
                        <SelectItem value="home">Home Page Only</SelectItem>
                        <SelectItem value="products">Product Pages Only</SelectItem>
                        <SelectItem value="collection">Collection Pages Only</SelectItem>
                        <SelectItem value="cart">Cart Page Only</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile-display">Mobile Display</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger id="mobile-display">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled (Full)</SelectItem>
                        <SelectItem value="compact">Enabled (Compact)</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chat-icon">Chat Icon</Label>
                    <Select defaultValue="default">
                      <SelectTrigger id="chat-icon">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Chat Icon</SelectItem>
                        <SelectItem value="assistant">AI Assistant</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="custom">Custom Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Chat Button</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input id="button-text" defaultValue="Chat with us" />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="button-color">Button Color</Label>
                    <div className="flex gap-2">
                      <Input id="button-color" defaultValue="#5c6ac4" />
                      <div className="h-10 w-10 rounded bg-[#5c6ac4] border"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom Code</h3>
                
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 rounded-md">
                  <p className="text-sm">
                    Advanced users: If you need to customize the widget's placement or behavior beyond the options above, 
                    you can use the custom code options below.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-css">Custom CSS</Label>
                  <Textarea id="custom-css" className="font-mono text-sm h-32" placeholder="/* Add your custom CSS here */" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-js">Custom JavaScript</Label>
                  <Textarea id="custom-js" className="font-mono text-sm h-32" placeholder="// Add your custom JavaScript here" />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">
                  Reset to Default
                </Button>
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
