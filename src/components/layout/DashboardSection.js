import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dashboardStyles } from "./DashboardPageContainer";
import { cn } from "@/lib/utils";
export function DashboardSection({ children, className, title, description, requireAuth = true }) {
    return (_jsxs("div", { className: cn(dashboardStyles.sectionSpacing, className), children: [(title || description) && (_jsxs("div", { className: "mb-4", children: [title && _jsx("h2", { className: "text-xl font-semibold", children: title }), description && _jsx("p", { className: "text-muted-foreground text-sm", children: description })] })), children] }));
}
