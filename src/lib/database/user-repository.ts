/**
 * User Repository
 * 
 * Handles all user-related database operations using the Supabase REST API
 */

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/auth';

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_admin?: boolean;
  role?: string;
  status?: string;
  avatar_url?: string;
  display_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  company?: string;
  company_name?: string;
  has_2fa?: boolean;
  // Additional fields from the actual database
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  // Subscription related fields
  subscription_updated_at?: string;
  subscription_renews_at?: string;
  payment_method_type?: string;
  payment_customer_id?: string;
  payment_subscription_id?: string;
  trial_notification_sent?: boolean;
  usage_limit_notification_sent?: boolean;
  subscription_addons?: any;
}

export class UserRepository {
  /**
   * Get a user profile by ID - direct implementation without DatabaseService dependency
   */
  static async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check if supabase client is available
      if(!supabase){
        console.error('[UserRepository] getProfile - Supabase client not available');
        return null;
      }

      
      // Get current auth session first to obtain token
      let { data: sessionData, error: getSessionError } = await supabase.auth.getSession();
      console.log('[UserRepository] getProfile - session data:', sessionData);

      if (getSessionError) {
        console.error('[UserRepository] Error getting session:', getSessionError);
        return null;
      }
      
      //Check if session is available
      if (!sessionData?.session?.access_token) {
        console.error('[UserRepository] getProfile - No valid auth session, attempting to refresh');
        
        const { data: refreshedSessionData, error: refreshError } = await supabase.auth.refreshSession()
        if(refreshError) {
          console.error('[UserRepository] getProfile - Failed to refresh session', refreshError)
          return null;
        }
        console.log('[UserRepository] getProfile - Session refreshed')
        sessionData = refreshedSessionData
        
      }

      //Check if session is now available
      if (!sessionData?.session?.access_token) {
        console.error('[UserRepository] getProfile - No valid auth session after refresh, cannot query profiles');
        return null;
      }

      
      let fetchResponse = null;
      let apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
      try {
          // Reference: https://supabase.com/docs/guides/api/creating-routes
          const apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
          
          const fetchParams = {
            method: 'GET',
            headers: {
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          };
          
          fetchResponse = await fetch(apiUrl, fetchParams);
          
          // Check response status
          if (!fetchResponse.ok) {
            if (fetchResponse.status === 401) {
              console.error('[UserRepository] getProfile - 401 Unauthorized error. Attempting to refresh session.');
              
              const { data: refreshedSessionData, error: refreshError } = await supabase.auth.refreshSession()
              if(refreshError) {
                console.error('[UserRepository] getProfile - Failed to refresh session after 401:', refreshError)
                throw refreshError;
              }
              console.log('[UserRepository] getProfile - Session refreshed after 401, retrying')
              sessionData = refreshedSessionData
              fetchParams.headers['Authorization'] = `Bearer ${sessionData.session?.access_token}`;
              fetchResponse = await fetch(apiUrl, fetchParams);
            } else {
              const responseText = await fetchResponse.text();
              console.error('[UserRepository] getProfile -  REST API error:', fetchResponse.status, fetchResponse.statusText, {response: fetchResponse, responseText: responseText});
            }
            

            // If not found (404) or not acceptable (406), handle profile creation
            if (fetchResponse.status === 404 || fetchResponse.status === 406) {
              return this.createNewProfile(userId);
            }
            const responseText = await fetchResponse.text();
            console.error('[UserRepository] response.text', responseText);
            throw new Error(`REST API error: ${fetchResponse.status} ${fetchResponse.statusText}`);
          }
      } catch(error) {
          console.error('[UserRepository] getProfile - Error while fetching', error);
          if(fetchResponse){
            console.error('[UserRepository] getProfile - fetch response', fetchResponse)
          }
          
          if (error instanceof Error) {
            console.error('[UserRepository] getProfile - Error object:', error);
          }
          throw error;
      }
      
      const response = fetchResponse
      const data = await response.json();

      
      if (Array.isArray(data) && data.length > 0) {
        return this.mapProfileData(data[0]);
      } else {
        return this.createNewProfile(userId);
      }
    } catch (err) {
      console.error('[UserRepository] getProfile - Exception getting profile:', err);

      if (err instanceof Error) {
        console.error('[UserRepository] getProfile - Error object:', err);
      }
      // Last attempt using standard supabase client
      try {
        console.error('[UserRepository] getProfile - Trying standard Supabase client as fallback');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error || !data) {
          console.error('[UserRepository] getProfile - Fallback error:', error);
          return null;
        }
        
        if (data) {
          return this.mapProfileData(data);
        }
      } catch (fallbackErr: any) {
        console.error('[UserRepository] Fallback exception:', fallbackErr);
      }


