import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Copy, Code, ExternalLink, ShoppingBag } from "lucide-react";

export default function ShopifySetup() {
  const [activeTab, setActiveTab] = useState("setup");
  const [shopName, setShopName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! How can I help you find the perfect product today?",
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
    if (!shopName.trim()) {
      toast({
        title: "Error",
        description: "Please provide your Shopify store name",
        variant: "destructive",
      });
      return;
    }

    if (!agentId) {
      toast({
        title: "Error",
        description: "Please select an AI agent for your Shopify store",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would make an API call to deploy the Shopify integration
    // For now, just simulate deployment
    setTimeout(() => {
      setIsDeployed(true);
      toast({
        title: "Success",
        description: "Shopify integration deployed successfully",
      });
    }, 1500);
  };

  const generateInstallCode = () => {
    return `{% if content_for_header contains 'Shopify.AnalyticsPayload' %}
  <script>
    (function(w, d, s, o, f, js, fjs) {
      w['AkiiShopify'] = o;
      w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
      js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
      js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'akii', 'https://shopify.akii.com/loader.js'));
    
    akii('init', {
      shopId: '${isDeployed ? "shop_" + Math.random().toString(36).substring(2, 10) : "YOUR_SHOP_ID"}',
      position: '${position}',
      primaryColor: '${primaryColor}',
      welcomeMessage: '${welcomeMessage}'
    });
  </script>
{% endif %}`;
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Shopify Integration Setup
        </CardTitle>
        <CardDescription>
          Connect your AI agent to your Shopify store to help customers find
          products and answer questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Store Setup</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="installation">Installation</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shopify Store Name</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="your-store.myshopify.com"
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
                placeholder="Hello! How can I help you find the perfect product today?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Chat Widget Position</Label>
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

            <div className="rounded-md border p-4 mt-4 bg-amber-50">
              <div className="flex">
                <ShoppingBag className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    Shopify Store Connection
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    You'll need to install our Shopify app from the Shopify App
                    Store and authorize it to access your store data.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Go to Shopify App Store
                  </Button>
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
                  <SelectItem value="agent_1">Product Specialist</SelectItem>
                  <SelectItem value="agent_2">Sales Assistant</SelectItem>
                  <SelectItem value="agent_3">Customer Support</SelectItem>
                  <SelectItem value="agent_4">Order Tracking</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The AI agent will determine how your chat responds to customer
                queries.
              </p>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="productRecommendations">
                    Product Recommendations
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow AI to recommend products based on customer preferences
                  </p>
                </div>
                <Switch id="productRecommendations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orderTracking">Order Tracking</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable customers to track their orders through the chat
                  </p>
                </div>
                <Switch id="orderTracking" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inventoryCheck">Inventory Checking</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow AI to check product availability in real-time
                  </p>
                </div>
                <Switch id="inventoryCheck" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="discountCodes">Discount Codes</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable AI to provide discount codes to customers
                  </p>
                </div>
                <Switch id="discountCodes" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="installation" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Shopify Theme Installation</Label>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyCode(generateInstallCode())}
                >
                  <Copy size={16} />
                </Button>
                <pre className="rounded-md bg-muted p-4 overflow-x-auto text-xs">
                  {generateInstallCode()}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add this code to your Shopify theme's theme.liquid file just
                before the closing &lt;/body&gt; tag.
              </p>
            </div>

            <div className="space-y-2 mt-6">
              <Label>Alternative: Shopify App Installation</Label>
              <div className="rounded-md border p-4 bg-muted">
                <p className="text-sm mb-4">
                  For an easier setup, you can install our Shopify app directly
                  from the Shopify App Store.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Install Akii Shopify App
                </Button>
              </div>
            </div>

            <div className="rounded-md border p-4 mt-6 bg-amber-50">
              <div className="flex items-start">
                <Code className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    Developer Options
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    For advanced customization, you can also use our Shopify SDK
                    or REST API to integrate the AI assistant.
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
          {isDeployed ? "Deployed" : "Deploy to Shopify"}
        </Button>
      </CardFooter>
    </Card>
  );
}
