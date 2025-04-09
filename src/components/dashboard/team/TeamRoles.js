import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
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
    return (_jsxs(Card, { className: "bg-white dark:bg-gray-950", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Team Roles & Permissions" }), _jsx(CardDescription, { children: "Learn about the different roles and their permissions in your team." })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: "w-[300px]", children: "Action" }), _jsx(TableHead, { className: "text-center", children: "Admin" }), _jsx(TableHead, { className: "text-center", children: "Member" }), _jsx(TableHead, { className: "text-center", children: "Viewer" })] }) }), _jsx(TableBody, { children: rolePermissions.map((permission, index) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: permission.action }), _jsx(TableCell, { className: "text-center", children: permission.admin ? (_jsx(Check, { className: "h-5 w-5 text-green-500 mx-auto" })) : (_jsx(X, { className: "h-5 w-5 text-red-500 mx-auto" })) }), _jsx(TableCell, { className: "text-center", children: permission.member ? (_jsx(Check, { className: "h-5 w-5 text-green-500 mx-auto" })) : (_jsx(X, { className: "h-5 w-5 text-red-500 mx-auto" })) }), _jsx(TableCell, { className: "text-center", children: permission.viewer ? (_jsx(Check, { className: "h-5 w-5 text-green-500 mx-auto" })) : (_jsx(X, { className: "h-5 w-5 text-red-500 mx-auto" })) })] }, index))) })] }) })] }));
};
export default TeamRoles;
