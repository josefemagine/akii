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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Download, CheckCircle } from "lucide-react";
const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    otp: z.string().optional(),
});
const LeadMagnetModal = ({ isOpen, onClose, title = "Boost Your Sales by 67% with AI Chat Agents", description = "Enter your details to download our free guide with 10 proven strategies to increase your sales using AI chat agents.", downloadUrl = "#", // This would be the actual PDF URL in production
 }) => {
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
    const handleDownload = () => {
        // In a real implementation, this would download the actual PDF
        // For demo purposes, we'll just close the modal
        onClose();
    };
    const renderStepContent = () => {
        switch (step) {
            case "form":
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-bold", children: title }), _jsx(DialogDescription, { className: "text-muted-foreground", children: description })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4", children: [_jsx(FormField, { control: form.control, name: "name", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Name" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "John Doe" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "john@example.com" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sending OTP..."] })) : ("Get Your Free Guide") }) })] }) }))] }));
            case "otp":
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-bold", children: "Verify Your Email" }), _jsx(DialogDescription, { className: "text-muted-foreground", children: "We've sent a verification code to your email. Please enter it below." })] }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4", children: [_jsx(FormField, { control: form.control, name: "otp", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Verification Code" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "123456" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(DialogFooter, { children: _jsx(Button, { type: "submit", disabled: isSubmitting, className: "w-full", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Verifying..."] })) : ("Verify & Download") }) })] }) }))] }));
            case "success":
                return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { className: "text-xl font-bold", children: "Download Ready!" }), _jsx(DialogDescription, { className: "text-muted-foreground", children: "Thank you for verifying your email. Your guide is ready to download." })] }), _jsxs("div", { className: "flex flex-col items-center justify-center py-6 space-y-4", children: [_jsx(CheckCircle, { className: "h-16 w-16 text-primary" }), _jsx("p", { className: "text-center text-muted-foreground", children: "You'll also receive a copy in your email inbox for future reference." })] }), _jsx(DialogFooter, { children: _jsxs(Button, { onClick: handleDownload, className: "w-full", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Guide"] }) })] }));
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: (open) => !open && onClose(), children: _jsx(DialogContent, { className: "sm:max-w-[425px]", children: renderStepContent() }) }));
};
export default LeadMagnetModal;
