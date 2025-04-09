var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Edit, Trash, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// Validation schema
const planSchema = z.object({
    name: z.string().min(1, "Plan name is required"),
    code: z.string().min(1, "Plan code is required"),
    description: z.string().min(1, "Description is required"),
    price_monthly: z.coerce.number().min(0, "Price must be a positive number"),
    price_annual: z.coerce.number().min(0, "Price must be a positive number"),
    is_active: z.boolean().default(true),
    has_trial: z.boolean().default(false),
    trial_days: z.coerce.number().min(0, "Trial days must be a positive number").default(0),
    message_limit: z.coerce.number().min(0, "Message limit must be a positive number"),
    has_overage: z.boolean().default(false),
    overage_rate: z.coerce.number().min(0, "Overage rate must be a positive number").default(0),
    bedrock_model_id: z.string().min(1, "Bedrock model is required"),
    features: z.array(z.string()).default([]),
    is_popular: z.boolean().default(false),
});
// Available Bedrock models
const bedrockModels = [
    { id: "amazon.titan-text-lite-v1", name: "Amazon Titan Text Lite", provider: "Amazon" },
    { id: "amazon.titan-text-express-v1", name: "Amazon Titan Text Express", provider: "Amazon" },
    { id: "anthropic.claude-instant-v1", name: "Claude Instant v1", provider: "Anthropic" },
    { id: "anthropic.claude-v2", name: "Claude v2", provider: "Anthropic" },
    { id: "anthropic.claude-3-sonnet-20240229-v1:0", name: "Claude 3 Sonnet", provider: "Anthropic" },
    { id: "anthropic.claude-3-haiku-20240307-v1:0", name: "Claude 3 Haiku", provider: "Anthropic" },
    { id: "meta.llama2-13b-chat-v1", name: "Llama 2 13B", provider: "Meta" },
];
export default function PlansPage() {
    const { toast } = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);
    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            code: "",
            description: "",
            price_monthly: 0,
            price_annual: 0,
            is_active: true,
            has_trial: false,
            trial_days: 0,
            message_limit: 0,
            has_overage: false,
            overage_rate: 0,
            bedrock_model_id: "",
            features: [],
            is_popular: false,
        },
    });
    // Fetch plans
    useEffect(() => {
        const fetchPlans = () => __awaiter(this, void 0, void 0, function* () {
            try {
                setLoading(true);
                const { data, error } = yield supabase
                    .from("subscription_plans")
                    .select("*")
                    .order("price_monthly", { ascending: true });
                if (error)
                    throw error;
                setPlans(data || []);
            }
            catch (error) {
                console.error("Error fetching plans:", error);
                toast({
                    title: "Error",
                    description: "Failed to load plans. Please try again.",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
        });
        fetchPlans();
    }, [toast]);
    // Reset form when editing a plan
    useEffect(() => {
        if (editingPlan) {
            form.reset({
                name: editingPlan.name,
                code: editingPlan.code,
                description: editingPlan.description,
                price_monthly: editingPlan.price_monthly,
                price_annual: editingPlan.price_annual,
                is_active: editingPlan.is_active,
                has_trial: editingPlan.has_trial || false,
                trial_days: editingPlan.trial_days || 0,
                message_limit: editingPlan.message_limit,
                has_overage: editingPlan.has_overage || false,
                overage_rate: editingPlan.overage_rate || 0,
                bedrock_model_id: editingPlan.bedrock_model_id,
                features: editingPlan.features || [],
                is_popular: editingPlan.is_popular || false,
            });
        }
        else {
            form.reset({
                name: "",
                code: "",
                description: "",
                price_monthly: 0,
                price_annual: 0,
                is_active: true,
                has_trial: false,
                trial_days: 0,
                message_limit: 0,
                has_overage: false,
                overage_rate: 0,
                bedrock_model_id: bedrockModels[0].id,
                features: [],
                is_popular: false,
            });
        }
    }, [editingPlan, form]);
    const handleEditPlan = (plan) => {
        setEditingPlan(plan);
        setIsDialogOpen(true);
    };
    const handleCreatePlan = () => {
        setEditingPlan(null);
        setIsDialogOpen(true);
    };
    const handleDeletePlan = (plan) => {
        setPlanToDelete(plan);
        setDeleteDialogOpen(true);
    };
    const confirmDeletePlan = () => __awaiter(this, void 0, void 0, function* () {
        if (!planToDelete)
            return;
        try {
            const { error } = yield supabase
                .from("subscription_plans")
                .delete()
                .eq("id", planToDelete.id);
            if (error)
                throw error;
            setPlans(plans.filter(p => p.id !== planToDelete.id));
            toast({
                title: "Success",
                description: `${planToDelete.name} plan has been deleted.`,
            });
        }
        catch (error) {
            console.error("Error deleting plan:", error);
            toast({
                title: "Error",
                description: "Failed to delete plan. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setDeleteDialogOpen(false);
            setPlanToDelete(null);
        }
    });
    const onSubmit = (values) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Calculate annual price if not manually set (16% discount)
            if (values.price_annual === 0 && values.price_monthly > 0) {
                values.price_annual = Math.round(values.price_monthly * 12 * 0.84);
            }
            if (editingPlan) {
                // Update existing plan
                const { error } = yield supabase
                    .from("subscription_plans")
                    .update(values)
                    .eq("id", editingPlan.id);
                if (error)
                    throw error;
                // Update local state
                setPlans(plans.map((plan) => (plan.id === editingPlan.id ? Object.assign(Object.assign({}, plan), values) : plan)));
                toast({
                    title: "Success",
                    description: `${values.name} plan has been updated.`,
                });
            }
            else {
                // Create new plan
                const { data, error } = yield supabase
                    .from("subscription_plans")
                    .insert(values)
                    .select();
                if (error)
                    throw error;
                // Update local state with the new plan
                setPlans([...plans, data[0]]);
                toast({
                    title: "Success",
                    description: `${values.name} plan has been created.`,
                });
            }
            setIsDialogOpen(false);
        }
        catch (error) {
            console.error("Error saving plan:", error);
            toast({
                title: "Error",
                description: "Failed to save plan. Please try again.",
                variant: "destructive",
            });
        }
    });
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }).format(amount);
    };
    // Get model name from ID
    const getModelName = (modelId) => {
        const model = bedrockModels.find(m => m.id === modelId);
        return model ? model.name : modelId;
    };
    return (_jsxs("div", { className: "container py-10 space-y-6 max-w-7xl", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Subscription Plans" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Manage your subscription plans and pricing tiers" })] }), _jsxs(Button, { onClick: handleCreatePlan, children: [_jsx(PlusCircle, { className: "h-4 w-4 mr-2" }), "New Plan"] })] }), _jsxs(Card, { className: "bg-card border-border", children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsx(CardTitle, { children: "Plan Management" }), _jsx(CardDescription, { children: "All subscription plans available to your customers" })] }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "py-20 flex justify-center items-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) })) : plans.length === 0 ? (_jsxs("div", { className: "py-12 text-center border border-dashed rounded-md bg-muted/20 border-border", children: [_jsx("h3", { className: "text-lg font-medium mb-2", children: "No plans found" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "You haven't created any subscription plans yet." }), _jsxs(Button, { onClick: handleCreatePlan, children: [_jsx(PlusCircle, { className: "h-4 w-4 mr-2" }), "Create Your First Plan"] })] })) : (_jsx("div", { className: "rounded-md border border-border overflow-hidden", children: _jsxs(Table, { children: [_jsx(TableHeader, { className: "bg-muted/50", children: _jsxs(TableRow, { className: "hover:bg-muted/50", children: [_jsx(TableHead, { className: "w-[250px]", children: "Plan" }), _jsx(TableHead, { children: "Price (Monthly/Annual)" }), _jsx(TableHead, { children: "Message Limit" }), _jsx(TableHead, { children: "Bedrock Model" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: plans.map((plan) => (_jsxs(TableRow, { className: "hover:bg-muted/20", children: [_jsxs(TableCell, { className: "font-medium", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { children: plan.name }), plan.is_popular && (_jsx(Badge, { variant: "secondary", className: "bg-primary/10 text-primary border-primary/20", children: "Popular" }))] }), _jsx("div", { className: "text-muted-foreground text-sm mt-1", children: plan.description })] }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { children: [formatCurrency(plan.price_monthly), " / month"] }), _jsxs("span", { className: "text-muted-foreground text-sm", children: [formatCurrency(plan.price_annual), " / year"] })] }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("span", { children: [plan.message_limit.toLocaleString(), " messages"] }), plan.has_overage && (_jsxs("span", { className: "text-muted-foreground text-sm", children: ["$", plan.overage_rate, " per message overage"] }))] }) }), _jsx(TableCell, { children: _jsx("span", { children: getModelName(plan.bedrock_model_id) }) }), _jsx(TableCell, { children: plan.is_active ? (_jsxs(Badge, { variant: "outline", className: "bg-green-500/10 text-green-500 border-green-500/20", children: [_jsx(Check, { className: "h-3.5 w-3.5 mr-1" }), "Active"] })) : (_jsxs(Badge, { variant: "outline", className: "bg-muted text-muted-foreground border-border", children: [_jsx(X, { className: "h-3.5 w-3.5 mr-1" }), "Inactive"] })) }), _jsx(TableCell, { className: "text-right", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEditPlan(plan), className: "border-border hover:bg-muted", children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), "Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleDeletePlan(plan), className: "border-destructive/50 text-destructive hover:bg-destructive/10", children: [_jsx(Trash, { className: "h-4 w-4 mr-1" }), "Delete"] })] }) })] }, plan.id))) })] }) })) })] }), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "max-w-4xl bg-background border-border dark:bg-gray-800", children: [_jsxs(DialogHeader, { className: "text-foreground", children: [_jsx(DialogTitle, { children: editingPlan ? 'Edit Plan' : 'Create a new subscription plan for your customers' }), _jsx(DialogDescription, { className: "text-muted-foreground", children: editingPlan
                                        ? 'Make changes to the subscription plan below.'
                                        : 'Fill in the details below to create a new subscription plan.' })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs(Tabs, { defaultValue: "basic", className: "w-full", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full bg-muted dark:bg-gray-700 mb-4", children: [_jsx(TabsTrigger, { value: "basic", className: "data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800", children: "Basic Details" }), _jsx(TabsTrigger, { value: "pricing", className: "data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800", children: "Pricing" }), _jsx(TabsTrigger, { value: "limits", className: "data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800", children: "Limits" }), _jsx(TabsTrigger, { value: "features", className: "data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800", children: "Features" })] }), _jsxs(TabsContent, { value: "basic", className: "mt-0 space-y-4 bg-background dark:bg-gray-800", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Pro" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "A short, descriptive name for the subscription plan" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "code", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Code" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "pro" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "An internal code for this plan (e.g., 'pro', 'enterprise')" }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Description" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Perfect for small teams and businesses" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "A detailed description of what the plan offers" }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(FormField, { control: form.control, name: "is_active", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [_jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange, className: "data-[state=checked]:bg-primary" }) }), _jsxs("div", { className: "space-y-1 leading-none", children: [_jsx(FormLabel, { className: "text-foreground", children: "Active" }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Inactive plans won't be shown to customers" })] })] })) }), _jsx(FormField, { control: form.control, name: "is_popular", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0", children: [_jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange, className: "data-[state=checked]:bg-primary" }) }), _jsxs("div", { className: "space-y-1 leading-none", children: [_jsx(FormLabel, { className: "text-foreground", children: "Popular" }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Highlight this as a popular choice" })] })] })) })] })] }), _jsxs(TabsContent, { value: "pricing", className: "mt-0 space-y-4 bg-background dark:bg-gray-800", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "price_monthly", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Monthly Price ($)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", placeholder: "99" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "The monthly subscription price in USD" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "price_annual", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Annual Price ($)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", placeholder: "990" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "The annual subscription price in USD (leave at 0 for auto 16% discount)" }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { children: _jsx(FormField, { control: form.control, name: "has_trial", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0 mb-2", children: [_jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange, className: "data-[state=checked]:bg-primary" }) }), _jsxs("div", { className: "space-y-1 leading-none", children: [_jsx(FormLabel, { className: "text-foreground", children: "Has Trial" }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Allow customers to try this plan before paying" })] })] })) }) }), form.watch("has_trial") && (_jsx(FormField, { control: form.control, name: "trial_days", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Trial Days" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", placeholder: "14" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Number of days for the trial period" }), _jsx(FormMessage, {})] })) }))] })] }), _jsxs(TabsContent, { value: "limits", className: "mt-0 space-y-4 bg-background dark:bg-gray-800", children: [_jsx(FormField, { control: form.control, name: "message_limit", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Monthly Message Limit" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", placeholder: "5000" }, field, { className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Maximum number of messages per month" }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx("div", { children: _jsx(FormField, { control: form.control, name: "has_overage", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center space-x-3 space-y-0 mb-2", children: [_jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange, className: "data-[state=checked]:bg-primary" }) }), _jsxs("div", { className: "space-y-1 leading-none", children: [_jsx(FormLabel, { className: "text-foreground", children: "Allow Overage" }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Allow customers to exceed limits for an additional fee" })] })] })) }) }), form.watch("has_overage") && (_jsx(FormField, { control: form.control, name: "overage_rate", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Overage Rate ($)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", placeholder: "0.01" }, field, { step: "0.001", className: "border-input bg-background dark:bg-gray-700 text-foreground" })) }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Cost per message beyond the limit" }), _jsx(FormMessage, {})] })) }))] }), _jsx(FormField, { control: form.control, name: "bedrock_model_id", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { className: "text-foreground", children: "Bedrock Model" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { className: "w-full border-input bg-background dark:bg-gray-700 text-foreground", children: _jsx(SelectValue, { placeholder: "Select a model" }) }) }), _jsx(SelectContent, { className: "bg-popover dark:bg-gray-700 border-border text-foreground", children: bedrockModels.map((model) => (_jsxs(SelectItem, { value: model.id, children: [model.name, " (", model.provider, ")"] }, model.id))) })] }), _jsx(FormDescription, { className: "text-muted-foreground", children: "The default AWS Bedrock model for this plan" }), _jsx(FormMessage, {})] })) })] }), _jsx(TabsContent, { value: "features", className: "mt-0 bg-background dark:bg-gray-800", children: _jsx(FormField, { control: form.control, name: "features", render: ({ field }) => (_jsxs(FormItem, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(FormLabel, { className: "text-foreground", children: "Features" }), _jsx(FormDescription, { className: "text-muted-foreground", children: "Add features that will be displayed on the subscription plan card" })] }), field.value.length > 0 ? (_jsx("div", { className: "space-y-2", children: field.value.map((feature, index) => (_jsxs("div", { className: "flex items-center gap-2 p-2 rounded bg-muted dark:bg-gray-700", children: [_jsx("span", { className: "text-foreground flex-1", children: feature }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => {
                                                                                const newFeatures = [...field.value];
                                                                                newFeatures.splice(index, 1);
                                                                                field.onChange(newFeatures);
                                                                            }, className: "h-8 w-8 p-0 text-destructive hover:text-destructive/90", children: _jsx(Trash, { className: "h-4 w-4" }) })] }, index))) })) : (_jsx("div", { className: "text-center p-4 border border-dashed rounded border-input dark:border-gray-600", children: _jsx("p", { className: "text-muted-foreground", children: "No features added yet" }) })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "new-feature", placeholder: "Add a new feature...", className: "flex-1 border-input bg-background dark:bg-gray-700 text-foreground", onKeyDown: (e) => {
                                                                            if (e.key === 'Enter') {
                                                                                e.preventDefault();
                                                                                const input = e.currentTarget;
                                                                                const feature = input.value.trim();
                                                                                if (feature) {
                                                                                    field.onChange([...field.value, feature]);
                                                                                    input.value = '';
                                                                                }
                                                                            }
                                                                        } }), _jsx(Button, { type: "button", onClick: () => {
                                                                            const input = document.getElementById('new-feature');
                                                                            const feature = input.value.trim();
                                                                            if (feature) {
                                                                                field.onChange([...field.value, feature]);
                                                                                input.value = '';
                                                                            }
                                                                        }, children: "Add" })] }), _jsx(FormMessage, {})] })) }) })] }), _jsxs(DialogFooter, { className: "flex justify-between pt-4 border-t border-border", children: [editingPlan && (_jsxs(Button, { type: "button", variant: "destructive", onClick: () => {
                                                    setIsDialogOpen(false);
                                                    setPlanToDelete(editingPlan);
                                                    setDeleteDialogOpen(true);
                                                }, className: "mr-auto", children: [_jsx(Trash, { className: "h-4 w-4 mr-2" }), "Delete Plan"] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setIsDialogOpen(false), className: "bg-background dark:bg-gray-800 border-border text-foreground hover:bg-muted", children: "Cancel" }), _jsx(Button, { type: "submit", children: editingPlan ? 'Update Plan' : 'Create Plan' })] })] })] }) }))] }) }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(DialogContent, { className: "bg-background dark:bg-gray-800 border-border", children: [_jsxs(DialogHeader, { className: "text-foreground", children: [_jsx(DialogTitle, { children: "Are you sure?" }), _jsxs(DialogDescription, { className: "text-muted-foreground", children: ["This will permanently delete the \"", planToDelete === null || planToDelete === void 0 ? void 0 : planToDelete.name, "\" plan.", (planToDelete === null || planToDelete === void 0 ? void 0 : planToDelete.is_active) && (_jsx("span", { className: "block mt-2 font-medium text-destructive", children: "Warning: This plan is currently active and may have subscribers." }))] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setDeleteDialogOpen(false), className: "bg-background dark:bg-gray-800 border-border text-foreground hover:bg-muted", children: "Cancel" }), _jsx(Button, { variant: "destructive", onClick: confirmDeletePlan, children: "Delete Plan" })] })] }) })] }));
}
