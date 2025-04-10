import React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { User } from "@/types/user.ts";

export const getRoleBadge = (role: User["role"]) => {
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

export const getStatusIcon = (status: User["status"]) => {
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

export const getPlanBadge = (plan: User["plan"]) => {
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