import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table.tsx";
import { Mail, Trash, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.tsx";

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: "pending" | "accepted" | "expired";
}

interface PendingInvitationsProps {
  invitations?: Invitation[];
  onResendInvitation?: (id: string) => Promise<void>;
  onDeleteInvitation?: (id: string) => Promise<void>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PendingInvitations({
  invitations = [],
  onResendInvitation,
  onDeleteInvitation,
  isLoading = false,
  onRefresh,
}: PendingInvitationsProps) {
  const { toast } = useToast();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const handleResendInvitation = async (id: string) => {
    try {
      setActionInProgress(id);
      if (onResendInvitation) {
        await onResendInvitation(id);
        toast({
          title: "Invitation resent",
          description: "The invitation has been successfully resent.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      setActionInProgress(id);
      if (onDeleteInvitation) {
        await onDeleteInvitation(id);
        toast({
          title: "Invitation deleted",
          description: "The invitation has been successfully deleted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case "expired":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Pending Invitations</CardTitle>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending invitations</p>
            <p className="text-sm text-muted-foreground mt-1">
              When you invite team members, they will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Invited On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell className="capitalize">{invitation.role}</TableCell>
                  <TableCell>{formatDate(invitation.created_at)}</TableCell>
                  <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvitation(invitation.id)}
                        disabled={
                          actionInProgress === invitation.id || 
                          invitation.status !== "pending"
                        }
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        disabled={actionInProgress === invitation.id}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
