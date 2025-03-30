import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Users,
  Building,
} from "lucide-react";

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

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const form = useForm<FormValues>({
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

  const onSubmit = async (values: FormValues) => {
    // In a real implementation, this would submit to an API
    console.log(values);
    alert("Thank you for your message. We'll get back to you soon!");
    form.reset();
  };

  return (
    <MainLayout>
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Contact Us
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Have questions about our AI agents? Get in touch with our team.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2 mt-12">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                <Input
                                  placeholder="john@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Inc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+1 (555) 000-0000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">
                                  General Inquiry
                                </SelectItem>
                                <SelectItem value="sales">
                                  Sales Question
                                </SelectItem>
                                <SelectItem value="support">
                                  Technical Support
                                </SelectItem>
                                <SelectItem value="demo">
                                  Request a Demo
                                </SelectItem>
                                <SelectItem value="partnership">
                                  Partnership Opportunity
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide details about your inquiry..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Contact Information</h2>
                <p className="text-muted-foreground">
                  Our team is here to help you with any questions you may have
                  about our AI agent solutions.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">info@akii.ai</p>
                    <p className="text-muted-foreground">support@akii.ai</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">
                      Mon-Fri, 9am-6pm EST
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Office</h3>
                    <p className="text-muted-foreground">123 AI Boulevard</p>
                    <p className="text-muted-foreground">
                      San Francisco, CA 94103
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <h2 className="text-2xl font-bold">How We Can Help</h2>
                <div className="grid gap-4">
                  <div className="flex items-start space-x-4">
                    <MessageSquare className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Sales Inquiries</h3>
                      <p className="text-muted-foreground">
                        Interested in our AI agents? Our sales team can help you
                        find the right solution.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Support</h3>
                      <p className="text-muted-foreground">
                        Need help with your AI agents? Our support team is ready
                        to assist.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Building className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium">Partnerships</h3>
                      <p className="text-muted-foreground">
                        Looking to partner with us? Let's explore opportunities
                        together.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
