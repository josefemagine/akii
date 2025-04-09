import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Code, ExternalLink, ShoppingBag } from "lucide-react";
export default function ShopifySetup() {
    const [activeTab, setActiveTab] = useState("setup");
    const [shopName, setShopName] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you find the perfect product today?");
    const [primaryColor, setPrimaryColor] = useState("#4f46e5");
    const [position, setPosition] = useState("bottom-right");
    const [agentId, setAgentId] = useState("");
    const [isDeployed, setIsDeployed] = useState(false);
    const { toast } = useToast();
    const handleCopyCode = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied",
            description: "Code copied to clipboard",
        });
    };
    const handleDeploy = () => {
        if (!shopName.trim()) {
            toast({
                title: "Error",
                description: "Please provide your Shopify store name",
                variant: "destructive",
            });
            return;
        }
        if (!agentId) {
            toast({
                title: "Error",
                description: "Please select an AI agent for your Shopify store",
                variant: "destructive",
            });
            return;
        }
        // In a real implementation, this would make an API call to deploy the Shopify integration
        // For now, just simulate deployment
        setTimeout(() => {
            setIsDeployed(true);
            toast({
                title: "Success",
                description: "Shopify integration deployed successfully",
            });
        }, 1500);
    };
    const generateInstallCode = () => {
        return `{% if content_for_header contains 'Shopify.AnalyticsPayload' %}
  <script>
    (function(w, d, s, o, f, js, fjs) {
      w['AkiiShopify'] = o;
      w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
      js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
      js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
    }(window, document, 'script', 'akii', 'https://shopify.akii.com/loader.js'));
    
    akii('init', {
      shopId: '${isDeployed ? "shop_" + Math.random().toString(36).substring(2, 10) : "YOUR_SHOP_ID"}',
      position: '${position}',
      primaryColor: '${primaryColor}',
      welcomeMessage: '${welcomeMessage}'
    });
  </script>
{% endif %}`;
    };
    return (_jsxs(Card, { className: "w-full bg-white shadow-sm", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Shopify Integration Setup" }), _jsx(CardDescription, { children: "Connect your AI agent to your Shopify store to help customers find products and answer questions." })] }), _jsx(CardContent, { children: _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "setup", children: "Store Setup" }), _jsx(TabsTrigger, { value: "behavior", children: "Behavior" }), _jsx(TabsTrigger, { value: "installation", children: "Installation" })] }), _jsxs(TabsContent, { value: "setup", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "shopName", children: "Shopify Store Name" }), _jsx(Input, { id: "shopName", value: shopName, onChange: (e) => setShopName(e.target.value), placeholder: "your-store.myshopify.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "primaryColor", children: "Primary Color" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { id: "primaryColor", value: primaryColor, onChange: (e) => setPrimaryColor(e.target.value), placeholder: "#4f46e5" }), _jsx("div", { className: "h-10 w-10 rounded-md border", style: { backgroundColor: primaryColor } })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "welcomeMessage", children: "Welcome Message" }), _jsx(Textarea, { id: "welcomeMessage", value: welcomeMessage, onChange: (e) => setWelcomeMessage(e.target.value), placeholder: "Hello! How can I help you find the perfect product today?", rows: 3 })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "position", children: "Chat Widget Position" }), _jsxs(Select, { value: position, onValueChange: setPosition, children: [_jsx(SelectTrigger, { id: "position", children: _jsx(SelectValue, { placeholder: "Select position" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "bottom-right", children: "Bottom Right" }), _jsx(SelectItem, { value: "bottom-left", children: "Bottom Left" }), _jsx(SelectItem, { value: "top-right", children: "Top Right" }), _jsx(SelectItem, { value: "top-left", children: "Top Left" })] })] })] }), _jsx("div", { className: "rounded-md border p-4 mt-4 bg-amber-50", children: _jsxs("div", { className: "flex", children: [_jsx(ShoppingBag, { className: "h-5 w-5 text-amber-500 mt-0.5 mr-2" }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-amber-800", children: "Shopify Store Connection" }), _jsx("p", { className: "text-xs text-amber-700 mt-1", children: "You'll need to install our Shopify app from the Shopify App Store and authorize it to access your store data." }), _jsxs(Button, { variant: "outline", size: "sm", className: "mt-2 h-7 text-xs", children: [_jsx(ExternalLink, { className: "h-3.5 w-3.5 mr-1" }), "Go to Shopify App Store"] })] })] }) })] }), _jsxs(TabsContent, { value: "behavior", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "agent", children: "Select AI Agent" }), _jsxs(Select, { value: agentId, onValueChange: setAgentId, children: [_jsx(SelectTrigger, { id: "agent", children: _jsx(SelectValue, { placeholder: "Select an AI agent" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "agent_1", children: "Product Specialist" }), _jsx(SelectItem, { value: "agent_2", children: "Sales Assistant" }), _jsx(SelectItem, { value: "agent_3", children: "Customer Support" }), _jsx(SelectItem, { value: "agent_4", children: "Order Tracking" })] })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "The AI agent will determine how your chat responds to customer queries." })] }), _jsxs("div", { className: "space-y-4 mt-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "productRecommendations", children: "Product Recommendations" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Allow AI to recommend products based on customer preferences" })] }), _jsx(Switch, { id: "productRecommendations", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "orderTracking", children: "Order Tracking" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Enable customers to track their orders through the chat" })] }), _jsx(Switch, { id: "orderTracking", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "inventoryCheck", children: "Inventory Checking" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Allow AI to check product availability in real-time" })] }), _jsx(Switch, { id: "inventoryCheck", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "discountCodes", children: "Discount Codes" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Enable AI to provide discount codes to customers" })] }), _jsx(Switch, { id: "discountCodes" })] })] })] }), _jsxs(TabsContent, { value: "installation", className: "space-y-4 pt-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Shopify Theme Installation" }), _jsxs("div", { className: "relative", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "absolute top-2 right-2", onClick: () => handleCopyCode(generateInstallCode()), children: _jsx(Copy, { size: 16 }) }), _jsx("pre", { className: "rounded-md bg-muted p-4 overflow-x-auto text-xs", children: generateInstallCode() })] }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Add this code to your Shopify theme's theme.liquid file just before the closing </body> tag." })] }), _jsxs("div", { className: "space-y-2 mt-6", children: [_jsx(Label, { children: "Alternative: Shopify App Installation" }), _jsxs("div", { className: "rounded-md border p-4 bg-muted", children: [_jsx("p", { className: "text-sm mb-4", children: "For an easier setup, you can install our Shopify app directly from the Shopify App Store." }), _jsxs(Button, { variant: "outline", size: "sm", className: "w-full", children: [_jsx(ShoppingBag, { className: "mr-2 h-4 w-4" }), "Install Akii Shopify App"] })] })] }), _jsx("div", { className: "rounded-md border p-4 mt-6 bg-amber-50", children: _jsxs("div", { className: "flex items-start", children: [_jsx(Code, { className: "h-5 w-5 text-amber-500 mt-0.5 mr-2" }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-amber-800", children: "Developer Options" }), _jsx("p", { className: "text-xs text-amber-700 mt-1", children: "For advanced customization, you can also use our Shopify SDK or REST API to integrate the AI assistant." }), _jsxs("div", { className: "flex gap-2 mt-2", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", children: [_jsx(Code, { className: "h-3.5 w-3.5 mr-1" }), "View SDK Docs"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "h-7 text-xs", children: [_jsx(ExternalLink, { className: "h-3.5 w-3.5 mr-1" }), "API Reference"] })] })] })] }) })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsx(Button, { variant: "outline", children: "Save as Draft" }), _jsx(Button, { onClick: handleDeploy, disabled: isDeployed, children: isDeployed ? "Deployed" : "Deploy to Shopify" })] })] }));
}
