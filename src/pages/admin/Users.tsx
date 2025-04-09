import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  MoreVertical,
  UserPlus,
  Download,
  Filter,
  Mail,
  Edit,
  Trash2,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getAllUsers, setUserRole as updateDbUserRole, setUserAsAdmin, debugAdminStatus, createUserProfile } from "@/lib/supabase-admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getAdminClient } from "@/lib/supabase-singleton";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended" | "pending";
  plan: "free" | "starter" | "professional" | "enterprise";
  createdAt: string;
  lastLogin: string;
  agents: number;
  messagesUsed: number;
  messageLimit: number;
  company_name?: string;
}

const getRoleBadge = (role: User["role"]) => {
  switch (role) {
    case "admin":
      return (
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20"
        >
          Admin
        </Badge>
      );
    case "moderator":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
        >
          Moderator
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          User
        </Badge>
      );
  }
};

const getStatusIcon = (status: User["status"]) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "inactive":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "pending":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return null;
  }
};

const getPlanBadge = (plan: User["plan"]) => {
  switch (plan) {
    case "enterprise":
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300">
          Enterprise
        </Badge>
      );
    case "professional":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300">
          Professional
        </Badge>
      );
    case "starter":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
          Starter
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
          Free
        </Badge>
      );
  }
};

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    role: "",
    status: "",
  });
  const navigate = useNavigate();

  // Fetch all users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching all users from profiles table...");
        
        // Define an interface for auth users
        interface AuthUser {
          id: string;
          email?: string;
          confirmed_at?: string;
          email_confirmed_at?: string;
          created_at?: string;
          last_sign_in_at?: string;
        }
        
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
          setError(profileError.message || "Failed to fetch users");
          toast({
            title: "Error loading users",
            description: profileError.message,
            variant: "destructive",
          });
          setUsers([]);
          return;
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

          setUsers(mappedUsers);
          console.log("Loaded users from database:", mappedUsers.length);
        } else {
          console.log("No users found in profiles table");
          setUsers([]);
          toast({
            title: "No users found",
            description: "No user profiles were found in the database.",
          });
        }
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        setError(err instanceof Error ? err.message : String(err));
        setUsers([]);
        toast({
          title: "Error loading users",
          description: "Failed to fetch user data from Supabase.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to update a user's role
  const updateUserRole = async (userId: string, email: string, newRole: User['role']) => {
    try {
      // Update role directly with standard client
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select();

      if (error) {
        toast({
          title: "Error updating role",
          description: error.message || "Failed to update user role",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role updated",
        description: `${email} is now a ${newRole}`,
      });
    } catch (err) {
      toast({
        title: "Error updating role",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  // Function to open edit dialog
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    
    // Split the name into first_name and last_name if it's a full name
    let firstName = "";
    let lastName = "";
    
    if (user.name && user.name.includes(" ")) {
      const nameParts = user.name.split(" ");
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(" ");
    } else {
      firstName = user.name;
    }
    
    setEditedUserData({
      first_name: firstName,
      last_name: lastName,
      email: user.email,
      company_name: user.company_name || "",
      role: user.role,
      status: user.status,
    });
  };

  // Function to close dialog
  const handleCloseDialog = () => {
    setEditingUser(null);
  };

  // Function to save edited user
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      console.log("Saving user updates:", editedUserData);
      
      // Create full_name from first_name and last_name
      const fullName = `${editedUserData.first_name} ${editedUserData.last_name}`.trim();
      
      // Start with basic fields that are known to exist
      const updateData: Record<string, any> = {
        first_name: editedUserData.first_name,
        last_name: editedUserData.last_name,
        full_name: fullName,
        role: editedUserData.role,
      };
      
      // Add status field if it exists (might not in some databases)
      if (editedUserData.status) {
        updateData.status = editedUserData.status;
      }
      
      // Add company_name field if provided
      if (editedUserData.company_name) {
        updateData.company_name = editedUserData.company_name;
      }
      
      console.log("Updating with data:", updateData);
      
      // Update user data in database using standard client
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingUser.id)
        .select();

      if (error) {
        console.error("Error updating user in database:", error);
        
        // Check for specific column errors
        if (error.message?.includes("Could not find the 'company_name' column")) {
          // Try again without the company_name field
          delete updateData.company_name;
          console.log("Retrying without company_name field:", updateData);
          
          // Show toast with link to migration
          toast({
            title: "Company Name field missing",
            description: (
              <div>
                The company_name column is missing from your database. 
                <br />
                <a 
                  href="/dashboard/admin/user-profile-migration" 
                  className="underline text-blue-500 hover:text-blue-700"
                >
                  Run the Profile Migration
                </a> to add it.
              </div>
            ),
            variant: "destructive",
          });
          
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', editingUser.id)
            .select();
            
          if (retryError) {
            // If there's still an error, check for status column issues
            if (retryError.message?.includes("Could not find the 'status' column")) {
              // Try one more time without the status field
              delete updateData.status;
              console.log("Retrying without status field:", updateData);
              
              const { data: finalRetryData, error: finalRetryError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', editingUser.id)
                .select();
                
              if (finalRetryError) {
                console.error("Error in final retry:", finalRetryError);
                toast({
                  title: "Error updating user",
                  description: finalRetryError.message,
                  variant: "destructive",
                });
                return;
              }
            } else {
              console.error("Error updating user in retry:", retryError);
              toast({
                title: "Error updating user",
                description: retryError.message,
                variant: "destructive",
              });
              return;
            }
          }
        } else if (error.message?.includes("Could not find the 'status' column")) {
          // Try again without the status field
          delete updateData.status;
          console.log("Retrying without status field:", updateData);
          
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', editingUser.id)
            .select();
            
          if (retryError) {
            console.error("Error updating user in retry:", retryError);
            toast({
              title: "Error updating user",
              description: retryError.message,
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: "Error updating user",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Update local state with the new data
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: fullName,
                company_name: editedUserData.company_name,
                role: editedUserData.role as User["role"],
                status: editedUserData.status as User["status"],
              }
            : user
        )
      );

      toast({
        title: "User updated",
        description: "User details have been saved successfully.",
      });

      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      toast({
        title: "Error saving user",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={async () => {
            try {
              // Add current user as admin via direct API
              const email = prompt("Enter your email address");
              if (!email) return;
              
              toast({
                title: "Adding admin user",
                description: `Attempting to add ${email} as admin...`,
              });
              
              const { success, data, error } = await setUserAsAdmin(email);
              
              if (error || !success) {
                toast({
                  title: "Error adding admin",
                  description: error && typeof error === 'object' && 'message' in error 
                    ? String(error.message) 
                    : "Failed to set user as admin",
                  variant: "destructive",
                });
                return;
              }
              
              if (data && data.length > 0) {
                toast({
                  title: "Success!",
                  description: `${email} is now an admin. Please refresh the page.`,
                });
                
                // Refresh the page to show updated data
                setTimeout(() => window.location.reload(), 2000);
              } else {
                toast({
                  title: "User not found",
                  description: "No user found with that email",
                  variant: "destructive",
                });
              }
            } catch (err) {
              toast({
                title: "Error adding admin",
                description: err instanceof Error ? err.message : String(err),
                variant: "destructive",
              });
            }
          }} variant="secondary">
            Add Me As Admin
          </Button>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <CardDescription>
            {loading ? "Loading users..." : `Showing ${filteredUsers.length} users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-red-500">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => navigate(`/admin/user-detail/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`}
                          />
                          <AvatarFallback>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(user.status)}
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{user.messagesUsed.toLocaleString()}</span>
                          <span>{user.messageLimit.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div
                            className="h-2 bg-primary rounded-full"
                            style={{
                              width: `${(user.messagesUsed / user.messageLimit) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => e.stopPropagation()}  
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user);
                            }}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Mail className="h-4 w-4 mr-2" /> Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Lock className="h-4 w-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUserRole(user.id, user.email, 'admin');
                              }}
                              disabled={user.role === 'admin'}
                            >
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateUserRole(user.id, user.email, 'user');
                              }}
                              disabled={user.role === 'user'}
                            >
                              Set as User
                            </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>1</strong> to{" "}
            <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={open => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit User</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="dark:text-gray-200">First Name</Label>
              <Input 
                id="first_name" 
                value={editedUserData.first_name} 
                onChange={e => setEditedUserData({...editedUserData, first_name: e.target.value})} 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="dark:text-gray-200">Last Name</Label>
              <Input 
                id="last_name" 
                value={editedUserData.last_name} 
                onChange={e => setEditedUserData({...editedUserData, last_name: e.target.value})} 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
              <Input 
                id="email" 
                value={editedUserData.email} 
                disabled 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:opacity-70"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name" className="dark:text-gray-200">Company Name</Label>
              <Input 
                id="company_name" 
                value={editedUserData.company_name} 
                onChange={e => setEditedUserData({...editedUserData, company_name: e.target.value})} 
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="dark:text-gray-200">Role</Label>
              <select 
                id="role" 
                value={editedUserData.role} 
                onChange={e => setEditedUserData({...editedUserData, role: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="dark:text-gray-200">User Status</Label>
              <select 
                id="status" 
                value={editedUserData.status} 
                onChange={e => setEditedUserData({...editedUserData, status: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Setting a user to "inactive" or "suspended" will prevent them from accessing the application.
                If the status field is missing from your database, visit Admin &gt; User Status Migration.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancel</Button>
            <Button onClick={() => {
              console.log("Save Changes button clicked");
              handleSaveUser();
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
