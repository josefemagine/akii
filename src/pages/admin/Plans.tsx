import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusCircle, Edit, Trash, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Plan {
  id: string;
  name: string;
  code: string;
  description: string;
  price_monthly: number;
  price_annual: number;
  is_active: boolean;
  has_trial: boolean;
  trial_days: number;
  message_limit: number;
  has_overage: boolean;
  overage_rate: number;
  bedrock_model_id: string;
  features: string[];
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const form = useForm<z.infer<typeof planSchema>>({
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
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .order("price_monthly", { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast({
          title: "Error",
          description: "Failed to load plans. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

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
    } else {
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

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planToDelete.id);

      if (error) throw error;

      setPlans(plans.filter(p => p.id !== planToDelete.id));
      toast({
        title: "Success",
        description: `${planToDelete.name} plan has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const onSubmit = async (values: z.infer<typeof planSchema>) => {
    try {
      // Calculate annual price if not manually set (16% discount)
      if (values.price_annual === 0 && values.price_monthly > 0) {
        values.price_annual = Math.round(values.price_monthly * 12 * 0.84);
      }

      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from("subscription_plans")
          .update(values)
          .eq("id", editingPlan.id);

        if (error) throw error;

        // Update local state
        setPlans(
          plans.map((plan) => (plan.id === editingPlan.id ? { ...plan, ...values } : plan))
        );

        toast({
          title: "Success",
          description: `${values.name} plan has been updated.`,
        });
      } else {
        // Create new plan
        const { data, error } = await supabase
          .from("subscription_plans")
          .insert(values)
          .select();

        if (error) throw error;

        // Update local state with the new plan
        setPlans([...plans, data[0]]);

        toast({
          title: "Success",
          description: `${values.name} plan has been created.`,
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get model name from ID
  const getModelName = (modelId: string) => {
    const model = bedrockModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
          <p className="text-muted-foreground">
            Manage pricing plans, features, and Bedrock model assignments.
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>
            Configure pricing, features, and model assignments for each plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price (Monthly)</TableHead>
                  <TableHead>Price (Annual)</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Has Overage</TableHead>
                  <TableHead>Bedrock Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No plans found. Create your first plan to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{plan.name}</span>
                          {plan.is_popular && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plan.description}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(plan.price_monthly)}</TableCell>
                      <TableCell>{formatCurrency(plan.price_annual)}</TableCell>
                      <TableCell>
                        {plan.has_trial ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            {plan.trial_days} days
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            No trial
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {plan.has_overage ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-muted-foreground">
                              ${plan.overage_rate}/1k tokens
                            </span>
                          </div>
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {getModelName(plan.bedrock_model_id)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {plan.bedrock_model_id.split(".")[0]}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePlan(plan)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Plan Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? `Edit ${editingPlan.name} Plan` : "Create New Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure the plan details, pricing, and feature set.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing & Limits</TabsTrigger>
                  <TabsTrigger value="features">Features & Model</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Professional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. pro" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier used in the system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Perfect for small to medium businesses"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <FormDescription>
                              Make this plan available to customers
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

                    <FormField
                      control={form.control}
                      name="is_popular"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured Plan</FormLabel>
                            <FormDescription>
                              Highlight this plan as recommended
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
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                              placeholder="e.g. 99.99"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price_annual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Price ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="e.g. 999.99"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave at 0 for automatic 16% discount
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            placeholder="e.g. 5000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="has_trial"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Free Trial</FormLabel>
                            <FormDescription>
                              Allow users to try this plan before paying
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

                    {form.watch("has_trial") && (
                      <FormField
                        control={form.control}
                        name="trial_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trial Duration (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="90"
                                placeholder="e.g. 14"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="has_overage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Overage Pricing</FormLabel>
                            <FormDescription>
                              Charge for usage beyond the plan limit
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

                    {form.watch("has_overage") && (
                      <FormField
                        control={form.control}
                        name="overage_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Overage Rate ($ per 1k tokens)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.001"
                                placeholder="e.g. 0.01"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="bedrock_model_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Bedrock Model</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bedrockModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This model will be assigned to all users on this plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Feature list editing would go here */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-medium">Plan Features</h3>
                        <p className="text-sm text-muted-foreground">
                          Add features that will be displayed to customers
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
                        <span>Unlimited AI agents</span>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
                        <span>Web, mobile, and API access</span>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-muted rounded-md">
                        <span>Team collaboration</span>
                        <Button type="button" variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the "{planToDelete?.name}" plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePlan}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 