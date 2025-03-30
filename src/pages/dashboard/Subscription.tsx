import React, { useState, useEffect } from "react";
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
import { CheckCircle, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const currentPlan = user?.subscription?.plan || "free";
  interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_annual: number;
    features: string[];
    is_popular?: boolean;
    [key: string]: any;
  }

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        // Using the correct API endpoint path with proper typing
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*");

        if (error) throw error;

        setPlans(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching subscription plans:", err);
        setError("Failed to load subscription plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and billing information.
        </p>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the{" "}
            <span className="font-medium capitalize">{currentPlan}</span> plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Professional Plan</h3>
                <p className="text-sm text-muted-foreground">$99/month</p>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Current Plan
              </Badge>
            </div>
            <div className="mt-4 text-sm">
              <p>
                Your next billing date is <strong>July 15, 2023</strong>
              </p>
              <div className="mt-2">
                <span className="text-muted-foreground">
                  5,000 messages per month
                </span>
                <div className="h-2 w-full bg-muted-foreground/20 rounded-full mt-1">
                  <div className="h-2 w-3/5 bg-primary rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>3,120 used</span>
                  <span>5,000 total</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="monthly">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Available Plans</h2>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
          </TabsList>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Loading subscription plans...
            </p>
          </div>
        ) : (
          <>
            <TabsContent value="monthly" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <CardDescription>
                      For individuals just getting started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$0</div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>1,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>1 AI agent</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Web integration only</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Basic analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={currentPlan === "free"}
                    >
                      {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Professional</CardTitle>
                      <Badge>Popular</Badge>
                    </div>
                    <CardDescription>
                      For small to medium businesses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$99</div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>5,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Up to 10 AI agents</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Web, mobile, and WhatsApp integration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Team collaboration (up to 5 members)</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={currentPlan === "pro"}>
                      {currentPlan === "pro"
                        ? "Current Plan"
                        : "Upgrade to Pro"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>
                      For large organizations with advanced needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$499</div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>50,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unlimited AI agents</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>All platform integrations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Advanced analytics and reporting</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unlimited team members</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Dedicated support</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Custom AI model training</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={currentPlan === "enterprise"}
                    >
                      {currentPlan === "enterprise"
                        ? "Current Plan"
                        : "Contact Sales"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Need a custom plan? Contact our sales team for a tailored
                  solution.
                </span>
                <Button variant="link" className="ml-auto">
                  Contact Sales <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="annual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Free</CardTitle>
                    <CardDescription>
                      For individuals just getting started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">$0</div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>1,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>1 AI agent</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Web integration only</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Basic analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={currentPlan === "free"}
                    >
                      {currentPlan === "free" ? "Current Plan" : "Downgrade"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Professional</CardTitle>
                      <Badge>Popular</Badge>
                    </div>
                    <CardDescription>
                      For small to medium businesses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <div className="text-3xl font-bold">$79</div>
                      <div className="text-sm text-muted-foreground ml-2">
                        /month
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      $948 billed annually
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>5,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Up to 10 AI agents</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Web, mobile, and WhatsApp integration</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Team collaboration (up to 5 members)</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" disabled={currentPlan === "pro"}>
                      {currentPlan === "pro"
                        ? "Current Plan"
                        : "Upgrade to Pro"}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Enterprise</CardTitle>
                    <CardDescription>
                      For large organizations with advanced needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline">
                      <div className="text-3xl font-bold">$399</div>
                      <div className="text-sm text-muted-foreground ml-2">
                        /month
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      $4,788 billed annually
                    </div>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>50,000 messages per month</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unlimited AI agents</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>All platform integrations</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Advanced analytics and reporting</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Unlimited team members</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Dedicated support</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span>Custom AI model training</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={currentPlan === "enterprise"}
                    >
                      {currentPlan === "enterprise"
                        ? "Current Plan"
                        : "Contact Sales"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Need a custom plan? Contact our sales team for a tailored
                  solution.
                </span>
                <Button variant="link" className="ml-auto">
                  Contact Sales <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default SubscriptionPage;
