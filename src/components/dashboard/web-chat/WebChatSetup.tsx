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
    <Card className="w-full bg-white shadow-sm">
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
              <div className="relative h-64 w-full rounded-md bg-gray-100 overflow-hidden">
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
                    Customer Support Agent
                  </SelectItem>
                  <SelectItem value="agent_2">Sales Assistant</SelectItem>
                  <SelectItem value="agent_3">Product Specialist</SelectItem>
                  <SelectItem value="agent_4">Technical Support</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The AI agent will determine how your chat responds to user
                queries.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoOpen">Auto-open Chat</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically open the chat after page load
                  </p>
                </div>
                <Switch id="autoOpen" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="collectEmail">Collect Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Ask for visitor's email before starting chat
                  </p>
                </div>
                <Switch id="collectEmail" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="persistConversation">
                    Persist Conversation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Save conversation history between sessions
                  </p>
                </div>
                <Switch id="persistConversation" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fileAttachments">File Attachments</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow users to upload files during chat
                  </p>
                </div>
                <Switch id="fileAttachments" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="deployment" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Embed Code</Label>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(generateEmbedCode())}
                >
                  <Copy size={16} />
                </Button>
                <pre className="rounded-md bg-muted p-4 overflow-x-auto text-xs">
                  {generateEmbedCode()}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add this code to your website before the closing &lt;/body&gt;
                tag.
              </p>
            </div>

            <div className="space-y-2 mt-6">
              <Label>Allowed Domains</Label>
              <Textarea
                placeholder="example.com\napp.example.com"
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter one domain per line. Leave empty to allow all domains.
              </p>
            </div>

            <div className="rounded-md border p-4 mt-6 bg-amber-50">
              <div className="flex items-start">
                <Code className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    Developer Options
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    For advanced customization, you can also use our JavaScript
                    SDK or REST API to integrate the web chat.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Code className="h-3.5 w-3.5 mr-1" />
                      View SDK Docs
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      API Reference
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Save as Draft</Button>
        <Button onClick={handleDeploy} disabled={isDeployed}>
          {isDeployed ? "Deployed" : "Deploy Web Chat"}
        </Button>
      </CardFooter>
    </Card>
  );
}
