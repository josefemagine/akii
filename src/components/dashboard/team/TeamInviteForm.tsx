import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["admin", "member", "viewer"], {
    required_error: "Please select a role",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamInviteFormProps {
  teamId: string;
  onInviteSent?: () => void;
}

export default function TeamInviteForm({
  teamId,
  onInviteSent = () => {},
}: TeamInviteFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-team-invite",
        {
          body: {
            action: "invite",
            teamId,
            email: values.email,
            role: values.role,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${values.email}`,
      });

      form.reset();
      onInviteSent();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium mb-4">Invite Team Member</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="colleague@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
