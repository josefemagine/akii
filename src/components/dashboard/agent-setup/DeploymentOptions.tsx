import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Check,
  Code as CodeIcon,
} from "lucide-react";

interface DeploymentOptionsProps {
  agentId?: string;
  agentName?: string;
  platforms?: string[];
  integrationCode?: Record<string, string>;
  qrCodes?: Record<string, string>;
}

const DeploymentOptions = ({
  agentId = "agent-123",
  agentName = "Sales Assistant",
  platforms = [
    "Website",
    "Mobile",
    "WhatsApp",
    "Telegram",
    "Shopify",
    "WordPress",
  ],
  integrationCode = {
    Website: `<script src="https://akii.io/embed.js" data-agent-id="agent-123"></script>`,
    Mobile: `import AkiiChat from 'akii-react-native';

export default function App() {
  return (
    <AkiiChat agentId="agent-123" theme="light" />
  );
}`,
    WhatsApp: `1. Send a message to +1 (555) 123-4567
2. Include the code: AKII-agent-123
3. Follow the activation instructions`,
    Telegram: `1. Search for @AkiiAIBot on Telegram
2. Start a conversation
3. Send the command: /connect agent-123`,
    Shopify: `{% section 'akii-chat-widget' %}

<!-- In your theme settings -->
{
  "agent_id": "agent-123",
  "position": "bottom-right",
  "theme": "light"
}`,
    WordPress: `// Install the Akii AI Chat plugin
// Navigate to Akii settings
// Enter your Agent ID: agent-123
// Save changes`,
  },
  qrCodes = {
    Website: "https://api.dicebear.com/7.x/avataaars/svg?seed=website",
    Mobile: "https://api.dicebear.com/7.x/avataaars/svg?seed=mobile",
    WhatsApp: "https://api.dicebear.com/7.x/avataaars/svg?seed=whatsapp",
    Telegram: "https://api.dicebear.com/7.x/avataaars/svg?seed=telegram",
    Shopify: "https://api.dicebear.com/7.x/avataaars/svg?seed=shopify",
    WordPress: "https://api.dicebear.com/7.x/avataaars/svg?seed=wordpress",
  },
}: DeploymentOptionsProps) => {
  const [activeTab, setActiveTab] = useState(platforms[0]);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const handleCopy = (platform: string) => {
    navigator.clipboard.writeText(integrationCode[platform]);
    setCopied({ ...copied, [platform]: true });
    setTimeout(() => {
      setCopied({ ...copied, [platform]: false });
    }, 2000);
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Deploy Your Agent</h2>
        <p className="text-muted-foreground">
          Your AI agent <span className="font-medium">{agentName}</span> is
          ready to be deployed. Choose a platform below to get the integration
          code or QR code for activation.
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          {platforms.map((platform) => (
            <TabsTrigger key={platform} value={platform} className="px-4 py-2">
              {platform}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform} value={platform} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{platform} Integration</CardTitle>
                <CardDescription>
                  Follow the instructions below to integrate your AI agent with{" "}
                  {platform}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md relative">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(platform)}
                          className="h-8 w-8 p-0"
                        >
                          {copied[platform] ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                        {integrationCode[platform]}
                      </pre>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Instructions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <CodeIcon className="h-4 w-4" />
                        View API Docs
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                    <div className="mb-4 text-center">
                      <h3 className="font-medium mb-1">Quick Connect</h3>
                      <p className="text-sm text-muted-foreground">
                        Scan this QR code to activate your agent
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-md mb-4">
                      <img
                        src={qrCodes[platform]}
                        alt={`QR Code for ${platform}`}
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      Download QR Code
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Agent ID:{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    {agentId}
                  </code>
                </p>
                <Button variant="link" className="flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" />
                  View Integration Guide
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-8 flex justify-end gap-4">
        <Button variant="outline">Back to Testing</Button>
        <Button>Complete Setup</Button>
      </div>
    </div>
  );
};

export default DeploymentOptions;
