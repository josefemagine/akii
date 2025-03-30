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
import { ShoppingBag, Settings, BarChart3, Code } from "lucide-react";
import ShopifySetup from "@/components/dashboard/shopify/ShopifySetup";
import ShopifyAnalytics from "@/components/dashboard/shopify/ShopifyAnalytics";
import ShopifyPreview from "@/components/dashboard/shopify/ShopifyPreview";

export default function ShopifyChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [chatStatus, setChatStatus] = useState("draft"); // draft, active
  const [visitorCount, setVisitorCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed chat
    const isDeployed = localStorage.getItem("shopifyChatDeployed") === "true";

    if (isDeployed) {
      setChatStatus("active");
      setVisitorCount(876);
      setConversationCount(245);
      setConversionRate(18.5);
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Shopify AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Help customers find products, answer questions, and track orders on
          your Shopify store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Shopify Integration Status
            </CardTitle>
            <CardDescription>
              Current status of your Shopify AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {chatStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  Draft
                </Badge>
              )}
              {chatStatus === "active" && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 hover:bg-green-100"
                >
                  Active
                </Badge>
              )}
            </div>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Store Visitors
                </span>
                <span className="text-sm font-medium">{visitorCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversations
                </span>
                <span className="text-sm font-medium">{conversationCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Conversion Rate
                </span>
                <span className="text-sm font-medium">{conversionRate}%</span>
              </div>
              {chatStatus === "active" && (
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
            <CardTitle className="text-lg font-medium">Preview</CardTitle>
            <CardDescription>
              See how your AI assistant will appear on your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 rounded-md relative overflow-hidden">
            <ShopifyPreview
              chatName="Shop Assistant"
              welcomeMessage="Hello! How can I help you find the perfect product today?"
              primaryColor="#4f46e5"
              position="bottom-right"
              agentName="Shop AI"
            />
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
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Integration Code
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setup" className="mt-6">
          <ShopifySetup />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <ShopifyAnalytics />
        </TabsContent>
        <TabsContent value="code" className="mt-6">
          <Card className="w-full bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Integration Code
              </CardTitle>
              <CardDescription>
                Add this code to your Shopify theme to integrate the AI
                assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="text-sm font-medium mb-2">
                    Shopify Theme Code
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add this code to your Shopify theme's theme.liquid file just
                    before the closing &lt;/body&gt; tag.
                  </p>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                    {`{% if content_for_header contains 'Shopify.AnalyticsPayload' %}
  <script>
    (function(w, d, s, o, f, js, fjs) {
      w['AkiiShopify'] = o;
      w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
      js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
      js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'akii', 'https://shopify.akii.com/loader.js'));
    
    akii('init', {
      shopId: '${chatStatus === "active" ? "shop_" + Math.random().toString(36).substring(2, 10) : "YOUR_SHOP_ID"}',
      position: 'bottom-right',
      primaryColor: '#4f46e5',
      welcomeMessage: 'Hello! How can I help you find the perfect product today?'
    });
  </script>
{% endif %}`}
                  </pre>
                  <Button className="mt-4" variant="secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    Copy Code
                  </Button>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h3 className="text-sm font-medium mb-2">JavaScript API</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Control the AI assistant programmatically using these
                    methods.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md overflow-x-auto text-xs">
                      <code>akii('open');</code> - Open the chat widget
                    </div>
                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md overflow-x-auto text-xs">
                      <code>akii('close');</code> - Close the chat widget
                    </div>
                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md overflow-x-auto text-xs">
                      <code>akii('toggle');</code> - Toggle the chat widget
                    </div>
                    <div className="bg-slate-950 text-slate-50 p-2 rounded-md overflow-x-auto text-xs">
                      <code>
                        akii('setCustomer', &#123; id: 'cust123', name: 'John
                        Doe', email: 'john@example.com' &#125;);
                      </code>{" "}
                      - Set customer information
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-amber-50">
                  <div className="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500 mr-2"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        Important Note
                      </h3>
                      <p className="text-xs text-amber-700 mt-1">
                        Make sure to deploy your Shopify integration before
                        adding the code to your theme. The AI assistant will not
                        work until it's deployed from the Setup tab.
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
}
