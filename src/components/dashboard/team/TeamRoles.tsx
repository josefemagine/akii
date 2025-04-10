import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Check, X } from "lucide-react";

interface RolePermission {
  action: string;
  admin: boolean;
  member: boolean;
  viewer: boolean;
}

export function TeamRoles() {
  // Mock role permissions data
  const rolePermissions: RolePermission[] = [
    {
      action: "View team members",
      admin: true,
      member: true,
      viewer: true,
    },
    {
      action: "Invite team members",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "Remove team members",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "Manage roles",
      admin: true,
      member: false,
      viewer: false,
    },
    {
      action: "View AI instances",
      admin: true,
      member: true,
      viewer: true,
    },
    {
      action: "Create AI instances",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "Edit AI instances",
      admin: true,
      member: true,
      viewer: false,
    },
    {
      action: "Delete AI instances",
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
      action: "Access billing",
      admin: true,
      member: false,
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
}
