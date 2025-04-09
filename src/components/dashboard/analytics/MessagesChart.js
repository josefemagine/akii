import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const MessagesChart = ({ data = [
    { date: "Mon", messages: 320 },
    { date: "Tue", messages: 420 },
    { date: "Wed", messages: 380 },
    { date: "Thu", messages: 450 },
    { date: "Fri", messages: 520 },
    { date: "Sat", messages: 480 },
    { date: "Sun", messages: 550 },
], period = "daily", onPeriodChange = () => { }, }) => {
    // Find the maximum value to scale the chart
    const maxValue = Math.max(...data.map((item) => item.messages), 10);
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { children: "Message Volume" }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("div", { className: "flex items-center space-x-1 rounded-md bg-muted p-1 text-xs font-medium", children: [_jsx("button", { onClick: () => onPeriodChange("daily"), className: `rounded px-2.5 py-1.5 ${period === "daily" ? "bg-background shadow-sm" : ""}`, children: "Daily" }), _jsx("button", { onClick: () => onPeriodChange("weekly"), className: `rounded px-2.5 py-1.5 ${period === "weekly" ? "bg-background shadow-sm" : ""}`, children: "Weekly" }), _jsx("button", { onClick: () => onPeriodChange("monthly"), className: `rounded px-2.5 py-1.5 ${period === "monthly" ? "bg-background shadow-sm" : ""}`, children: "Monthly" })] }) })] }), _jsx(CardContent, { children: _jsx("div", { className: "h-[200px] w-full", children: data.length === 0 ? (_jsx("div", { className: "flex h-full items-center justify-center", children: _jsx("p", { className: "text-sm text-muted-foreground", children: "No data available" }) })) : (_jsx("div", { className: "flex h-full items-end space-x-2", children: data.map((item, index) => {
                            const height = (item.messages / maxValue) * 100;
                            return (_jsxs("div", { className: "relative flex h-full flex-1 flex-col justify-end", children: [_jsx("div", { className: "bg-primary rounded-t w-full transition-all duration-300", style: { height: `${height}%` } }), _jsx("div", { className: "mt-2 text-xs text-center truncate", children: item.date }), _jsxs("div", { className: "absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-background border rounded px-2 py-1", children: [item.messages, " messages"] })] }, index));
                        }) })) }) })] }));
};
export default MessagesChart;
