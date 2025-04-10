import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  MessageCircle,
  ShoppingBag,
  FileCode,
  Link2,
  Check,
  ExternalLink,
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "not_connected";
  category: "messaging" | "ecommerce" | "cms" | "other";
}

const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect your AI agents to WhatsApp for messaging support.",
    icon: <MessageCircle className="h-8 w-8 text-emerald-500" />,
    status: "connected",
    category: "messaging",
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Deploy your AI agents as Telegram bots for your customers.",
    icon: <MessageCircle className="h-8 w-8 text-blue-400" />,
    status: "not_connected",
    category: "messaging",
  },
  {
    id: "shopify",
    name: "Shopify",
    description:
      "Add your AI agents to your Shopify store for sales assistance.",
    icon: <ShoppingBag className="h-8 w-8 text-purple-500" />,
    status: "connected",
    category: "ecommerce",
  },
  {
    id: "wordpress",
    name: "WordPress",
    description:
      "Install your AI agents on your WordPress site with our plugin.",
    icon: <FileCode className="h-8 w-8 text-orange-500" />,
    status: "not_connected",
    category: "cms",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect your AI agents to thousands of apps via Zapier.",
    icon: <Link2 className="h-8 w-8 text-red-500" />,
    status: "not_connected",
    category: "other",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Deploy your AI agents in your Slack workspace.",
    icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
    status: "not_connected",
    category: "messaging",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Add your AI agents to your WooCommerce store.",
    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
    status: "not_connected",
    category: "ecommerce",
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Add your AI agents to your Webflow site.",
    icon: <Globe className="h-8 w-8 text-blue-500" />,
    status: "not_connected",
    category: "cms",
  },
];

const Integrations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your AI agents to various platforms and services.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="cms">CMS</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} integration={integration} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter((i) => i.category === "messaging")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ecommerce" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter((i) => i.category === "ecommerce")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="cms" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter((i) => i.category === "cms")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations
              .filter((i) => i.category === "other")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const IntegrationCard = ({ integration }: { integration: Integration }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-background/80">
            {integration.icon}
          </div>
          {integration.status === "connected" && (
            <div className="flex items-center text-xs font-medium text-green-500">
              <Check className="mr-1 h-3 w-3" /> Connected
            </div>
          )}
        </div>
        <CardTitle className="mt-4">{integration.name}</CardTitle>
        <CardDescription>{integration.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          <ExternalLink className="mr-2 h-4 w-4" /> Learn More
        </Button>
        <Button size="sm">
          {integration.status === "connected" ? "Configure" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Integrations;
