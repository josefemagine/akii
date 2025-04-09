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
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { stripeAdminClient } from '@/lib/stripe-admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
// Define the plan schema for form validation
const planSchema = z.object({
    name: z.string().min(1, 'Plan name is required'),
    description: z.string().min(1, 'Description is required'),
    price_monthly: z.coerce.number().min(0, 'Price must be a positive number'),
    price_annual: z.coerce.number().min(0, 'Price must be a positive number'),
    is_active: z.boolean().default(true),
    message_limit: z.coerce.number().min(0, 'Message limit must be a positive number'),
    stripe_price_id: z.string().optional(),
    stripe_product_id: z.string().optional(),
    features: z.array(z.string()).default([]),
});
// Define the feature input schema
const featureSchema = z.object({
    feature: z.string().min(1, 'Feature cannot be empty'),
});
export default function ManagePlans() {
    const { toast } = useToast();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncingPlan, setSyncingPlan] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlanId, setCurrentPlanId] = useState(null);
    const [features, setFeatures] = useState([]);
    const [newFeature, setNewFeature] = useState('');
    // Initialize the form
    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            description: '',
            price_monthly: 0,
            price_annual: 0,
            is_active: true,
            message_limit: 0,
            stripe_price_id: '',
            stripe_product_id: '',
            features: [],
        },
    });
    const featureForm = useForm({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            feature: '',
        },
    });
    // Load plans from the database
    useEffect(() => {
        fetchPlans();
    }, []);
    const fetchPlans = () => __awaiter(this, void 0, void 0, function* () {
        setLoading(true);
        try {
            const { data, error } = yield supabase
                .from('subscription_plans')
                .select('*')
                .order('price_monthly', { ascending: true });
            if (error)
                throw error;
            setPlans(data || []);
        }
        catch (error) {
            console.error('Error fetching plans:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch subscription plans',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    });
    // Handle opening the edit dialog
    const handleEdit = (plan) => {
        setIsEditing(true);
        setCurrentPlanId(plan.id);
        setFeatures(plan.features || []);
        form.reset({
            name: plan.name,
            description: plan.description,
            price_monthly: plan.price_monthly,
            price_annual: plan.price_annual,
            is_active: plan.is_active,
            message_limit: plan.message_limit,
            stripe_price_id: plan.stripe_price_id || '',
            stripe_product_id: plan.stripe_product_id || '',
            features: [],
        });
        setOpenDialog(true);
    };
    // Handle opening the create dialog
    const handleCreate = () => {
        setIsEditing(false);
        setCurrentPlanId(null);
        setFeatures([]);
        form.reset({
            name: '',
            description: '',
            price_monthly: 0,
            price_annual: 0,
            is_active: true,
            message_limit: 0,
            stripe_price_id: '',
            stripe_product_id: '',
            features: [],
        });
        setOpenDialog(true);
    };
    // Handle form submission
    const onSubmit = (values) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Add features to the form data
            values.features = features;
            if (isEditing && currentPlanId) {
                // Update existing plan
                const { error } = yield supabase
                    .from('subscription_plans')
                    .update(Object.assign(Object.assign({}, values), { updated_at: new Date().toISOString() }))
                    .eq('id', currentPlanId);
                if (error)
                    throw error;
                toast({
                    title: 'Success',
                    description: 'Plan updated successfully',
                });
            }
            else {
                // Create new plan
                const { error, data } = yield supabase
                    .from('subscription_plans')
                    .insert(Object.assign(Object.assign({}, values), { created_at: new Date().toISOString(), updated_at: new Date().toISOString() }))
                    .select();
                if (error)
                    throw error;
                setCurrentPlanId((_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0 ? void 0 : _a.id);
                toast({
                    title: 'Success',
                    description: 'Plan created successfully',
                });
            }
            // Refresh the plans list
            yield fetchPlans();
            setOpenDialog(false);
        }
        catch (error) {
            console.error('Error saving plan:', error);
            toast({
                title: 'Error',
                description: 'Failed to save subscription plan',
                variant: 'destructive',
            });
        }
    });
    // Handle adding a feature
    const handleAddFeature = (data) => {
        if (data.feature.trim()) {
            setFeatures([...features, data.feature.trim()]);
            featureForm.reset({ feature: '' });
        }
    };
    // Handle removing a feature
    const handleRemoveFeature = (index) => {
        const newFeatures = [...features];
        newFeatures.splice(index, 1);
        setFeatures(newFeatures);
    };
    // Handle syncing a plan to Stripe
    const handleSyncPlan = (planId) => __awaiter(this, void 0, void 0, function* () {
        try {
            setSyncingPlan(planId);
            yield stripeAdminClient.syncPlanToStripe(planId, 'create');
            toast({
                title: 'Success',
                description: 'Plan synced to Stripe successfully',
            });
            // Refresh the plans list
            yield fetchPlans();
        }
        catch (error) {
            console.error('Error syncing plan to Stripe:', error);
            toast({
                title: 'Error',
                description: 'Failed to sync plan to Stripe',
                variant: 'destructive',
            });
        }
        finally {
            setSyncingPlan(null);
        }
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Subscription Plans" }), _jsx("p", { className: "text-muted-foreground", children: "Manage and sync subscription plans with Stripe" })] }), _jsxs(Button, { onClick: handleCreate, children: [_jsx(PlusCircle, { className: "mr-2 h-4 w-4" }), "Create New Plan"] })] }), loading ? (_jsx("div", { className: "flex justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) })) : plans.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-8", children: [_jsx(AlertCircle, { className: "h-10 w-10 text-muted-foreground mb-4" }), _jsx("p", { className: "text-center text-muted-foreground", children: "No subscription plans found" }), _jsx(Button, { variant: "outline", className: "mt-4", onClick: handleCreate, children: "Create Your First Plan" })] }) })) : (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Subscription Plans" }), _jsx(CardDescription, { children: "Create, edit, and sync your subscription plans with Stripe" })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Name" }), _jsx(TableHead, { children: "Monthly Price" }), _jsx(TableHead, { children: "Yearly Price" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Stripe Sync" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: plans.map((plan) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: plan.name }), _jsxs(TableCell, { children: ["$", plan.price_monthly] }), _jsxs(TableCell, { children: ["$", plan.price_annual] }), _jsx(TableCell, { children: plan.is_active ? (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800", children: "Active" })) : (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800", children: "Inactive" })) }), _jsx(TableCell, { children: plan.stripe_product_id ? (_jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "h-4 w-4 text-green-500 mr-2" }), _jsx("span", { className: "text-sm", children: "Synced" })] })) : (_jsxs("div", { className: "flex items-center", children: [_jsx(AlertCircle, { className: "h-4 w-4 text-amber-500 mr-2" }), _jsx("span", { className: "text-sm", children: "Not synced" })] })) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleEdit(plan), children: "Edit" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleSyncPlan(plan.id), disabled: syncingPlan === plan.id, children: syncingPlan === plan.id ? (_jsx(RefreshCw, { className: "h-4 w-4 animate-spin" })) : ('Sync to Stripe') })] }) })] }, plan.id))) })] }) })] })), _jsx(Dialog, { open: openDialog, onOpenChange: setOpenDialog, children: _jsxs(DialogContent, { className: "max-w-2xl", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: isEditing ? 'Edit Plan' : 'Create New Plan' }), _jsx(DialogDescription, { children: isEditing
                                        ? 'Update the details of your subscription plan'
                                        : 'Create a new subscription plan for your customers' })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs(Tabs, { defaultValue: "details", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "details", children: "Basic Details" }), _jsx(TabsTrigger, { value: "pricing", children: "Pricing" }), _jsx(TabsTrigger, { value: "limits", children: "Limits" }), _jsx(TabsTrigger, { value: "features", children: "Features" })] }), _jsxs(TabsContent, { value: "details", className: "space-y-4 pt-4", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Plan Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Pro" }, field)) }), _jsx(FormDescription, { children: "A short, descriptive name for the subscription plan" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, Object.assign({ placeholder: "Perfect for small teams and businesses" }, field)) }), _jsx(FormDescription, { children: "A detailed description of what the plan offers" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "is_active", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(FormLabel, { className: "text-base", children: "Active" }), _jsx(FormDescription, { children: "Inactive plans won't be shown to customers" })] }), _jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange }) })] })) })] }), _jsxs(TabsContent, { value: "pricing", className: "space-y-4 pt-4", children: [_jsx(FormField, { control: form.control, name: "price_monthly", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Monthly Price ($)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", min: "0", step: "0.01", placeholder: "9.99" }, field)) }), _jsx(FormDescription, { children: "The price per month in USD" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "price_annual", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Yearly Price ($)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", min: "0", step: "0.01", placeholder: "99.99" }, field)) }), _jsx(FormDescription, { children: "The price per year in USD (typically offered at a discount)" }), _jsx(FormMessage, {})] })) })] }), _jsx(TabsContent, { value: "limits", className: "space-y-4 pt-4", children: _jsx(FormField, { control: form.control, name: "message_limit", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Monthly Message Limit" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ type: "number", min: "0", placeholder: "1000" }, field)) }), _jsx(FormDescription, { children: "Maximum number of AI messages allowed per month" }), _jsx(FormMessage, {})] })) }) }), _jsx(TabsContent, { value: "features", className: "space-y-4 pt-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: "Add features that will be displayed to customers" }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Input, { value: newFeature, onChange: (e) => setNewFeature(e.target.value), placeholder: "Enter a feature", className: "flex-1" }), _jsx(Button, { type: "button", onClick: () => {
                                                                        if (newFeature.trim()) {
                                                                            setFeatures([...features, newFeature.trim()]);
                                                                            setNewFeature('');
                                                                        }
                                                                    }, children: "Add" })] }), _jsx("div", { className: "mt-4", children: features.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "No features added yet" })) : (_jsx("ul", { className: "space-y-2", children: features.map((feature, index) => (_jsxs("li", { className: "flex justify-between items-center p-2 border rounded-md", children: [_jsx("span", { children: feature }), _jsx(Button, { type: "button", variant: "ghost", size: "sm", onClick: () => handleRemoveFeature(index), children: _jsx(Trash2, { className: "h-4 w-4 text-red-500" }) })] }, index))) })) })] }) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(Button, { type: "submit", children: isEditing ? 'Update Plan' : 'Create Plan' })] })] }) }))] }) })] }));
}
