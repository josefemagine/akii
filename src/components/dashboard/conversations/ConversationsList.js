var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Search, MessageSquare, MoreVertical, Trash2, Eye, Archive, } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";
const ConversationsList = ({ conversations = [], onRefresh = () => { }, onViewConversation = () => { }, isLoading = false, }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const handleDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = yield supabase
                .from("conversations")
                .delete()
                .eq("id", id);
            if (error)
                throw error;
            onRefresh();
        }
        catch (error) {
            console.error("Error deleting conversation:", error);
        }
    });
    const handleArchive = (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { error } = yield supabase
                .from("conversations")
                .update({ is_active: false })
                .eq("id", id);
            if (error)
                throw error;
            onRefresh();
        }
        catch (error) {
            console.error("Error archiving conversation:", error);
        }
    });
    const filteredConversations = conversations.filter((conv) => {
        var _a, _b;
        return ((_a = conv.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (((_b = conv.agent) === null || _b === void 0 ? void 0 : _b.name) &&
                conv.agent.name.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    return (_jsxs(Card, { className: "w-full", children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsx(CardTitle, { children: "Your Conversations" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" }), _jsx(Input, { type: "search", placeholder: "Search conversations...", className: "pl-8 w-[250px]", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })] }), _jsx(Button, { onClick: onRefresh, variant: "outline", disabled: isLoading, children: isLoading ? "Refreshing..." : "Refresh" })] })] }), _jsx(CardContent, { children: conversations.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(MessageSquare, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900 dark:text-gray-100", children: "No conversations" }), _jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Start chatting with an agent to see your conversations here." })] })) : filteredConversations.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Search, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900 dark:text-gray-100", children: "No results found" }), _jsxs("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: ["No conversations matching \"", searchQuery, "\""] })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Title" }), _jsx(TableHead, { children: "Agent" }), _jsx(TableHead, { children: "Messages" }), _jsx(TableHead, { children: "Last Updated" }), _jsx(TableHead, { className: "text-right", children: "Actions" })] }) }), _jsx(TableBody, { children: filteredConversations.map((conv) => {
                                    var _a;
                                    return (_jsxs(TableRow, { children: [_jsx(TableCell, { className: "font-medium", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(MessageSquare, { className: "h-4 w-4 text-gray-500" }), _jsx("span", { children: conv.title || "Untitled" })] }) }), _jsx(TableCell, { children: ((_a = conv.agent) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Agent" }), _jsx(TableCell, { children: conv.message_count || 0 }), _jsx(TableCell, { children: conv.updated_at
                                                    ? format(new Date(conv.updated_at), "MMM d, yyyy h:mm a")
                                                    : format(new Date(conv.started_at), "MMM d, yyyy h:mm a") }), _jsx(TableCell, { className: "text-right", children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "icon", children: [_jsx(MoreVertical, { className: "h-4 w-4" }), _jsx("span", { className: "sr-only", children: "Actions" })] }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => onViewConversation(conv.id), children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "View Conversation" })] }), _jsxs(DropdownMenuItem, { onClick: () => handleArchive(conv.id), children: [_jsx(Archive, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Archive" })] }), _jsxs(DropdownMenuItem, { onClick: () => handleDelete(conv.id), className: "text-red-600 dark:text-red-400", children: [_jsx(Trash2, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Delete" })] })] })] }) })] }, conv.id));
                                }) })] }) })) })] }));
};
export default ConversationsList;
