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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    role: z.enum(["admin", "member", "viewer"], {
        required_error: "Please select a role",
    }),
});
export default function TeamInviteForm({ teamId, onInviteSent = () => { }, }) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "member",
        },
    });
    const onSubmit = (values) => __awaiter(this, void 0, void 0, function* () {
        try {
            setIsLoading(true);
            const { data, error } = yield supabase.functions.invoke("supabase-functions-team-invite", {
                body: {
                    action: "invite",
                    teamId,
                    email: values.email,
                    role: values.role,
                },
            });
            if (error) {
                throw new Error(error.message);
            }
            toast({
                title: "Invitation sent",
                description: `An invitation has been sent to ${values.email}`,
            });
            form.reset();
            onInviteSent();
        }
        catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send invitation",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    });
    return (_jsxs("div", { className: "p-6 bg-card rounded-lg border shadow-sm", children: [_jsx("h3", { className: "text-lg font-medium mb-4", children: "Invite Team Member" }), _jsx(Form, Object.assign({}, form, { children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { control: form.control, name: "email", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Email address" }), _jsx(FormControl, { children: _jsx(Input, Object.assign({ placeholder: "colleague@example.com" }, field)) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: "role", render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Role" }), _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select a role" }) }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "member", children: "Member" }), _jsx(SelectItem, { value: "viewer", children: "Viewer" })] })] }), _jsx(FormMessage, {})] })) }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Sending..."] })) : ("Send Invitation") })] }) }))] }));
}
