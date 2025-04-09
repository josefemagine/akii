import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
export default function SubscriptionAddons({ onAddonsSelected, currentAddons = {}, }) {
    const [selectedAddons, setSelectedAddons] = useState(currentAddons);
    const addons = [
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
    const updateAddon = (addonId, increment) => {
        setSelectedAddons((prev) => {
            const currentValue = prev[addonId] || 0;
            const addon = addons.find((a) => a.id === addonId);
            if (!addon)
                return prev;
            let newValue = increment ? currentValue + 1 : currentValue - 1;
            // Ensure within limits
            newValue = Math.max(0, newValue);
            if (addon.maxQuantity) {
                newValue = Math.min(addon.maxQuantity, newValue);
            }
            const newAddons = Object.assign(Object.assign({}, prev), { [addonId]: newValue });
            // Remove addon if quantity is 0
            if (newValue === 0) {
                delete newAddons[addonId];
            }
            // Notify parent component
            onAddonsSelected(newAddons);
            return newAddons;
        });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("h3", { className: "text-xl font-semibold", children: "Add-ons" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: addons.map((addon) => {
                    const quantity = selectedAddons[addon.id] || 0;
                    const isMaxed = addon.maxQuantity !== undefined && quantity >= addon.maxQuantity;
                    const isMin = quantity <= 0;
                    return (_jsxs(Card, { className: "border border-border", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(CardTitle, { className: "text-lg", children: addon.name }), _jsx(CardDescription, { children: addon.description })] }), _jsx(CardContent, { children: _jsxs("p", { className: "font-medium", children: ["+$", addon.price, "/month per ", addon.unit] }) }), _jsxs(CardFooter, { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => updateAddon(addon.id, false), disabled: isMin, children: _jsx(Minus, { className: "h-4 w-4" }) }), _jsx("span", { className: "w-8 text-center", children: quantity }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => updateAddon(addon.id, true), disabled: isMaxed, children: _jsx(Plus, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "text-right font-medium", children: ["$", quantity * addon.price, "/mo"] })] })] }, addon.id));
                }) })] }));
}
