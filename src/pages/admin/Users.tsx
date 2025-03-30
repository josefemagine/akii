import React, { useState } from "react";
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
  const [users, setUsers] = useState<User[]>(mockUsers);

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
        <Button>
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
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
            Showing {filteredUsers.length} users
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
                {filteredUsers.map((user) => (
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
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" /> Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Lock className="h-4 w-4 mr-2" /> Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
    </div>
  );
};

export default UsersPage;
