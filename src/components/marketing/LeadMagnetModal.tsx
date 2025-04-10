import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Loader2, Download, CheckCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  otp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  downloadUrl?: string;
}

const LeadMagnetModal = ({
  isOpen,
  onClose,
  title = "Boost Your Sales by 67% with AI Chat Agents",
  description = "Enter your details to download our free guide with 10 proven strategies to increase your sales using AI chat agents.",
  downloadUrl = "#", // This would be the actual PDF URL in production
}: LeadMagnetModalProps) => {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      otp: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // In a real implementation, this would call an API to send the OTP
      // For demo purposes, we'll just simulate a delay and move to the OTP step
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (step === "form") {
        setStep("otp");
      } else if (step === "otp") {
        // Verify OTP - in a real implementation this would call an API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStep("success");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would download the actual PDF
    // For demo purposes, we'll just close the modal
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case "form":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {description}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Get Your Free Guide"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        );
      case "otp":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Verify Your Email
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                We've sent a verification code to your email. Please enter it
                below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Download"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Download Ready!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Thank you for verifying your email. Your guide is ready to
                download.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <CheckCircle className="h-16 w-16 text-primary" />
              <p className="text-center text-muted-foreground">
                You'll also receive a copy in your email inbox for future
                reference.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Guide
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default LeadMagnetModal;
