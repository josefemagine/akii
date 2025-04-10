import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Loader2, Plus, Edit, Trash2, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { AIInstanceStatus } from "@/types/custom.ts";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";

type AIInstance = {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  settings: any;
  status: AIInstanceStatus;
};

interface AIInstancesListProps {
  teamId?: string;
  onInstanceChange?: () => void;
}

const AIInstancesList = ({
  teamId,
  onInstanceChange = () => {},
}: AIInstancesListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [instances, setInstances] = useState<AIInstance[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<AIInstance | null>(
    null,
  );
  const [newInstanceName, setNewInstanceName] = useState("");
  const [newInstanceDescription, setNewInstanceDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    fetchAIInstances();

    // Setup a polling mechanism instead of realtime subscription
    const pollingInterval = setInterval(() => {
      fetchAIInstances();
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(pollingInterval);
    };
  }, [teamId]);

  const fetchAIInstances = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      
      const data = await invokeServerFunction<AIInstance[]>("team_get_ai_instances", {
        teamId
      });

      if (data) {
        setInstances(data);
      }
    } catch (error) {
      console.error("Error fetching AI instances:", error);
      toast({
        title: "Error",
        description: "Failed to load AI instances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstance = async () => {
    if (!newInstanceName || !teamId) return;

    try {
      setIsProcessing(true);

      await invokeServerFunction("team_create_ai_instance", {
        teamId,
        name: newInstanceName,
        description: newInstanceDescription || null,
        status: "active" as AIInstanceStatus,
        settings: {}
      });

      toast({
        title: "AI Instance created",
        description: `${newInstanceName} has been created successfully`,
      });

      setNewInstanceName("");
      setNewInstanceDescription("");
      setIsCreateDialogOpen(false);
      fetchAIInstances();
      onInstanceChange();
    } catch (error) {
      console.error("Error creating AI instance:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create AI instance",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditInstance = (instance: AIInstance) => {
    setSelectedInstance(instance);
    setNewInstanceName(instance.name);
    setNewInstanceDescription(instance.description || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInstance || !teamId || !newInstanceName) return;

    try {
      setIsProcessing(true);

      await invokeServerFunction("team_update_ai_instance", {
        instanceId: selectedInstance.id,
        teamId,
        name: newInstanceName,
        description: newInstanceDescription || null
      });

      toast({
        title: "AI Instance updated",
        description: `${newInstanceName} has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      setSelectedInstance(null);
      setNewInstanceName("");
      setNewInstanceDescription("");
      fetchAIInstances();
      onInstanceChange();
    } catch (error) {
      console.error("Error updating AI instance:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update AI instance",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteInstance = (instance: AIInstance) => {
    setSelectedInstance(instance);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInstance = async () => {
    if (!selectedInstance || !teamId) return;

    try {
      setIsProcessing(true);

      await invokeServerFunction("team_delete_ai_instance", {
        instanceId: selectedInstance.id,
        teamId
      });

      toast({
        title: "AI Instance deleted",
        description: `${selectedInstance.name} has been deleted successfully`,
      });

      setInstances((prev) =>
        prev.filter((instance) => instance.id !== selectedInstance.id),
      );

      setIsDeleteDialogOpen(false);
      setSelectedInstance(null);
      onInstanceChange();
    } catch (error) {
      console.error("Error deleting AI instance:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete AI instance",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Instances</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create AI Instance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create AI Instance</DialogTitle>
              <DialogDescription>
                Create a new AI instance that can be assigned to team members
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Customer Support Bot"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="AI assistant for handling customer inquiries"
                  value={newInstanceDescription}
                  onChange={(e) => setNewInstanceDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInstance}
                disabled={isProcessing || !newInstanceName}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Instance"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {instances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Bot className="h-16 w-16 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No AI Instances</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Create your first AI instance to start managing team access
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create AI Instance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => (
            <Card key={instance.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{instance.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Created on {formatDate(instance.created_at)}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      instance.status === "active" ? "default" : "secondary"
                    }
                  >
                    {instance.status.charAt(0).toUpperCase() +
                      instance.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {instance.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditInstance(instance)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteInstance(instance)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Instance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Instance</DialogTitle>
            <DialogDescription>
              Update the details of this AI instance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                placeholder="Customer Support Bot"
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="AI assistant for handling customer inquiries"
                value={newInstanceDescription}
                onChange={(e) => setNewInstanceDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isProcessing || !newInstanceName}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Instance Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AI Instance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedInstance?.name}? This
              action cannot be undone and will remove access for all team
              members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInstance}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AIInstancesList;
