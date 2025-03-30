import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Globe,
  Smartphone,
  MessageCircle,
  ShoppingBag,
  FileCode,
  ArrowRight,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface PlatformSelectorProps {
  platforms?: Platform[];
  onPlatformToggle?: (platformId: string, enabled: boolean) => void;
}

const PlatformSelector = ({
  platforms = [
    {
      id: "website",
      name: "Website",
      description:
        "Embed your AI agent on your website for instant customer support.",
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      enabled: true,
    },
    {
      id: "mobile",
      name: "Mobile App",
      description:
        "Integrate your AI agent into your iOS and Android applications.",
      icon: <Smartphone className="h-8 w-8 text-green-500" />,
      enabled: false,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Connect your AI agent to WhatsApp for messaging support.",
      icon: <MessageCircle className="h-8 w-8 text-emerald-500" />,
      enabled: false,
    },
    {
      id: "telegram",
      name: "Telegram",
      description: "Deploy your AI agent as a Telegram bot for your customers.",
      icon: <MessageCircle className="h-8 w-8 text-blue-400" />,
      enabled: false,
    },
    {
      id: "shopify",
      name: "Shopify",
      description:
        "Add your AI agent to your Shopify store for sales assistance.",
      icon: <ShoppingBag className="h-8 w-8 text-purple-500" />,
      enabled: false,
    },
    {
      id: "wordpress",
      name: "WordPress",
      description:
        "Install your AI agent on your WordPress site with our plugin.",
      icon: <FileCode className="h-8 w-8 text-orange-500" />,
      enabled: false,
    },
  ],
  onPlatformToggle = (platformId, enabled) => {
    console.log(`Platform ${platformId} toggled to ${enabled}`);
  },
}: PlatformSelectorProps) => {
  const handleToggle = (platformId: string, currentState: boolean) => {
    onPlatformToggle(platformId, !currentState);
  };

  return (
    <div className="w-full bg-background p-6 rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Platforms</h2>
        <p className="text-muted-foreground">
          Select the platforms where you want to deploy your AI agent. You can
          enable or disable platforms at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-200"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="p-2 rounded-lg bg-background/80">
                  {platform.icon}
                </div>
                <Switch
                  checked={platform.enabled}
                  onCheckedChange={() =>
                    handleToggle(platform.id, platform.enabled)
                  }
                  aria-label={`Enable ${platform.name}`}
                />
              </div>
              <CardTitle className="mt-4">{platform.name}</CardTitle>
              <CardDescription>{platform.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-12 flex items-center justify-center">
                {platform.enabled ? (
                  <span className="text-sm font-medium text-green-500">
                    Enabled
                  </span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    Disabled
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-full text-sm font-medium">
                Configure
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <p className="text-sm text-muted-foreground">
          You can change these settings later in your agent configuration.
        </p>
      </div>
    </div>
  );
};

export default PlatformSelector;