      return null;
    }
  }
  
  /**
   * Helper method to create a new profile
   */
  private static async createNewProfile(userId: string): Promise<UserProfile | null> {
      console.log('[UserRepository] createNewProfile - Creating new profile for user:', userId);
      
      // Get user data
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        console.error('[UserRepository] No user data available for profile creation');
        return null;
      }
      
      const newProfile = {
        id: userId,
        email: userData.user.email || '',
        first_name: 'User',
        last_name: '',
        full_name: userData.user.email?.split('@')[0] || 'User',
        status: 'active',
        is_admin: userId === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8' ? true : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
       // Use REST API directly for creation to ensure consistency
       const { data: sessionData, error: getSessionError } = await supabase.auth.getSession();
       if(getSessionError || !sessionData.session || !sessionData.session.access_token){
          throw new Error(`No valid auth session for profile creation: ${getSessionError}`)
      }
      
      const apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newProfile)
      });
      
      if (!response.ok) {
        console.error('[UserRepository] REST API error creating profile:', response.status, response.statusText);
        throw new Error(`REST API error creating profile: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[UserRepository] New profile created successfully:', data);

      if (Array.isArray(data) && data.length > 0) {
        return this.mapProfileData(data[0]);
      }
        if(data){
          return this.mapProfileData(data);
        }

      // Fallback to the original created profile if no response data
      return this.mapProfileData(newProfile);
    } catch (err) {
      console.error('[UserRepository] Exception creating profile:', err);
      
      // Last attempt using standard Supabase client
      try {
        console.log('[UserRepository] Trying standard Supabase client for profile creation');
        
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData?.user) {
          return null;
        }
        
        console.log('[UserRepository] Creating profile - new profile data fallback:', newProfile);
        const newProfile = {
          id: userId,
          email: userData.user.email || '',
          first_name: 'User',
          last_name: '',
          full_name: userData.user.email?.split('@')[0] || 'User',
          status: 'active',
          is_admin: userId === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8' ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();
        
        if (error) {
          console.error('[UserRepository] Error creating profile with Supabase client:', error);
          return null;
        }
        
        return this.mapProfileData(data);
      } catch (createErr) {
        console.error('[UserRepository] Exception in fallback profile creation:', createErr);
        return null;
      }
    }
  }
  
  /**
   * Maps database fields to our application model
   */
  private static mapProfileData(data: any): UserProfile {
    if (!data) {
      console.error('[UserRepository] Cannot map null profile data');
      return null as any;
    }

    // Map database fields to our application model
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      
      // Name fields - handle different schema variations
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      full_name: data.full_name || '',
      
      // Role and admin status
      role: data.role || 'user',
      status: data.status || 'active',
      is_admin: data.is_admin === true || data.role === 'admin',
      
      // Contact and image
      avatar_url: data.avatar_url || '',
      phone: data.phone || '',
      
      // Timestamps
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      
      // Company info
      company: data.company || '',
      company_name: data.company_name || '',
      
      // 2FA - not in actual DB schema
      has_2fa: false,
      
      // Address fields from actual schema
      address1: data.address1 || '',
      address2: data.address2 || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      country: data.country || '',
      
      // Subscription fields from actual schema
      subscription_updated_at: data.subscription_updated_at,
      subscription_renews_at: data.subscription_renews_at,
      payment_method_type: data.payment_method_type,
      payment_customer_id: data.payment_customer_id,
      payment_subscription_id: data.payment_subscription_id,
      trial_notification_sent: data.trial_notification_sent,
      usage_limit_notification_sent: data.usage_limit_notification_sent,
      subscription_addons: data.subscription_addons
    };
    
    console.log('[UserRepository] Mapped profile:', profile);
    return profile;
  }
  
  /**
   * Get multiple user profiles - direct implementation
   */
  static async getProfiles(options: {
    limit?: number;
    filters?: Record<string, any>;
    orderBy?: string;
    ascending?: boolean;
  } = {}): Promise<UserProfile[]> {
    try {
      const { limit, orderBy = 'created_at', ascending = false } = options;
      
      let query = supabase
        .from('profiles')
        .select('*');
      
      // Apply ordering
      query = query.order(orderBy, { ascending });
      
      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[UserRepository] Error getting profiles:', error);
        return [];
      }
      
      return data as UserProfile[];
    } catch (err) {
      console.error('[UserRepository] Exception getting profiles:', err);
      return [];
    }
  }
  
  /**
   * Update a user profile - direct implementation
   */
  static async updateProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    try {
      console.log('[UserRepository] Updating profile for user:', userId, updates);
      
      // Clone updates to avoid modifying the original object
      const cleanUpdates = { ...updates };
      
      // Remove any properties that shouldn't be directly updated
      delete cleanUpdates.id;
      delete cleanUpdates.created_at;
      
      // Ensure updated_at is set to the current time
      cleanUpdates.updated_at = new Date().toISOString();
      
      // First try the native Supabase client
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('[UserRepository] Error updating profile with client:', error);
        
        // Fall back to REST API if client fails
        try {
          console.log('[UserRepository] Trying direct REST API for profile update');
          
          // Get current auth session for token
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.access_token) {
            throw new Error('No valid auth session for profile update');
          }
          
          const apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}`;
          
          const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(cleanUpdates)
          });
          
          if (!response.ok) {
            throw new Error(`REST API error: ${response.status} ${response.statusText}`);
          }
          
          const restData = await response.json();
          
          if (Array.isArray(restData) && restData.length > 0) {
            console.log('[UserRepository] Profile updated successfully via REST API');
            return this.mapProfileData(restData[0]);
          }
          
          return null;
        } catch (restErr) {
          console.error('[UserRepository] Exception using REST API for update:', restErr);
          return null;
        }
      }
      
      console.log('[UserRepository] Profile updated successfully:', data);
      return this.mapProfileData(data);
    } catch (err) {
      console.error('[UserRepository] Exception updating profile:', err);
      return null;
    }
  }
  
  /**
   * Check if a user is an admin - direct implementation
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      // First check if user is the special admin user
      if (userId === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
        return true;
      }
      
      // Check the profile for admin status
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('[UserRepository] Error checking admin status:', error);
        return false;
      }
      
      return data?.is_admin === true || data?.role === 'admin';
    } catch (err) {
      console.error('[UserRepository] Exception checking admin status:', err);
      return false;
    }
  }
  
  /**
   * Get detailed user information (admin only) - direct implementation
   */
  static async getUserDetails(userId: string): Promise<any | null> {
    try {
      // Call the RPC function directly
      const { data, error } = await supabase
        .rpc('get_user_details', { user_id: userId });
      
      if (error) {
        console.error('[UserRepository] Error getting user details:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('[UserRepository] Exception getting user details:', err);
      return null;
    }
  }
  
  /**
   * Toggle a user's admin status (admin only) - direct implementation
   */
  static async toggleAdminStatus(userId: string): Promise<boolean> {
    try {
      // Call the RPC function directly
      const { data, error } = await supabase
        .rpc('toggle_admin_status', { target_user_id: userId });
      
      if (error) {
        console.error('[UserRepository] Error toggling admin status:', error);
        return false;
      }
      
      return data === true;
    } catch (err) {
      console.error('[UserRepository] Exception toggling admin status:', err);
      return false;
    }
  }
  
  /**
   * Search for users by name or email - direct implementation
   */
  static async searchUsers(query: string, limit = 20): Promise<UserProfile[]> {
    try {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(limit);
      
      if (error) {
        console.error('[UserRepository] Error searching users:', error);
        return [];
      }
      
      return data as UserProfile[];
    } catch (err) {
      console.error('[UserRepository] Exception searching users:', err);
      return [];
    }
  }

  /**
   * Check admin status using direct REST API call
   * This is more reliable than the RPC-based approach
   */
  static async checkAdminStatusREST(userId: string): Promise<boolean> {
    try {
      console.log('[UserRepository] Checking admin status via REST for user:', userId);
      
      // Special case for known admin user
      if (userId === 'b574f273-e0e1-4cb8-8c98-f5a7569234c8') {
        console.log('[UserRepository] Special admin user detected');
        return true;
      }
      
      // Get current session for token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        console.error('[UserRepository] No access token available');
        return false;
      }
      
      // Build URL for profiles table
      const apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=is_admin,role`;
      
      // Make direct REST call
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${sessionData.session.access_token}`,
          "apikey": supabase.supabaseKey,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`REST API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[UserRepository] REST API admin check result:', data);
      
      // Check both is_admin field and role field
      const isAdmin = data[0]?.is_admin === true || data[0]?.role === 'admin';
      
      // Update localstorage for fallback mechanisms
      if (isAdmin) {
        localStorage.setItem('user_is_admin', 'true');
        localStorage.setItem('admin_user_id', userId);
      }
      
      return isAdmin;
    } catch (err) {
      console.error('[UserRepository] Exception checking admin status via REST:', err);
      
      // Fallback to the standard method
      return UserRepository.isAdmin(userId);
    }
  }
} 