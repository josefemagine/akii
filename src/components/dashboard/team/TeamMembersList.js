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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { invokeServerFunction } from "@/utils/supabase/functions";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
const TeamMembersList = ({ initialMembers = [] }) => {
    const { user } = useAuth();
    const [members, setMembers] = useState(initialMembers);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");
    const [editingMember, setEditingMember] = useState(null);
    const [teamId, setTeamId] = useState("");
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        if (!user)
            return;
        fetchTeamAndMembers();
    }, [user]);
    const fetchTeamAndMembers = () => __awaiter(void 0, void 0, void 0, function* () {
        setIsLoading(true);
        try {
            if (!(user === null || user === void 0 ? void 0 : user.id)) {
                throw new Error("No user ID available");
            }
            // Get user's team
            const teamData = yield invokeServerFunction("team_get_member_team", { userId: user.id });
            if (!teamData || !teamData.id) {
                throw new Error("Could not find your team");
            }
            setTeamId(teamData.id);
            // Get team members
            const membersData = yield invokeServerFunction("team_get_members", { teamId: teamData.id });
            if (!membersData || !Array.isArray(membersData)) {
                throw new Error("Failed to fetch team members");
            }
            setMembers(membersData);
        }
        catch (error) {
            handleError(error, {
                title: "Failed to load team",
                context: "TeamMembersList.fetchTeamAndMembers"
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleInvite = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!newMemberEmail || !teamId)
            return;
        setIsProcessing(true);
        try {
            const response = yield invokeServerFunction("team_invite", {
                teamId,
                email: newMemberEmail,
                role: newMemberRole,
            });
            if (!response || !response.success) {
                throw new Error((response === null || response === void 0 ? void 0 : response.message) || "Failed to send invitation");
            }
            showSuccess("Invitation sent", `An invitation has been sent to ${newMemberEmail}`);
            setNewMemberEmail("");
            setIsInviteDialogOpen(false);
            // Refresh the members list
            fetchTeamAndMembers();
        }
        catch (error) {
            handleError(error, {
                title: "Invitation failed",
                context: "TeamMembersList.handleInvite"
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const handleRemoveMember = (member) => {
        setMemberToRemove(member);
        setShowRemoveDialog(true);
    };
    const confirmRemoveMember = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!teamId || !memberToRemove)
            return;
        setIsProcessing(true);
        try {
            const response = yield invokeServerFunction("team_remove", {
                teamId,
                userId: memberToRemove.user_id,
            });
            if (!response || !response.success) {
                throw new Error((response === null || response === void 0 ? void 0 : response.message) || "Failed to remove team member");
            }
            setMembers((prev) => prev.filter((member) => member.user_id !== memberToRemove.user_id));
            showSuccess("Member removed", "Team member has been removed successfully");
            setMemberToRemove(null);
            setShowRemoveDialog(false);
        }
        catch (error) {
            handleError(error, {
                title: "Remove failed",
                context: "TeamMembersList.confirmRemoveMember"
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const handleEditMember = (member) => {
        setEditingMember(member);
    };
    const handleSaveEdit = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!teamId || !editingMember)
            return;
        setIsProcessing(true);
        try {
            const response = yield invokeServerFunction("team_update_member_role", {
                teamId,
                userId: editingMember.user_id,
                role: editingMember.role
            });
            if (!response || !response.success) {
                throw new Error((response === null || response === void 0 ? void 0 : response.message) || "Failed to update team member");
            }
            setMembers((prev) => prev.map((member) => member.id === editingMember.id ? editingMember : member));
            showSuccess("Member updated", "Team member role has been updated successfully");
            setEditingMember(null);
        }
        catch (error) {
            handleError(error, {
                title: "Update failed",
                context: "TeamMembersList.handleSaveEdit"
            });
        }
        finally {
            setIsProcessing(false);
        }
    });
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case "member":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsxs("div", { className: "space-y-4 bg-white dark:bg-gray-950 p-6 rounded-lg border dark:border-gray-800", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Team Members" }), _jsxs(Dialog, { open: isInviteDialogOpen, onOpenChange: setIsInviteDialogOpen, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(UserPlus, { className: "mr-2 h-4 w-4" }), " Invite Member"] }) }), _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Invite Team Member" }), _jsx(DialogDescription, { children: "Send an invitation to a new team member to collaborate on your AI agents." })] }), _jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "email", children: "Email address" }), _jsx(Input, { id: "email", type: "email", placeholder: "colleague@example.com", value: newMemberEmail, onChange: (e) => setNewMemberEmail(e.target.value) })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "role", children: "Role" }), _jsxs(Select, { value: newMemberRole, onValueChange: (value) => setNewMemberRole(value), children: [_jsx(SelectTrigger, { id: "role", children: _jsx(SelectValue, { placeholder: "Select a role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "owner", children: "Owner" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "member", children: "Member" })] })] })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsInviteDialogOpen(false), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleInvite, disabled: isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sending..."] })) : ("Send Invitation") })] })] })] }), _jsx(Dialog, { open: !!editingMember, onOpenChange: (open) => !open && setEditingMember(null), children: _jsxs(DialogContent, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Edit Team Member" }), _jsx(DialogDescription, { children: "Update the role and permissions for this team member." })] }), editingMember && (_jsxs("div", { className: "grid gap-4 py-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingMember.user_id}` }), _jsx(AvatarFallback, { children: (editingMember.user_name || "UN")
                                                                .substring(0, 2)
                                                                .toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: editingMember.user_name }), _jsx("p", { className: "text-sm text-muted-foreground", children: editingMember.user_email })] })] }), _jsxs("div", { className: "grid gap-2", children: [_jsx(Label, { htmlFor: "edit-role", children: "Role" }), _jsxs(Select, { value: editingMember.role, onValueChange: (value) => setEditingMember(Object.assign(Object.assign({}, editingMember), { role: value })), children: [_jsx(SelectTrigger, { id: "edit-role", children: _jsx(SelectValue, { placeholder: "Select a role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "owner", children: "Owner" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "member", children: "Member" })] })] })] })] })), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: "outline", onClick: () => setEditingMember(null), disabled: isProcessing, children: "Cancel" }), _jsx(Button, { onClick: handleSaveEdit, disabled: isProcessing, children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Saving..."] })) : ("Save Changes") })] })] }) }), _jsx(AlertDialog, { open: showRemoveDialog, onOpenChange: setShowRemoveDialog, children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "Remove Team Member" }), _jsxs(AlertDialogDescription, { children: ["Are you sure you want to remove", " ", (memberToRemove === null || memberToRemove === void 0 ? void 0 : memberToRemove.user_name) || (memberToRemove === null || memberToRemove === void 0 ? void 0 : memberToRemove.user_email), " from the team? This action cannot be undone."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: isProcessing, children: "Cancel" }), _jsx(AlertDialogAction, { onClick: confirmRemoveMember, disabled: isProcessing, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: isProcessing ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Removing..."] })) : ("Remove") })] })] }) })] }), _jsx("div", { className: "border rounded-md", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Member" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: members.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 3, className: "text-center py-6 text-muted-foreground", children: "No team members found" }) })) : (members.map((member) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}` }), _jsx(AvatarFallback, { children: (member.user_name || "UN")
                                                                .substring(0, 2)
                                                                .toUpperCase() })] }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: member.user_name }), _jsx("p", { className: "text-sm text-muted-foreground", children: member.user_email }), member.user_id === (user === null || user === void 0 ? void 0 : user.id) && (_jsx(Badge, { variant: "outline", className: "mt-1", children: "You" }))] })] }) }), _jsx(TableCell, { children: _jsx(Badge, { variant: "outline", className: getRoleBadgeColor(member.role), children: member.role.charAt(0).toUpperCase() +
                                                member.role.slice(1) }) }), _jsx(TableCell, { className: "text-right", children: _jsx("div", { className: "flex justify-end gap-2", children: member.user_id !== (user === null || user === void 0 ? void 0 : user.id) && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleEditMember(member), title: "Edit Member", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemoveMember(member), title: "Remove Member", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })) }) })] }, member.id)))) })] }) })] }));
};
export default TeamMembersList;
