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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Settings, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";
const AIInstanceAccess = ({ teamId }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [members, setMembers] = useState([]);
    const [aiInstances, setAiInstances] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedInstances, setSelectedInstances] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    useEffect(() => {
        if (!teamId)
            return;
        fetchTeamMembersAndInstances();
    }, [teamId]);
    const fetchTeamMembersAndInstances = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!teamId)
            return;
        try {
            setIsLoading(true);
            // Fetch team members and AI instances
            const [membersData, instancesData] = yield Promise.all([
                invokeServerFunction("team_get_members_with_ai_access", {
                    teamId,
                }),
                invokeServerFunction("team_get_ai_instances", {
                    teamId,
                })
            ]);
            if (membersData) {
                setMembers(membersData);
            }
            if (instancesData) {
                setAiInstances(instancesData);
            }
        }
        catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: "Failed to load team members and AI instances",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleManageAccess = (member) => {
        setSelectedMember(member);
        setSelectedInstances(member.ai_instance_access || []);
        setIsDialogOpen(true);
    };
    const handleSaveAccess = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!selectedMember || !teamId)
            return;
        try {
            setIsSaving(true);
            yield invokeServerFunction("team_update_ai_access", {
                teamId,
                memberId: selectedMember.id,
                aiInstanceAccess: selectedInstances
            });
            // Update local state
            setMembers((prev) => prev.map((member) => member.id === selectedMember.id
                ? Object.assign(Object.assign({}, member), { ai_instance_access: selectedInstances }) : member));
            toast({
                title: "Access updated",
                description: `AI instance access for ${selectedMember.user_name} has been updated`,
            });
            setIsDialogOpen(false);
        }
        catch (error) {
            console.error("Error updating access:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update AI instance access",
                variant: "destructive",
            });
        }
        finally {
            setIsSaving(false);
        }
    });
    const toggleInstanceAccess = (instanceId) => {
        setSelectedInstances((prev) => prev.includes(instanceId)
            ? prev.filter((id) => id !== instanceId)
            : [...prev, instanceId]);
    };
    const getAccessCount = (member) => {
        const accessList = member.ai_instance_access || [];
        return accessList.length;
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Instance Access" }), _jsx(CardDescription, { children: "Manage which AI instances each team member can access" })] }), _jsxs(CardContent, { children: [aiInstances.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500", children: [_jsx(Bot, { className: "mb-2 h-12 w-12" }), _jsx("p", { children: "No AI instances found" }), _jsx("p", { className: "mt-2", children: "Create AI instances to manage access" })] })) : members.length === 0 ? (_jsx("div", { className: "flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500", children: _jsx("p", { children: "No team members found" }) })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Member" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "Access" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: members.map((member) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}` }), _jsx(AvatarFallback, { children: (member.user_name || "UN")
                                                                    .substring(0, 2)
                                                                    .toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: member.user_name }), _jsx("p", { className: "text-sm text-muted-foreground", children: member.user_email }), member.user_id === (user === null || user === void 0 ? void 0 : user.id) && (_jsx(Badge, { variant: "outline", className: "mt-1", children: "You" }))] })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: `${member.role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`, children: member.role.charAt(0).toUpperCase() +
                                                    member.role.slice(1) }) }), _jsx(TableCell, { children: _jsxs(Badge, { variant: "secondary", children: [getAccessCount(member), " / ", aiInstances.length, " instances"] }) }), _jsx(TableCell, { className: "text-right", children: _jsxs(Button, { variant: "outline", size: "sm", onClick: () => handleManageAccess(member), children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Manage Access"] }) })] }, member.id))) })] })), _jsx(Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: ["Manage AI Instance Access for ", selectedMember === null || selectedMember === void 0 ? void 0 : selectedMember.user_name] }), _jsx(DialogDescription, { children: "Select which AI instances this team member can access" })] }), _jsx("div", { className: "grid gap-4 py-4", children: aiInstances.map((instance) => (_jsxs("div", { className: "flex items-center space-x-2 rounded-md border p-3", children: [_jsx(Checkbox, { id: `instance-${instance.id}`, checked: selectedInstances.includes(instance.id), onCheckedChange: () => toggleInstanceAccess(instance.id) }), _jsxs("div", { className: "grid gap-1.5 leading-none", children: [_jsx("label", { htmlFor: `instance-${instance.id}`, className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", children: instance.name }), instance.description && (_jsx("p", { className: "text-sm text-muted-foreground", children: instance.description }))] })] }, instance.id))) }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsDialogOpen(false), disabled: isSaving, children: "Cancel" }), _jsx(Button, { onClick: handleSaveAccess, disabled: isSaving, children: isSaving ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Saving..."] })) : ("Save Changes") })] })] }) })] })] }));
};
export default AIInstanceAccess;
