import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
export default function SubscriptionSummary({ planName, planPrice, addons = [], onCheckout, isLoading = false, }) {
    // Calculate total price
    const addonTotal = addons.reduce((sum, addon) => sum + addon.quantity * addon.pricePerUnit, 0);
    const basePrice = typeof planPrice === "number" ? planPrice : 0;
    const totalPrice = basePrice + addonTotal;
    return (_jsxs(Card, { className: "border border-border", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Subscription Summary" }), _jsx(CardDescription, { children: "Review your subscription details" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium", children: "Base Plan" }), _jsx("span", { children: typeof planPrice === "string" ? planPrice : `$${planPrice}/month` })] }), addons.length > 0 && (_jsxs(_Fragment, { children: [_jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx("span", { className: "font-medium", children: "Add-ons" }), addons.map((addon) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: [addon.name, " (x", addon.quantity, ")"] }), _jsxs("span", { children: ["$", addon.quantity * addon.pricePerUnit, "/month"] })] }, addon.id)))] })] })), _jsx(Separator, {}), _jsxs("div", { className: "flex justify-between font-bold", children: [_jsx("span", { children: "Total" }), _jsx("span", { children: typeof planPrice === "string"
                                    ? "Custom pricing"
                                    : `$${totalPrice}/month` })] })] }), _jsx(CardFooter, { children: _jsx(Button, { className: "w-full", onClick: onCheckout, disabled: isLoading || typeof planPrice === "string", children: isLoading
                        ? "Processing..."
                        : typeof planPrice === "string"
                            ? "Contact Sales"
                            : "Proceed to Checkout" }) })] }));
}
