import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { CheckCircle, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import { toast } from "@/components/ui/use-toast.ts";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer.tsx";

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  is_popular?: boolean;
}

const SubscriptionPage = () => {
  const { user, hasUser, isLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  useEffect(() => {
    if (hasUser) {
      fetchSubscriptionPlans();
      fetchCurrentSubscription();
    }
  }, [hasUser]);

  const fetchSubscriptionPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const plansData = await invokeServerFunction("get_subscription_plans", {});
      setPlans(plansData?.plans || []);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    if (!user) return;
    
    try {
      const subscriptionData = await invokeServerFunction("get_user_subscription", { 
        userId: user.id 
      });
      
      if (subscriptionData?.subscription) {
        setCurrentPlan(subscriptionData.subscription.plan_id);
      }
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      toast({
        title: "Error",
        description: "Failed to load your subscription details",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async (planId: string, isAnnual: boolean) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to subscribe",
        variant: "destructive"
      });
      return;
    }

    try {
      // Call subscription_create function
      const result = await invokeServerFunction("subscription_create", {
        userId: user.id,
        planId,
        isAnnual,
      });

      if (result?.checkoutUrl) {
        // Redirect to checkout
        window.location.href = result.checkoutUrl;
      } else {
        toast({
          title: "Success",
          description: "Subscription updated successfully!"
        });
        // Refresh subscription data
        fetchCurrentSubscription();
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardPageContainer>
        <div className="flex justify-center items-center h-64">
          <p>Loading subscription data...</p>
        </div>
      </DashboardPageContainer>
    );
  }

  if (!hasUser) {
    return (
      <DashboardPageContainer>
        <div className="flex justify-center items-center h-64">
          <p>Please log in to view subscription options</p>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <DashboardPageContainer>
      <div className="space-y-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold mb-2">Subscription Plans</h2>
          <p className="text-muted-foreground mb-6">
            Choose the plan that works best for your business
          </p>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">Annual (20% off)</TabsTrigger>
          </TabsList>

          {isLoadingPlans ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading plans...</p>
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
                        disabled={currentPlan === "free" || isLoading}
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
                      <Button
                        className="w-full"
                        disabled={currentPlan === "professional" || isLoading}
                        onClick={() => handleSubscribe("pro", false)}
                      >
                        {isLoading ? "Loading..." : currentPlan === "professional" ? "Current Plan" : "Upgrade"}
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
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleSubscribe("scale", false)}
                        disabled={currentPlan === "business" || isLoading}
                      >
                        {isLoading ? "Loading..." : currentPlan === "business" ? "Current Plan" : "Upgrade"}
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
                        disabled={currentPlan === "free" || isLoading}
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
                      <Button
                        className="w-full"
                        disabled={currentPlan === "professional" || isLoading}
                        onClick={() => handleSubscribe("pro", true)}
                      >
                        {isLoading ? "Loading..." : currentPlan === "professional" ? "Current Plan" : "Upgrade"}
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
                        className="w-full"
                        variant="secondary"
                        onClick={() => handleSubscribe("scale", true)}
                        disabled={currentPlan === "business" || isLoading}
                      >
                        {isLoading ? "Loading..." : currentPlan === "business" ? "Current Plan" : "Upgrade"}
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
    </DashboardPageContainer>
  );
};

export default SubscriptionPage;
