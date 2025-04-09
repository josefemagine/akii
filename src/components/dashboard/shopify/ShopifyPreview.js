import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Maximize2, Minimize2, ShoppingBag, Search, } from "lucide-react";
// Mock products data
const mockProducts = [
    {
        id: "prod_1",
        name: "Premium Cotton T-Shirt",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80",
    },
    {
        id: "prod_2",
        name: "Slim Fit Jeans",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80",
    },
    {
        id: "prod_3",
        name: "Classic Leather Wallet",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
    },
];
export default function ShopifyPreview({ chatName = "Shop Assistant", welcomeMessage = "Hello! How can I help you find the perfect product today?", primaryColor = "#4f46e5", position = "bottom-right", agentName = "Shop AI", agentAvatar = "", }) {
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
            // Check if the message contains product-related keywords
            const productKeywords = [
                "shirt",
                "t-shirt",
                "tshirt",
                "tee",
                "jeans",
                "pants",
                "wallet",
                "leather",
            ];
            const hasProductKeyword = productKeywords.some((keyword) => inputValue.toLowerCase().includes(keyword));
            let botResponse;
            if (hasProductKeyword) {
                // If product keywords are detected, include product recommendations
                const matchingProducts = mockProducts.filter((product) => productKeywords.some((keyword) => product.name.toLowerCase().includes(keyword) &&
                    inputValue.toLowerCase().includes(keyword)));
                const productsToShow = matchingProducts.length > 0 ? matchingProducts : [mockProducts[0]];
                botResponse = {
                    id: (Date.now() + 1).toString(),
                    content: matchingProducts.length > 0
                        ? "I found these items that might interest you:"
                        : "Here's one of our popular items you might like:",
                    sender: "bot",
                    timestamp: new Date(),
                    products: productsToShow,
                };
            }
            else {
                // Generic responses for non-product queries
                const botResponses = [
                    "I'd be happy to help you find the perfect product!",
                    "Let me show you some of our best sellers.",
                    "Is there a specific category you're interested in?",
                    "Would you like me to recommend something based on your preferences?",
                    "We have some great new arrivals that I think you'll love.",
                ];
                const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
                botResponse = {
                    id: (Date.now() + 1).toString(),
                    content: randomResponse,
                    sender: "bot",
                    timestamp: new Date(),
                };
            }
            setMessages((prevMessages) => [...prevMessages, botResponse]);
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
    return (_jsxs("div", { className: "relative h-full w-full", children: [!isOpen && (_jsx("button", { className: `absolute ${positionClasses[position]} flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105`, style: { backgroundColor: primaryColor }, onClick: toggleChat, children: _jsx(ShoppingBag, { className: "h-5 w-5 text-white" }) })), isOpen && (_jsx("div", { className: `absolute ${positionClasses[position]} w-80 sm:w-96 rounded-lg shadow-xl overflow-hidden transition-all`, style: { height: isMinimized ? "48px" : "500px" }, children: _jsxs(Card, { className: "h-full flex flex-col", children: [_jsxs("div", { className: "p-3 flex items-center justify-between cursor-pointer", style: { backgroundColor: primaryColor }, onClick: toggleMinimize, children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: agentAvatar }), _jsx(AvatarFallback, { className: "text-xs bg-white/20 text-white", children: agentName.substring(0, 2).toUpperCase() })] }), _jsx("div", { className: "text-white font-medium", children: chatName })] }), _jsxs("div", { className: "flex items-center", children: [isMinimized ? (_jsx(Maximize2, { className: "h-4 w-4 text-white" })) : (_jsx(Minimize2, { className: "h-4 w-4 text-white" })), _jsx(X, { className: "h-5 w-5 text-white ml-2", onClick: (e) => {
                                                e.stopPropagation();
                                                setIsOpen(false);
                                            } })] })] }), !isMinimized && (_jsxs(CardContent, { className: "flex-1 p-0 flex flex-col", children: [_jsx(ScrollArea, { className: "flex-1 p-3", children: _jsxs("div", { className: "space-y-4", children: [messages.map((message) => (_jsx("div", { className: `flex ${message.sender === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: "flex items-end", children: [message.sender === "bot" && (_jsxs(Avatar, { className: "h-8 w-8 mr-2", children: [_jsx(AvatarImage, { src: agentAvatar }), _jsx(AvatarFallback, { className: "text-xs", children: agentName.substring(0, 2).toUpperCase() })] })), _jsxs("div", { className: `max-w-xs rounded-lg px-3 py-2 text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`, style: {
                                                                backgroundColor: message.sender === "user"
                                                                    ? primaryColor
                                                                    : undefined,
                                                            }, children: [_jsx("div", { children: message.content }), _jsx("div", { className: `text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-muted-foreground"}`, children: formatTime(message.timestamp) })] })] }) }, message.id))), messages
                                                .filter((m) => m.products && m.products.length > 0)
                                                .map((message) => {
                                                var _a;
                                                return (_jsx("div", { className: "ml-10", children: _jsx("div", { className: "grid grid-cols-1 gap-2 mt-2", children: (_a = message.products) === null || _a === void 0 ? void 0 : _a.map((product) => (_jsxs("div", { className: "flex items-center border rounded-md p-2 bg-white", children: [_jsx("div", { className: "w-16 h-16 rounded overflow-hidden flex-shrink-0", children: _jsx("img", { src: product.image, alt: product.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "ml-3 flex-1", children: [_jsx("div", { className: "text-sm font-medium", children: product.name }), _jsxs("div", { className: "text-sm font-bold mt-1", children: ["$", product.price.toFixed(2)] })] }), _jsx(Button, { size: "sm", className: "ml-2", style: { backgroundColor: primaryColor }, children: "View" })] }, product.id))) }) }, `${message.id}-products`));
                                            })] }) }), _jsx("div", { className: "p-3 border-t", children: _jsxs("div", { className: "flex items-center", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full", children: _jsx(Search, { className: "h-4 w-4" }) }), _jsx(Input, { className: "flex-1 mx-2", placeholder: "Ask about products...", value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyDown: (e) => {
                                                    if (e.key === "Enter") {
                                                        handleSendMessage();
                                                    }
                                                } }), _jsx(Button, { size: "icon", className: "h-8 w-8 rounded-full", style: { backgroundColor: primaryColor }, onClick: handleSendMessage, children: _jsx(Send, { className: "h-4 w-4" }) })] }) })] }))] }) }))] }));
}
