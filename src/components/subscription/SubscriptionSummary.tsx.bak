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
import { Separator } from "@/components/ui/separator";

type AddonSummary = {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
};

type SubscriptionSummaryProps = {
  planName: string;
  planPrice: number | string;
  addons: AddonSummary[];
  onCheckout: () => void;
  isLoading?: boolean;
};

export default function SubscriptionSummary({
  planName,
  planPrice,
  addons = [],
  onCheckout,
  isLoading = false,
}: SubscriptionSummaryProps) {
  // Calculate total price
  const addonTotal = addons.reduce(
    (sum, addon) => sum + addon.quantity * addon.pricePerUnit,
    0,
  );
  const basePrice = typeof planPrice === "number" ? planPrice : 0;
  const totalPrice = basePrice + addonTotal;

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Subscription Summary</CardTitle>
        <CardDescription>Review your subscription details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="font-medium">Base Plan</span>
          <span>
            {typeof planPrice === "string" ? planPrice : `$${planPrice}/month`}
          </span>
        </div>

        {addons.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <span className="font-medium">Add-ons</span>
              {addons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span>
                    {addon.name} (x{addon.quantity})
                  </span>
                  <span>${addon.quantity * addon.pricePerUnit}/month</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>
            {typeof planPrice === "string"
              ? "Custom pricing"
              : `$${totalPrice}/month`}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={isLoading || typeof planPrice === "string"}
        >
          {isLoading
            ? "Processing..."
            : typeof planPrice === "string"
              ? "Contact Sales"
              : "Proceed to Checkout"}
        </Button>
      </CardFooter>
    </Card>
  );
}
