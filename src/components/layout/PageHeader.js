import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { dashboardStyles } from "./DashboardPageContainer";
import { cn } from "@/lib/utils";
export function PageHeader({ title, description, children, className }) {
    return (_jsxs("div", { className: cn("flex items-center justify-between", dashboardStyles.sectionSpacing, className), children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: title }), description && (_jsx("p", { className: "text-muted-foreground mt-1", children: description }))] }), children && (_jsx("div", { className: "flex items-center gap-2", children: children }))] }));
}
