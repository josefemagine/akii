import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export const DashboardPageContainer = ({ children, title, description, icon, className, }) => {
    return (_jsxs("div", { className: cn("container mx-auto py-6", className), children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [icon && _jsx("div", { className: "rounded-lg bg-muted p-2", children: icon }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight", children: title }), description && (_jsx("p", { className: "text-muted-foreground", children: description }))] })] }), _jsx("div", { className: "space-y-6", children: children })] }));
};
