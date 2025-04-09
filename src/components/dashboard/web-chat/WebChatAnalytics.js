import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
// Mock data for charts
const dailyData = [
    { name: "Mon", conversations: 12, messages: 65 },
    { name: "Tue", conversations: 19, messages: 87 },
    { name: "Wed", conversations: 15, messages: 72 },
    { name: "Thu", conversations: 21, messages: 103 },
    { name: "Fri", conversations: 18, messages: 92 },
    { name: "Sat", conversations: 9, messages: 43 },
    { name: "Sun", conversations: 7, messages: 38 },
];
const weeklyData = [
    { name: "Week 1", conversations: 82, messages: 410 },
    { name: "Week 2", conversations: 91, messages: 452 },
    { name: "Week 3", conversations: 103, messages: 521 },
    { name: "Week 4", conversations: 89, messages: 438 },
];
const monthlyData = [
    { name: "Jan", conversations: 320, messages: 1650 },
    { name: "Feb", conversations: 290, messages: 1480 },
    { name: "Mar", conversations: 350, messages: 1820 },
    { name: "Apr", conversations: 380, messages: 1950 },
    { name: "May", conversations: 410, messages: 2100 },
    { name: "Jun", conversations: 390, messages: 1980 },
];
const topQuestionsData = [
    { question: "What are your pricing plans?", count: 42 },
    { question: "How do I reset my password?", count: 38 },
    { question: "Do you offer refunds?", count: 31 },
    { question: "How can I contact support?", count: 27 },
    { question: "Is there a free trial?", count: 24 },
];
const satisfactionData = [
    { name: "Very Satisfied", value: 45 },
    { name: "Satisfied", value: 30 },
    { name: "Neutral", value: 15 },
    { name: "Dissatisfied", value: 7 },
    { name: "Very Dissatisfied", value: 3 },
];
export default function WebChatAnalytics() {
    const [timeRange, setTimeRange] = useState("7d");
    const [chartType, setChartType] = useState("conversations");
    // Select the appropriate data based on time range
    const getChartData = () => {
        switch (timeRange) {
            case "7d":
                return dailyData;
            case "30d":
                return weeklyData;
            case "90d":
                return monthlyData;
            default:
                return dailyData;
        }
    };
    return (_jsxs(Card, { className: "w-full shadow-sm", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "Web Chat Analytics" }), _jsx("div", { className: "flex gap-2", children: _jsxs(Select, { value: timeRange, onValueChange: setTimeRange, children: [_jsx(SelectTrigger, { className: "w-[120px]", children: _jsx(SelectValue, { placeholder: "Time Range" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "7d", children: "Last 7 days" }), _jsx(SelectItem, { value: "30d", children: "Last 30 days" }), _jsx(SelectItem, { value: "90d", children: "Last 90 days" })] })] }) })] }) }), _jsx(CardContent, { children: _jsxs(Tabs, { defaultValue: "overview", className: "space-y-4", children: [_jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "conversations", children: "Conversations" }), _jsx(TabsTrigger, { value: "questions", children: "Top Questions" }), _jsx(TabsTrigger, { value: "satisfaction", children: "Satisfaction" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Total Conversations" }), _jsx("div", { className: "text-2xl font-bold mt-2", children: "365" }), _jsx("div", { className: "text-xs text-green-600 dark:text-green-400 mt-1", children: "\u2191 12% from previous period" })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Avg. Response Time" }), _jsx("div", { className: "text-2xl font-bold mt-2", children: "1.8s" }), _jsx("div", { className: "text-xs text-green-600 dark:text-green-400 mt-1", children: "\u2193 0.3s from previous period" })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Satisfaction Rate" }), _jsx("div", { className: "text-2xl font-bold mt-2", children: "92%" }), _jsx("div", { className: "text-xs text-green-600 dark:text-green-400 mt-1", children: "\u2191 3% from previous period" })] })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Conversations & Messages" }), _jsx("div", { className: "h-80 flex items-center justify-center", children: _jsx("div", { className: "text-muted-foreground text-sm", children: "Chart visualization would appear here" }) })] })] }), _jsxs(TabsContent, { value: "conversations", className: "space-y-4", children: [_jsx("div", { className: "flex justify-end mb-4", children: _jsxs(Select, { value: chartType, onValueChange: setChartType, children: [_jsx(SelectTrigger, { className: "w-[180px]", children: _jsx(SelectValue, { placeholder: "Chart Type" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "conversations", children: "Conversations" }), _jsx(SelectItem, { value: "messages", children: "Messages" }), _jsx(SelectItem, { value: "duration", children: "Avg. Duration" })] })] }) }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: chartType === "conversations"
                                                ? "Conversations Over Time"
                                                : chartType === "messages"
                                                    ? "Messages Over Time"
                                                    : "Average Conversation Duration" }), _jsx("div", { className: "h-80 flex items-center justify-center", children: _jsx("div", { className: "text-muted-foreground text-sm", children: "Line chart visualization would appear here" }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Conversation Sources" }), _jsxs("div", { className: "space-y-2 mt-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Homepage" }), _jsx("span", { className: "text-sm font-medium", children: "42%" })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: "bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full", style: { width: "42%" } }) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Product Pages" }), _jsx("span", { className: "text-sm font-medium", children: "28%" })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: "bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full", style: { width: "28%" } }) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Blog Articles" }), _jsx("span", { className: "text-sm font-medium", children: "17%" })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: "bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full", style: { width: "17%" } }) }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: "Support Pages" }), _jsx("span", { className: "text-sm font-medium", children: "13%" })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: "bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full", style: { width: "13%" } }) })] })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Conversation Times" }), _jsx("div", { className: "h-60 flex items-center justify-center", children: _jsx("div", { className: "text-muted-foreground text-sm", children: "Time distribution chart would appear here" }) })] })] })] }), _jsxs(TabsContent, { value: "questions", className: "space-y-4", children: [_jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Top Questions Asked" }), _jsx("div", { className: "space-y-4", children: topQuestionsData.map((item, index) => (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: item.question }), _jsx("span", { className: "text-sm font-medium", children: item.count })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: "bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full", style: {
                                                                width: `${(item.count /
                                                                    topQuestionsData[0].count) *
                                                                    100}%`,
                                                            } }) })] }, index))) })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Questions Without Answers" }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800", children: _jsx("span", { className: "text-sm", children: "How do I integrate with Salesforce?" }) }), _jsx("div", { className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800", children: _jsx("span", { className: "text-sm", children: "Do you have an affiliate program?" }) }), _jsx("div", { className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800", children: _jsx("span", { className: "text-sm", children: "How long does the setup process take?" }) }), _jsx("div", { className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800", children: _jsx("span", { className: "text-sm", children: "Can I customize the chat for multiple languages?" }) })] })] })] }), _jsxs(TabsContent, { value: "satisfaction", className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Satisfaction Ratings" }), _jsx("div", { className: "h-60 flex items-center justify-center", children: _jsx("div", { className: "text-muted-foreground text-sm", children: "Satisfaction pie chart would appear here" }) })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Rating Breakdown" }), _jsx("div", { className: "space-y-2", children: satisfactionData.map((item, index) => (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm", children: item.name }), _jsxs("span", { className: "text-sm font-medium", children: [item.value, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5", children: _jsx("div", { className: `h-2.5 rounded-full ${index === 0
                                                                        ? "bg-green-500 dark:bg-green-600"
                                                                        : index === 1
                                                                            ? "bg-green-400 dark:bg-green-500"
                                                                            : index === 2
                                                                                ? "bg-yellow-400 dark:bg-yellow-500"
                                                                                : index === 3
                                                                                    ? "bg-orange-400 dark:bg-orange-500"
                                                                                    : "bg-red-500 dark:bg-red-600"}`, style: { width: `${item.value}%` } }) })] }, index))) })] })] }), _jsxs("div", { className: "rounded-lg border p-4", children: [_jsx("h3", { className: "text-sm font-medium mb-4", children: "Recent Feedback" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-200", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("div", { className: "font-medium text-sm", children: "Very Satisfied" }), _jsx("div", { className: "text-xs text-green-600 dark:text-green-400", children: "2 hours ago" })] }), _jsx("p", { className: "text-sm", children: "The chatbot was incredibly helpful. It answered all my questions quickly and accurately." })] }), _jsxs("div", { className: "p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 text-yellow-800 dark:text-yellow-200", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("div", { className: "font-medium text-sm", children: "Neutral" }), _jsx("div", { className: "text-xs text-yellow-600 dark:text-yellow-400", children: "1 day ago" })] }), _jsx("p", { className: "text-sm", children: "Got most of my questions answered, but had to contact support for a few issues." })] }), _jsxs("div", { className: "p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-200", children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsx("div", { className: "font-medium text-sm", children: "Satisfied" }), _jsx("div", { className: "text-xs text-green-600 dark:text-green-400", children: "2 days ago" })] }), _jsx("p", { className: "text-sm", children: "Good experience overall. The chatbot was friendly and helpful." })] })] })] })] })] }) })] }));
}
