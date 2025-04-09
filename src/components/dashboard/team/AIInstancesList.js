var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";
const AIInstancesList = ({ teamId, onInstanceChange = () => { }, }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [instances, setInstances] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);
    const [newInstanceName, setNewInstanceName] = useState("");
    const [newInstanceDescription, setNewInstanceDescription] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    useEffect(() => {
        if (!teamId)
            return;
        fetchAIInstances();
        // Setup a polling mechanism instead of realtime subscription
        const pollingInterval = setInterval(() => {
            fetchAIInstances();
        }, 10000); // Poll every 10 seconds
        return () => {
            clearInterval(pollingInterval);
        };
    }, [teamId]);
    const fetchAIInstances = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!teamId)
            return;
        try {
            setIsLoading(true);
            const data = yield invokeServerFunction("team_get_ai_instances", {
                teamId
            });
            if (data) {
                setInstances(data);
            }
        }
        catch (error) {
            console.error("Error fetching AI instances:", error);
            toast({
                title: "Error",
                description: "Failed to load AI instances",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleCreateInstance = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!newInstanceName || !teamId)
            return;
        try {
            setIsProcessing(true);
            yield invokeServerFunction("team_create_ai_instance", {
                teamId,
                name: newInstanceName,
                description: newInstanceDescription || null,
                status: "active",
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
        }
        catch (error) {
            console.error("Error creating AI instance:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create AI instance",
                variant: "destructive",
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const handleEditInstance = (instance) => {
        setSelectedInstance(instance);
        setNewInstanceName(instance.name);
        setNewInstanceDescription(instance.description || "");
        setIsEditDialogOpen(true);
    };
    const handleSaveEdit = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!selectedInstance || !teamId || !newInstanceName)
            return;
        try {
            setIsProcessing(true);
            yield invokeServerFunction("team_update_ai_instance", {
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
        }
        catch (error) {
            console.error("Error updating AI instance:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update AI instance",
                variant: "destructive",
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const handleDeleteInstance = (instance) => {
        setSelectedInstance(instance);
        setIsDeleteDialogOpen(true);
    };
    const confirmDeleteInstance = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!selectedInstance || !teamId)
            return;
        try {
            setIsProcessing(true);
            yield invokeServerFunction("team_delete_ai_instance", {
                instanceId: selectedInstance.id,
                teamId
            });
            toast({
                title: "AI Instance deleted",
                description: `${selectedInstance.name} has been deleted successfully`,
            });
            setInstances((prev) => prev.filter((instance) => instance.id !== selectedInstance.id));
            setIsDeleteDialogOpen(false);
            setSelectedInstance(null);
            onInstanceChange();
        }
        catch (error) {
            console.error("Error deleting AI instance:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete AI instance",
                variant: "destructive",
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "AI Instances" }), _jsxs(Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Create AI Instance"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Create AI Instance" }), _jsx(DialogDescription, { children: "Create a new AI instance that can be assigned to team members" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "name", children: "Name" }), _jsx(Input, { id: "name", placeholder: "Customer Support Bot", value: newInstanceName, onChange: (e) => setNewInstanceName(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "description", children: "Description (optional)" }), _jsx(Textarea, { id: "description", placeholder: "AI assistant for handling customer inquiries", value: newInstanceDescription, onChange: (e) => setNewInstanceDescription(e.target.value), rows: 3 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsCreateDialogOpen(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleCreateInstance, disabled: isProcessing || !newInstanceName, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Creating..."] })) : ("Create Instance") })] })] })] })] }), instances.length === 0 ? (_jsx(Card, { children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-10 text-center", children: [_jsx(Bot, { className: "h-16 w-16 mb-4 text-muted-foreground" }), _jsx("h3", { className: "text-lg font-medium", children: "No AI Instances" }), _jsx("p", { className: "text-sm text-muted-foreground mt-2 mb-6", children: "Create your first AI instance to start managing team access" }), _jsxs(Button, { onClick: () => setIsCreateDialogOpen(true), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), " Create AI Instance"] })] }) })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: instances.map((instance) => (_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-2", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: instance.name }), _jsxs(CardDescription, { className: "mt-1", children: ["Created on ", formatDate(instance.created_at)] })] }), _jsx(Badge, { variant: instance.status === "active" ? "default" : "secondary", children: instance.status.charAt(0).toUpperCase() +
                                            instance.status.slice(1) })] }) }), _jsx(CardContent, { children: _jsx("p", { className: "text-sm text-muted-foreground", children: instance.description || "No description provided" }) }), _jsxs(CardFooter, { className: "flex justify-end space-x-2 pt-0", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleEditInstance(instance), children: [_jsx(Edit, { className: "h-4 w-4 mr-1" }), " Edit"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "text-destructive hover:text-destructive", onClick: () => handleDeleteInstance(instance), children: [_jsx(Trash2, { className: "h-4 w-4 mr-1" }), " Delete"] })] })] }, instance.id))) })), _jsx(Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen, children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit AI Instance" }), _jsx(DialogDescription, { children: "Update the details of this AI instance" })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-name", children: "Name" }), _jsx(Input, { id: "edit-name", placeholder: "Customer Support Bot", value: newInstanceName, onChange: (e) => setNewInstanceName(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-description", children: "Description (optional)" }), _jsx(Textarea, { id: "edit-description", placeholder: "AI assistant for handling customer inquiries", value: newInstanceDescription, onChange: (e) => setNewInstanceDescription(e.target.value), rows: 3 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsEditDialogOpen(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleSaveEdit, disabled: isProcessing || !newInstanceName, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Saving..."] })) : ("Save Changes") })] })] }) }), _jsx(AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Delete AI Instance" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to delete ", selectedInstance === null || selectedInstance === void 0 ? void 0 : selectedInstance.name, "? This action cannot be undone and will remove access for all team members."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: isProcessing, children: "Cancel" }), _jsx(AlertDialogAction, { onClick: confirmDeleteInstance, disabled: isProcessing, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Deleting..."] })) : ("Delete") })] })] }) })] }));
};
export default AIInstancesList;
