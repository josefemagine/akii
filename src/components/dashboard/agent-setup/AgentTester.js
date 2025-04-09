import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback, } from "../../../components/ui/avatar";
import { Send, ThumbsUp, ThumbsDown, RefreshCw, Mic, MicOff, } from "lucide-react";
const AgentTester = ({ agentName = "AI Assistant", agentAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=agent123", initialMessages = [
    {
        id: "welcome",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "agent",
        timestamp: new Date(),
    },
], onFeedback = () => { }, onReset = () => { }, onVoiceToggle = () => { }, }) => {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleSendMessage = () => {
        if (!inputValue.trim())
            return;
        // Add user message
        const userMessage = {
            id: `user-${Date.now()}`,
            content: inputValue,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages([...messages, userMessage]);
        setInputValue("");
        setIsLoading(true);
        // Simulate agent response after a delay
        setTimeout(() => {
            const agentMessage = {
                id: `agent-${Date.now()}`,
                content: "This is a simulated response from the AI agent. In a real implementation, this would be the response from your trained AI model based on the training data you've provided.",
                sender: "agent",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, agentMessage]);
            setIsLoading(false);
        }, 1500);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const toggleVoiceInput = () => {
        const newState = !isVoiceActive;
        setIsVoiceActive(newState);
        onVoiceToggle(newState);
        // In a real implementation, this would activate speech-to-text functionality
    };
    const handleReset = () => {
        setMessages(initialMessages);
        onReset();
    };
    const handleFeedback = (messageId, isPositive) => {
        onFeedback(messageId, isPositive);
        // In a real implementation, this would send feedback to improve the agent
    };
    return (_jsxs(Card, { className: "w-full h-full bg-background border-2 border-border", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsxs(Avatar, { children: [_jsx(AvatarImage, { src: agentAvatar, alt: agentName }), _jsx(AvatarFallback, { children: agentName.substring(0, 2).toUpperCase() })] }), _jsx("span", { children: agentName })] }) }), _jsx(CardContent, { className: "p-0 h-[400px] overflow-y-auto", children: _jsxs("div", { className: "flex flex-col p-4 space-y-4", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.sender === "user" ? "justify-end" : "justify-start"}`, children: _jsx("div", { className: `max-w-[80%] rounded-lg p-3 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`, children: _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-sm", children: message.content }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("span", { className: "text-xs opacity-70", children: message.timestamp.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }) }), message.sender === "agent" && (_jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => handleFeedback(message.id, true), children: _jsx(ThumbsUp, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0", onClick: () => handleFeedback(message.id, false), children: _jsx(ThumbsDown, { className: "h-3 w-3" }) })] }))] })] }) }) }, message.id))), isLoading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "max-w-[80%] rounded-lg p-3 bg-muted", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full bg-current animate-bounce" }), _jsx("div", { className: "h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" }), _jsx("div", { className: "h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" })] }) }) }))] }) }), _jsxs(CardFooter, { className: "border-t p-3 flex gap-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: handleReset, title: "Reset conversation", children: _jsx(RefreshCw, { className: "h-4 w-4" }) }), _jsx(Button, { variant: isVoiceActive ? "default" : "outline", size: "icon", onClick: toggleVoiceInput, title: isVoiceActive ? "Disable voice input" : "Enable voice input", children: isVoiceActive ? (_jsx(Mic, { className: "h-4 w-4" })) : (_jsx(MicOff, { className: "h-4 w-4" })) }), _jsx(Textarea, { placeholder: "Type your message here...", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: handleKeyDown, className: "flex-1 min-h-[40px] resize-none" }), _jsx(Button, { onClick: handleSendMessage, disabled: !inputValue.trim() || isLoading, size: "icon", children: _jsx(Send, { className: "h-4 w-4" }) })] })] }));
};
export default AgentTester;
