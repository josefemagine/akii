import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Edit, Plus, Trash } from "lucide-react";

const packages = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for small businesses just getting started with AI",
    features: [
      "1 AI Agent",
      "500 messages/month",
      "Web integration",
      "Basic analytics",
      "Email support",
    ],
    aiProvider: "OpenAI",
    aiModel: "gpt-3.5-turbo",
    active: true,
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    description: "Ideal for growing businesses with multiple channels",
    features: [
      "3 AI Agents",
      "2,000 messages/month",
      "Web & Mobile integration",
      "Advanced analytics",
      "Priority support",
      "WhatsApp integration",
    ],
    aiProvider: "OpenAI",
    aiModel: "gpt-4o",
    active: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 199,
    description: "For businesses requiring maximum flexibility and support",
    features: [
      "Unlimited AI Agents",
      "10,000 messages/month",
      "All platform integrations",
      "Custom analytics dashboard",
      "Dedicated support manager",
      "Custom training & onboarding",
    ],
    aiProvider: "Anthropic",
    aiModel: "claude-3-opus",
    active: true,
  },
];

const AdminPackages = () => {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Package Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create New Package
        </Button>
      </div>

      <Tabs defaultValue="packages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="features">Feature Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4">
          {packages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {pkg.name}
                      {pkg.active ? (
                        <Badge className="ml-2 bg-green-500">Active</Badge>
                      ) : (
                        <Badge className="ml-2 bg-gray-500">Inactive</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </div>
                  <div className="text-2xl font-bold">
                    ${pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Features</h3>
                    <ul className="space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">AI Configuration</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Provider:</span>{" "}
                        {pkg.aiProvider}
                      </p>
                      <p>
                        <span className="font-medium">Model:</span>{" "}
                        {pkg.aiModel}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Package Status</h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id={`${pkg.id}-active`}
                        defaultChecked={pkg.active}
                      />
                      <Label htmlFor={`${pkg.id}-active`}>
                        {pkg.active ? "Active" : "Inactive"}
                      </Label>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Users:</span> 127
                      </p>
                      <p>
                        <span className="font-medium">Created:</span> May 10,
                        2024
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ai-models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>
                Configure which AI models are available for each package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">OpenAI Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">GPT-3.5 Turbo</p>
                        <p className="text-sm text-muted-foreground">
                          Fast & cost-effective
                        </p>
                      </div>
                      <Switch id="gpt-35-turbo" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">GPT-4o</p>
                        <p className="text-sm text-muted-foreground">
                          Balanced performance
                        </p>
                      </div>
                      <Switch id="gpt-4o" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">GPT-4o-mini</p>
                        <p className="text-sm text-muted-foreground">
                          Efficient & fast
                        </p>
                      </div>
                      <Switch id="gpt-4o-mini" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Anthropic Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Claude 3 Haiku</p>
                        <p className="text-sm text-muted-foreground">
                          Fast responses
                        </p>
                      </div>
                      <Switch id="claude-3-haiku" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Claude 3 Sonnet</p>
                        <p className="text-sm text-muted-foreground">
                          Balanced performance
                        </p>
                      </div>
                      <Switch id="claude-3-sonnet" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Claude 3 Opus</p>
                        <p className="text-sm text-muted-foreground">
                          Highest quality
                        </p>
                      </div>
                      <Switch id="claude-3-opus" defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Google AI Models</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Gemini Pro</p>
                        <p className="text-sm text-muted-foreground">
                          Versatile model
                        </p>
                      </div>
                      <Switch id="gemini-pro" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">Gemini Ultra</p>
                        <p className="text-sm text-muted-foreground">
                          Premium performance
                        </p>
                      </div>
                      <Switch id="gemini-ultra" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Matrix</CardTitle>
              <CardDescription>
                Configure which features are available in each package
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-center p-2">Starter</th>
                      <th className="text-center p-2">Professional</th>
                      <th className="text-center p-2">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Web Integration</td>
                      <td className="text-center p-2">
                        <Switch id="web-starter" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="web-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="web-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Mobile Integration</td>
                      <td className="text-center p-2">
                        <Switch id="mobile-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="mobile-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="mobile-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">WhatsApp Integration</td>
                      <td className="text-center p-2">
                        <Switch id="whatsapp-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="whatsapp-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="whatsapp-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Telegram Integration</td>
                      <td className="text-center p-2">
                        <Switch id="telegram-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="telegram-pro" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="telegram-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Shopify Integration</td>
                      <td className="text-center p-2">
                        <Switch id="shopify-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="shopify-pro" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="shopify-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">WordPress Integration</td>
                      <td className="text-center p-2">
                        <Switch id="wordpress-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="wordpress-pro" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="wordpress-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Advanced Analytics</td>
                      <td className="text-center p-2">
                        <Switch id="analytics-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="analytics-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="analytics-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Team Collaboration</td>
                      <td className="text-center p-2">
                        <Switch id="team-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="team-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="team-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Custom Training</td>
                      <td className="text-center p-2">
                        <Switch id="training-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="training-pro" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="training-enterprise" defaultChecked />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Priority Support</td>
                      <td className="text-center p-2">
                        <Switch id="support-starter" />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="support-pro" defaultChecked />
                      </td>
                      <td className="text-center p-2">
                        <Switch id="support-enterprise" defaultChecked />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPackages;
