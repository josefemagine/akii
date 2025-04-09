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
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import TeamMembersList from "@/components/dashboard/team/TeamMembersList";
import TeamRoles from "@/components/dashboard/team/TeamRoles";
import PendingInvitations from "@/components/dashboard/team/PendingInvitations";
import TeamInviteForm from "@/components/dashboard/team/TeamInviteForm";
import AIInstanceAccess from "@/components/dashboard/team/AIInstanceAccess";
import AIInstancesList from "@/components/dashboard/team/AIInstancesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShieldCheck, Mail, Bot, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
const Team = () => {
    const { user, hasUser, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [teamId, setTeamId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchTeam = () => __awaiter(void 0, void 0, void 0, function* () {
            if (!hasUser || authLoading)
                return;
            try {
                setIsLoading(true);
                setError(null);
                console.log("Fetching team for user:", user === null || user === void 0 ? void 0 : user.id);
                // First, ensure the teams table exists and create it if it doesn't
                try {
                    // Check if teams table exists
                    const { data: teamsTableExists, error: teamsTableError } = yield supabase
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
                            const { data: funcExists } = yield supabase
                                .from("pg_proc")
                                .select("proname")
                                .eq("proname", "create_schema_if_needed")
                                .maybeSingle();
                            if (funcExists) {
                                // Use existing function if it exists
                                yield supabase.from("rpc").select("create_schema_if_needed()");
                            }
                            else {
                                // Use the supabase.from API to create the table
                                // Note: This will only work if we have appropriate permissions and if
                                // Postgres extensions are already installed
                                // Alert the user that this operation might need admin privileges
                                console.log("Creating teams table requires admin privileges.");
                                // Insert a record to trigger table creation
                                // This is a workaround as direct schema operations require elevated privileges
                                const { error: insertError } = yield supabase
                                    .from("teams")
                                    .insert({
                                    name: "Initial Team",
                                    created_by: user === null || user === void 0 ? void 0 : user.id
                                });
                                if (insertError && !insertError.message.includes('already exists')) {
                                    console.error("Could not create teams table:", insertError);
                                }
                            }
                        }
                        catch (createError) {
                            console.error("Error creating teams table:", createError);
                        }
                    }
                }
                catch (error) {
                    console.error("Error checking/creating teams table:", error);
                }
                // Check if the team_members table exists
                const { data: tableExists, error: tableError } = yield supabase
                    .from("information_schema.tables")
                    .select("table_name")
                    .eq("table_name", "team_members")
                    .eq("table_schema", "public")
                    .single();
                if (tableError || !tableExists) {
                    console.log("Team members table doesn't exist yet, creating default team");
                    // Create a default team for the user
                    const { data: teamData, error: createTeamError } = yield supabase
                        .from("teams")
                        .insert([{ name: `${user === null || user === void 0 ? void 0 : user.email}'s Team`, created_by: user === null || user === void 0 ? void 0 : user.id }])
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
                            const { data: memberTableExists } = yield supabase
                                .from("information_schema.tables")
                                .select("table_name")
                                .eq("table_name", "team_members")
                                .eq("table_schema", "public")
                                .single();
                            if (!memberTableExists) {
                                console.log("Creating team_members table directly");
                                // Insert a record to trigger table creation
                                // This is a workaround as direct schema operations require elevated privileges
                                const { error: insertError } = yield supabase
                                    .from("team_members")
                                    .insert({
                                    team_id: teamData.id,
                                    user_id: user === null || user === void 0 ? void 0 : user.id,
                                    role: "owner"
                                });
                                if (insertError && !insertError.message.includes('already exists')) {
                                    console.error("Could not create team_members table:", insertError);
                                }
                            }
                        }
                        catch (error) {
                            console.error("Error creating team_members table:", error);
                        }
                        setTeamId(teamData.id);
                        setIsLoading(false);
                        return;
                    }
                }
                // Get the user's primary team
                const { data, error } = yield supabase
                    .from("team_members")
                    .select("team_id")
                    .eq("user_id", user === null || user === void 0 ? void 0 : user.id)
                    .single();
                if (error) {
                    console.error("Error fetching team:", error);
                    // If no team found, create a default one
                    if (error.code === "PGRST116") {
                        console.log("No team found, creating default team");
                        const { data: teamData, error: createTeamError } = yield supabase
                            .from("teams")
                            .insert([{ name: `${user === null || user === void 0 ? void 0 : user.email}'s Team`, created_by: user === null || user === void 0 ? void 0 : user.id }])
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
                        }
                        else if (teamData) {
                            // Add user to the team
                            const { error: memberError } = yield supabase
                                .from("team_members")
                                .insert([
                                {
                                    team_id: teamData.id,
                                    user_id: user === null || user === void 0 ? void 0 : user.id,
                                    role: "owner",
                                },
                            ]);
                            if (memberError) {
                                console.error("Error adding user to team:", memberError);
                            }
                            else {
                                setTeamId(teamData.id);
                            }
                        }
                    }
                    else {
                        setError("Failed to load team information. Please try again.");
                        toast({
                            title: "Error",
                            description: "Failed to load team information",
                            variant: "destructive",
                        });
                    }
                }
                else if (data) {
                    // Use optional chaining and type assertion to safely access team_id
                    setTeamId(data && "team_id" in data ? data.team_id : "");
                }
            }
            catch (error) {
                console.error("Error in team fetch:", error);
                setError("An unexpected error occurred. Please try again.");
                toast({
                    title: "Error",
                    description: "An unexpected error occurred",
                    variant: "destructive",
                });
            }
            finally {
                setIsLoading(false);
            }
        });
        fetchTeam();
    }, [user, hasUser, authLoading, refreshKey, toast]);
    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };
    if (authLoading || isLoading) {
        return (_jsx(DashboardPageContainer, { children: _jsx("div", { className: "flex items-center justify-center h-[calc(100vh-200px)]", children: _jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary mb-4" }), _jsx("span", { className: "text-lg", children: "Loading team information..." })] }) }) }));
    }
    if (error) {
        return (_jsx(DashboardPageContainer, { children: _jsx("div", { className: "flex items-center justify-center h-[calc(100vh-200px)]", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "Error Loading Team" }), _jsx("p", { className: "mt-2 text-muted-foreground mb-6", children: error }), _jsx(Button, { onClick: handleRefresh, className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90", children: "Retry" })] }) }) }));
    }
    if (!teamId) {
        return (_jsx(DashboardPageContainer, { children: _jsx("div", { className: "flex items-center justify-center h-[calc(100vh-200px)]", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("h2", { className: "text-2xl font-bold mb-4", children: "No Team Found" }), _jsx("p", { className: "mt-2 text-muted-foreground mb-6", children: "You don't seem to be part of any team. Please refresh the page or contact support." }), _jsx(Button, { onClick: handleRefresh, className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90", children: "Retry" })] }) }) }));
    }
    return (_jsx(DashboardPageContainer, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Team Management" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage your team members and their permissions." })] }), _jsxs(Tabs, { defaultValue: "members", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsxs(TabsTrigger, { value: "members", className: "flex items-center gap-2", children: [_jsx(Users, { className: "h-4 w-4" }), _jsx("span", { children: "Members" })] }), _jsxs(TabsTrigger, { value: "invitations", className: "flex items-center gap-2", children: [_jsx(Mail, { className: "h-4 w-4" }), _jsx("span", { children: "Invitations" })] }), _jsxs(TabsTrigger, { value: "ai-access", className: "flex items-center gap-2", children: [_jsx(Bot, { className: "h-4 w-4" }), _jsx("span", { children: "AI Access" })] }), _jsxs(TabsTrigger, { value: "roles", className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "h-4 w-4" }), _jsx("span", { children: "Roles & Permissions" })] })] }), _jsxs(TabsContent, { value: "members", className: "space-y-4", children: [_jsx(TeamMembersList, {}), _jsx(TeamInviteForm, { teamId: teamId, onInviteSent: handleRefresh })] }), _jsx(TabsContent, { value: "invitations", className: "space-y-4", children: _jsx(PendingInvitations, { teamId: teamId, onInvitationCancelled: handleRefresh }) }), _jsxs(TabsContent, { value: "ai-access", className: "space-y-8", children: [_jsx(AIInstancesList, { teamId: teamId, onInstanceChange: handleRefresh }), _jsx(AIInstanceAccess, { teamId: teamId })] }), _jsx(TabsContent, { value: "roles", className: "space-y-4", children: _jsx(TeamRoles, {}) })] })] }) }));
};
export default Team;
