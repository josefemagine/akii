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
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small businesses just getting started with AI",
    features: [
      "1 AI Agent",
      "500 messages/month",
      "Web integration",
      "Basic analytics",
      "Email support",
    ],
    popular: false,
    buttonText: "Get Started",
  },
  {
    name: "Professional",
    price: "$79",
    description: "Ideal for growing businesses with multiple channels",
    features: [
      "3 AI Agents",
      "2,000 messages/month",
      "Web & Mobile integration",
      "Advanced analytics",
      "Priority support",
      "WhatsApp integration",
    ],
    popular: true,
    buttonText: "Upgrade Now",
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "For businesses requiring maximum flexibility and support",
    features: [
      "Unlimited AI Agents",
      "10,000 messages/month",
      "All platform integrations",
      "Custom analytics dashboard",
      "Dedicated support manager",
      "Custom training & onboarding",
    ],
    popular: false,
    buttonText: "Contact Sales",
  },
];

const BillingPage = () => {
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Subscription & Billing</h1>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              You are currently on the Professional plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">
                  $79
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Next billing date: June 15, 2024
                </p>
              </div>
              <Button variant="outline">Manage Payment Methods</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Usage This Month</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold">1,245</p>
                <p className="text-muted-foreground">of 2,000 (62%)</p>
              </div>
              <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: "62%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold">2</p>
                <p className="text-muted-foreground">of 3 (67%)</p>
              </div>
              <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: "67%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-bold">1.2GB</p>
                <p className="text-muted-foreground">of 5GB (24%)</p>
              </div>
              <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: "24%" }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Billing History</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Description</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">May 15, 2024</td>
                    <td className="p-4">Professional Plan - Monthly</td>
                    <td className="p-4">$79.00</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Paid
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Apr 15, 2024</td>
                    <td className="p-4">Professional Plan - Monthly</td>
                    <td className="p-4">$79.00</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Paid
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">Mar 15, 2024</td>
                    <td className="p-4">Professional Plan - Monthly</td>
                    <td className="p-4">$79.00</td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Paid
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <Tabs defaultValue="monthly">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 20%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}
                >
                  {plan.popular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const yearlyPrice =
                  parseInt(plan.price.replace("$", "")) * 0.8 * 12;
                return (
                  <Card
                    key={plan.name}
                    className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}
                  >
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          ${yearlyPrice}
                        </span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Save $
                        {parseInt(plan.price.replace("$", "")) * 12 -
                          yearlyPrice}{" "}
                        compared to monthly
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <Check className="h-5 w-5 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.buttonText}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BillingPage;
