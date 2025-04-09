import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
// Define consistent dashboard styling variables
export const dashboardStyles = {
    containerPadding: "p-8",
    containerWidth: "max-w-7xl",
    containerMargin: "mx-auto",
    pageMinHeight: "min-h-[calc(100vh-4rem)]",
    pageBg: "bg-gray-50 dark:bg-gray-900",
    contentSpacing: "space-y-8",
    sectionSpacing: "mb-8",
};
export function DashboardPageContainer({ children, className, fullWidth = false, requireAuth = true, }) {
    return (_jsx("div", { className: cn(dashboardStyles.pageBg, dashboardStyles.pageMinHeight, dashboardStyles.containerPadding, className), children: _jsx("div", { className: cn("w-full", !fullWidth && dashboardStyles.containerWidth, !fullWidth && dashboardStyles.containerMargin, dashboardStyles.contentSpacing), children: children }) }));
}
