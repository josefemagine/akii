import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Eye, Plus, Send, Trash } from "lucide-react";
const emailTemplates = [
    {
        id: "welcome",
        name: "Welcome Email",
        subject: "Welcome to Akii AI - Get Started Today!",
        description: "Sent to new users after registration",
        category: "onboarding",
        lastUpdated: "2024-05-10",
    },
    {
        id: "password-reset",
        name: "Password Reset",
        subject: "Reset Your Akii AI Password",
        description: "Sent when a user requests a password reset",
        category: "account",
        lastUpdated: "2024-05-05",
    },
    {
        id: "subscription-confirmation",
        name: "Subscription Confirmation",
        subject: "Your Akii AI Subscription is Active",
        description: "Sent after a successful subscription payment",
        category: "billing",
        lastUpdated: "2024-04-28",
    },
    {
        id: "payment-failed",
        name: "Payment Failed",
        subject: "Action Required: Payment Failed for Your Akii AI Subscription",
        description: "Sent when a subscription payment fails",
        category: "billing",
        lastUpdated: "2024-04-15",
    },
    {
        id: "agent-created",
        name: "Agent Created",
        subject: "Your New AI Agent is Ready to Use",
        description: "Sent when a user creates a new AI agent",
        category: "product",
        lastUpdated: "2024-05-12",
    },
    {
        id: "document-processed",
        name: "Document Processing Complete",
        subject: "Your Documents Have Been Processed",
        description: "Sent when document processing is complete",
        category: "product",
        lastUpdated: "2024-05-08",
    },
];
const AdminEmailTemplates = () => {
    return (_jsxs("div", { className: "container mx-auto py-8 max-w-7xl", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Email Templates" }), _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), " Create Template"] })] }), _jsxs(Tabs, { defaultValue: "templates", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "editor", children: "Template Editor" }), _jsx(TabsTrigger, { value: "settings", children: "Email Settings" }), _jsx(TabsTrigger, { value: "test", children: "Test & Preview" })] }), _jsx(TabsContent, { value: "templates", className: "space-y-4", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Email Templates" }), _jsx(CardDescription, { children: "Manage and customize email templates sent to users" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs(Select, { defaultValue: "all", children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Filter by category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "onboarding", children: "Onboarding" }), _jsx(SelectItem, { value: "account", children: "Account" }), _jsx(SelectItem, { value: "billing", children: "Billing" }), _jsx(SelectItem, { value: "product", children: "Product" })] })] }), _jsx(Input, { type: "search", placeholder: "Search templates...", className: "w-[250px]" })] })] }) }), _jsx(CardContent, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left p-3", children: "Template Name" }), _jsx("th", { className: "text-left p-3", children: "Subject" }), _jsx("th", { className: "text-left p-3", children: "Category" }), _jsx("th", { className: "text-left p-3", children: "Last Updated" }), _jsx("th", { className: "text-right p-3", children: "Actions" })] }) }), _jsx("tbody", { children: emailTemplates.map((template) => (_jsxs("tr", { className: "border-b hover:bg-muted/50", children: [_jsx("td", { className: "p-3", children: _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: template.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: template.description })] }) }), _jsx("td", { className: "p-3", children: template.subject }), _jsx("td", { className: "p-3", children: _jsx("span", { className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary", children: template.category.charAt(0).toUpperCase() +
                                                                        template.category.slice(1) }) }), _jsx("td", { className: "p-3 text-sm", children: template.lastUpdated }), _jsx("td", { className: "p-3 text-right", children: _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", children: _jsx(Send, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive", children: _jsx(Trash, { className: "h-4 w-4" }) })] }) })] }, template.id))) })] }) }) })] }) }), _jsx(TabsContent, { value: "editor", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Template Editor" }), _jsx(CardDescription, { children: "Edit email template content and settings" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "template-name", children: "Template Name" }), _jsx(Input, { id: "template-name", defaultValue: "Welcome Email", placeholder: "Enter template name" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "template-category", children: "Category" }), _jsxs(Select, { defaultValue: "onboarding", children: [_jsx(SelectTrigger, { id: "template-category", children: _jsx(SelectValue, { placeholder: "Select category" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "onboarding", children: "Onboarding" }), _jsx(SelectItem, { value: "account", children: "Account" }), _jsx(SelectItem, { value: "billing", children: "Billing" }), _jsx(SelectItem, { value: "product", children: "Product" }), _jsx(SelectItem, { value: "marketing", children: "Marketing" }), _jsx(SelectItem, { value: "notification", children: "Notification" })] })] })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email-subject", children: "Email Subject" }), _jsx(Input, { id: "email-subject", defaultValue: "Welcome to Akii AI - Get Started Today!", placeholder: "Enter email subject" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email-sender", children: "Sender Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Input, { id: "email-sender-name", defaultValue: "Akii AI Team", placeholder: "Sender name" }), _jsx(Input, { id: "email-sender-email", defaultValue: "welcome@akii.ai", placeholder: "Sender email", type: "email" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { htmlFor: "email-content", children: "Email Content" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "HTML" }), _jsx(Button, { variant: "outline", size: "sm", children: "Visual Editor" })] })] }), _jsx(Textarea, { id: "email-content", className: "min-h-[300px] font-mono", defaultValue: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Akii AI</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://akii.ai/logo.png" alt="Akii AI Logo" width="150">
    </div>
    <h1 style="color: #4f46e5;">Welcome to Akii AI!</h1>
    <p>Hello {{user.firstName}},</p>
    <p>Thank you for joining Akii AI! We're excited to have you on board.</p>
    <p>With Akii AI, you can:</p>
    <ul>
      <li>Create powerful AI agents for your business</li>
      <li>Train them with your own data</li>
      <li>Deploy them across multiple platforms</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardUrl}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Get Started Now</a>
    </div>
    <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
    <p>Best regards,<br>The Akii AI Team</p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
      <p>© 2024 Akii AI. All rights reserved.</p>
      <p>
        <a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe</a> |
        <a href="{{privacyPolicyUrl}}" style="color: #666;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>` })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Available Variables" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{user.firstName}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{user.email}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{dashboardUrl}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{unsubscribeUrl}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{privacyPolicyUrl}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{companyName}" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { }, children: "{currentDate}" })] })] }), _jsxs("div", { className: "flex justify-end space-x-2", children: [_jsx(Button, { variant: "outline", children: "Cancel" }), _jsxs(Button, { variant: "outline", children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), " Preview"] }), _jsxs(Button, { children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), " Save Template"] })] })] })] }) }), _jsx(TabsContent, { value: "settings", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Email Settings" }), _jsx(CardDescription, { children: "Configure global email settings and defaults" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "default-sender-name", children: "Default Sender Name" }), _jsx(Input, { id: "default-sender-name", defaultValue: "Akii AI Team" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "default-sender-email", children: "Default Sender Email" }), _jsx(Input, { id: "default-sender-email", defaultValue: "no-reply@akii.ai", type: "email" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "reply-to-email", children: "Reply-To Email" }), _jsx(Input, { id: "reply-to-email", defaultValue: "support@akii.ai", type: "email" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email-footer", children: "Default Email Footer" }), _jsx(Textarea, { id: "email-footer", defaultValue: "\u00A9 2024 Akii AI. All rights reserved." })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Email Delivery" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Track Email Opens" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track when recipients open emails" })] }), _jsx(Switch, { id: "track-opens", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Track Link Clicks" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Track when recipients click links in emails" })] }), _jsx(Switch, { id: "track-clicks", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Unsubscribe Link" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Include unsubscribe link in all marketing emails" })] }), _jsx(Switch, { id: "unsubscribe-link", defaultChecked: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Email Throttling" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Limit the number of emails sent per hour" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Input, { id: "email-throttle", type: "number", defaultValue: "100", className: "w-[100px]" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "per hour" })] })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { children: "Save Settings" }) })] })] }) }), _jsx(TabsContent, { value: "test", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Test & Preview" }), _jsx(CardDescription, { children: "Preview and send test emails to verify templates" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "test-template", children: "Select Template" }), _jsxs(Select, { defaultValue: "welcome", children: [_jsx(SelectTrigger, { id: "test-template", children: _jsx(SelectValue, { placeholder: "Select template" }) }), _jsx(SelectContent, { children: emailTemplates.map((template) => (_jsx(SelectItem, { value: template.id, children: template.name }, template.id))) })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "test-email", children: "Test Email Address" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { id: "test-email", type: "email", placeholder: "Enter email address", className: "flex-1" }), _jsxs(Button, { children: [_jsx(Send, { className: "h-4 w-4 mr-2" }), " Send Test"] })] })] }), _jsxs("div", { className: "border rounded-md p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-medium", children: "Email Preview" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", children: "Desktop" }), _jsx(Button, { variant: "outline", size: "sm", children: "Mobile" })] })] }), _jsx("div", { className: "border rounded-md p-4 bg-white min-h-[400px] overflow-auto", children: _jsxs("div", { className: "max-w-[600px] mx-auto", children: [_jsx("div", { className: "text-center mb-4", children: _jsx("div", { className: "w-[150px] h-[40px] bg-primary/20 mx-auto mb-2" }) }), _jsx("h1", { className: "text-xl font-bold text-primary mb-4", children: "Welcome to Akii AI!" }), _jsx("p", { className: "mb-2", children: "Hello John," }), _jsx("p", { className: "mb-2", children: "Thank you for joining Akii AI! We're excited to have you on board." }), _jsx("p", { className: "mb-2", children: "With Akii AI, you can:" }), _jsxs("ul", { className: "list-disc pl-5 mb-4", children: [_jsx("li", { children: "Create powerful AI agents for your business" }), _jsx("li", { children: "Train them with your own data" }), _jsx("li", { children: "Deploy them across multiple platforms" })] }), _jsx("div", { className: "text-center my-6", children: _jsx("button", { className: "bg-primary text-white px-6 py-2 rounded", children: "Get Started Now" }) }), _jsx("p", { className: "mb-2", children: "If you have any questions, feel free to reply to this email or contact our support team." }), _jsxs("p", { className: "mb-4", children: ["Best regards,", _jsx("br", {}), "The Akii AI Team"] }), _jsxs("div", { className: "text-xs text-muted-foreground text-center border-t pt-4 mt-6", children: [_jsx("p", { children: "\u00A9 2024 Akii AI. All rights reserved." }), _jsxs("p", { className: "mt-1", children: [_jsx("a", { href: "#", className: "text-muted-foreground underline", children: "Unsubscribe" }), " ", "|", _jsx("a", { href: "#", className: "text-muted-foreground underline ml-1", children: "Privacy Policy" })] })] })] }) })] })] })] }) })] })] }));
};
export default AdminEmailTemplates;
const Save = ({ className }) => {
    return (_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: className, children: [_jsx("path", { d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }), _jsx("polyline", { points: "17 21 17 13 7 13 7 21" }), _jsx("polyline", { points: "7 3 7 8 15 8" })] }));
};
