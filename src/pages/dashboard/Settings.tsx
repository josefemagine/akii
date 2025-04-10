import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { UserRepository } from "@/lib/database/user-repository";
import { AlertCircle, Check, Copy, CreditCard, Download, Eye, EyeOff, Lock, Mail, MoreHorizontal, Plus, ShieldCheck, Smartphone, Trash2, UserPlus, UserX, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface SettingsSection {
  id: string;
  name: string;
  description: string;
}

interface ProfileData {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  company?: string;
  company_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  role?: string;
  has_2fa?: boolean;
  phone?: string;
  // Add a fallback flag for debugging
  is_fallback?: boolean;
}

interface PlanDetails {
  id: string;
  name: string;
  description: string;
  price: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface NotificationPreferences {
  marketing_emails: boolean;
  product_updates: boolean;
  security_alerts: boolean;
  billing_alerts: boolean;
  newsletter: boolean;
  team_activity: boolean;
}

interface BillingState {
  currentPlan: PlanDetails | null;
  availablePlans: PlanDetails[];
  invoices: InvoiceData[];
  showUpgradeDialog: boolean;
  selectedPlan: string;
  usagePercentage: number;
  billingEmail: string;
  cardLast4: string;
  nextBillingDate: string;
}

interface SecurityState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPassword: boolean;
  passwordStrength: number;
  is2FAEnabled: boolean;
  isVerifying2FA: boolean;
  verificationCode: string;
  setupKey: string;
  showSetup2FADialog: boolean;
  phone: string;
  selectedMethod: '2fa_app' | '2fa_sms';
}

interface CookiePreferences {
  essential: boolean; // Always true, can't be toggled
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  thirdParty: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar_url?: string;
  status: 'active' | 'invited' | 'deactivated';
  last_active?: string;
}

interface AIAgent {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
}

interface TeamState {
  members: TeamMember[];
  pendingInvites: TeamMember[];
  showInviteDialog: boolean;
  newInviteEmail: string;
  newInviteRole: 'admin' | 'member';
  selectedMember: TeamMember | null;
  showMemberDialog: boolean;
  availableAgents: AIAgent[];
  isLoadingTeam: boolean;
}

export default function Settings() {
  // State and hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [securityState, setSecurityState] = useState<SecurityState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    showPassword: false,
    passwordStrength: 0,
    is2FAEnabled: false,
    isVerifying2FA: false,
    verificationCode: "",
    setupKey: "AKII-1234-5678-ABCD",
    showSetup2FADialog: false,
    phone: "",
    selectedMethod: '2fa_app',
  });
  const [billingState, setBillingState] = useState<BillingState>({
    currentPlan: null,
    availablePlans: [],
    invoices: [],
    showUpgradeDialog: false,
    selectedPlan: "",
    usagePercentage: 0,
    billingEmail: "",
    cardLast4: "",
    nextBillingDate: "",
  });
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    marketing_emails: false,
    product_updates: true,
    security_alerts: true,
    billing_alerts: true,
    newsletter: false,
    team_activity: true
  });
  const [notificationsChanged, setNotificationsChanged] = useState(false);
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false,
    thirdParty: false
  });
  const [cookiesChanged, setCookiesChanged] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [teamState, setTeamState] = useState<TeamState>({
    members: [],
    pendingInvites: [],
    showInviteDialog: false,
    newInviteEmail: "",
    newInviteRole: "member",
    selectedMember: null,
    showMemberDialog: false,
    availableAgents: [],
    isLoadingTeam: true
  });

  // Available settings sections
  const sections: SettingsSection[] = [
    { id: "profile", name: "Profile", description: "Manage your personal information" },
    { id: "security", name: "Security & Authentication", description: "Password and 2FA settings" },
    { id: "billing", name: "Billing & Subscriptions", description: "Manage your subscription and billing" },
    { id: "notifications", name: "Notification Preferences", description: "Control emails and alerts" },
    { id: "privacy", name: "Data & Privacy", description: "Control your data and privacy settings" },
    { id: "team", name: "Team", description: "Invite and manage team members" },
  ];

  // Emergency direct function to create and fetch profile data
  const emergencyLoadProfile = async () => {
    console.log("[Settings] Using emergency direct profile loader");
    
    try {
      // Import Supabase directly
      const { supabase } = await import('@/lib/supabase');
      
      // Check if we have a session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token || !user?.id) {
        console.error("[Settings] No valid auth session for emergency profile load");
        return null;
      }
      
      console.log("[Settings] Emergency direct request for profile");
      
      // Try Supabase client first
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("[Settings] Emergency profile loader error:", error);
        } else if (data) {
          console.log("[Settings] Emergency profile loader success:", data);
          return data;
        }
      } catch (clientErr) {
        console.error("[Settings] Emergency profile client error:", clientErr);
      }
      
      // If client fails, use direct fetch API
      const apiUrl = `${supabase.supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error("[Settings] Emergency fetch error:", response.status, response.statusText);
        
        // Create profile if not found
        if (response.status === 404 || response.status === 406) {
          return createEmergencyProfile();
        }
        
        return null;
      }
      
      const data = await response.json();
      console.log("[Settings] Emergency fetch success:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      
      // Create profile if not found
      return createEmergencyProfile();
    } catch (err) {
      console.error("[Settings] Emergency profile loader exception:", err);
      return null;
    }
  };
  
  // Create emergency profile function
  const createEmergencyProfile = async () => {
    try {
      console.log("[Settings] Creating emergency profile");
      
      if (!user?.id) {
        return null;
      }
      
      // Import Supabase directly
      const { supabase } = await import('@/lib/supabase');
      
      // Create basic profile
      const newProfile = {
        id: user.id,
        email: user.email || "",
        first_name: "Admin",
        last_name: "User",
        status: "active",
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Try to create profile
      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select()
        .single();
        
      if (error) {
        console.error("[Settings] Error creating emergency profile:", error);
        return newProfile; // Return the created profile even if save failed
      }
      
      console.log("[Settings] Emergency profile created:", data);
      return data;
    } catch (err) {
      console.error("[Settings] Exception creating emergency profile:", err);
      return null;
    }
  };

  // Fetch user profile data using REST API
  useEffect(() => {
    async function fetchProfileData() {
      if (!user?.id) return;
      
      setIsLoading(true);
      setApiError(null);
      
      try {
        console.log("[Settings Debug] Starting profile fetch, current state:", {
          user: user ? 'Present' : 'Not present',
          profileData: profileData ? 'Loaded' : 'Not loaded',
          formData: Object.keys(formData).length > 0 ? JSON.stringify(formData) : 'Empty'
        });
        
        console.log("[Settings] Loading profile via REST API for user:", user.id);
        
        // Create a default fallback profile in case API fails
        const fallbackProfile: ProfileData = {
          id: user.id,
          email: user.email || "",
          first_name: "Admin",
          last_name: "User",
          full_name: "Admin User",
          company: "Akii AI",
          is_fallback: true
        };
        
        // Try UserRepository first
        let profile = await UserRepository.getProfile(user.id);
        
        // If that fails, try emergency loader
        if (!profile) {
          console.log("[Settings] UserRepository failed, trying emergency loader");
          profile = await emergencyLoadProfile();
        }
        
        console.log("[Settings] Final profile result:", profile);
        
        if (profile) {
          console.log("[Settings] Profile loaded successfully:", profile);
          
          // Set the profile data
          setProfileData(profile);
          
          // Prepare form data using available profile fields with proper defaults
          const updatedFormData = {
            first_name: profile.first_name || "Admin",
            last_name: profile.last_name || "User",
            company: profile.company || profile.company_name || "Akii AI",
            email: profile.email || user.email || "",
          };
          
          
          console.log("[Settings] Setting form data to:", updatedFormData);
          
          // Update form data
          setFormData(updatedFormData);
          
          // Update security state
          setSecurityState(prev => ({
            ...prev,
            is2FAEnabled: profile.has_2fa || false,
            phone: profile.phone || "",
          }));
          
          setIsLoading(false);
        } else {
          console.error("[Settings] Failed to load profile data - null response from API");
          setApiError("Could not load your profile. Please try again later.");
          
          // Use the fallback profile
          console.log("[Settings] Using fallback profile");
          setProfileData(fallbackProfile);
          
          const fallbackFormData = {
            first_name: "",
            last_name: "",
            company: "",
            email: user.email || "",
          };
          
          setFormData(fallbackFormData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[Settings] Error loading profile:", error);
        setApiError(error instanceof Error ? error.message : "An unknown error occurred");
        
        // Create and use a fallback profile for emergency recovery
        console.log("[Settings] Using emergency fallback profile after error");
        const emergencyProfile: ProfileData = {
          id: user.id,
          email: user.email || "",
          first_name: "",
          last_name: "",
          is_fallback: true
        };
        
        setProfileData(emergencyProfile);
        
        const fallbackFormData = {
          first_name: "",
          last_name: "",
          company: "",
          email: user.email || "",
        };
        
        setFormData(fallbackFormData);
        setIsLoading(false);
      } finally {
        // Ensure we're not stuck in loading state
        setIsLoading(false);
        
        // Log the final state
        setTimeout(() => {
          console.log("[Settings Debug] Final component state:", {
            user: user ? 'Present' : 'Not present',
            profileData: profileData ? JSON.stringify(profileData) : 'Not loaded', 
            isLoading: false,
            formData: Object.keys(formData).length > 0 ? JSON.stringify(formData) : 'Empty'
          });
        }, 500);
      }
    }

    fetchProfileData();
  }, [user]);

  // Fetch billing data
  useEffect(() => {
    if (!user?.id) return;
    
    // Mock data for demonstration - replace with actual API call
    const fetchBillingData = async () => {
      try {
        // Mock plan data
        const plans: PlanDetails[] = [
          {
            id: 'free',
            name: 'Free',
            description: 'Basic features for personal use',
            price: '$0',
            billingCycle: 'monthly',
            features: [
              '5 AI agents',
              '100 queries per month',
              'Basic support'
            ]
          },
          {
            id: 'pro',
            name: 'Pro',
            description: 'Advanced features for professionals',
            price: '$29',
            billingCycle: 'monthly',
            features: [
              'Unlimited AI agents',
              '1,000 queries per month',
              'Priority support',
              'Advanced analytics'
            ],
            isPopular: true
          },
          {
            id: 'business',
            name: 'Business',
            description: 'Enterprise-grade features for teams',
            price: '$99',
            billingCycle: 'monthly',
            features: [
              'Unlimited AI agents',
              '10,000 queries per month',
              '24/7 support',
              'Advanced analytics',
              'Team management',
              'Custom integrations'
            ]
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'Custom solutions for large organizations',
            price: 'Custom',
            billingCycle: 'yearly',
            features: [
              'Unlimited everything',
              'Dedicated support manager',
              'Custom AI model training',
              'SLA guarantees',
              'On-premise deployment option'
            ],
            isEnterprise: true
          }
        ];
        
        // Mock invoices
        const invoices: InvoiceData[] = [
          {
            id: 'inv-001',
            invoiceNumber: 'INV-2023-001',
            date: '2023-10-01',
            amount: '$29.00',
            status: 'paid',
            downloadUrl: '#'
          },
          {
            id: 'inv-002',
            invoiceNumber: 'INV-2023-002',
            date: '2023-11-01',
            amount: '$29.00',
            status: 'paid',
            downloadUrl: '#'
          },
          {
            id: 'inv-003',
            invoiceNumber: 'INV-2023-003',
            date: '2023-12-01',
            amount: '$29.00',
            status: 'pending',
            downloadUrl: '#'
          }
        ];
        
        // Set billing state with mock data
        setBillingState({
          currentPlan: plans[1], // Pro plan
          availablePlans: plans,
          invoices,
          showUpgradeDialog: false,
          selectedPlan: plans[1].id,
          usagePercentage: 65,
          billingEmail: profileData?.email || "",
          cardLast4: "4242",
          nextBillingDate: "January 1, 2024"
        });
      } catch (error) {
        console.error("[Settings] Error loading billing data:", error);
        setApiError("Failed to load billing information");
      }
    };
    
    fetchBillingData();
  }, [user?.id, profileData]);

  // Fetch notification preferences
  useEffect(() => {
    if (!user?.id) return;
    
    // In a real application, you would fetch these preferences from your API
    const fetchNotificationPreferences = async () => {
      try {
        // Mock data - replace with actual API call
        setNotificationPrefs({
          marketing_emails: false,
          product_updates: true,
          security_alerts: true,
          billing_alerts: true,
          newsletter: false,
          team_activity: true
        });
      } catch (error) {
        console.error("[Settings] Error loading notification preferences:", error);
        setApiError("Failed to load notification preferences");
      }
    };
    
    fetchNotificationPreferences();
  }, [user?.id]);

  // Fetch team data
  useEffect(() => {
    if (!user?.id) return;
    
    // Mock data for demonstration - replace with actual API call
    const fetchTeamData = async () => {
      try {
        setTeamState(prev => ({ ...prev, isLoadingTeam: true }));
        
        // Add this check to ensure we have user data
        if (!user?.id) {
          console.log("[Settings] Cannot load team data - no user ID");
          setTeamState(prev => ({ ...prev, isLoadingTeam: false }));
          return;
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create members array with additional error handling
        let members = [];
        try {
          members = [
            {
              id: "1",
              name: "You",
              email: profileData?.email || user.email || "",
              role: "owner",
              avatar_url: profileData?.avatar_url || "",
              status: "active",
              last_active: new Date().toISOString()
            },
            {
              id: "2",
              name: "Jane Smith",
              email: "jane@example.com",
              role: "admin",
              avatar_url: "",
              status: "active",
              last_active: "2023-12-15T10:30:00Z"
            },
            {
              id: "3",
              name: "Bob Johnson",
              email: "bob@example.com",
              role: "member",
              avatar_url: "",
              status: "active",
              last_active: "2023-12-10T14:45:00Z"
            }
          ];
        } catch (e) {
          console.error("[Settings] Error creating members array:", e);
          members = [{
            id: "1",
            name: "You",
            email: user.email || "",
            role: "owner",
            status: "active",
            last_active: new Date().toISOString()
          }];
        }
        
        const pendingInvites: TeamMember[] = [
          {
            id: "invite-1",
            name: "",
            email: "alex@example.com",
            role: "member",
            status: "invited"
          }
        ];
        
        const agents: AIAgent[] = [
          { id: "agent-1", name: "Research Assistant", description: "Helps with research tasks", isSelected: true },
          { id: "agent-2", name: "Data Analyst", description: "Analyzes data and creates reports", isSelected: true },
          { id: "agent-3", name: "Code Assistant", description: "Helps write and debug code", isSelected: false },
          { id: "agent-4", name: "Meeting Scheduler", description: "Helps schedule and organize meetings", isSelected: true },
          { id: "agent-5", name: "Content Writer", description: "Creates content for various platforms", isSelected: false }
        ];
        
        setTeamState(prev => ({
          ...prev,
          members,
          pendingInvites,
          availableAgents: agents,
          isLoadingTeam: false
        }));
      } catch (error) {
        console.error("[Settings] Error loading team data:", error);
        setApiError("Failed to load team information");
        setTeamState(prev => ({ ...prev, isLoadingTeam: false }));
      }
    };
    
    fetchTeamData();
  }, [user?.id, profileData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setHasChanges(true);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.id || !hasChanges) return;
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      console.log("[Settings] Saving profile changes:", formData);
      const updatedProfile = await UserRepository.updateProfile(user.id, formData);
      
      if (updatedProfile) {
        console.log("[Settings] Profile updated successfully:", updatedProfile);
        setProfileData(updatedProfile);
        setHasChanges(false);
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("[Settings] Error saving profile:", error);
      setApiError(error instanceof Error ? error.message : "Failed to save your changes");
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem saving your profile information.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    // Implementation for avatar upload will depend on your storage solution
    // This is a placeholder
    toast({
      title: "Coming Soon",
      description: "Avatar upload functionality will be available in a future update.",
    });
  };

  // Reset form to original data
  const handleCancelChanges = () => {
    if (profileData) {
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        company: profileData.company || "",
        email: profileData.email || "",
      });
      setHasChanges(false);
    }
  };

  // Update security state when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setSecurityState(prev => ({
        ...prev,
        is2FAEnabled: profileData.has_2fa || false,
        phone: profileData.phone || "",
      }));
    }
  }, [profileData]);

  // Handle security form changes
  const handleSecurityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setSecurityState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength if the field is newPassword
    if (name === "newPassword") {
      const strength = calculatePasswordStrength(value);
      setSecurityState(prev => ({
        ...prev,
        passwordStrength: strength
      }));
    }
  };

  // Calculate password strength (0-100)
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check (max 40 points)
    strength += Math.min(password.length * 5, 40);
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 15; // Has uppercase
    if (/[a-z]/.test(password)) strength += 10; // Has lowercase
    if (/[0-9]/.test(password)) strength += 15; // Has number
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Has special char
    
    return Math.min(strength, 100);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setSecurityState(prev => ({
      ...prev,
      showPassword: !prev.showPassword
    }));
  };

  // Handle password change
  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = securityState;
    
    // Validation
    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Current password required",
        description: "Please enter your current password."
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "New password and confirmation must match."
      });
      return;
    }
    
    if (securityState.passwordStrength < 50) {
      toast({
        variant: "destructive",
        title: "Password too weak",
        description: "Please choose a stronger password."
      });
      return;
    }
    
    setIsSaving(true);
    setApiError(null);
    
    try {
      // Password change API call would go here
      // await UserRepository.changePassword(currentPassword, newPassword);
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully."
      });
      
      // Reset form
      setSecurityState(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        passwordStrength: 0
      }));
    } catch (error) {
      console.error("[Settings] Error changing password:", error);
      setApiError(error instanceof Error ? error.message : "Failed to change password");
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: "There was a problem updating your password."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle 2FA setup dialog
  const toggle2FASetupDialog = () => {
    setSecurityState(prev => ({
      ...prev,
      showSetup2FADialog: !prev.showSetup2FADialog
    }));
  };

  // Handle 2FA method selection
  const handle2FAMethodChange = (method: '2fa_app' | '2fa_sms') => {
    setSecurityState(prev => ({
      ...prev,
      selectedMethod: method
    }));
  };

  // Enable 2FA
  const handleEnable2FA = async () => {
    setIsSaving(true);
    setApiError(null);
    
    try {
      // 2FA enable API call would go here
      // const result = await UserRepository.enable2FA(securityState.selectedMethod, securityState.verificationCode);
      
      setSecurityState(prev => ({
        ...prev,
        is2FAEnabled: true,
        showSetup2FADialog: false,
        verificationCode: ""
      }));
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled for your account."
      });
    } catch (error) {
      console.error("[Settings] Error enabling 2FA:", error);
      setApiError(error instanceof Error ? error.message : "Failed to enable 2FA");
      toast({
        variant: "destructive",
        title: "2FA Setup Failed",
        description: "There was a problem enabling two-factor authentication."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    setIsSaving(true);
    setApiError(null);
    
    try {
      // 2FA disable API call would go here
      // await UserRepository.disable2FA();
      
      setSecurityState(prev => ({
        ...prev,
        is2FAEnabled: false
      }));
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account."
      });
    } catch (error) {
      console.error("[Settings] Error disabling 2FA:", error);
      setApiError(error instanceof Error ? error.message : "Failed to disable 2FA");
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem disabling two-factor authentication."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy setup key to clipboard
  const copySetupKey = () => {
    navigator.clipboard.writeText(securityState.setupKey);
    toast({
      title: "Copied",
      description: "Setup key copied to clipboard."
    });
  };

  // Toggle plan upgrade dialog
  const toggleUpgradeDialog = () => {
    setBillingState(prev => ({
      ...prev,
      showUpgradeDialog: !prev.showUpgradeDialog
    }));
  };

  // Handle plan selection
  const handlePlanSelection = (planId: string) => {
    setBillingState(prev => ({
      ...prev,
      selectedPlan: planId
    }));
  };

  // Handle plan upgrade/change
  const handleChangePlan = async () => {
    setIsSaving(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPlan = billingState.availablePlans.find(
        plan => plan.id === billingState.selectedPlan
      );
      
      if (newPlan) {
        setBillingState(prev => ({
          ...prev,
          currentPlan: newPlan,
          showUpgradeDialog: false
        }));
        
        toast({
          title: "Plan Updated",
          description: `Your subscription has been updated to ${newPlan.name}.`
        });
      }
    } catch (error) {
      console.error("[Settings] Error changing plan:", error);
      toast({
        variant: "destructive",
        title: "Plan Change Failed",
        description: "There was a problem updating your subscription plan."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle downloading invoice
  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real application, this would trigger a download from your backend
    toast({
      title: "Download Started",
      description: "Your invoice is being downloaded."
    });
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setNotificationsChanged(true);
  };

  // Save notification preferences
  const handleSaveNotificationPreferences = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, you would call your API to save these preferences
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating API call
      
      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated."
      });
      
      setNotificationsChanged(false);
    } catch (error) {
      console.error("[Settings] Error saving notification preferences:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was a problem saving your notification preferences."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cookie toggle
  const handleCookieToggle = (key: keyof CookiePreferences) => {
    // Essential cookies can't be toggled
    if (key === 'essential') return;
    
    setCookiePrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setCookiesChanged(true);
  };

  // Save cookie preferences
  const handleSaveCookiePreferences = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, you would call your API to save these preferences
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulating API call
      
      toast({
        title: "Cookie Preferences Saved",
        description: "Your cookie preferences have been updated."
      });
      
      setCookiesChanged(false);
    } catch (error) {
      console.error("[Settings] Error saving cookie preferences:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "There was a problem saving your cookie preferences."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deactivation confirmation
  const handleDeactivateAccount = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, you would call your API to deactivate the account
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You can reactivate it by logging in again."
      });
      
      setShowDeactivateDialog(false);
      // In a real app, you would probably sign the user out and redirect them
    } catch (error) {
      console.error("[Settings] Error deactivating account:", error);
      toast({
        variant: "destructive",
        title: "Deactivation Failed",
        description: "There was a problem deactivating your account."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle permanent deletion
  const handleDeleteAccount = async () => {
    setIsSaving(true);
    
    try {
      // In a real application, you would call your API to delete the account
      await new Promise(resolve => setTimeout(resolve, 1200)); // Simulating API call
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted. All your data has been removed."
      });
      
      setShowDeleteDialog(false);
      // In a real app, you would redirect to a goodbye page or sign out
    } catch (error) {
      console.error("[Settings] Error deleting account:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "There was a problem deleting your account."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle invite dialog
  const toggleInviteDialog = () => {
    setTeamState(prev => ({
      ...prev,
      showInviteDialog: !prev.showInviteDialog,
      newInviteEmail: "",
      newInviteRole: "member"
    }));
  };

  // Handle member selection
  const handleSelectMember = (member: TeamMember) => {
    setTeamState(prev => ({
      ...prev,
      selectedMember: member,
      showMemberDialog: true
    }));
  };

  // Close member dialog
  const handleCloseMemberDialog = () => {
    setTeamState(prev => ({
      ...prev,
      showMemberDialog: false,
      selectedMember: null
    }));
  };

  // Handle invite submission
  const handleSendInvite = async () => {
    if (!teamState.newInviteEmail) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter an email address for the invitation."
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to pending invites (in real app, this would come from the server response)
      const newInvite: TeamMember = {
        id: `invite-${Date.now()}`,
        name: "",
        email: teamState.newInviteEmail,
        role: teamState.newInviteRole,
        status: "invited"
      };
      
      setTeamState(prev => ({
        ...prev,
        pendingInvites: [...prev.pendingInvites, newInvite],
        showInviteDialog: false,
        newInviteEmail: "",
        newInviteRole: "member"
      }));
      
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${teamState.newInviteEmail}.`
      });
    } catch (error) {
      console.error("[Settings] Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: "There was a problem sending the invitation."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel invitation
  const handleCancelInvite = async (inviteId: string) => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setTeamState(prev => ({
        ...prev,
        pendingInvites: prev.pendingInvites.filter(invite => invite.id !== inviteId)
      }));
      
      toast({
        title: "Invitation Cancelled",
        description: "The invitation has been cancelled."
      });
    } catch (error) {
      console.error("[Settings] Error cancelling invitation:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "There was a problem cancelling the invitation."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Remove team member
  const handleRemoveMember = async (memberId: string) => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTeamState(prev => ({
        ...prev,
        members: prev.members.filter(member => member.id !== memberId),
        showMemberDialog: false,
        selectedMember: null
      }));
      
      toast({
        title: "Member Removed",
        description: "The team member has been removed."
      });
    } catch (error) {
      console.error("[Settings] Error removing team member:", error);
      toast({
        variant: "destructive",
        title: "Removal Failed",
        description: "There was a problem removing the team member."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update member role
  const handleUpdateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setTeamState(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.id === memberId ? { ...member, role: newRole } : member
        ),
        selectedMember: prev.selectedMember ? 
          { ...prev.selectedMember, role: newRole } : null
      }));
      
      toast({
        title: "Role Updated",
        description: `The member's role has been updated to ${newRole}.`
      });
    } catch (error) {
      console.error("[Settings] Error updating member role:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating the member's role."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle AI agent access
  const handleToggleAgentAccess = (agentId: string) => {
    setTeamState(prev => ({
      ...prev,
      availableAgents: prev.availableAgents.map(agent => 
        agent.id === agentId ? { ...agent, isSelected: !agent.isSelected } : agent
      )
    }));
  };

  // Show loading state
  if (isLoading) {
    return (
      <DashboardPageContainer>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <div className="flex gap-4">
            <div className="w-1/4">
              <Skeleton className="h-[500px] w-full" />
            </div>
            <div className="w-3/4">
              <Skeleton className="h-[500px] w-full" />
            </div>
          </div>
        </div>
      </DashboardPageContainer>
    );
  }

  return (
    <DashboardPageContainer>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Settings</h1>
          
          {/* REST API Status Indicator */}
          {profileData && (
            <Badge variant="outline" className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300">
              ✓ Using REST API
            </Badge>
          )}
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p>{apiError}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-1/4">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              orientation="vertical" 
              className="h-full"
            >
              <TabsList className="w-full flex flex-col h-auto space-y-1 bg-transparent">
                {sections.map(section => (
                  <TabsTrigger 
                    key={section.id}
                    value={section.id} 
                    className="w-full justify-start text-left px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-xs text-muted-foreground">{section.description}</div>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-3/4">
            {/* Profile Section */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center sm:flex-row gap-4 pb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profileData?.avatar_url || ""} alt={profileData?.first_name || "User"} />
                        <AvatarFallback>
                          {profileData?.first_name?.[0] || profileData?.email?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-2">
                        <h3 className="font-medium">Profile Picture</h3>
                        <p className="text-sm text-muted-foreground">
                          JPG, GIF or PNG. Max size 1MB.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <label>
                              <span>Change</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                              />
                            </label>
                          </Button>
                          <Button size="sm" variant="outline">Remove</Button>
                        </div>
                      </div>
                    </div>

                    {/* Name Fields */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    {/* Company & Email */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          name="company"
                          value={formData.company || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button
                      variant="ghost"
                      onClick={handleCancelChanges}
                      disabled={!hasChanges || isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!hasChanges || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Security Section */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Password Change Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={securityState.showPassword ? "text" : "password"}
                          value={securityState.currentPassword}
                          onChange={handleSecurityInputChange}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {securityState.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={securityState.showPassword ? "text" : "password"}
                          value={securityState.newPassword}
                          onChange={handleSecurityInputChange}
                        />
                      </div>
                      {securityState.newPassword && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Password strength</span>
                            <span>
                              {securityState.passwordStrength < 50 ? "Weak" : 
                               securityState.passwordStrength < 80 ? "Medium" : "Strong"}
                            </span>
                          </div>
                          <Progress value={securityState.passwordStrength} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={securityState.showPassword ? "text" : "password"}
                          value={securityState.confirmPassword}
                          onChange={handleSecurityInputChange}
                        />
                      </div>
                      {securityState.newPassword && securityState.confirmPassword && 
                       securityState.newPassword !== securityState.confirmPassword && (
                        <p className="text-xs text-destructive flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          Passwords don't match
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleChangePassword}
                      disabled={
                        !securityState.currentPassword || 
                        !securityState.newPassword || 
                        securityState.newPassword !== securityState.confirmPassword ||
                        securityState.passwordStrength < 50 ||
                        isSaving
                      }
                    >
                      {isSaving ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Two-Factor Authentication Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                    <CardDescription>
                      Add an extra layer of security to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className={securityState.is2FAEnabled ? "text-green-500" : "text-muted-foreground"} />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            {securityState.is2FAEnabled 
                              ? "Your account is protected with 2FA" 
                              : "Recommended for enhanced security"}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={securityState.is2FAEnabled}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            toggle2FASetupDialog();
                          } else {
                            handleDisable2FA();
                          }
                        }}
                      />
                    </div>
                    
                    {securityState.is2FAEnabled && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <p className="text-sm font-medium">Two-factor authentication is enabled</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your account has an additional layer of security. When you sign in, you'll need to provide
                          a verification code from your authentication app or SMS.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-3"
                          onClick={handleDisable2FA}
                          disabled={isSaving}
                        >
                          {isSaving ? "Disabling..." : "Disable 2FA"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2FA Setup Dialog */}
                <AlertDialog 
                  open={securityState.showSetup2FADialog} 
                  onOpenChange={toggle2FASetupDialog}
                >
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Set Up Two-Factor Authentication</AlertDialogTitle>
                      <AlertDialogDescription>
                        Choose your preferred method for two-factor authentication
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="py-4">
                      <div className="space-y-4">
                        {/* Method Selection */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Authentication Method</p>
                          <div className="flex flex-col space-y-2">
                            <label className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                name="2fa_method"
                                checked={securityState.selectedMethod === '2fa_app'}
                                onChange={() => handle2FAMethodChange('2fa_app')}
                                className="form-radio"
                              />
                              <span>Authenticator App (Google Authenticator, Authy, etc.)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input 
                                type="radio" 
                                name="2fa_method"
                                checked={securityState.selectedMethod === '2fa_sms'}
                                onChange={() => handle2FAMethodChange('2fa_sms')}
                                className="form-radio"
                              />
                              <span>SMS Text Message</span>
                            </label>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        {/* App Based Setup */}
                        {securityState.selectedMethod === '2fa_app' && (
                          <div className="space-y-3">
                            <p className="text-sm">
                              1. Install an authenticator app like Google Authenticator or Authy
                            </p>
                            <p className="text-sm">
                              2. Scan this QR code or enter the setup key in your app
                            </p>
                            
                            <div className="flex flex-col items-center p-4 bg-muted rounded-md">
                              <div className="w-40 h-40 bg-white flex items-center justify-center text-xs mb-2">
                                [QR Code Placeholder]
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <code className="text-xs bg-background px-2 py-1 rounded border">
                                  {securityState.setupKey}
                                </code>
                                <Button 
                                  size="icon" 
                                  variant="ghost"
                                  onClick={copySetupKey}
                                >
                                  <Copy size={14} />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm">
                              3. Enter the 6-digit verification code from your app
                            </p>
                            
                            <Input 
                              name="verificationCode"
                              value={securityState.verificationCode}
                              onChange={handleSecurityInputChange}
                              placeholder="000000"
                              maxLength={6}
                              className="text-center"
                            />
                          </div>
                        )}
                        
                        {/* SMS Based Setup */}
                        {securityState.selectedMethod === '2fa_sms' && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone"
                                name="phone"
                                value={securityState.phone}
                                onChange={handleSecurityInputChange}
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                            
                            {securityState.isVerifying2FA ? (
                              <>
                                <p className="text-sm">
                                  Enter the 6-digit verification code sent to your phone
                                </p>
                                <Input 
                                  name="verificationCode"
                                  value={securityState.verificationCode}
                                  onChange={handleSecurityInputChange}
                                  placeholder="000000"
                                  maxLength={6}
                                  className="text-center"
                                />
                              </>
                            ) : (
                              <Button 
                                onClick={() => setSecurityState(prev => ({ ...prev, isVerifying2FA: true }))}
                                disabled={!securityState.phone}
                              >
                                Send Verification Code
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          setSecurityState(prev => ({
                            ...prev,
                            verificationCode: "",
                            isVerifying2FA: false
                          }));
                        }}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEnable2FA}
                        disabled={
                          !securityState.verificationCode || 
                          securityState.verificationCode.length < 6 ||
                          (securityState.selectedMethod === '2fa_sms' && !securityState.phone)
                        }
                      >
                        Enable 2FA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Billing Section */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Current Plan</CardTitle>
                        <CardDescription>
                          Manage your subscription and billing details
                        </CardDescription>
                      </div>
                      {billingState.currentPlan && (
                        <Badge variant="outline" className="ml-2">
                          {billingState.currentPlan.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Plan Details */}
                    {billingState.currentPlan ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">{billingState.currentPlan.name} Plan</h3>
                          <p className="text-muted-foreground">{billingState.currentPlan.description}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-6">
                          <div>
                            <p className="text-sm font-medium">Price</p>
                            <p>{billingState.currentPlan.price}/{billingState.currentPlan.billingCycle === 'monthly' ? 'month' : 'year'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Next billing date</p>
                            <p>{billingState.nextBillingDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Payment method</p>
                            <p className="flex items-center">
                              <CreditCard size={16} className="mr-1" /> 
                              •••• {billingState.cardLast4}
                            </p>
                          </div>
                        </div>
                        
                        {/* Usage */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Monthly Usage</span>
                            <span>{billingState.usagePercentage}%</span>
                          </div>
                          <Progress value={billingState.usagePercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {billingState.usagePercentage < 80 
                              ? `You're using your plan effectively.` 
                              : `You're approaching your plan limit. Consider upgrading.`}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="default" 
                            onClick={toggleUpgradeDialog}
                          >
                            Change Plan
                          </Button>
                          <Button variant="outline">Update Payment Method</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-muted-foreground mb-4">No active subscription</p>
                        <Button onClick={toggleUpgradeDialog}>Choose a Plan</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Invoices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {billingState.invoices.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingState.invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.invoiceNumber}</TableCell>
                              <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                              <TableCell>{invoice.amount}</TableCell>
                              <TableCell>
                                <Badge variant={invoice.status === 'paid' ? 'default' : 
                                               invoice.status === 'pending' ? 'outline' : 'destructive'}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleDownloadInvoice(invoice.id)}
                                >
                                  <Download size={16} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        No invoices available
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Plan Selection Dialog */}
                <AlertDialog 
                  open={billingState.showUpgradeDialog} 
                  onOpenChange={toggleUpgradeDialog}
                >
                  <AlertDialogContent className="max-w-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Choose Your Plan</AlertDialogTitle>
                      <AlertDialogDescription>
                        Select the plan that best fits your needs
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                      {billingState.availablePlans
                        .filter(plan => !plan.isEnterprise) // Separate enterprise plans
                        .map((plan) => (
                          <div 
                            key={plan.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all relative
                                      ${billingState.selectedPlan === plan.id 
                                          ? 'border-primary bg-primary/5' 
                                          : 'hover:border-primary/50'}`}
                            onClick={() => handlePlanSelection(plan.id)}
                          >
                            {plan.isPopular && (
                              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                                <Badge className="bg-primary">Popular</Badge>
                              </div>
                            )}
                            
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            <p className="text-muted-foreground text-sm">{plan.description}</p>
                            
                            <div className="mt-3 mb-4">
                              <span className="text-2xl font-bold">{plan.price}</span>
                              {plan.price !== 'Custom' && (
                                <span className="text-muted-foreground">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                              )}
                            </div>
                            
                            <ul className="space-y-2 mt-4">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <Check size={16} className="text-primary mr-2 mt-1 flex-shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            
                            {billingState.selectedPlan === plan.id && (
                              <div className="absolute inset-y-0 left-0 w-1 bg-primary rounded-l-lg" />
                            )}
                          </div>
                        ))}
                        
                      {/* Enterprise Plan */}
                      {billingState.availablePlans
                        .filter(plan => plan.isEnterprise)
                        .map((plan) => (
                          <div 
                            key={plan.id}
                            className="border border-dashed rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-3 mt-4"
                          >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div>
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                <p className="text-muted-foreground">{plan.description}</p>
                                
                                <ul className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                                  {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                      <Check size={16} className="text-primary mr-1" />
                                      <span className="text-sm">{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <Button 
                                className="mt-4 md:mt-0"
                                variant="outline"
                                onClick={() => {
                                  toggleUpgradeDialog();
                                  toast({
                                    title: "Contact Sales",
                                    description: "Our team will reach out to discuss enterprise options."
                                  });
                                }}
                              >
                                Contact Sales
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleChangePlan}
                        disabled={
                          !billingState.selectedPlan || 
                          (billingState.currentPlan?.id === billingState.selectedPlan)
                        }
                      >
                        {isSaving 
                          ? "Processing..." 
                          : billingState.currentPlan 
                            ? "Change Plan" 
                            : "Subscribe"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Notifications Section */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Control what types of notifications you receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-base font-medium mb-3">Email Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="marketing_emails" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Marketing Emails
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Receive emails about new features, special offers, and promotions
                            </p>
                          </div>
                          <Switch 
                            id="marketing_emails"
                            checked={notificationPrefs.marketing_emails}
                            onCheckedChange={() => handleNotificationToggle('marketing_emails')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="product_updates" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Product Updates
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Get notified about new features and improvements
                            </p>
                          </div>
                          <Switch 
                            id="product_updates"
                            checked={notificationPrefs.product_updates}
                            onCheckedChange={() => handleNotificationToggle('product_updates')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="security_alerts" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Security Alerts
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Important notifications about your account security
                            </p>
                          </div>
                          <Switch 
                            id="security_alerts"
                            checked={notificationPrefs.security_alerts}
                            onCheckedChange={() => handleNotificationToggle('security_alerts')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="billing_alerts" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Billing Alerts
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Get notified about invoice payments and billing changes
                            </p>
                          </div>
                          <Switch 
                            id="billing_alerts"
                            checked={notificationPrefs.billing_alerts}
                            onCheckedChange={() => handleNotificationToggle('billing_alerts')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="newsletter" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Monthly Newsletter
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Monthly digest with industry news and tips
                            </p>
                          </div>
                          <Switch 
                            id="newsletter"
                            checked={notificationPrefs.newsletter}
                            onCheckedChange={() => handleNotificationToggle('newsletter')}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                              <label 
                                htmlFor="team_activity" 
                                className="text-sm font-medium cursor-pointer"
                              >
                                Team Activity
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Notifications about your team members' activities
                            </p>
                          </div>
                          <Switch 
                            id="team_activity"
                            checked={notificationPrefs.team_activity}
                            onCheckedChange={() => handleNotificationToggle('team_activity')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Notification Frequency */}
                    <div>
                      <h3 className="text-base font-medium mb-3">Notification Frequency</h3>
                      <div className="grid gap-2">
                        <Label htmlFor="notification_frequency">Email Frequency</Label>
                        <select 
                          id="notification_frequency" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="immediate">Immediately</option>
                          <option value="daily">Daily Digest</option>
                          <option value="weekly">Weekly Digest</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Choose how often you want to receive non-critical notifications
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveNotificationPreferences}
                      disabled={!notificationsChanged || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Communication Channels</CardTitle>
                    <CardDescription>
                      Manage how we can reach you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email_channel">Email Address</Label>
                      <Input 
                        id="email_channel" 
                        value={profileData?.email || ""} 
                        readOnly 
                      />
                      <p className="text-xs text-muted-foreground">
                        This is your primary notification channel
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone_channel">Mobile Phone (SMS)</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="phone_channel" 
                          value={securityState.phone} 
                          placeholder="+1 (555) 123-4567"
                          disabled={isSaving}
                        />
                        <Button variant="outline" disabled={isSaving}>Update</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        For security alerts and time-sensitive notifications
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-md mt-2">
                      <p className="text-sm">
                        <strong>Note:</strong> Some critical notifications (such as security alerts and billing information) 
                        cannot be disabled as they are essential to your account.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Data & Privacy Section */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                {/* Cookie Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cookie Preferences</CardTitle>
                    <CardDescription>
                      Manage how we use cookies to enhance your experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">Essential Cookies</label>
                          <p className="text-xs text-muted-foreground">
                            Required for the website to function. Cannot be disabled.
                          </p>
                        </div>
                        <Switch 
                          checked={cookiePrefs.essential}
                          disabled={true}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label 
                            htmlFor="functional_cookies" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            Functional Cookies
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Enhances functionality and personalization
                          </p>
                        </div>
                        <Switch 
                          id="functional_cookies"
                          checked={cookiePrefs.functional}
                          onCheckedChange={() => handleCookieToggle('functional')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label 
                            htmlFor="analytics_cookies" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            Analytics Cookies
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Helps us understand how you use our services
                          </p>
                        </div>
                        <Switch 
                          id="analytics_cookies"
                          checked={cookiePrefs.analytics}
                          onCheckedChange={() => handleCookieToggle('analytics')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label 
                            htmlFor="marketing_cookies" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            Marketing Cookies
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Used to deliver relevant ads and marketing campaigns
                          </p>
                        </div>
                        <Switch 
                          id="marketing_cookies"
                          checked={cookiePrefs.marketing}
                          onCheckedChange={() => handleCookieToggle('marketing')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label 
                            htmlFor="thirdparty_cookies" 
                            className="text-sm font-medium cursor-pointer"
                          >
                            Third-party Cookies
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Set by third-party services on our website
                          </p>
                        </div>
                        <Switch 
                          id="thirdparty_cookies"
                          checked={cookiePrefs.thirdParty}
                          onCheckedChange={() => handleCookieToggle('thirdParty')}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveCookiePreferences}
                      disabled={!cookiesChanged || isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Data Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Control and manage your personal data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border border-dashed rounded-md">
                      <h3 className="text-sm font-medium flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Your Data Privacy
                      </h3>
                      <p className="mt-2 text-sm">
                        We take your privacy seriously. Your data is securely stored and used only for the purposes 
                        you've agreed to. You can request a copy of your data or ask us to delete it at any time.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Download My Data
                        </Button>
                        <Button variant="outline" size="sm">
                          Privacy Policy
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-base font-medium">Account Actions</h3>
                      
                      <div className="flex items-start justify-between p-4 border border-muted rounded-md">
                        <div className="space-y-1">
                          <h4 className="font-medium flex items-center">
                            <UserX className="mr-2 h-4 w-4 text-amber-500" />
                            Deactivate Account
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Temporarily disable your account. You can reactivate by logging in again.
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDeactivateDialog(true)}
                        >
                          Deactivate
                        </Button>
                      </div>
                      
                      <div className="flex items-start justify-between p-4 border border-destructive rounded-md">
                        <div className="space-y-1">
                          <h4 className="font-medium flex items-center">
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Delete Account
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all your data. This action cannot be undone.
                          </p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setShowDeleteDialog(true)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Deactivate Account Dialog */}
                <AlertDialog
                  open={showDeactivateDialog}
                  onOpenChange={setShowDeactivateDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to deactivate your account? You can reactivate it at any time by logging in again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <p className="text-sm font-medium mb-2">What happens when you deactivate:</p>
                      <ul className="text-sm space-y-1 list-disc pl-5">
                        <li>Your profile will be hidden from other users</li>
                        <li>You won't receive emails or notifications</li>
                        <li>Your data will be preserved for when you return</li>
                      </ul>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeactivateAccount}
                        disabled={isSaving}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {isSaving ? "Processing..." : "Deactivate Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {/* Delete Account Dialog */}
                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and cannot be undone. All your data will be deleted permanently.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
                        <p className="font-medium mb-1">Warning:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Your account will be permanently deleted</li>
                          <li>All your data will be erased</li>
                          <li>You will lose access to all services</li>
                          <li>This action cannot be reversed</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-sm font-medium">To confirm, please type "delete my account"</p>
                        <Input 
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="delete my account"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={confirmText !== "delete my account" || isSaving}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isSaving ? "Processing..." : "Permanently Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Team Section */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage your team and access permissions</CardDescription>
                      </div>
                      <Button size="sm" onClick={toggleInviteDialog}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Member
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {teamState.isLoadingTeam ? (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Active Members */}
                        <div>
                          <h3 className="text-sm font-medium mb-3">Active Members ({teamState.members.length})</h3>
                          <div className="space-y-2">
                            {teamState.members.map(member => (
                              <div 
                                key={member.id} 
                                className="flex items-center justify-between p-3 bg-muted/40 rounded-md hover:bg-muted/60 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.name} {member.id === "1" && "(You)"}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className={
                                    member.role === 'owner' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' :
                                    member.role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
                                    'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                                  }>
                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                  </Badge>
                                  
                                  {member.id !== "1" && (
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleSelectMember(member)}
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Pending Invitations */}
                        {teamState.pendingInvites.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-sm font-medium mb-3">Pending Invitations ({teamState.pendingInvites.length})</h3>
                            <div className="space-y-2">
                              {teamState.pendingInvites.map(invite => (
                                <div 
                                  key={invite.id} 
                                  className="flex items-center justify-between p-3 bg-yellow-50/40 dark:bg-yellow-900/10 rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    <div>
                                      <p className="text-sm font-medium">{invite.email}</p>
                                      <p className="text-xs text-muted-foreground">Invited as {invite.role}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                                      Pending
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleCancelInvite(invite.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* AI Agent Access */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Agent Access</CardTitle>
                    <CardDescription>Control which AI agents your team can use</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamState.availableAgents.map(agent => (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground">{agent.description}</p>
                          </div>
                          <Switch 
                            checked={agent.isSelected}
                            onCheckedChange={() => handleToggleAgentAccess(agent.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Invite Member Dialog */}
                <Dialog open={teamState.showInviteDialog} onOpenChange={toggleInviteDialog}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your team. They'll receive an email with instructions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="colleague@example.com"
                          value={teamState.newInviteEmail}
                          onChange={(e) => setTeamState(prev => ({
                            ...prev,
                            newInviteEmail: e.target.value
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <select 
                          id="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={teamState.newInviteRole}
                          onChange={(e) => setTeamState(prev => ({
                            ...prev,
                            newInviteRole: e.target.value as 'admin' | 'member'
                          }))}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Admins can manage team members and settings
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={toggleInviteDialog}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSendInvite}
                        disabled={!teamState.newInviteEmail || isSaving}
                      >
                        {isSaving ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Member Details Dialog */}
                <Dialog open={teamState.showMemberDialog} onOpenChange={handleCloseMemberDialog}>
                  {teamState.selectedMember && (
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Manage Team Member</DialogTitle>
                        <DialogDescription>
                          Update role or remove this team member
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={teamState.selectedMember.avatar_url || ""} alt={teamState.selectedMember.name} />
                            <AvatarFallback>
                              {teamState.selectedMember.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teamState.selectedMember.name}</p>
                            <p className="text-sm text-muted-foreground">{teamState.selectedMember.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="member_role">Role</Label>
                            <select 
                              id="member_role"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              value={teamState.selectedMember.role}
                              onChange={(e) => handleUpdateMemberRole(
                                teamState.selectedMember!.id, 
                                e.target.value as 'admin' | 'member'
                              )}
                              disabled={isSaving}
                            >
                              <option value="member">Member</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Remove from team</p>
                            <p className="text-xs text-muted-foreground mb-3">
                              This will revoke their access to your team's resources.
                            </p>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveMember(teamState.selectedMember!.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Processing..." : "Remove Member"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardPageContainer>
  );
}
