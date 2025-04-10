import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Bot, Camera } from "lucide-react";

import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";

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

type AgentBasicInfoFormValues = z.infer<typeof formSchema>;

interface AgentBasicInfoProps {
  onSubmit?: (values: AgentBasicInfoFormValues) => void;
  initialData?: Partial<AgentBasicInfoFormValues>;
}

const AgentBasicInfo = ({
  onSubmit = () => {},
  initialData = {
    name: "",
    description: "",
    purpose: "",
    avatarUrl: "",
  },
}: AgentBasicInfoProps) => {
  const [avatarPreview, setAvatarPreview] = React.useState<string>(
    initialData.avatarUrl || "",
  );

  const form = useForm<AgentBasicInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleSubmit = (values: AgentBasicInfoFormValues) => {
    onSubmit(values);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to a storage service
      // For now, we'll just create a local URL for preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      form.setValue("avatarUrl", previewUrl);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Basic Agent Information
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Define the core details of your AI agent. This information helps
          establish your agent's identity and purpose.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="mb-4">
                <Avatar className="h-32 w-32 border-2 border-gray-200 dark:border-gray-700">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Agent avatar" />
                  ) : (
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              <div className="flex flex-col items-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    <Camera className="h-4 w-4" />
                    <span>Change Avatar</span>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Upload a square image for best results. Recommended size:
                  256x256px.
                </p>
              </div>
            </div>

            <div className="md:w-2/3 space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sales Assistant, Support Bot"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is how your agent will identify itself to users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. AI assistant that helps with product inquiries"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of your agent's role (displayed in
                      agent listings).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent Purpose</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe in detail what this agent will help users with..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed explanation of your agent's purpose,
                      capabilities, and limitations. This helps train your agent
                      to respond appropriately.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Save & Continue</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AgentBasicInfo;
