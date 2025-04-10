import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Code, ExternalLink } from "lucide-react";

export default function WebChatSetup() {
  const [activeTab, setActiveTab] = useState("appearance");
  const [chatName, setChatName] = useState("My Web Chat");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! How can I help you today?",
  );
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [position, setPosition] = useState("bottom-right");
  const [agentId, setAgentId] = useState("");
  const [isDeployed, setIsDeployed] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const handleDeploy = () => {
    if (!chatName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for your web chat",
        variant: "destructive",
      });
      return;
    }

    if (!agentId) {
      toast({
        title: "Error",
        description: "Please select an AI agent for your web chat",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would make an API call to deploy the web chat
    // For now, just simulate deployment
    setTimeout(() => {
      setIsDeployed(true);
      toast({
        title: "Success",
        description: "Web chat deployed successfully",
      });
    }, 1500);
  };

  const generateEmbedCode = () => {
    return `<script>
  (function(w, d, s, o, f, js, fjs) {
    w['AkiiWebChat'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'akii', 'https://chat.akii.com/loader.js'));
  
  akii('init', {
    chatId: '${isDeployed ? "wc_" + Math.random().toString(36).substring(2, 10) : "YOUR_CHAT_ID"}',
    position: '${position}',
    primaryColor: '${primaryColor}',
    welcomeMessage: '${welcomeMessage}'
  });
</script>`;
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Web Chat Setup</CardTitle>
        <CardDescription>
          Configure and deploy an AI chat widget for your website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chatName">Chat Name</Label>
                <Input
                  id="chatName"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="My Web Chat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#4f46e5"
                  />
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">Welcome Message</Label>
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="Hello! How can I help you today?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Widget Position</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="position">
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

            <div className="rounded-md border p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="relative h-64 w-full rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className="absolute bottom-4 right-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
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
                      className="text-white"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="agent">Select AI Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an AI agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent_1">
                    General Assistant
                  </SelectItem>
                  <SelectItem value="agent_2">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="agent_3">
                    Sales Representative
                  </SelectItem>
                  <SelectItem value="agent_4">
                    Customer Service
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sendToCRM">Send to CRM</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync conversations with your CRM system
                  </p>
                </div>
                <Switch id="sendToCRM" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collectEmail">Collect Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask for visitor's email before starting chat
                  </p>
                </div>
                <Switch id="collectEmail" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoOpen">Auto Open</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically open chat after 30 seconds
                  </p>
                </div>
                <Switch id="autoOpen" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="persistent">Persistent Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Save chat history between page visits
                  </p>
                </div>
                <Switch id="persistent" defaultChecked />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="targetPages">Pages to Show Chat</Label>
              <Select defaultValue="all">
                <SelectTrigger id="targetPages">
                  <SelectValue placeholder="Select pages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pages</SelectItem>
                  <SelectItem value="homepage">Homepage Only</SelectItem>
                  <SelectItem value="product">Product Pages</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4 pt-4">
            {isDeployed ? (
              <div className="rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/30 p-4 text-green-800 dark:text-green-200">
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
                    className="mr-3"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <div>
                    <h3 className="font-medium">Web Chat Deployed!</h3>
                    <p className="text-sm">
                      Your web chat is now live and ready to use. Add the code
                      below to your website to enable the chat widget.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 p-4 text-blue-800 dark:text-blue-200">
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
                    className="mr-3"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <div>
                    <h3 className="font-medium">Ready to Deploy</h3>
                    <p className="text-sm">
                      Configure your web chat settings in the Appearance and
                      Behavior tabs, then click the Deploy button below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md bg-muted p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Website Embed Code</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(generateEmbedCode())}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <pre className="bg-slate-950 text-slate-50 p-3 rounded-md overflow-x-auto text-xs">
                {generateEmbedCode()}
              </pre>
            </div>

            <div className="rounded-md border p-4 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-700 text-amber-800 dark:text-amber-200">
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
                  <h3 className="text-sm font-medium">Important Note</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Make sure to deploy your web chat before adding the code to
                    your website. The chat widget will not work until it's
                    deployed.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDeploy}
              className="w-full mt-4"
              disabled={isDeployed}
            >
              {isDeployed ? "Deployed" : "Deploy Web Chat"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
