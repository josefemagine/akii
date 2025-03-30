import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  Users,
  Upload,
  CheckCircle,
} from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the
                platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Upload className="h-4 w-4" />
                    Change
                  </Button>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" defaultValue="Acme Inc." />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">
                    Secure your account with two-factor authentication.
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email notifications about your account activity.
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Agent Activity</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified about important agent activity and
                      performance.
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Marketing Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and promotions.
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription plan and usage limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Professional Plan</h3>
                      <p className="text-sm text-muted-foreground">$99/month</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                  <div className="mt-4 text-sm">
                    <p>
                      Your next billing date is <strong>July 15, 2023</strong>
                    </p>
                    <div className="mt-2">
                      <span className="text-muted-foreground">
                        5,000 messages per month
                      </span>
                      <div className="h-2 w-full bg-muted-foreground/20 rounded-full mt-1">
                        <div className="h-2 w-3/5 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>3,120 used</span>
                        <span>5,000 total</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Plan Features</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>5,000 messages per month</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Up to 10 AI agents</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Web and mobile integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>WhatsApp integration</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Team collaboration (up to 5 members)</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4">
                  <Button>Manage Subscription</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Professional Plan</h3>
                      <p className="text-sm text-muted-foreground">$99/month</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                  <div className="mt-4 text-sm">
                    <p>
                      Your next billing date is <strong>July 15, 2023</strong>
                    </p>
                    <div className="mt-2">
                      <span className="text-muted-foreground">
                        5,000 messages per month
                      </span>
                      <div className="h-2 w-full bg-muted-foreground/20 rounded-full mt-1">
                        <div className="h-2 w-3/5 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span>3,120 used</span>
                        <span>5,000 total</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-12 bg-background rounded flex items-center justify-center text-xs font-medium">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm">•••• •••• •••• 4242</p>
                        <p className="text-xs text-muted-foreground">
                          Expires 12/24
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Billing History</h3>
                  <div className="border rounded-lg">
                    <div className="flex justify-between items-center p-3 border-b">
                      <div>
                        <p className="text-sm font-medium">June 15, 2023</p>
                        <p className="text-xs text-muted-foreground">
                          Professional Plan - Monthly
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">$99.00</p>
                        <p className="text-xs text-green-500">Paid</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border-b">
                      <div>
                        <p className="text-sm font-medium">May 15, 2023</p>
                        <p className="text-xs text-muted-foreground">
                          Professional Plan - Monthly
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">$99.00</p>
                        <p className="text-xs text-green-500">Paid</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3">
                      <div>
                        <p className="text-sm font-medium">April 15, 2023</p>
                        <p className="text-xs text-muted-foreground">
                          Professional Plan - Monthly
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">$99.00</p>
                        <p className="text-xs text-green-500">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members and their access permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Team Members (3)</h3>
                  <Button size="sm">
                    <Users className="h-4 w-4 mr-2" /> Invite Member
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">
                          john.doe@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                        Admin
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user456" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-sm text-muted-foreground">
                          jane.smith@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-muted px-2 py-1 rounded">
                        Member
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user789" />
                        <AvatarFallback>RJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Robert Johnson</p>
                        <p className="text-sm text-muted-foreground">
                          robert.johnson@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-muted px-2 py-1 rounded">
                        Member
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for integrating with our platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Your API Keys</h3>
                  <Button size="sm">
                    <Globe className="h-4 w-4 mr-2" /> Generate New Key
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <div className="flex justify-between items-center p-4 border-b">
                    <div>
                      <p className="font-medium">Production Key</p>
                      <p className="text-sm text-muted-foreground">
                        Created on June 10, 2023
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        ak_*************dKp8
                      </code>
                      <Button variant="ghost" size="sm">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-medium">Development Key</p>
                      <p className="text-sm text-muted-foreground">
                        Created on May 22, 2023
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        ak_*************jF2s
                      </code>
                      <Button variant="ghost" size="sm">
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">API Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Learn how to integrate our API with your applications.
                  </p>
                  <Button variant="outline" size="sm">
                    View Documentation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
