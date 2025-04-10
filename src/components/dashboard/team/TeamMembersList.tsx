import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Button } from "@/components/ui/button.tsx";
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
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { UserPlus, Mail, Trash2, Edit, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { Database } from "@/types/supabase.tsx";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";
import { handleError, showSuccess } from "@/lib/utils/error-handler.ts";

type TeamMemberRole = "owner" | "admin" | "member";

type TeamMemberBase = Database["public"]["Tables"]["team_members"]["Row"];

type TeamMember = TeamMemberBase & {
  user_email?: string;
  user_name?: string;
  last_active?: string;
};

interface TeamMembersListProps {
  initialMembers?: TeamMember[];
}

const TeamMembersList = ({ initialMembers = [] }: TeamMembersListProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<TeamMemberRole>("member");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamId, setTeamId] = useState<string>("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchTeamAndMembers();
  }, [user]);

  const fetchTeamAndMembers = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        throw new Error("No user ID available");
      }

      // Get user's team
      const teamData = await invokeServerFunction("team_get_member_team", { userId: user.id });
      if (!teamData || !teamData.id) {
        throw new Error("Could not find your team");
      }

      setTeamId(teamData.id);

      // Get team members
      const membersData = await invokeServerFunction("team_get_members", { teamId: teamData.id });
      if (!membersData || !Array.isArray(membersData)) {
        throw new Error("Failed to fetch team members");
      }

      setMembers(membersData);
    } catch (error) {
      handleError(error, {
        title: "Failed to load team",
        context: "TeamMembersList.fetchTeamAndMembers"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newMemberEmail || !teamId) return;

    setIsProcessing(true);
    try {
      const response = await invokeServerFunction("team_invite", {
        teamId,
        email: newMemberEmail,
        role: newMemberRole,
      });

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to send invitation");
      }

      showSuccess("Invitation sent", 
        `An invitation has been sent to ${newMemberEmail}`
      );
      
      setNewMemberEmail("");
      setIsInviteDialogOpen(false);
      
      // Refresh the members list
      fetchTeamAndMembers();
    } catch (error) {
      handleError(error, {
        title: "Invitation failed",
        context: "TeamMembersList.handleInvite"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveMember = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveDialog(true);
  };

  const confirmRemoveMember = async () => {
    if (!teamId || !memberToRemove) return;

    setIsProcessing(true);
    try {
      const response = await invokeServerFunction("team_remove", {
        teamId,
        userId: memberToRemove.user_id,
      });

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to remove team member");
      }

      setMembers((prev) =>
        prev.filter((member) => member.user_id !== memberToRemove.user_id)
      );

      showSuccess("Member removed", 
        "Team member has been removed successfully"
      );
      
      setMemberToRemove(null);
      setShowRemoveDialog(false);
    } catch (error) {
      handleError(error, {
        title: "Remove failed",
        context: "TeamMembersList.confirmRemoveMember"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleSaveEdit = async () => {
    if (!teamId || !editingMember) return;

    setIsProcessing(true);
    try {
      const response = await invokeServerFunction("team_update_member_role", {
        teamId,
        userId: editingMember.user_id,
        role: editingMember.role
      });

      if (!response || !response.success) {
        throw new Error(response?.message || "Failed to update team member");
      }

      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id ? editingMember : member,
        ),
      );

      showSuccess("Member updated", 
        "Team member role has been updated successfully"
      );
      
      setEditingMember(null);
    } catch (error) {
      handleError(error, {
        title: "Update failed",
        context: "TeamMembersList.handleSaveEdit"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
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
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white dark:bg-gray-950 p-6 rounded-lg border dark:border-gray-800">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Members</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to a new team member to collaborate on your
                AI agents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMemberRole}
                  onValueChange={(value) =>
                    setNewMemberRole(value as "owner" | "admin" | "member")
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update the role and permissions for this team member.
              </DialogDescription>
            </DialogHeader>
            {editingMember && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editingMember.user_id}`}
                    />
                    <AvatarFallback>
                      {(editingMember.user_name || "UN")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{editingMember.user_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {editingMember.user_email}
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) =>
                      setEditingMember({
                        ...editingMember,
                        role: value as "owner" | "admin" | "member",
                      })
                    }
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingMember(null)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isProcessing}>
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

        {/* Remove Member Dialog */}
        <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                {memberToRemove?.user_name || memberToRemove?.user_email} from
                the team? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveMember}
                disabled={isProcessing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-muted-foreground"
                >
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                        />
                        <AvatarFallback>
                          {(member.user_name || "UN")
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user_email}
                        </p>
                        {member.user_id === user?.id && (
                          <Badge variant="outline" className="mt-1">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(member.role)}
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {member.user_id !== user?.id && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditMember(member)}
                            title="Edit Member"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member)}
                            title="Remove Member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamMembersList;
