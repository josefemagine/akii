import React, { useState, useEffect } from "react";
import { DashboardSection } from "@/components/layout/DashboardSection";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  RefreshCw, 
  Plus, 
  Trash, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  BarChart3
} from "lucide-react";

// Backend API service for secure AWS interactions
const bedrockService = {
  // List all provisioned model throughputs
  listInstances: async () => {
    try {
      const response = await fetch('/api/bedrock/instances');
      if (!response.ok) throw new Error('Failed to fetch instances');
      return await response.json();
    } catch (error) {
      console.error('Error listing instances:', error);
      throw error;
    }
  },

  // Get details for a specific instance
  getInstance: async (instanceId) => {
    try {
      const response = await fetch(`/api/bedrock/instances/${instanceId}`);
      if (!response.ok) throw new Error('Failed to fetch instance details');
      return await response.json();
    } catch (error) {
      console.error('Error getting instance details:', error);
      throw error;
    }
  },

  // Create a new provisioned model throughput
  createInstance: async (instanceData) => {
    try {
      const response = await fetch('/api/bedrock/instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instanceData),
      });
      if (!response.ok) throw new Error('Failed to create instance');
      return await response.json();
    } catch (error) {
      console.error('Error creating instance:', error);
      throw error;
    }
  },

  // Delete a provisioned model throughput
  deleteInstance: async (instanceId) => {
    try {
      const response = await fetch(`/api/bedrock/instances/${instanceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete instance');
      return await response.json();
    } catch (error) {
      console.error('Error deleting instance:', error);
      throw error;
    }
  },

  // List available foundation models
  listFoundationModels: async () => {
    try {
      const response = await fetch('/api/bedrock/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      return await response.json();
    } catch (error) {
      console.error('Error listing models:', error);
      throw error;
    }
  },

  // List model customization jobs
  listCustomizationJobs: async () => {
    try {
      const response = await fetch('/api/bedrock/customization-jobs');
      if (!response.ok) throw new Error('Failed to fetch customization jobs');
      return await response.json();
    } catch (error) {
      console.error('Error listing customization jobs:', error);
      throw error;
    }
  },
};

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    InService: { color: "bg-green-500", icon: <CheckCircle2 className="h-4 w-4 mr-1" /> },
    Creating: { color: "bg-blue-500", icon: <Clock className="h-4 w-4 mr-1" /> },
    Pending: { color: "bg-yellow-500", icon: <Clock className="h-4 w-4 mr-1" /> },
    Failed: { color: "bg-red-500", icon: <XCircle className="h-4 w-4 mr-1" /> },
    Deleted: { color: "bg-gray-500", icon: <Trash className="h-4 w-4 mr-1" /> },
    default: { color: "bg-gray-500", icon: <AlertCircle className="h-4 w-4 mr-1" /> },
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge className={`${config.color} text-white flex items-center`}>
      {config.icon} {status}
    </Badge>
  );
};

// Plan models configuration
const planModels = {
  Starter: {
    modelId: "anthropic.claude-instant-v1",
    throughput: 1,
    commitment: "1mo"
  },
  Pro: {
    modelId: "anthropic.claude-v2",
    throughput: 2,
    commitment: "1mo"
  },
  Business: {
    modelId: "anthropic.claude-v2:1",
    throughput: 5,
    commitment: "6mo"
  },
  Enterprise: {
    modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
    throughput: 10,
    commitment: "6mo"
  }
};

const InstanceTable = ({ instances, onDelete, onRefresh, loading }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>AI Instances</CardTitle>
          <CardDescription>Provisioned model throughputs for customer plans</CardDescription>
        </div>
        <Button onClick={onRefresh} variant="outline" size="icon" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instance Name</TableHead>
              <TableHead>Model ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Throughput (TPS)</TableHead>
              <TableHead>Creation Date</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && instances.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No AI instances found. Create your first instance.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading instances...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell className="font-medium">{instance.name}</TableCell>
                <TableCell className="font-mono text-xs">{instance.modelId}</TableCell>
                <TableCell><StatusBadge status={instance.status} /></TableCell>
                <TableCell>{instance.throughput} TPS</TableCell>
                <TableCell>{new Date(instance.creationTime).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/10">
                    {instance.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/admin/instances/${instance.id}/monitor`, '_blank')}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" /> Monitor
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete the AI instance "{instance.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              onDelete(instance.id);
                            }}
                          >
                            Delete Instance
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const CreateInstanceForm = ({ onSubmit, loading, foundationModels }) => {
  const [formData, setFormData] = useState({
    instanceName: "",
    modelId: "",
    commitment: "1mo", // Default: 1 month
    throughput: 1, // Default: 1 TPS
    plan: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanSelect = (plan) => {
    const planConfig = planModels[plan];
    setFormData({
      ...formData,
      plan,
      modelId: planConfig.modelId,
      throughput: planConfig.throughput,
      commitment: planConfig.commitment
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New AI Instance</CardTitle>
        <CardDescription>Provision a new model throughput for a customer plan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Instance Name</label>
              <Input
                name="instanceName"
                value={formData.instanceName}
                onChange={handleInputChange}
                placeholder="customer-name-instance-01"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide a unique name for this AI instance
              </p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Quick Plan Selection</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(planModels).map(plan => (
                  <Button
                    key={plan}
                    type="button"
                    variant={formData.plan === plan ? "default" : "outline"}
                    className={formData.plan === plan ? "border-2 border-primary" : ""}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {plan}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Select a plan to auto-configure the instance parameters
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-1.5">Model</label>
                <Select
                  name="modelId"
                  value={formData.modelId}
                  onValueChange={(value) => handleSelectChange("modelId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Models</SelectLabel>
                      {foundationModels.map((model) => (
                        <SelectItem key={model.modelId} value={model.modelId}>
                          {model.modelName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Commitment Duration</label>
                <Select
                  name="commitment"
                  value={formData.commitment}
                  onValueChange={(value) => handleSelectChange("commitment", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1mo">1 Month</SelectItem>
                    <SelectItem value="6mo">6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Throughput (TPS)</label>
              <Input
                name="throughput"
                type="number"
                min="1"
                max="50"
                value={formData.throughput}
                onChange={handleInputChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Transactions per second, cost scales with throughput
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Provisioning...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create AI Instance
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const CustomizationJobs = ({ jobs, loading, onRefresh }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fine-Tuning Jobs</CardTitle>
          <CardDescription>Custom model training jobs for specialized use cases</CardDescription>
        </div>
        <Button onClick={onRefresh} variant="outline" size="icon" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Base Model</TableHead>
              <TableHead>Output Model ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Creation Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No fine-tuning jobs found. Create your first customization job.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    <span>Loading jobs...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && jobs.map((job) => (
              <TableRow key={job.jobName}>
                <TableCell className="font-medium">{job.jobName}</TableCell>
                <TableCell className="font-mono text-xs">{job.baseModelId}</TableCell>
                <TableCell className="font-mono text-xs">{job.outputModelId || "—"}</TableCell>
                <TableCell><StatusBadge status={job.status} /></TableCell>
                <TableCell>{new Date(job.creationTime).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/admin/fine-tuning/${job.jobName}`, '_blank')}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// Main component for managing AI instances
const ManageInstances = () => {
  const [instances, setInstances] = useState([]);
  const [finetuningJobs, setFinetuningJobs] = useState([]);
  const [foundationModels, setFoundationModels] = useState([]);
  const [loading, setLoading] = useState({
    instances: false,
    creation: false,
    jobs: false,
    models: false
  });

  // Fetch instances
  const fetchInstances = async () => {
    setLoading(prev => ({ ...prev, instances: true }));
    try {
      const data = await bedrockService.listInstances();
      setInstances(data);
    } catch (error) {
      toast({
        title: "Error fetching instances",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, instances: false }));
    }
  };

  // Fetch foundation models
  const fetchFoundationModels = async () => {
    setLoading(prev => ({ ...prev, models: true }));
    try {
      const data = await bedrockService.listFoundationModels();
      setFoundationModels(data);
    } catch (error) {
      toast({
        title: "Error fetching models",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  };

  // Fetch fine-tuning jobs
  const fetchFinetuningJobs = async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    try {
      const data = await bedrockService.listCustomizationJobs();
      setFinetuningJobs(data);
    } catch (error) {
      toast({
        title: "Error fetching fine-tuning jobs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  // Handle instance creation
  const handleCreateInstance = async (formData) => {
    setLoading(prev => ({ ...prev, creation: true }));
    try {
      const instanceData = {
        modelId: formData.modelId,
        provisionedModelName: formData.instanceName,
        commitmentDuration: formData.commitment,
        throughputCapacity: parseInt(formData.throughput, 10),
        plan: formData.plan
      };

      await bedrockService.createInstance(instanceData);
      
      toast({
        title: "AI Instance Created",
        description: `Instance '${formData.instanceName}' has been provisioned successfully!`,
        variant: "default",
      });
      
      // Refresh the instances list
      fetchInstances();
    } catch (error) {
      toast({
        title: "Failed to create instance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, creation: false }));
    }
  };

  // Handle instance deletion
  const handleDeleteInstance = async (instanceId) => {
    try {
      await bedrockService.deleteInstance(instanceId);
      
      toast({
        title: "AI Instance Deleted",
        description: "The instance has been successfully deleted.",
        variant: "default",
      });
      
      // Refresh the instances list
      fetchInstances();
    } catch (error) {
      toast({
        title: "Failed to delete instance",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchInstances();
    fetchFoundationModels();
    fetchFinetuningJobs();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Instance Management"
        description="Deploy and manage AWS Bedrock AI Instances for customer plans"
      />

      <Tabs defaultValue="instances" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="instances">AI Instances</TabsTrigger>
          <TabsTrigger value="customization">Fine-Tuning Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="instances" className="space-y-6">
          <DashboardSection>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <InstanceTable
                  instances={instances}
                  onDelete={handleDeleteInstance}
                  onRefresh={fetchInstances}
                  loading={loading.instances}
                />
              </div>
              <div>
                <CreateInstanceForm
                  onSubmit={handleCreateInstance}
                  loading={loading.creation}
                  foundationModels={foundationModels}
                />
              </div>
            </div>
          </DashboardSection>

          <DashboardSection>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                AWS Bedrock provisioned instances incur costs even when not in use.
                Make sure to delete instances that are no longer needed.
              </AlertDescription>
            </Alert>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="customization">
          <DashboardSection>
            <CustomizationJobs
              jobs={finetuningJobs}
              loading={loading.jobs}
              onRefresh={fetchFinetuningJobs}
            />
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageInstances; 