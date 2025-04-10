import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Addon = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  maxQuantity?: number;
};

type SubscriptionAddonsProps = {
  onAddonsSelected: (addons: Record<string, number>) => void;
  currentAddons?: Record<string, number>;
};

export default function SubscriptionAddons({
  onAddonsSelected,
  currentAddons = {},
}: SubscriptionAddonsProps) {
  const [selectedAddons, setSelectedAddons] =
    useState<Record<string, number>>(currentAddons);

  const addons: Addon[] = [
    {
      id: "extra_messages",
      name: "Extra Messages",
      description: "Additional 1,000 messages per month",
      price: 10,
      unit: "1,000 messages",
      maxQuantity: 100,
    },
    {
      id: "extra_agents",
      name: "Extra AI Agents",
      description: "Additional AI agent",
      price: 15,
      unit: "agent",
      maxQuantity: 50,
    },
    {
      id: "developer_api",
      name: "Developer API Access",
      description: "API access for Basic tier only",
      price: 25,
      unit: "access",
      maxQuantity: 1,
    },
    {
      id: "hipaa_compliance",
      name: "HIPAA/BAA Compliance",
      description: "Healthcare compliance add-on",
      price: 100,
      unit: "compliance",
      maxQuantity: 1,
    },
    {
      id: "priority_support",
      name: "Priority Support",
      description: "For Pro users",
      price: 50,
      unit: "support",
      maxQuantity: 1,
    },
  ];

  const updateAddon = (addonId: string, increment: boolean) => {
    setSelectedAddons((prev) => {
      const currentValue = prev[addonId] || 0;
      const addon = addons.find((a) => a.id === addonId);

      if (!addon) return prev;

      let newValue = increment ? currentValue + 1 : currentValue - 1;

      // Ensure within limits
      newValue = Math.max(0, newValue);
      if (addon.maxQuantity) {
        newValue = Math.min(addon.maxQuantity, newValue);
      }

      const newAddons = { ...prev, [addonId]: newValue };

      // Remove addon if quantity is 0
      if (newValue === 0) {
        delete newAddons[addonId];
      }

      // Notify parent component
      onAddonsSelected(newAddons);

      return newAddons;
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((addon) => {
          const quantity = selectedAddons[addon.id] || 0;
          const isMaxed =
            addon.maxQuantity !== undefined && quantity >= addon.maxQuantity;
          const isMin = quantity <= 0;

          return (
            <Card key={addon.id} className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{addon.name}</CardTitle>
                <CardDescription>{addon.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  +${addon.price}/month per {addon.unit}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateAddon(addon.id, false)}
                    disabled={isMin}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateAddon(addon.id, true)}
                    disabled={isMaxed}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right font-medium">
                  ${quantity * addon.price}/mo
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
