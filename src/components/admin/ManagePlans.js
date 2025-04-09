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
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Trash2, Plus, Edit2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
// Form schema for validating plan data
const planSchema = z.object({
    name: z.string().min(2, 'Name is required').max(64),
    description: z.string().max(255).nullable(),
    message_limit: z.coerce.number().min(0),
    price_monthly: z.coerce.number().min(0),
    price_annual: z.coerce.number().min(0),
    stripe_price_id_monthly: z.string().nullable(),
    stripe_price_id_annual: z.string().nullable(),
    is_active: z.boolean().default(true),
});
export default function ManagePlans() {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            description: null,
            message_limit: 0,
            price_monthly: 0,
            price_annual: 0,
            stripe_price_id_monthly: null,
            stripe_price_id_annual: null,
            is_active: true,
        },
    });
    // Fetch plans from database
    const fetchPlans = () => __awaiter(this, void 0, void 0, function* () {
        setIsLoading(true);
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
                title: 'Error fetching plans',
                description: 'Please try again or contact support.',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    useEffect(() => {
        fetchPlans();
    }, []);
    // Reset form for new plan
    const handleNewPlan = () => {
        form.reset({
            name: '',
            description: null,
            message_limit: 0,
            price_monthly: 0,
            price_annual: 0,
            stripe_price_id_monthly: null,
            stripe_price_id_annual: null,
            is_active: true,
        });
        setSelectedPlan(null);
        setIsEditDialogOpen(true);
    };
    // Set up form for editing existing plan
    const handleEditPlan = (plan) => {
        form.reset({
            name: plan.name,
            description: plan.description,
            message_limit: plan.message_limit,
            price_monthly: plan.price_monthly,
            price_annual: plan.price_annual,
            stripe_price_id_monthly: plan.stripe_price_id_monthly,
            stripe_price_id_annual: plan.stripe_price_id_annual,
            is_active: plan.is_active,
        });
        setSelectedPlan(plan);
        setIsEditDialogOpen(true);
    };
    // Set up plan for deletion
    const handleDeletePlanClick = (plan) => {
        setSelectedPlan(plan);
        setIsDeleteDialogOpen(true);
    };
    // Delete plan
    const handleDeletePlan = () => __awaiter(this, void 0, void 0, function* () {
        if (!selectedPlan)
            return;
        try {
            const { error } = yield supabase
                .from('subscription_plans')
                .delete()
                .eq('id', selectedPlan.id);
            if (error)
                throw error;
            toast({
                title: 'Plan deleted',
                description: `Successfully deleted ${selectedPlan.name} plan.`,
            });
            fetchPlans();
        }
        catch (error) {
            console.error('Error deleting plan:', error);
            toast({
                title: 'Error deleting plan',
                description: 'Please try again or contact support.',
                variant: 'destructive',
            });
        }
        finally {
            setIsDeleteDialogOpen(false);
        }
    });
    // Save plan (create or update)
    const onSubmit = (values) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (selectedPlan) {
                // Update existing plan
                const { error } = yield supabase
                    .from('subscription_plans')
                    .update(values)
                    .eq('id', selectedPlan.id);
                if (error)
                    throw error;
                toast({
                    title: 'Plan updated',
                    description: `Successfully updated ${values.name} plan.`,
                });
            }
            else {
                // Create new plan
                const { error } = yield supabase
                    .from('subscription_plans')
                    .insert([values]);
                if (error)
                    throw error;
                toast({
                    title: 'Plan created',
                    description: `Successfully created ${values.name} plan.`,
                });
            }
            setIsEditDialogOpen(false);
            fetchPlans();
        }
        catch (error) {
            console.error('Error saving plan:', error);
            toast({
                title: 'Error saving plan',
                description: 'Please try again or contact support.',
                variant: 'destructive',
            });
        }
    });
    // Format price as currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price / 100);
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-3xl font-bold tracking-tight", children: "Subscription Plans" }), _jsxs(Button, { onClick: handleNewPlan, children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Add Plan"] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: plans.map((plan) => (_jsxs(Card, { className: !plan.is_active ? 'opacity-70' : '', children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: plan.name }), !plan.is_active && (_jsxs("div", { className: "text-amber-500 text-sm flex items-center mt-1", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), " Inactive"] }))] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => handleEditPlan(plan), children: _jsx(Edit2, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => handleDeletePlanClick(plan), children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsx(CardDescription, { children: plan.description })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Message Limit" }), _jsxs("div", { children: [plan.message_limit.toLocaleString(), " per month"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Monthly Price" }), _jsxs("div", { children: [formatPrice(plan.price_monthly), "/month"] })] }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium", children: "Annual Price" }), _jsxs("div", { children: [formatPrice(plan.price_annual), "/year"] })] })] }) }), _jsxs(CardFooter, { className: "flex justify-between", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["ID: ", plan.id.substring(0, 8), "..."] }), !plan.stripe_price_id_monthly && !plan.stripe_price_id_annual && (_jsxs("div", { className: "text-amber-500 text-sm flex items-center", children: [_jsx(AlertTriangle, { className: "h-4 w-4 mr-1" }), " No Stripe IDs"] }))] })] }, plan.id))) }), _jsx(Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-[600px]", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: selectedPlan ? 'Edit Plan' : 'Create New Plan' }), _jsx(DialogDescription, { children: selectedPlan
                                        ? 'Update the details for this subscription plan.'
                                        : 'Fill in the details to create a new subscription plan.' })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs(Tabs, { defaultValue: "general", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "general", children: "General" }), _jsx(TabsTrigger, { value: "stripe", children: "Stripe" })] }), _jsxs(TabsContent, { value: "general", className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Plan Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { placeholder: "e.g. Basic, Pro, Enterprise" })) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Description" }), _jsx(FormControl, { children: _jsx(Textarea, Object.assign({}, field, { value: field.value || '', placeholder: "Brief description of this plan" })) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "message_limit", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Message Limit" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { type: "number", min: "0" })) }), _jsx(FormDescription, { children: "Number of messages allowed per month" }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(FormField, { control: form.control, name: "price_monthly", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Monthly Price (cents)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { type: "number", min: "0" })) }), _jsx(FormDescription, { children: "Price in cents (e.g., 1999 = $19.99)" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "price_annual", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Annual Price (cents)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { type: "number", min: "0" })) }), _jsx(FormDescription, { children: "Price in cents (e.g., 19990 = $199.90)" }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "is_active", render: ({ field }) => (_jsxs(FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(FormLabel, { className: "text-base", children: "Active" }), _jsx(FormDescription, { children: "Whether this plan should be available for users to select" })] }), _jsx(FormControl, { children: _jsx(Switch, { checked: field.value, onCheckedChange: field.onChange }) })] })) })] }), _jsxs(TabsContent, { value: "stripe", className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "stripe_price_id_monthly", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Stripe Monthly Price ID" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { value: field.value || '', placeholder: "e.g. price_1MkTp2..." })) }), _jsx(FormDescription, { children: "The Stripe Price ID for monthly billing" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "stripe_price_id_annual", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Stripe Annual Price ID" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({}, field, { value: field.value || '', placeholder: "e.g. price_1MkTp2..." })) }), _jsx(FormDescription, { children: "The Stripe Price ID for annual billing" }), _jsx(FormMessage, {})] })) })] })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", children: "Save" }) })] }) }))] }) }), _jsx(ConfirmDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, title: "Delete Plan", description: `Are you sure you want to delete the ${selectedPlan === null || selectedPlan === void 0 ? void 0 : selectedPlan.name} plan? This action cannot be undone.`, onConfirm: handleDeletePlan })] }));
}
