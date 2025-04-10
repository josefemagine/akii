import { supabase } from "@/lib/supabase.tsx";
import { getAdminClient } from "@/lib/supabase-singleton.tsx";
import { User, AuthUser, EditUserData } from "@/types/user.ts";

/**
 * Fetches all users from the database
 */
export const fetchAllUsers = async (): Promise<{
  users: User[];
  error: string | null;
}> => {
  try {
    console.log("Fetching all users from profiles table...");
    
    // First, try to get auth users using admin client
    const adminClient = getAdminClient();
    let authUsers: AuthUser[] = [];
    
    if (adminClient) {
      try {
        const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
        if (authError) {
          console.error("Error fetching auth users:", authError);
        } else if (authData) {
          console.log(`Successfully loaded ${authData.users.length} auth users`);
          authUsers = authData.users;
        }
      } catch (authErr) {
        console.error("Error accessing admin auth API:", authErr);
      }
    }
    
    // Use the standard client to fetch all profiles without any filters
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*");

    if (profileError) {
      console.error("Error fetching profiles:", profileError);
      return {
        users: [],
        error: profileError.message || "Failed to fetch users"
      };
    }

    // Create a map of profiles by ID for quick lookup
    const profilesMap = new Map();
    if (profileData) {
      profileData.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }
    
    // Create profiles for auth users that don't have profiles
    const profilesToCreate: AuthUser[] = [];
    for (const authUser of authUsers) {
      if (!profilesMap.has(authUser.id)) {
        profilesToCreate.push(authUser);
      }
    }
    
    // Create missing profiles
    if (profilesToCreate.length > 0) {
      console.log(`Creating profiles for ${profilesToCreate.length} users without profiles`);
      
      for (const authUser of profilesToCreate) {
        try {
          const { success, data } = await createUserProfile(authUser);
          if (success && data) {
            profilesMap.set(data.id, data);
          }
        } catch (err) {
          console.error(`Error creating profile for user ${authUser.id}:`, err);
        }
      }
    }

    if (profilesMap.size > 0) {
      console.log(`Successfully processed ${profilesMap.size} profiles`);
      
      // Create a map of auth users by ID for quick lookup
      const authUsersMap = new Map();
      authUsers.forEach(user => {
        authUsersMap.set(user.id, user);
      });
      
      // Map profiles to our User interface
      const mappedUsers: User[] = Array.from(profilesMap.values()).map(profile => {
        // Get auth user data if available
        const authUser = authUsersMap.get(profile.id);
        
        // Determine status from either status field or active field
        let userStatus: User['status'] = 'inactive';
        if (profile.status === 'active') {
          userStatus = 'active';
        } else if (profile.status === 'pending') {
          userStatus = 'pending';
        } else if (profile.active === true) {
          userStatus = 'active';
        } else if (authUser?.confirmed_at) {
          userStatus = 'active';
        } else if (authUser?.email_confirmed_at) {
          userStatus = 'active';
        }
        
        // Get the last login time from auth data if available
        let lastLogin = '-';
        if (profile.last_sign_in_at) {
          lastLogin = new Date(profile.last_sign_in_at).toISOString().split('T')[0];
        } else if (authUser?.last_sign_in_at) {
          lastLogin = new Date(authUser.last_sign_in_at).toISOString().split('T')[0];
        }
        
        // Default to safer values when fields are missing
        return {
          id: profile.id || `profile-${Math.random()}`,
          name: profile.full_name || 
                `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                profile.email?.split('@')[0] || 
                'Unknown User',
          email: profile.email || authUser?.email || 'unknown@example.com',
          role: profile.role || 'user',
          status: userStatus,
          plan: profile.subscription_tier || 'free',
          createdAt: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 
                    authUser?.created_at ? new Date(authUser.created_at).toISOString().split('T')[0] : 
                    'Unknown',
          lastLogin,
          agents: profile.agents_count || 0,
          messagesUsed: profile.messages_used || 0,
          messageLimit: profile.message_limit || 1000,
          company_name: profile.company_name || '',
        };
      });

      return {
        users: mappedUsers,
        error: null
      };
    } else {
      console.log("No users found in profiles table");
      return {
        users: [],
        error: "No user profiles were found in the database."
      };
    }
  } catch (err) {
    console.error("Unexpected error fetching users:", err);
    return {
      users: [],
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

/**
 * Creates a user profile for an auth user
 */
export const createUserProfile = async (authUser: AuthUser): Promise<{
  success: boolean;
  data: any | null;
  error: string | null;
}> => {
  try {
    if (!authUser.id || !authUser.email) {
      return {
        success: false,
        data: null,
        error: "User ID or email missing"
      };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        role: 'user',
        status: 'active',
        first_name: authUser.email.split('@')[0] || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating profile:", error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
    
    return {
      success: true,
      data,
      error: null
    };
  } catch (err) {
    console.error("Error in createUserProfile:", err);
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

/**
 * Updates a user's role
 */
export const updateUserRole = async (
  userId: string, 
  newRole: string
): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Update role directly with standard client
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select();

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to update user role"
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

/**
 * Updates user data
 */
export const updateUserData = async (
  userId: string,
  userData: Partial<EditUserData>
): Promise<{
  success: boolean;
  error: string | null;
  data: any | null;
}> => {
  try {
    // Create full_name from first_name and last_name if both are provided
    let updateData: Record<string, any> = { ...userData };
    
    if (userData.first_name !== undefined && userData.last_name !== undefined) {
      updateData.full_name = `${userData.first_name} ${userData.last_name}`.trim();
    }
    
    console.log("Updating user with data:", updateData);
    
    // Update user data in database
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      // Handle specific column errors
      if (error.message?.includes("company_name")) {
        // Try again without company_name
        delete updateData.company_name;
        
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select();
          
        if (retryError) {
          if (retryError.message?.includes("status")) {
            // Try one more time without the status field
            delete updateData.status;
            
            const { data: finalRetryData, error: finalRetryError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', userId)
              .select();
              
            if (finalRetryError) {
              return {
                success: false,
                error: finalRetryError.message,
                data: null
              };
            }
            
            return {
              success: true,
              error: "Warning: company_name and status fields not available in database schema",
              data: finalRetryData
            };
          }
          
          return {
            success: false,
            error: retryError.message,
            data: null
          };
        }
        
        return {
          success: true,
          error: "Warning: company_name field not available in database schema",
          data: retryData
        };
      } else if (error.message?.includes("status")) {
        // Try again without status
        delete updateData.status;
        
        const { data: retryData, error: retryError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId)
          .select();
          
        if (retryError) {
          return {
            success: false,
            error: retryError.message,
            data: null
          };
        }
        
        return {
          success: true,
          error: "Warning: status field not available in database schema",
          data: retryData
        };
      }
      
      return {
        success: false,
        error: error.message,
        data: null
      };
    }

    return {
      success: true,
      error: null,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      data: null
    };
  }
}; 