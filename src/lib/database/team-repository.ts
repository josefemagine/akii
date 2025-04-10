/**
 * Team Repository
 * 
 * Handles all team-related database operations using the Supabase REST API
 */

import { DatabaseService } from './index';
import type { Profile } from '@/types/auth';

export interface TeamMember {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status?: string;
  is_admin?: boolean;
  joined_at?: string;
  team_id?: string;
  avatar_url?: string;
  display_name?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
  logo_url?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invited_by: string;
  invited_at: string;
  expires_at?: string;
  role?: string;
}

export class TeamRepository {
  /**
   * Get all teams the current user belongs to
   */
  static async getUserTeams(userId: string): Promise<Team[]> {
    const result = await DatabaseService.callFunction<Team[]>('get_user_teams', { user_id: userId });
    return result || [];
  }
  
  /**
   * Get team details by ID
   */
  static async getTeam(teamId: string): Promise<Team | null> {
    return DatabaseService.getById<Team>('teams', teamId);
  }
  
  /**
   * Create a new team
   */
  static async createTeam(team: Partial<Team>): Promise<Team | null> {
    return DatabaseService.insertItem<Team>('teams', team);
  }
  
  /**
   * Update team details
   */
  static async updateTeam(
    teamId: string, 
    updates: Partial<Team>
  ): Promise<Team | null> {
    return DatabaseService.updateItem<Team>('teams', teamId, updates);
  }
  
  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string): Promise<boolean> {
    return DatabaseService.deleteItem('teams', teamId);
  }
  
  /**
   * Get all members of a team
   */
  static async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const result = await DatabaseService.callFunction<{ data: TeamMember[], error?: any }>(
      'get_team_members', 
      { team_id: teamId }
    );
    
    if (!result || result.error) {
      console.error('[TeamRepository] Error getting team members:', result?.error);
      return [];
    }
    
    return result.data || [];
  }
  
  /**
   * Add a user to a team
   */
  static async addTeamMember(
    teamId: string, 
    userId: string, 
    role: string = 'member'
  ): Promise<boolean> {
    const result = await DatabaseService.callFunction<boolean>(
      'add_team_member', 
      { 
        team_id: teamId, 
        user_id: userId, 
        user_role: role 
      }
    );
    
    return result === true;
  }
  
  /**
   * Remove a user from a team
   */
  static async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    const result = await DatabaseService.callFunction<boolean>(
      'remove_team_member', 
      { team_id: teamId, user_id: userId }
    );
    
    return result === true;
  }
  
  /**
   * Update a team member's role
   */
  static async updateTeamMemberRole(
    teamId: string, 
    userId: string, 
    role: string
  ): Promise<boolean> {
    const result = await DatabaseService.callFunction<boolean>(
      'update_team_member_role', 
      { 
        team_id: teamId, 
        user_id: userId, 
        new_role: role 
      }
    );
    
    return result === true;
  }
  
  /**
   * Get all pending invitations for a team
   */
  static async getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
    const invitations = await DatabaseService.getItems<TeamInvitation>('team_invitations', {
      filters: { team_id: teamId, status: 'pending' }
    });
    
    return invitations || [];
  }
  
  /**
   * Create a team invitation
   */
  static async createInvitation(invitation: Partial<TeamInvitation>): Promise<TeamInvitation | null> {
    return DatabaseService.insertItem<TeamInvitation>('team_invitations', invitation);
  }
  
  /**
   * Cancel a team invitation
   */
  static async cancelInvitation(invitationId: string): Promise<boolean> {
    return DatabaseService.deleteItem('team_invitations', invitationId);
  }
  
  /**
   * Accept a team invitation
   */
  static async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<boolean> {
    const result = await DatabaseService.callFunction<boolean>(
      'accept_team_invitation', 
      { invitation_id: invitationId, user_id: userId }
    );
    
    return result === true;
  }
  
  /**
   * Decline a team invitation
   */
  static async declineInvitation(invitationId: string): Promise<boolean> {
    const result = await DatabaseService.callFunction<boolean>(
      'decline_team_invitation', 
      { invitation_id: invitationId }
    );
    
    return result === true;
  }
} 