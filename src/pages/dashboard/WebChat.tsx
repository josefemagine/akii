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
import WebChatSetup from "@/components/dashboard/web-chat/WebChatSetup.tsx";
import WebChatAnalytics from "@/components/dashboard/web-chat/WebChatAnalytics.tsx";
import WebChatPreview from "@/components/dashboard/web-chat/WebChatPreview.tsx";

export default function WebChat() {
  const [activeTab, setActiveTab] = useState("setup");
  const [chatStatus, setChatStatus] = useState("draft"); // draft, active
  const [visitorCount, setVisitorCount] = useState(0);
  const [conversationCount, setConversationCount] = useState(0);
  const [satisfactionRate, setSatisfactionRate] = useState(0);

  // Simulate loading data
  useState(() => {
    // Check if we have a deployed chat
    const isDeployed = localStorage.getItem("webChatDeployed") === "true";

    if (isDeployed) {
      setChatStatus("active");
      setVisitorCount(1245);
      setConversationCount(387);
      setSatisfactionRate(92);
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Web Chat Agent</h1>
        <p className="text-muted-foreground">
          Add your AI to any website with an embeddable chat widget.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Web Chat Status
            </CardTitle>
            <CardDescription>
              Current status of your web chat deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {chatStatus === "draft" && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 hover:bg-amber-100 hover:dark:bg-amber-900/30"
                >
                  Not Deployed
                </Badge>
              )}
              {chatStatus === "active" && (
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
                <span className="text-sm text-muted-foreground">Visitors</span>
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
                  Satisfaction
                </span>
                <span className="text-sm font-medium">{satisfactionRate}%</span>
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
              See how your web chat will appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 bg-gray-100 dark:bg-gray-800 rounded-md relative overflow-hidden">
            <WebChatPreview
              chatName="Akii Support"
              welcomeMessage="Hello! I'm your AI assistant. How can I help you today?"
              primaryColor="#4f46e5"
              position="bottom-right"
              agentName="Akii Assistant"
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
          <WebChatSetup />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <WebChatAnalytics />
        </TabsContent>
        <TabsContent value="code" className="mt-6">
          <Card className="w-full shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Integration Code
              </CardTitle>
              <CardDescription>
                Add this code to your website to embed the chat widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="text-sm font-medium mb-2">
                    Website Embed Code
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add this code to your website before the closing
                    &lt;/body&gt; tag.
                  </p>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto text-xs">
                    {`<script>
  (function(w, d, s, o, f, js, fjs) {
    w['AkiiWebChat'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'akii', 'https://chat.akii.com/loader.js'));
  
  akii('init', {
    chatId: '${chatStatus === "active" ? "wc_" + Math.random().toString(36).substring(2, 10) : "YOUR_CHAT_ID"}',
    position: 'bottom-right',
    primaryColor: '#4f46e5',
    welcomeMessage: 'Hello! I\'m your AI assistant. How can I help you today?'
  });
</script>`}
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
                    Control the chat widget programmatically using these
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
                        akii('setUser', &#123; id: 'user123', name: 'John Doe',
                        email: 'john@example.com' &#125;);
                      </code>{" "}
                      - Set user information
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700">
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
                      className="text-amber-500 dark:text-amber-400 mr-2"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" x2="12" y1="9" y2="13" />
                      <line x1="12" x2="12.01" y1="17" y2="17" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Important Note
                      </h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Make sure to deploy your web chat before adding the code
                        to your website. The chat widget will not work until
                        it's deployed from the Setup tab.
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
