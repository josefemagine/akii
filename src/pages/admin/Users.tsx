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
  Download,
  Filter,
  Search,
  UserPlus,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { setUserAsAdmin } from "@/lib/supabase-admin";
import { User, EditUserData } from "@/types/user";
import { UserTable } from "@/components/admin/users/UserTable";
import { EditUserDialog } from "@/components/admin/users/EditUserDialog";
import {
  fetchAllUsers,
  updateUserRole,
  updateUserData
} from "@/services/userService";

const UsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editedUserData, setEditedUserData] = useState<EditUserData>({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    role: "",
    status: "",
  });

  // Fetch all users from the database
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const { users: loadedUsers, error: fetchError } = await fetchAllUsers();
        
        if (fetchError) {
          setError(fetchError);
          setUsers([]);
          toast({
            title: "Error loading users",
            description: fetchError,
            variant: "destructive",
          });
          return;
        }

        setUsers(loadedUsers);
        console.log("Loaded users from database:", loadedUsers.length);
        
        if (loadedUsers.length === 0) {
          toast({
            title: "No users found",
            description: "No user profiles were found in the database.",
          });
        }
      } catch (err) {
        console.error("Unexpected error:", err);
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

    loadUsers();
  }, []);

  // Function to update a user's role
  const handleUpdateRole = async (userId: string, email: string, newRole: User['role']) => {
    try {
      const { success, error: updateError } = await updateUserRole(userId, newRole);

      if (!success) {
        toast({
          title: "Error updating role",
          description: updateError || "Failed to update user role",
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
      
      const { success, error: updateError, data } = await updateUserData(editingUser.id, editedUserData);
      
      if (!success) {
        toast({
          title: "Error updating user",
          description: updateError,
          variant: "destructive",
        });
        return;
      }

      // Warning about missing fields in database
      if (updateError) {
        toast({
          title: "Warning",
          description: updateError,
        });
      }

      // Create full_name from first_name and last_name
      const fullName = `${editedUserData.first_name} ${editedUserData.last_name}`.trim();

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
            <UserTable 
              users={filteredUsers}
              loading={loading}
              error={error}
              onEditUser={handleEditUser}
              onUpdateRole={handleUpdateRole}
            />
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
      <EditUserDialog
        open={editingUser !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
        userData={editedUserData}
        setUserData={setEditedUserData}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;
