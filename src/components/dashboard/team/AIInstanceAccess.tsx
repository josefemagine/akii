import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Loader2, Settings, Bot } from "lucide-react";
import { useToast } from "@/components/ui/use-toast.ts";
import { invokeServerFunction } from "@/utils/supabase/functions.ts";

type AIInstance = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

type TeamMember = {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  user_email?: string;
  user_name?: string;
  ai_instance_access?: string[];
};

interface AIInstanceAccessProps {
  teamId?: string;
}

const AIInstanceAccess = ({ teamId }: AIInstanceAccessProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [aiInstances, setAiInstances] = useState<AIInstance[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    fetchTeamMembersAndInstances();
  }, [teamId]);

  const fetchTeamMembersAndInstances = async () => {
    if (!teamId) return;

    try {
      setIsLoading(true);

      // Fetch team members and AI instances
      const [membersData, instancesData] = await Promise.all([
        invokeServerFunction<TeamMember[]>("team_get_members_with_ai_access", {
          teamId,
        }),
        invokeServerFunction<AIInstance[]>("team_get_ai_instances", {
          teamId,
        })
      ]);

      if (membersData) {
        setMembers(membersData);
      }

      if (instancesData) {
        setAiInstances(instancesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load team members and AI instances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageAccess = (member: TeamMember) => {
    setSelectedMember(member);
    setSelectedInstances(member.ai_instance_access || []);
    setIsDialogOpen(true);
  };

  const handleSaveAccess = async () => {
    if (!selectedMember || !teamId) return;

    try {
      setIsSaving(true);

      await invokeServerFunction("team_update_ai_access", {
        teamId,
        memberId: selectedMember.id,
        aiInstanceAccess: selectedInstances
      });

      // Update local state
      setMembers((prev) =>
        prev.map((member) =>
          member.id === selectedMember.id
            ? { ...member, ai_instance_access: selectedInstances }
            : member,
        ),
      );

      toast({
        title: "Access updated",
        description: `AI instance access for ${selectedMember.user_name} has been updated`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating access:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update AI instance access",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleInstanceAccess = (instanceId: string) => {
    setSelectedInstances((prev) =>
      prev.includes(instanceId)
        ? prev.filter((id) => id !== instanceId)
        : [...prev, instanceId],
    );
  };

  const getAccessCount = (member: TeamMember) => {
    const accessList = member.ai_instance_access || [];
    return accessList.length;
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
        <CardTitle>AI Instance Access</CardTitle>
        <CardDescription>
          Manage which AI instances each team member can access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {aiInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500">
            <Bot className="mb-2 h-12 w-12" />
            <p>No AI instances found</p>
            <p className="mt-2">Create AI instances to manage access</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-gray-500">
            <p>No team members found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
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
                      className={`${member.role === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}`}
                    >
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getAccessCount(member)} / {aiInstances.length} instances
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageAccess(member)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Access
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Manage AI Instance Access for {selectedMember?.user_name}
              </DialogTitle>
              <DialogDescription>
                Select which AI instances this team member can access
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {aiInstances.map((instance) => (
                <div
                  key={instance.id}
                  className="flex items-center space-x-2 rounded-md border p-3"
                >
                  <Checkbox
                    id={`instance-${instance.id}`}
                    checked={selectedInstances.includes(instance.id)}
                    onCheckedChange={() => toggleInstanceAccess(instance.id)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`instance-${instance.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {instance.name}
                    </label>
                    {instance.description && (
                      <p className="text-sm text-muted-foreground">
                        {instance.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAccess} disabled={isSaving}>
                {isSaving ? (
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
      </CardContent>
    </Card>
  );
};

export default AIInstanceAccess;
