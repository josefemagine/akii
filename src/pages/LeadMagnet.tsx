import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Download, CheckCircle, FileText } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  otp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LeadMagnet = () => {
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

  const renderStepContent = () => {
    switch (step) {
      case "form":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Boost Your Sales by 67% with AI Chat Agents
              </CardTitle>
              <CardDescription>
                Enter your details to download our free guide with 10 proven
                strategies to increase your sales using AI chat agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
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
                </form>
              </Form>
            </CardContent>
          </Card>
        );
      case "otp":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Verify Your Email
              </CardTitle>
              <CardDescription>
                We've sent a verification code to your email. Please enter it
                below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
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
                </form>
              </Form>
            </CardContent>
          </Card>
        );
      case "success":
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Download Ready!
              </CardTitle>
              <CardDescription>
                Thank you for verifying your email. Your guide is ready to
                download.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
              <CheckCircle className="h-20 w-20 text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium">
                  10 Steps to Boost Sales by 67% with AI
                </h3>
                <p className="text-muted-foreground">
                  Learn how to implement AI chat agents to dramatically increase
                  your conversion rates.
                </p>
              </div>
              <div className="flex items-center justify-center w-full max-w-xs bg-muted/30 rounded-lg p-4">
                <FileText className="h-10 w-10 text-primary mr-4" />
                <div>
                  <p className="font-medium">Sales-Boost-Guide.pdf</p>
                  <p className="text-xs text-muted-foreground">2.4 MB • PDF</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll also receive a copy in your email inbox for future
                reference.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Guide
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <MainLayout>
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6">{renderStepContent()}</div>
      </section>
    </MainLayout>
  );
};

export default LeadMagnet;
