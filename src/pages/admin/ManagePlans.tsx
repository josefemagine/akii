import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast.ts';
import { supabase } from "@/lib/supabase.tsx";
import { stripeAdminClient } from '@/lib/stripe-admin-client.ts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
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

type PlanFormData = z.infer<typeof planSchema>;

// Define the feature input schema
const featureSchema = z.object({
  feature: z.string().min(1, 'Feature cannot be empty'),
});

export default function ManagePlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingPlan, setSyncingPlan] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Initialize the form
  const form = useForm<PlanFormData>({
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

  const featureForm = useForm<{ feature: string }>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      feature: '',
    },
  });

  // Load plans from the database
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription plans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the edit dialog
  const handleEdit = (plan: any) => {
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
  const onSubmit = async (values: PlanFormData) => {
    try {
      // Add features to the form data
      values.features = features;
      
      if (isEditing && currentPlanId) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPlanId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Plan updated successfully',
        });
      } else {
        // Create new plan
        const { error, data } = await supabase
          .from('subscription_plans')
          .insert({
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (error) throw error;
        
        setCurrentPlanId(data?.[0]?.id);

        toast({
          title: 'Success',
          description: 'Plan created successfully',
        });
      }
      
      // Refresh the plans list
      await fetchPlans();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subscription plan',
        variant: 'destructive',
      });
    }
  };

  // Handle adding a feature
  const handleAddFeature = (data: { feature: string }) => {
    if (data.feature.trim()) {
      setFeatures([...features, data.feature.trim()]);
      featureForm.reset({ feature: '' });
    }
  };

  // Handle removing a feature
  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...features];
    newFeatures.splice(index, 1);
    setFeatures(newFeatures);
  };

  // Handle syncing a plan to Stripe
  const handleSyncPlan = async (planId: string) => {
    try {
      setSyncingPlan(planId);
      await stripeAdminClient.syncPlanToStripe(planId, 'create');
      
      toast({
        title: 'Success',
        description: 'Plan synced to Stripe successfully',
      });
      
      // Refresh the plans list
      await fetchPlans();
    } catch (error) {
      console.error('Error syncing plan to Stripe:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync plan to Stripe',
        variant: 'destructive',
      });
    } finally {
      setSyncingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage and sync subscription plans with Stripe
          </p>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">No subscription plans found</p>
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Create, edit, and sync your subscription plans with Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Yearly Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe Sync</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>${plan.price_monthly}</TableCell>
                    <TableCell>${plan.price_annual}</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.stripe_product_id ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">Synced</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm">Not synced</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncPlan(plan.id)}
                          disabled={syncingPlan === plan.id}
                        >
                          {syncingPlan === plan.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Sync to Stripe'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Plan Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the details of your subscription plan'
                : 'Create a new subscription plan for your customers'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Basic Details</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="limits">Limits</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Pro" {...field} />
                        </FormControl>
                        <FormDescription>
                          A short, descriptive name for the subscription plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Perfect for small teams and businesses"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of what the plan offers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active
                          </FormLabel>
                          <FormDescription>
                            Inactive plans won't be shown to customers
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="price_monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="9.99"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The price per month in USD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_annual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yearly Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="99.99"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The price per year in USD (typically offered at a discount)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="limits" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="message_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Message Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="1000"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum number of AI messages allowed per month
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="features" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Add features that will be displayed to customers
                    </p>

                    <div className="flex space-x-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Enter a feature"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newFeature.trim()) {
                            setFeatures([...features, newFeature.trim()]);
                            setNewFeature('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>

                    <div className="mt-4">
                      {features.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No features added yet
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center p-2 border rounded-md"
                            >
                              <span>{feature}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFeature(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Plan' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 