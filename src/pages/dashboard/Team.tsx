import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext.tsx";
import TeamMembersList from "@/components/dashboard/team/TeamMembersList.tsx";
import TeamRoles from "@/components/dashboard/team/TeamRoles.tsx";
import PendingInvitations from "@/components/dashboard/team/PendingInvitations.tsx";
import TeamInviteForm from "@/components/dashboard/team/TeamInviteForm.tsx";
import AIInstanceAccess from "@/components/dashboard/team/AIInstanceAccess.tsx";
import AIInstancesList from "@/components/dashboard/team/AIInstancesList.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Users, ShieldCheck, Mail, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Button } from "@/components/ui/button.tsx";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer.tsx";

const Team = () => {
  const { user, hasUser, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [teamId, setTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!hasUser || authLoading) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching team for user:", user?.id);

        // First, ensure the teams table exists and create it if it doesn't
        try {
          // Check if teams table exists
          const { data: teamsTableExists, error: teamsTableError } =
            await supabase
              .from("information_schema.tables")
              .select("table_name")
              .eq("table_name", "teams")
              .eq("table_schema", "public")
              .single();

          if (teamsTableError || !teamsTableExists) {
            console.log("Teams table doesn't exist, creating it");
            // Create teams table by executing separate operations
            try {
              // First check if the function exists that can create tables
              const { data: funcExists } = await supabase
                .from("pg_proc")
                .select("proname")
                .eq("proname", "create_schema_if_needed")
                .maybeSingle();

              if (funcExists) {
                // Use existing function if it exists
                await supabase.from("rpc").select("create_schema_if_needed()");
              } else {
                // Use the supabase.from API to create the table
                // Note: This will only work if we have appropriate permissions and if
                // Postgres extensions are already installed
                
                // Alert the user that this operation might need admin privileges
                console.log("Creating teams table requires admin privileges.");
                
                // Insert a record to trigger table creation
                // This is a workaround as direct schema operations require elevated privileges
                const { error: insertError } = await supabase
                  .from("teams")
                  .insert({
                    name: "Initial Team",
                    created_by: user?.id
                  });
                
                if (insertError && !insertError.message.includes('already exists')) {
                  console.error("Could not create teams table:", insertError);
                }
              }
            } catch (createError) {
              console.error("Error creating teams table:", createError);
            }
          }
        } catch (error) {
          console.error("Error checking/creating teams table:", error);
        }

        // Check if the team_members table exists
        const { data: tableExists, error: tableError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_name", "team_members")
          .eq("table_schema", "public")
          .single();

        if (tableError || !tableExists) {
          console.log(
            "Team members table doesn't exist yet, creating default team",
          );
          // Create a default team for the user
          const { data: teamData, error: createTeamError } = await supabase
            .from("teams")
            .insert([{ name: `${user?.email}'s Team`, created_by: user?.id }])
            .select()
            .single();

          if (createTeamError) {
            console.error("Error creating default team:", createTeamError);
            setIsLoading(false);
            setError("Failed to create default team. Please try again.");
            return;
          }

          if (teamData) {
            // Try to create team_members table directly instead of RPC
            try {
              // First check if the table exists despite the earlier check
              const { data: memberTableExists } = await supabase
                .from("information_schema.tables")
                .select("table_name")
                .eq("table_name", "team_members")
                .eq("table_schema", "public")
                .single();
              
              if (!memberTableExists) {
                console.log("Creating team_members table directly");
                
                // Insert a record to trigger table creation
                // This is a workaround as direct schema operations require elevated privileges
                const { error: insertError } = await supabase
                  .from("team_members")
                  .insert({
                    team_id: teamData.id,
                    user_id: user?.id,
                    role: "owner"
                  });
                
                if (insertError && !insertError.message.includes('already exists')) {
                  console.error("Could not create team_members table:", insertError);
                }
              }
            } catch (error) {
              console.error("Error creating team_members table:", error);
            }

            setTeamId(teamData.id);
            setIsLoading(false);
            return;
          }
        }

        // Get the user's primary team
        const { data, error } = await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", user?.id)
          .single();

        if (error) {
          console.error("Error fetching team:", error);

          // If no team found, create a default one
          if (error.code === "PGRST116") {
            console.log("No team found, creating default team");
            const { data: teamData, error: createTeamError } = await supabase
              .from("teams")
              .insert([{ name: `${user?.email}'s Team`, created_by: user?.id }])
              .select()
              .single();

            if (createTeamError) {
              console.error("Error creating default team:", createTeamError);
              setError("Failed to create team. Please try again.");
              toast({
                title: "Error",
                description: "Failed to create team",
                variant: "destructive",
              });
            } else if (teamData) {
              // Add user to the team
              const { error: memberError } = await supabase
                .from("team_members")
                .insert([
                  {
                    team_id: teamData.id,
                    user_id: user?.id,
                    role: "owner",
                  },
                ]);

              if (memberError) {
                console.error("Error adding user to team:", memberError);
              } else {
                setTeamId(teamData.id);
              }
            }
          } else {
            setError("Failed to load team information. Please try again.");
            toast({
              title: "Error",
              description: "Failed to load team information",
              variant: "destructive",
            });
          }
        } else if (data) {
          // Use optional chaining and type assertion to safely access team_id
          setTeamId(data && "team_id" in data ? data.team_id : "");
        }
      } catch (error) {
        console.error("Error in team fetch:", error);
        setError("An unexpected error occurred. Please try again.");
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
  }, [user, hasUser, authLoading, refreshKey, toast]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (authLoading || isLoading) {
    return (
      <DashboardPageContainer>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span className="text-lg">Loading team information...</span>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

  if (error) {
    return (
      <DashboardPageContainer>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Error Loading Team</h2>
            <p className="mt-2 text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

  if (!teamId) {
    return (
      <DashboardPageContainer>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">No Team Found</h2>
            <p className="mt-2 text-muted-foreground mb-6">
              You don't seem to be part of any team. Please refresh the page or
              contact support.
            </p>
            <Button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <DashboardPageContainer>
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
            <TabsTrigger value="ai-access" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>AI Access</span>
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
            <PendingInvitations
              teamId={teamId}
              onInvitationCancelled={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="ai-access" className="space-y-8">
            <AIInstancesList teamId={teamId} onInstanceChange={handleRefresh} />
            <AIInstanceAccess teamId={teamId} />
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <TeamRoles />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardPageContainer>
  );
};

export default Team;
