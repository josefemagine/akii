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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    company: z.string().optional(),
    phone: z.string().optional(),
    subject: z.string().min(1, { message: "Please select a subject" }),
    message: z
        .string()
        .min(10, { message: "Message must be at least 10 characters" }),
});
const Contact = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            company: "",
            phone: "",
            subject: "",
            message: "",
        },
    });
    const onSubmit = (values) => __awaiter(void 0, void 0, void 0, function* () {
        // In a real implementation, this would submit to an API
        console.log(values);
        alert("Thank you for your message. We'll get back to you soon!");
        form.reset();
    });
    return (_jsx(MainLayout, { children: _jsx("section", { className: "py-20 md:py-28 bg-gradient-to-b from-background to-muted/30", children: _jsxs("div", { className: "container px-4 md:px-6", children: [_jsx("div", { className: "flex flex-col items-center justify-center space-y-4 text-center", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h1", { className: "text-3xl font-bold tracking-tighter sm:text-5xl", children: "Contact Us" }), _jsx("p", { className: "max-w-[700px] text-muted-foreground md:text-xl", children: "Have questions about Akii? Get in touch with our team." })] }) }), _jsxs("div", { className: "mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 mt-12", children: [_jsx("div", { children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Get in Touch" }), _jsx(CardDescription, { children: "Fill out the form below and we'll get back to you as soon as possible." })] }), _jsx(CardContent, { children: _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "John Doe" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "john@example.com" }, field)) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(FormField, { control: form.control, name: "company", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Company" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "Acme Inc." }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "phone", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Phone (optional)" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "+1 (555) 000-0000" }, field)) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: "subject", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Subject" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a subject" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "general", children: "General Inquiry" }), _jsx(SelectItem, { value: "sales", children: "Sales Question" }), _jsx(SelectItem, { value: "support", children: "Technical Support" }), _jsx(SelectItem, { value: "demo", children: "Request a Demo" }), _jsx(SelectItem, { value: "partnership", children: "Partnership Opportunity" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "message", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Message" }), _jsx(FormControl, { children: _jsx(Textarea, Object.assign({ placeholder: "Please provide details about your inquiry...", className: "min-h-[120px]" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", children: "Send Message" })] }) })) })] }) }), _jsx("div", { className: "space-y-6" })] })] }) }) }));
};
export default Contact;
