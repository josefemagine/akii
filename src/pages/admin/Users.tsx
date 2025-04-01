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
import { getAllUsers, setUserRole as updateDbUserRole, setUserAsAdmin, debugAdminStatus } from "@/lib/supabase-admin";
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

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "team_member";
  status: "active" | "inactive" | "pending";
  plan: "free" | "starter" | "professional" | "enterprise";
  createdAt: string;
  lastLogin: string;
  agents: number;
  messagesUsed: number;
  messageLimit: number;
}

const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    plan: "enterprise",
    createdAt: "2023-05-10",
    lastLogin: "2023-06-28",
    agents: 12,
    messagesUsed: 8750,
    messageLimit: 50000,
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    plan: "professional",
    createdAt: "2023-05-15",
    lastLogin: "2023-06-27",
    agents: 5,
    messagesUsed: 3240,
    messageLimit: 5000,
  },
  {
    id: "user-3",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    role: "team_member",
    status: "active",
    plan: "professional",
    createdAt: "2023-05-20",
    lastLogin: "2023-06-25",
    agents: 3,
    messagesUsed: 1890,
    messageLimit: 5000,
  },
  {
    id: "user-4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "user",
    status: "inactive",
    plan: "starter",
    createdAt: "2023-06-01",
    lastLogin: "2023-06-15",
    agents: 2,
    messagesUsed: 850,
    messageLimit: 2000,
  },
  {
    id: "user-5",
    name: "Michael Wilson",
    email: "michael.wilson@example.com",
    role: "user",
    status: "pending",
    plan: "free",
    createdAt: "2023-06-20",
    lastLogin: "-",
    agents: 0,
    messagesUsed: 0,
    messageLimit: 1000,
  },
];

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
    case "team_member":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
        >
          Team Member
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
    name: "",
    email: "",
    role: "",
    status: "",
  });

  // Fetch real users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        console.log("Fetching users with client from supabase-admin...");
        
        // Log available environment variables for debugging
        console.log("Environment variables available:", {
          url: import.meta.env.VITE_SUPABASE_URL ? "YES" : "NO",
          anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? "YES" : "NO",
          serviceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY ? "YES" : "NO",
        });
        
        // Use our dedicated admin function to get all users
        const { users: dbUsers, error: usersError } = await getAllUsers();

        if (usersError) {
          console.error("Error fetching users:", usersError);
          setError(usersError.message || "Failed to fetch users");
          setUsers(mockUsers);
          return;
        }

        if (dbUsers && dbUsers.length > 0) {
          // Map database users to our User interface
          const mappedUsers: User[] = dbUsers.map(user => {
            console.log("Processing user:", user);
            
            // Determine status from either status field or active field
            let userStatus: User['status'] = 'inactive';
            if (user.status === 'active') {
              userStatus = 'active';
            } else if (user.status === 'pending') {
              userStatus = 'pending';
            } else if (user.active === true) {
              userStatus = 'active';
            }
            
            return {
              id: user.id || `profile-${Math.random()}`,
              name: user.full_name || user.auth_email?.split('@')[0] || 'Unknown User',
              email: user.auth_email || user.email || 'unknown@example.com',
              role: user.role || 'user',
              status: userStatus,
              plan: user.subscription_tier || 'free',
              createdAt: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'Unknown',
              lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString().split('T')[0] : '-',
              agents: user.agents_count || 0,
              messagesUsed: user.messages_used || 0,
              messageLimit: user.message_limit || 1000,
            };
          });

          setUsers(mappedUsers);
          console.log("Loaded users from database:", mappedUsers);
        } else {
          console.log("No users found, using mock data");
          setUsers(mockUsers);
        }
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        setError(err instanceof Error ? err.message : String(err));
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to update a user's role
  const updateUserRole = async (userId: string, email: string, newRole: User['role']) => {
    try {
      const { success, error } = await updateDbUserRole(email, newRole);

      if (error || !success) {
        toast({
          title: "Error updating role",
          description: error?.message || "Failed to update user role",
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
    setEditedUserData({
      name: user.name,
      email: user.email,
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
      
      const adminClient = getAdminClient();
      if (!adminClient) {
        toast({
          title: "Admin client not available",
          description: "Check your environment variables",
          variant: "destructive",
        });
        return;
      }
      
      // Update user data in database
      const { data, error } = await adminClient
        .from('profiles')
        .update({
          full_name: editedUserData.name,
          role: editedUserData.role,
          status: editedUserData.status,
        })
        .eq('email', editingUser.email);

      if (error) {
        // Special handling for missing status column
        if (error.message.includes("does not exist") && error.message.includes("status")) {
          toast({
            title: "Status field not available",
            description: "The status column is missing from your database. Visit Admin > User Status Migration to add it.",
            variant: "destructive",
          });
          
          // Try again without the status field
          const { data: retryData, error: retryError } = await adminClient
            .from('profiles')
            .update({
              full_name: editedUserData.name,
              role: editedUserData.role,
            })
            .eq('email', editingUser.email);
            
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
          console.error("Error updating user in database:", error);
          toast({
            title: "Error updating user",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id ? { 
          ...user, 
          name: editedUserData.name,
          role: editedUserData.role as User['role'],
          status: editedUserData.status as User['status'],
        } : user
      ));

      toast({
        title: "User updated",
        description: `${editingUser.email} has been updated successfully.`,
      });

      // Close the dialog
      handleCloseDialog();
    } catch (err) {
      console.error("Exception updating user:", err);
      toast({
        title: "Error updating user",
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
                  description: error?.message || "Failed to set user as admin",
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
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
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
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" /> Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="h-4 w-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(user.id, user.email, 'admin')}
                              disabled={user.role === 'admin'}
                            >
                              Set as Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateUserRole(user.id, user.email, 'user')}
                              disabled={user.role === 'user'}
                            >
                              Set as User
                            </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={editedUserData.name} 
                onChange={e => setEditedUserData({...editedUserData, name: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={editedUserData.email} 
                disabled 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select 
                id="role" 
                value={editedUserData.role} 
                onChange={e => setEditedUserData({...editedUserData, role: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">User Status</Label>
              <select 
                id="status" 
                value={editedUserData.status} 
                onChange={e => setEditedUserData({...editedUserData, status: e.target.value})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Setting a user to "inactive" or "banned" will prevent them from accessing the application.
                If the status field is missing from your database, visit Admin &gt; User Status Migration.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
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
