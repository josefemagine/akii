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
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, User, Bot, Paperclip, MessageSquare, } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { invokeServerFunction } from "@/utils/supabase/functions";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
const ConversationView = ({ conversationId, onBack = () => { }, }) => {
    var _a, _b, _c;
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const fetchConversation = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!user || !conversationId)
            return;
        setIsLoading(true);
        try {
            // Fetch conversation details using edge function
            const conversationData = yield invokeServerFunction("get_conversation", {
                conversationId,
                userId: user.id
            });
            if (conversationData === null || conversationData === void 0 ? void 0 : conversationData.conversation) {
                setConversation(conversationData.conversation);
            }
            else {
                toast({
                    title: "Error",
                    description: "Conversation not found",
                    variant: "destructive"
                });
                return;
            }
            // Fetch messages using edge function
            const messagesData = yield invokeServerFunction("get_conversation_messages", {
                conversationId,
                userId: user.id
            });
            if (messagesData === null || messagesData === void 0 ? void 0 : messagesData.messages) {
                setMessages(messagesData.messages);
            }
        }
        catch (error) {
            console.error("Error fetching conversation:", error);
            toast({
                title: "Error",
                description: "Failed to load conversation",
                variant: "destructive"
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    useEffect(() => {
        fetchConversation();
        // Set up realtime subscription for new messages
        const subscription = supabase
            .channel(`conversation-${conversationId}`)
            .on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
        }, (payload) => {
            // Process the new message
            const newMsg = payload.new;
            const processedMessage = {
                role: newMsg.role,
                id: newMsg.id,
                conversation_id: newMsg.conversation_id,
                content: newMsg.content,
                created_at: newMsg.created_at,
                user_id: newMsg.user_id,
                sender_type: newMsg.sender_type,
                metadata: newMsg.metadata
            };
            setMessages((prev) => [...prev, processedMessage]);
        })
            .subscribe();
        return () => {
            supabase.removeChannel(subscription);
        };
    }, [conversationId, user]);
    useEffect(() => {
        var _a;
        // Scroll to bottom when messages change
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const handleSendMessage = (e) => __awaiter(void 0, void 0, void 0, function* () {
        e.preventDefault();
        if (!newMessage.trim() || !user || !conversation)
            return;
        setIsSending(true);
        try {
            // Send message using edge function
            const response = yield invokeServerFunction("send_message", {
                conversationId,
                userId: user.id,
                content: newMessage,
                role: "user"
            });
            if (!response || !response.success) {
                throw new Error("Failed to send message");
            }
            // Clear input
            setNewMessage("");
            // The AI response will be added via the realtime subscription
            // We don't need to manually add the user message either, as it will come through the subscription
        }
        catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsSending(false);
        }
    });
    const MessageBubble = ({ message }) => {
        var _a, _b;
        const isUser = message.role === "user";
        return (_jsx("div", { className: `flex ${isUser ? "justify-end" : "justify-start"} mb-4`, children: _jsxs("div", { className: "flex items-start max-w-[80%]", children: [!isUser && (_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: ((_a = conversation === null || conversation === void 0 ? void 0 : conversation.agent) === null || _a === void 0 ? void 0 : _a.avatar_url) || "", alt: ((_b = conversation === null || conversation === void 0 ? void 0 : conversation.agent) === null || _b === void 0 ? void 0 : _b.name) || "AI" }), _jsx(AvatarFallback, { children: _jsx(Bot, { className: "h-4 w-4" }) })] })), _jsxs("div", { className: `px-4 py-2 rounded-lg ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: [_jsx("div", { className: "text-sm", children: message.content }), _jsx("div", { className: "text-xs mt-1 opacity-70", children: format(new Date(message.created_at), "h:mm a") })] }), isUser && (_jsxs(Avatar, { className: "h-8 w-8 ml-2", children: [_jsx(AvatarImage, { src: `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user === null || user === void 0 ? void 0 : user.email) || "user"}`, alt: "You" }), _jsx(AvatarFallback, { children: _jsx(User, { className: "h-4 w-4" }) })] }))] }) }));
    };
    if (isLoading) {
        return (_jsx(Card, { className: "w-full h-[600px] flex items-center justify-center", children: _jsx("div", { className: "text-center", children: _jsx("h3", { className: "text-lg font-medium", children: "Loading conversation..." }) }) }));
    }
    if (!conversation) {
        return (_jsx(Card, { className: "w-full h-[600px] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-medium", children: "Conversation not found" }), _jsxs(Button, { onClick: onBack, variant: "outline", className: "mt-4", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), " Back to Conversations"] })] }) }));
    }
    return (_jsxs(Card, { className: "w-full h-[600px] flex flex-col", children: [_jsx(CardHeader, { className: "border-b", children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: onBack, className: "mr-2", children: _jsx(ArrowLeft, { className: "h-4 w-4" }) }), _jsxs(Avatar, { className: "h-8 w-8", children: [_jsx(AvatarImage, { src: ((_a = conversation.agent) === null || _a === void 0 ? void 0 : _a.avatar_url) || "", alt: ((_b = conversation.agent) === null || _b === void 0 ? void 0 : _b.name) || "AI" }), _jsx(AvatarFallback, { children: _jsx(Bot, { className: "h-4 w-4" }) })] }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-base", children: conversation.title }), _jsx("p", { className: "text-xs text-muted-foreground", children: ((_c = conversation.agent) === null || _c === void 0 ? void 0 : _c.name) || "Unknown Agent" })] })] }) }) }), _jsx(CardContent, { className: "flex-1 overflow-y-auto p-4", children: messages.length === 0 ? (_jsx("div", { className: "h-full flex items-center justify-center text-center", children: _jsxs("div", { children: [_jsx(MessageSquare, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("h3", { className: "mt-2 text-sm font-medium", children: "No messages in this conversation" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Start the conversation by sending a message below." })] }) })) : (_jsxs("div", { className: "space-y-4", children: [messages.map((message) => (_jsx(MessageBubble, { message: message }, message.id))), _jsx("div", { ref: messagesEndRef })] })) }), _jsx(CardFooter, { className: "border-t p-4", children: _jsxs("form", { onSubmit: handleSendMessage, className: "flex w-full space-x-2", children: [_jsxs(Button, { type: "button", variant: "ghost", size: "icon", className: "flex-shrink-0", children: [_jsx(Paperclip, { className: "h-5 w-5" }), _jsx("span", { className: "sr-only", children: "Attach file" })] }), _jsx(Input, { placeholder: "Type your message...", value: newMessage, onChange: (e) => setNewMessage(e.target.value), disabled: isSending, className: "flex-1" }), _jsxs(Button, { type: "submit", disabled: !newMessage.trim() || isSending, className: "flex-shrink-0", children: [isSending ? "Sending..." : "Send", _jsx(Send, { className: "ml-2 h-4 w-4" })] })] }) })] }));
};
export default ConversationView;
