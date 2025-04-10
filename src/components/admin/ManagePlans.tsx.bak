import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

interface Plan {
  id: string;
  name: string;
  description: string | null;
  message_limit: number;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  price_monthly: number;
  price_annual: number;
  is_active: boolean;
  created_at: string;
}

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

type PlanFormValues = z.infer<typeof planSchema>;

export default function ManagePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PlanFormValues>({
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
  const fetchPlans = async () => {
    setIsLoading(true);
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
        title: 'Error fetching plans',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleEditPlan = (plan: Plan) => {
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
  const handleDeletePlanClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  // Delete plan
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', selectedPlan.id);

      if (error) throw error;

      toast({
        title: 'Plan deleted',
        description: `Successfully deleted ${selectedPlan.name} plan.`,
      });
      
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: 'Error deleting plan',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Save plan (create or update)
  const onSubmit = async (values: PlanFormValues) => {
    try {
      if (selectedPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('subscription_plans')
          .update(values)
          .eq('id', selectedPlan.id);

        if (error) throw error;

        toast({
          title: 'Plan updated',
          description: `Successfully updated ${values.name} plan.`,
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('subscription_plans')
          .insert([values]);

        if (error) throw error;

        toast({
          title: 'Plan created',
          description: `Successfully created ${values.name} plan.`,
        });
      }

      setIsEditDialogOpen(false);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error saving plan',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <Button onClick={handleNewPlan}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-70' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{plan.name}</CardTitle>
                  {!plan.is_active && (
                    <div className="text-amber-500 text-sm flex items-center mt-1">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Inactive
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditPlan(plan)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeletePlanClick(plan)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Message Limit</div>
                  <div>{plan.message_limit.toLocaleString()} per month</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Monthly Price</div>
                  <div>{formatPrice(plan.price_monthly)}/month</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Annual Price</div>
                  <div>{formatPrice(plan.price_annual)}/year</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">ID: {plan.id.substring(0, 8)}...</div>
              {!plan.stripe_price_id_monthly && !plan.stripe_price_id_annual && (
                <div className="text-amber-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> No Stripe IDs
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit/Create Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              {selectedPlan 
                ? 'Update the details for this subscription plan.' 
                : 'Fill in the details to create a new subscription plan.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="stripe">Stripe</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Basic, Pro, Enterprise" />
                        </FormControl>
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
                            {...field} 
                            value={field.value || ''}
                            placeholder="Brief description of this plan" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Limit</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormDescription>
                          Number of messages allowed per month
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_monthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Price (cents)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                          <FormDescription>
                            Price in cents (e.g., 1999 = $19.99)
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
                          <FormLabel>Annual Price (cents)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" />
                          </FormControl>
                          <FormDescription>
                            Price in cents (e.g., 19990 = $199.90)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Whether this plan should be available for users to select
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
                
                <TabsContent value="stripe" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="stripe_price_id_monthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Monthly Price ID</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="e.g. price_1MkTp2..." 
                          />
                        </FormControl>
                        <FormDescription>
                          The Stripe Price ID for monthly billing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stripe_price_id_annual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Annual Price ID</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            value={field.value || ''}
                            placeholder="e.g. price_1MkTp2..." 
                          />
                        </FormControl>
                        <FormDescription>
                          The Stripe Price ID for annual billing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Plan"
        description={`Are you sure you want to delete the ${selectedPlan?.name} plan? This action cannot be undone.`}
        onConfirm={handleDeletePlan}
      />
    </div>
  );
} 