import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

const TeamRoles = () => {
  const rolePermissions = [
    {
      action: "Create and manage AI agents",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "Upload and manage training data",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "View agent conversations",
      admin: true,
      member: true,
      viewer: true,
    },
    {
      action: "Modify agent settings",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "Invite team members",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "Manage team roles",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "View analytics",
      admin: true,
      member: true,
      viewer: true,
    },
    {
      action: "Manage subscription",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "Access API keys",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "Configure integrations",
      admin: true,
      member: true,
      viewer: false,
    },
  ];

  return (
    <Card className="bg-white dark:bg-gray-950">
      <CardHeader>
        <CardTitle>Team Roles & Permissions</CardTitle>
        <CardDescription>
          Learn about the different roles and their permissions in your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Action</TableHead>
              <TableHead className="text-center">Admin</TableHead>
              <TableHead className="text-center">Member</TableHead>
              <TableHead className="text-center">Viewer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolePermissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {permission.action}
                </TableCell>
                <TableCell className="text-center">
                  {permission.admin ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.member ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.viewer ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TeamRoles;
