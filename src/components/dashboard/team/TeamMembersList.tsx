import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Trash2, Edit, UserCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/types/supabase";

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
    if (!user) return;

    try {
      setIsLoading(true);

      // First get the user's team
      const { data: teamData, error: teamError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

      if (teamError) throw teamError;
      const teamId = (teamData as any)?.team_id;
      if (!teamId) {
        throw new Error("No team found for user");
      }

      setTeamId(teamId);

      // Then get the team members
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      if (membersError) throw membersError;

      // Fetch user details for each member
      const membersWithDetails = await Promise.all(
        (membersData || []).map(async (member: any) => {
          const { data: userData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", member.user_id)
            .single();

          return {
            ...member,
            user_email: (userData as any)?.email || "Unknown",
            user_name: (userData as any)?.email?.split("@")[0] || "Unknown User",
          } as TeamMember;
        })
      );

      setMembers(membersWithDetails);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!newMemberEmail || !teamId) return;

    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-team-invite",
        {
          body: {
            action: "invite",
            teamId,
            email: newMemberEmail,
            role: newMemberRole,
          },
        },
      );

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${newMemberEmail}`,
      });

      setNewMemberEmail("");
      setNewMemberRole("member");
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
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
    if (!memberToRemove || !teamId) return;

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberToRemove.id)
        .eq("team_id", teamId);

      if (error) throw error;

      setMembers((prev) =>
        prev.filter((member) => member.id !== memberToRemove.id),
      );

      toast({
        title: "Member removed",
        description: "Team member has been removed successfully",
      });

      setShowRemoveDialog(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleSaveEdit = async () => {
    if (!editingMember || !teamId) return;

    try {
      setIsProcessing(true);

      const { error: updateError } = await supabase
        .from("team_members")
        .update({ role: editingMember.role } as any)
        .eq("id", editingMember.id);

      if (updateError) throw updateError;

      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id ? editingMember : member,
        ),
      );

      toast({
        title: "Member updated",
        description: "Team member role has been updated successfully",
      });

      setEditingMember(null);
    } catch (error) {
      console.error("Error updating team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member",
        variant: "destructive",
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
