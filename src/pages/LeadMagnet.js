var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Loader2, Download, CheckCircle, FileText } from "lucide-react";
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    otp: z.string().optional(),
});
const LeadMagnet = () => {
    const [step, setStep] = useState("form");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            otp: "",
        },
    });
    const onSubmit = (values) => __awaiter(void 0, void 0, void 0, function* () {
        setIsSubmitting(true);
        try {
            // In a real implementation, this would call an API to send the OTP
            // For demo purposes, we'll just simulate a delay and move to the OTP step
            yield new Promise((resolve) => setTimeout(resolve, 1000));
            if (step === "form") {
                setStep("otp");
            }
            else if (step === "otp") {
                // Verify OTP - in a real implementation this would call an API
                yield new Promise((resolve) => setTimeout(resolve, 1000));
                setStep("success");
            }
        }
        catch (error) {
            console.error("Error:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    });
    const renderStepContent = () => {
        switch (step) {
            case "form":
                return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: "Boost Your Sales by 67% with AI Chat Agents" }), _jsx(CardDescription, { children: "Enter your details to download our free guide with 10 proven strategies to increase your sales using AI chat agents." })] }), _jsx(CardContent, { children: _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "John Doe" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "john@example.com" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sending OTP..."] })) : ("Get Your Free Guide") })] }) })) })] }));
            case "otp":
                return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: "Verify Your Email" }), _jsx(CardDescription, { children: "We've sent a verification code to your email. Please enter it below." })] }), _jsx(CardContent, { children: _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "otp", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Verification Code" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "123456" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Verifying..."] })) : ("Verify & Download") })] }) })) })] }));
            case "success":
                return (_jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-bold", children: "Download Ready!" }), _jsx(CardDescription, { children: "Thank you for verifying your email. Your guide is ready to download." })] }), _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-6 space-y-6", children: [_jsx(CheckCircle, { className: "h-20 w-20 text-primary" }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h3", { className: "text-xl font-medium", children: "10 Steps to Boost Sales by 67% with AI" }), _jsx("p", { className: "text-muted-foreground", children: "Learn how to implement AI chat agents to dramatically increase your conversion rates." })] }), _jsxs("div", { className: "flex items-center justify-center w-full max-w-xs bg-muted/30 rounded-lg p-4", children: [_jsx(FileText, { className: "h-10 w-10 text-primary mr-4" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Sales-Boost-Guide.pdf" }), _jsx("p", { className: "text-xs text-muted-foreground", children: "2.4 MB \u2022 PDF" })] })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "You'll also receive a copy in your email inbox for future reference." })] }), _jsx(CardFooter, { children: _jsxs(Button, { className: "w-full", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Guide"] }) })] }));
        }
    };
    return (_jsx(MainLayout, { children: _jsx("section", { className: "py-20 md:py-28 bg-gradient-to-b from-background to-muted/30", children: _jsx("div", { className: "container px-4 md:px-6", children: renderStepContent() }) }) }));
};
export default LeadMagnet;
