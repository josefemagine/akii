import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";
import { TeamMemberRole } from "@/types/custom";

type InvitationStatus = "pending" | "expired" | "accepted";

type InvitationBase = Database["public"]["Tables"]["team_invitations"]["Row"];

type Invitation = InvitationBase & {
  status: InvitationStatus;
};

interface PendingInvitationsProps {
  teamId?: string;
  onInvitationCancelled?: () => void;
}

const PendingInvitations = ({
  teamId,
  onInvitationCancelled = () => {},
}: PendingInvitationsProps) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!teamId) return;
    fetchInvitations();

    // Set up realtime subscription
    const channel = supabase
      .channel("team_invitations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_invitations",
          filter: `team_id=eq.${teamId}`,
        },
        () => {
          fetchInvitations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId]);

  const fetchInvitations = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const processedInvitations = (data || []).map((inv: any) => ({
        ...inv,
        status: new Date(inv.expires_at) < new Date()
          ? "expired"
          : (inv.status as InvitationStatus) || "pending",
      }));

      setInvitations(processedInvitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      setCancellingId(id);
      const invitation = invitations.find((inv) => inv.id === id);

      if (!invitation) return;

      // Delete the old invitation
      await supabase.from("team_invitations").delete().eq("id", id);

      // Create a new invitation
      const { error } = await supabase.functions.invoke(
        "supabase-functions-team-invite",
        {
          body: {
            action: "invite",
            teamId,
            email: invitation.email,
            role: invitation.role as TeamMemberRole,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Invitation resent",
        description: `A new invitation has been sent to ${invitation.email}`,
      });

      fetchInvitations();
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelInvite = async (id: string) => {
    try {
      setCancellingId(id);
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });

      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
      onInvitationCancelled();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    } finally {
      setCancellingId(null);
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

  const getStatusIcon = (status: InvitationStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "accepted":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: InvitationStatus) => {
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

  const getStatusColor = (status: InvitationStatus) => {
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
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Manage team invitations that have been sent but not yet accepted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500">
            <Mail className="mb-2 h-12 w-12" />
            <p>No pending invitations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between space-x-4 rounded-lg border p-4"
              >
                <div className="flex-grow space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{invitation.email}</span>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(invitation.status)}
                    >
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(invitation.status)}
                        <span>{getStatusText(invitation.status)}</span>
                      </span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    <span>•</span>
                    <span>Expires {formatDate(invitation.expires_at)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {invitation.status === "expired" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(invitation.id)}
                      disabled={cancellingId === invitation.id}
                    >
                      {cancellingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Resend"
                      )}
                    </Button>
                  )}
                  {invitation.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelInvite(invitation.id)}
                      disabled={cancellingId === invitation.id}
                    >
                      {cancellingId === invitation.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingInvitations;
