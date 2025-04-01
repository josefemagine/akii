import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSearch } from "@/contexts/SearchContext";
import { toast } from "@/components/ui/use-toast";
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
import { FileInput } from "@/components/ui/file-input";
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
  Loader2,
  X,
  Search,
} from "lucide-react";
import {
  uploadProfilePicture,
  deleteProfilePicture,
} from "@/lib/storage-helpers";

const Settings = () => {
  const state = useAuth();
  const { searchValue, setSearchValue } = useSearch();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filteredTabs, setFilteredTabs] = useState<string[]>([]);

  // Log user data for debugging
  React.useEffect(() => {
    console.log("Settings page user data:", {
      user: state.user,
      profile: state.profile,
      email: state.user?.email,
      id: state.user?.id,
    });
  }, [state.user, state.profile]);

  // Set preview URL when a file is selected
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Filter tabs based on search value
  useEffect(() => {
    const allTabs = [
      "profile",
      "security",
      "notifications",
      "billing",
      "subscription",
      "team",
      "api",
    ];
    if (!searchValue) {
      setFilteredTabs(allTabs);
      return;
    }

    const filtered = allTabs.filter((tab) => {
      return tab.toLowerCase().includes(searchValue.toLowerCase());
    });
    setFilteredTabs(filtered);

    // If we have filtered results and the current tab isn't in the filtered list,
    // automatically select the first filtered tab
    if (filtered.length > 0) {
      console.log(`Filtered tabs based on search "${searchValue}":`, filtered);
    }
  }, [searchValue]);

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile || !state.user?.id) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log("Uploading avatar for user ID:", state.user.id);
      const { url, error } = await uploadProfilePicture(
        state.user.id,
        selectedFile,
      );

      if (error) {
        setUploadError(error.message);
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (url) {
        // Store avatar URL in localStorage as a backup
        try {
          localStorage.setItem("akii-avatar-url", url);
          console.log(
            "Avatar uploaded successfully, URL stored in localStorage:",
            url,
          );
        } catch (storageError) {
          console.error(
            "Failed to store avatar URL in localStorage:",
            storageError,
          );
        }

        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });

        // Refresh user profile to get the updated avatar URL
        if (state.refreshUser) {
          console.log("Refreshing user profile after avatar upload");
          try {
            await state.refreshUser();

            // Double-check if the avatar URL was updated in the profile
            if (state.profile?.avatar_url !== url) {
              console.warn("Avatar URL not updated in profile after refresh");
              // Force update the profile with the new avatar URL
              if (state.updateProfile) {
                try {
                  await state.updateProfile({ avatar_url: url });
                  console.log("Forced avatar URL update in profile");
                } catch (updateErr) {
                  console.error("Error forcing avatar update:", updateErr);
                }
              }
            } else {
              console.log("Avatar URL successfully updated in profile");
            }
          } catch (refreshError) {
            console.error("Error refreshing user profile:", refreshError);
            // Even if refresh fails, we still have the URL in localStorage
          }
        }

        // Clear the selected file
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setUploadError("An unexpected error occurred. Please try again.");
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!state.user?.id || !state.profile?.avatar_url) return;

    setIsUploading(true);

    try {
      const { success, error } = await deleteProfilePicture(
        state.user.id,
        state.profile.avatar_url,
      );

      if (error) {
        toast({
          title: "Remove Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Profile Picture Removed",
          description: "Your profile picture has been removed successfully.",
        });

        // Refresh user profile to get the updated avatar URL
        if (state.refreshUser) {
          await state.refreshUser();
        }
      }
    } catch (err) {
      console.error("Error removing profile picture:", err);
      toast({
        title: "Remove Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    console.log("Search value changed to:", e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            className="pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
          {searchValue && (
            <button
              className="absolute right-2 top-2.5"
              onClick={() => setSearchValue("")}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {filteredTabs.includes("profile") && (
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("security") && (
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("notifications") && (
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("billing") && (
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("subscription") && (
            <TabsTrigger
              value="subscription"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("team") && (
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          )}
          {filteredTabs.includes("api") && (
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          )}
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
                <div className="flex flex-col items-center space-y-4 w-full sm:w-auto">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-2 border-primary/20 shadow-md">
                      <AvatarImage
                        src={
                          previewUrl ||
                          localStorage.getItem("akii-avatar-url") ||
                          state.profile?.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user?.email || "user"}`
                        }
                        className="object-cover avatar-image"
                        onError={() => {
                          // If image fails to load, try the fallback
                          const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${state.user?.email || "user"}`;
                          const imgElement = document.querySelector(
                            ".avatar-image",
                          ) as HTMLImageElement;
                          if (imgElement) imgElement.src = fallbackUrl;
                        }}
                      />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10">
                        {state.user?.email
                          ? state.user.email.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-sm text-red-500 font-medium">
                      {uploadError}
                    </p>
                  )}

                  <div className="space-y-3 w-full max-w-xs">
                    <div className="flex flex-col space-y-2">
                      {selectedFile && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <span className="truncate flex-1">
                            {selectedFile.name} (
                            {Math.round(selectedFile.size / 1024)} KB)
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleFileSelected(e.target.files[0]);
                            }
                          }}
                          disabled={isUploading}
                        />

                        {selectedFile && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={handleUploadAvatar}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Save</span>
                              </>
                            )}
                          </Button>
                        )}

                        {state.profile?.avatar_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={handleRemoveAvatar}
                            disabled={isUploading}
                          >
                            <X className="h-3 w-3" />
                            <span>Remove</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        defaultValue={
                          state.user?.user_metadata?.full_name?.split(" ")[0] ||
                          state.profile?.first_name ||
                          ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={
                          state.user?.user_metadata?.full_name?.split(" ")[1] ||
                          state.profile?.last_name ||
                          ""
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={state.user?.email || ""}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      defaultValue={state.profile?.company || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <div className="flex">
                      <Input
                        id="userId"
                        value={state.user?.id || "No ID available"}
                        readOnly
                        className="font-mono text-xs bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    // Save profile changes logic would go here
                    console.log("Saving profile changes");
                    // For now just show a toast message
                    toast({
                      title: "Profile Updated",
                      description: "Your profile information has been saved.",
                    });
                  }}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Save Profile
                </Button>
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
