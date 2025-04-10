import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Mail, Lock, Trash2 } from "lucide-react";
import { User } from "@/types/user";
import { getRoleBadge, getStatusIcon, getPlanBadge } from "./UserBadges";

interface UserTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onEditUser: (user: User) => void;
  onUpdateRole: (userId: string, email: string, role: User["role"]) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  error,
  onEditUser,
  onUpdateRole,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-4">
          Loading users...
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-4 text-red-500">
          Error: {error}
        </TableCell>
      </TableRow>
    );
  }

  if (users.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-4">
          No users found.
        </TableCell>
      </TableRow>
    );
  }

  return (
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
        {users.map((user) => (
          <TableRow
            key={user.id}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => navigate(`/admin/user-detail/${user.id}`)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      user.email
                    )}`}
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
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUser(user);
                    }}
                  >
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
                      onUpdateRole(user.id, user.email, "admin");
                    }}
                    disabled={user.role === "admin"}
                  >
                    Set as Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateRole(user.id, user.email, "user");
                    }}
                    disabled={user.role === "user"}
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
        ))}
      </TableBody>
    </Table>
  );
}; 