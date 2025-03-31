import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import TeamMembersList from "@/components/dashboard/team/TeamMembersList";
import TeamRoles from "@/components/dashboard/team/TeamRoles";
import PendingInvitations from "@/components/dashboard/team/PendingInvitations";
import TeamInviteForm from "@/components/dashboard/team/TeamInviteForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldCheck, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Team = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamId, setTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Get the user's primary team
        const { data, error } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user.id as any)
          .single();

        if (error) {
          console.error("Error fetching team:", error);
          toast({
            title: "Error",
            description: "Failed to load team information",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Use optional chaining and type assertion to safely access team_id
          setTeamId(data && "team_id" in data ? data.team_id : "");
        }
      } catch (error) {
        console.error("Error in team fetch:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [user, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading team information...</h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we load your team data.
          </p>
        </div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Team Found</h2>
          <p className="mt-2 text-muted-foreground">
            You don't seem to be part of any team. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team members and their permissions.
        </p>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Invitations</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Roles & Permissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <TeamMembersList />
          <TeamInviteForm teamId={teamId} onInviteSent={handleRefresh} />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <PendingInvitations />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <TeamRoles />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
