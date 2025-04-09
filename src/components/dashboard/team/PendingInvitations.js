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
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
const PendingInvitations = ({ teamId, onInvitationCancelled = () => { }, }) => {
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const { toast } = useToast();
    useEffect(() => {
        if (!teamId)
            return;
        fetchInvitations();
        // Set up realtime subscription
        const channel = supabase
            .channel("team_invitations_changes")
            .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "team_invitations",
            filter: `team_id=eq.${teamId}`,
        }, () => {
            fetchInvitations();
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [teamId]);
    const fetchInvitations = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!teamId)
            return;
        try {
            setIsLoading(true);
            const { data, error } = yield supabase
                .from("team_invitations")
                .select("*")
                .eq("team_id", teamId)
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            const processedInvitations = (data || []).map((inv) => (Object.assign(Object.assign({}, inv), { status: new Date(inv.expires_at) < new Date()
                    ? "expired"
                    : inv.status || "pending" })));
            setInvitations(processedInvitations);
        }
        catch (error) {
            console.error("Error fetching invitations:", error);
            toast({
                title: "Error",
                description: "Failed to load invitations",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    const handleResendInvite = (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setCancellingId(id);
            const invitation = invitations.find((inv) => inv.id === id);
            if (!invitation)
                return;
            // Delete the old invitation
            yield supabase.from("team_invitations").delete().eq("id", id);
            // Create a new invitation
            const { error } = yield supabase.functions.invoke("supabase-functions-team-invite", {
                body: {
                    action: "invite",
                    teamId,
                    email: invitation.email,
                    role: invitation.role,
                },
            });
            if (error)
                throw error;
            toast({
                title: "Invitation resent",
                description: `A new invitation has been sent to ${invitation.email}`,
            });
            fetchInvitations();
        }
        catch (error) {
            console.error("Error resending invitation:", error);
            toast({
                title: "Error",
                description: "Failed to resend invitation",
                variant: "destructive",
            });
        }
        finally {
            setCancellingId(null);
        }
    });
    const handleCancelInvite = (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            setCancellingId(id);
            const { error } = yield supabase
                .from("team_invitations")
                .delete()
                .eq("id", id);
            if (error)
                throw error;
            toast({
                title: "Invitation cancelled",
                description: "The invitation has been cancelled",
            });
            setInvitations((prev) => prev.filter((inv) => inv.id !== id));
            onInvitationCancelled();
        }
        catch (error) {
            console.error("Error cancelling invitation:", error);
            toast({
                title: "Error",
                description: "Failed to cancel invitation",
                variant: "destructive",
            });
        }
        finally {
            setCancellingId(null);
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
    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
            case "expired":
                return _jsx(AlertCircle, { className: "h-4 w-4 text-red-500" });
            case "accepted":
                return _jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" });
            default:
                return null;
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return "Pending";
            case "expired":
                return "Expired";
            case "accepted":
                return "Accepted";
            default:
                return "Unknown";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "expired":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "accepted":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center py-8", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Pending Invitations" }), _jsx(CardDescription, { children: "Manage team invitations that have been sent but not yet accepted." })] }), _jsx(CardContent, { children: isLoading ? (_jsx("div", { className: "flex items-center justify-center py-6", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-gray-500" }) })) : invitations.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500", children: [_jsx(Mail, { className: "mb-2 h-12 w-12" }), _jsx("p", { children: "No pending invitations" })] })) : (_jsx("div", { className: "space-y-4", children: invitations.map((invitation) => (_jsxs("div", { className: "flex items-center justify-between space-x-4 rounded-lg border p-4", children: [_jsxs("div", { className: "flex-grow space-y-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium", children: invitation.email }), _jsx(Badge, { variant: "secondary", className: getStatusColor(invitation.status), children: _jsxs("span", { className: "flex items-center space-x-1", children: [getStatusIcon(invitation.status), _jsx("span", { children: getStatusText(invitation.status) })] }) })] }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: invitation.role }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Expires ", formatDate(invitation.expires_at)] })] })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [invitation.status === "expired" && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleResendInvite(invitation.id), disabled: cancellingId === invitation.id, children: cancellingId === invitation.id ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : ("Resend") })), invitation.status === "pending" && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleCancelInvite(invitation.id), disabled: cancellingId === invitation.id, children: cancellingId === invitation.id ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin" })) : ("Cancel") }))] })] }, invitation.id))) })) })] }));
};
export default PendingInvitations;
