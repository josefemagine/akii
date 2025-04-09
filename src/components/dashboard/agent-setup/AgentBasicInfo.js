import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bot, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Agent name must be at least 2 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
    purpose: z
        .string()
        .min(10, { message: "Purpose must be at least 10 characters" }),
    avatarUrl: z.string().optional(),
});
const AgentBasicInfo = ({ onSubmit = () => { }, initialData = {
    name: "",
    description: "",
    purpose: "",
    avatarUrl: "",
}, }) => {
    const [avatarPreview, setAvatarPreview] = React.useState(initialData.avatarUrl || "");
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });
    const handleSubmit = (values) => {
        onSubmit(values);
    };
    const handleAvatarUpload = (e) => {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // In a real implementation, this would upload to a storage service
            // For now, we'll just create a local URL for preview
            const previewUrl = URL.createObjectURL(file);
            setAvatarPreview(previewUrl);
            form.setValue("avatarUrl", previewUrl);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Basic Agent Information" }), _jsx("p", { className: "text-gray-500 dark:text-gray-400 mt-1", children: "Define the core details of your AI agent. This information helps establish your agent's identity and purpose." })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(handleSubmit), className: "space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row gap-8", children: [_jsxs("div", { className: "md:w-1/3 flex flex-col items-center", children: [_jsx("div", { className: "mb-4", children: _jsx(Avatar, { className: "h-32 w-32 border-2 border-gray-200 dark:border-gray-700", children: avatarPreview ? (_jsx(AvatarImage, { src: avatarPreview, alt: "Agent avatar" })) : (_jsx(AvatarFallback, { className: "bg-primary/10", children: _jsx(Bot, { className: "h-12 w-12 text-primary" }) })) }) }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("label", { htmlFor: "avatar-upload", className: "cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-2 text-primary hover:text-primary/80 transition-colors", children: [_jsx(Camera, { className: "h-4 w-4" }), _jsx("span", { children: "Change Avatar" })] }), _jsx("input", { id: "avatar-upload", type: "file", accept: "image/*", className: "hidden", onChange: handleAvatarUpload })] }), _jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-2 text-center", children: "Upload a square image for best results. Recommended size: 256x256px." })] })] }), _jsxs("div", { className: "md:w-2/3 space-y-6", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Agent Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "e.g. Sales Assistant, Support Bot" }, field)) }), _jsx(FormDescription, { children: "This is how your agent will identify itself to users." }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "description", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Short Description" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "e.g. AI assistant that helps with product inquiries" }, field)) }), _jsx(FormDescription, { children: "A brief description of your agent's role (displayed in agent listings)." }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "purpose", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Agent Purpose" }), _jsx(FormControl, { children: _jsx(Textarea, Object.assign({ placeholder: "Describe in detail what this agent will help users with...", className: "min-h-[120px]" }, field)) }), _jsx(FormDescription, { children: "Detailed explanation of your agent's purpose, capabilities, and limitations. This helps train your agent to respond appropriately." }), _jsx(FormMessage, {})] })) })] })] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", children: "Cancel" }), _jsx(Button, { type: "submit", children: "Save & Continue" })] })] }) }))] }));
};
export default AgentBasicInfo;
