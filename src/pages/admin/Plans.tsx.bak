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
    <div className="container py-10 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription plans and pricing tiers
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle>Plan Management</CardTitle>
          <CardDescription>
            All subscription plans available to your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center border border-dashed rounded-md bg-muted/20 border-border">
              <h3 className="text-lg font-medium mb-2">No plans found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any subscription plans yet.
              </p>
              <Button onClick={handleCreatePlan}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="w-[250px]">Plan</TableHead>
                    <TableHead>Price (Monthly/Annual)</TableHead>
                    <TableHead>Message Limit</TableHead>
                    <TableHead>Bedrock Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{plan.name}</span>
                          {plan.is_popular && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground text-sm mt-1">
                          {plan.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {formatCurrency(plan.price_monthly)} / month
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {formatCurrency(plan.price_annual)} / year
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{plan.message_limit.toLocaleString()} messages</span>
                          {plan.has_overage && (
                            <span className="text-muted-foreground text-sm">
                              ${plan.overage_rate} per message overage
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{getModelName(plan.bedrock_model_id)}</span>
                      </TableCell>
                      <TableCell>
                        {plan.is_active ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            <X className="h-3.5 w-3.5 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                            className="border-border hover:bg-muted"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-background border-border dark:bg-gray-800">
          <DialogHeader className="text-foreground">
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create a new subscription plan for your customers'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingPlan
                ? 'Make changes to the subscription plan below.'
                : 'Fill in the details below to create a new subscription plan.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-4 w-full bg-muted dark:bg-gray-700 mb-4">
                  <TabsTrigger value="basic" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">Basic Details</TabsTrigger>
                  <TabsTrigger value="pricing" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">Pricing</TabsTrigger>
                  <TabsTrigger value="limits" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">Limits</TabsTrigger>
                  <TabsTrigger value="features" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-800">Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="mt-0 space-y-4 bg-background dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Pro" {...field} className="border-input bg-background dark:bg-gray-700 text-foreground" />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            A short, descriptive name for the subscription plan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Code</FormLabel>
                          <FormControl>
                            <Input placeholder="pro" {...field} className="border-input bg-background dark:bg-gray-700 text-foreground" />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            An internal code for this plan (e.g., 'pro', 'enterprise')
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
                        <FormLabel className="text-foreground">Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Perfect for small teams and businesses"
                            {...field}
                            className="border-input bg-background dark:bg-gray-700 text-foreground"
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
                          A detailed description of what the plan offers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-foreground">Active</FormLabel>
                            <FormDescription className="text-muted-foreground">
                              Inactive plans won't be shown to customers
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="is_popular"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-foreground">Popular</FormLabel>
                            <FormDescription className="text-muted-foreground">
                              Highlight this as a popular choice
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="mt-0 space-y-4 bg-background dark:bg-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price_monthly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Monthly Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="99" 
                              {...field} 
                              className="border-input bg-background dark:bg-gray-700 text-foreground"
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            The monthly subscription price in USD
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
                          <FormLabel className="text-foreground">Annual Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="990" 
                              {...field} 
                              className="border-input bg-background dark:bg-gray-700 text-foreground"
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
                            The annual subscription price in USD (leave at 0 for auto 16% discount)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="has_trial"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-foreground">Has Trial</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Allow customers to try this plan before paying
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("has_trial") && (
                      <FormField
                        control={form.control}
                        name="trial_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Trial Days</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="14" 
                                {...field} 
                                className="border-input bg-background dark:bg-gray-700 text-foreground"
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground">
                              Number of days for the trial period
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="limits" className="mt-0 space-y-4 bg-background dark:bg-gray-800">
                  <FormField
                    control={form.control}
                    name="message_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Monthly Message Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5000" 
                            {...field} 
                            className="border-input bg-background dark:bg-gray-700 text-foreground"
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground">
                          Maximum number of messages per month
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="has_overage"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 mb-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-foreground">Allow Overage</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Allow customers to exceed limits for an additional fee
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("has_overage") && (
                      <FormField
                        control={form.control}
                        name="overage_rate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground">Overage Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0.01" 
                                {...field} 
                                step="0.001"
                                className="border-input bg-background dark:bg-gray-700 text-foreground"
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground">
                              Cost per message beyond the limit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="bedrock_model_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Bedrock Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full border-input bg-background dark:bg-gray-700 text-foreground">
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover dark:bg-gray-700 border-border text-foreground">
                            {bedrockModels.map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                {model.name} ({model.provider})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-muted-foreground">
                          The default AWS Bedrock model for this plan
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="features" className="mt-0 bg-background dark:bg-gray-800">
                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <div className="space-y-2">
                          <FormLabel className="text-foreground">Features</FormLabel>
                          <FormDescription className="text-muted-foreground">
                            Add features that will be displayed on the subscription plan card
                          </FormDescription>
                        </div>
                        
                        {field.value.length > 0 ? (
                          <div className="space-y-2">
                            {field.value.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted dark:bg-gray-700">
                                <span className="text-foreground flex-1">{feature}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newFeatures = [...field.value];
                                    newFeatures.splice(index, 1);
                                    field.onChange(newFeatures);
                                  }}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-4 border border-dashed rounded border-input dark:border-gray-600">
                            <p className="text-muted-foreground">No features added yet</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Input
                            id="new-feature"
                            placeholder="Add a new feature..."
                            className="flex-1 border-input bg-background dark:bg-gray-700 text-foreground"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const feature = input.value.trim();
                                if (feature) {
                                  field.onChange([...field.value, feature]);
                                  input.value = '';
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('new-feature') as HTMLInputElement;
                              const feature = input.value.trim();
                              if (feature) {
                                field.onChange([...field.value, feature]);
                                input.value = '';
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
              
              <DialogFooter className="flex justify-between pt-4 border-t border-border">
                {editingPlan && (
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setPlanToDelete(editingPlan);
                      setDeleteDialogOpen(true);
                    }}
                    className="mr-auto"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Plan
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="bg-background dark:bg-gray-800 border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingPlan ? 'Update Plan' : 'Create Plan'}</Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-background dark:bg-gray-800 border-border">
          <DialogHeader className="text-foreground">
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete the "{planToDelete?.name}" plan.
              {planToDelete?.is_active && (
                <span className="block mt-2 font-medium text-destructive">
                  Warning: This plan is currently active and may have subscribers.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-background dark:bg-gray-800 border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeletePlan}
            >
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 