import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Paperclip, X, Maximize2, Minimize2 } from "lucide-react";
export default function WebChatPreview({ chatName = "My Web Chat", welcomeMessage = "Hello! How can I help you today?", primaryColor = "#4f46e5", position = "bottom-right", agentName = "AI Assistant", agentAvatar = "", }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([
        {
            id: "1",
            content: welcomeMessage,
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const handleSendMessage = () => {
        if (!inputValue.trim())
            return;
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages([...messages, userMessage]);
        setInputValue("");
        // Simulate bot response after a short delay
        setTimeout(() => {
            const botResponses = [
                "I'd be happy to help with that!",
                "Let me check that for you.",
                "Great question! Here's what you need to know...",
                "Thanks for reaching out. I can definitely assist with this.",
                "I understand what you're looking for. Here's my recommendation...",
            ];
            const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
            const botMessage = {
                id: (Date.now() + 1).toString(),
                content: randomResponse,
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        }, 1000);
    };
    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };
    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };
    // Position classes
    const positionClasses = {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
    };
    return (_jsxs("div", { className: "relative h-full w-full", children: [!isOpen && (_jsx("button", { className: `absolute ${positionClasses[position]} flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105`, style: { backgroundColor: primaryColor }, onClick: toggleChat, children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "text-white", children: _jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }) }) })), isOpen && (_jsx("div", { className: `absolute ${positionClasses[position]} w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden transition-all`, style: { height: isMinimized ? "48px" : "400px" }, children: _jsxs(Card, { className: "h-full flex flex-col dark:border-gray-700", children: [_jsxs("div", { className: "p-3 flex items-center justify-between cursor-pointer", style: { backgroundColor: primaryColor }, onClick: toggleMinimize, children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: agentAvatar }), _jsx(AvatarFallback, { className: "text-xs bg-white/20 text-white", children: agentName.substring(0, 2).toUpperCase() })] }), _jsx("div", { className: "text-white font-medium", children: chatName })] }), _jsxs("div", { className: "flex items-center", children: [isMinimized ? (_jsx(Maximize2, { className: "h-4 w-4 text-white" })) : (_jsx(Minimize2, { className: "h-4 w-4 text-white" })), _jsx(X, { className: "h-5 w-5 text-white ml-2", onClick: (e) => {
                                                e.stopPropagation();
                                                setIsOpen(false);
                                            } })] })] }), !isMinimized && (_jsxs(CardContent, { className: "flex-1 p-0 flex flex-col dark:bg-gray-800", children: [_jsx(ScrollArea, { className: "flex-1 p-3", children: _jsx("div", { className: "space-y-4", children: messages.map((message) => (_jsx("div", { className: `flex ${message.sender === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: "flex items-end", children: [message.sender === "bot" && (_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: agentAvatar }), _jsx(AvatarFallback, { className: "text-xs dark:bg-gray-700", children: agentName.substring(0, 2).toUpperCase() })] })), _jsxs("div", { className: `max-w-xs rounded-lg px-3 py-2 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted dark:bg-gray-700"}`, style: {
                                                            backgroundColor: message.sender === "user"
                                                                ? primaryColor
                                                                : undefined,
                                                        }, children: [_jsx("div", { children: message.content }), _jsx("div", { className: `text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`, children: formatTime(message.timestamp) })] })] }) }, message.id))) }) }), _jsx("div", { className: "p-3 border-t dark:border-gray-700", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full", children: _jsx(Paperclip, { className: "h-4 w-4" }) }), _jsx(Input, { className: "flex-1 mx-2", placeholder: "Type your message...", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: (e) => {
                                                    if (e.key === "Enter") {
                                                        handleSendMessage();
                                                    }
                                                } }), _jsx(Button, { size: "icon", className: "h-8 w-8 rounded-full", style: { backgroundColor: primaryColor }, onClick: handleSendMessage, children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] }))] }) }))] }));
}
