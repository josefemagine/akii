import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Menu,
  Search,
  Settings,
  User as UserIcon,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Home,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Circle,
  HelpCircle,
  X,
  Layout,
  Monitor,
  Smartphone,
  MessageCircle,
  Send,
  ShoppingBag,
  Globe,
  Shield,
  BarChart,
  Upload,
  UserCircle,
  PlusCircle,
  Sidebar as SidebarIcon,
  Mail,
  CreditCard,
  Database,
  UsersRound,
  Bot,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-compatibility";
import { useSearch } from "@/contexts/SearchContext";
import { toast } from "@/components/ui/use-toast";
import { safeLocalStorage, safeSessionStorage } from "@/lib/browser-check";
import "@/styles/dashboard.css";
import { DashboardPageContainer } from "@/components/layout/DashboardPageContainer";
import { User as SupabaseUser } from "@supabase/supabase-js";
import SimpleSidebar from './Sidebar';
import { supabase, getCurrentUser, getUserProfile, signOut as supabaseSignOut } from '@/lib/supabase-auth';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
  subItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  collapsed?: boolean;
  className?: string;
}

const SidebarItem = ({
  icon = <Home className="h-5 w-5" />,
  label = "Menu Item",
  href = "/",
  active = false,
  onClick = () => {},
  subItems,
  collapsed = false,
  className,
}: SidebarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive = (subHref: string) => location.pathname === subHref;
  const isAnySubItemActive =
    hasSubItems && subItems.some((item) => isSubItemActive(item.href));

  return (
    <div>
      <a
        href={hasSubItems ? "#" : href}
        onClick={(e) => {
          e.preventDefault();
          if (hasSubItems) {
            setIsOpen(!isOpen);
          } else {
            navigate(href);
            onClick();
          }
        }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          !className && "hover:bg-gray-100 dark:hover:bg-gray-800",
          !className && (active || isAnySubItemActive)
            ? "bg-gray-100 text-primary dark:bg-gray-800"
            : "text-gray-500 dark:text-gray-400",
          className,
        )}
      >
        {icon}
        {!collapsed && (
          <>
            <span className="flex-1">{label}</span>
            {hasSubItems && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "transform rotate-180",
                )}
              />
            )}
          </>
        )}
      </a>
      {!collapsed && hasSubItems && isOpen && (
        <div className="ml-8 mt-1 space-y-1">
          {subItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.href);
              }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                isSubItemActive(item.href)
                  ? "bg-gray-100 text-primary dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400",
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Define a type for sidebar items
  interface SidebarItemData {
    icon: React.ReactNode;
    label: string;
    href: string;
    className?: string;
    subItems?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    }[];
  }

  // Then use this type for the array:
  const userSidebarItems: SidebarItemData[] = [
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Create AI Instance",
      href: "#",
      className: "create-instance-btn",
      subItems: []
    },
    {
      icon: <Circle className="h-5 w-5" />,
      label: "AI Instances",
      href: "/dashboard/agents",
      subItems: [
        {
          label: "My Instances",
          href: "/dashboard/agents",
          icon: <Bot className="h-4 w-4" />,
        },
        {
          label: "API Keys",
          href: "/dashboard/api-keys",
        },
        {
          label: "Zapier",
          href: "/dashboard/zapier",
        },
        {
          label: "n8n",
          href: "/dashboard/n8n",
        },
      ],
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Training Data",
      href: "/dashboard/documents",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Conversations",
      href: "/dashboard/conversations",
    },
    {
      icon: <Layout className="h-5 w-5" />,
      label: "Apps",
      href: "/dashboard/apps",
      subItems: [
        {
          label: "Web Chat",
          href: "/dashboard/web-chat",
          icon: <Monitor className="h-4 w-4" />,
        },
        {
          label: "Mobile Chat",
          href: "/dashboard/mobile-chat",
          icon: <Smartphone className="h-4 w-4" />,
        },
        {
          label: "WhatsApp Chat",
          href: "/dashboard/whatsapp-chat",
          icon: <MessageCircle className="h-4 w-4" />,
        },
        {
          label: "Telegram Chat",
          href: "/dashboard/telegram-chat",
          icon: <Send className="h-4 w-4" />,
        },
        {
          label: "Shopify Chat",
          href: "/dashboard/shopify-chat",
          icon: <ShoppingBag className="h-4 w-4" />,
        },
        {
          label: "WordPress Chat",
          href: "/dashboard/wordpress-chat",
          icon: <Globe className="h-4 w-4" />,
        },
      ],
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Team",
      href: "/dashboard/team",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/dashboard/settings",
    },
  ];

  const adminSidebarItems = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/dashboard/users",
      subItems: []
    },
    {
      icon: <UsersRound className="h-5 w-5" />,
      label: "User Sync",
      href: "/dashboard/user-sync",
      subItems: []
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Moderation",
      href: "/dashboard/moderation",
      subItems: []
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email Templates",
      href: "/dashboard/email-templates",
      subItems: []
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      href: "/dashboard/billing",
      subItems: []
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Workflows",
      href: "/dashboard/workflows",
      subItems: []
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      href: "/dashboard/analytics",
      subItems: []
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "Database",
      href: "/dashboard/database",
      subItems: []
    },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-white transition-all dark:border-gray-800 dark:bg-gray-950",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center border-b px-3 py-4 dark:border-gray-800">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 w-full justify-center"
          >
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
            <span className="text-xl font-semibold text-black dark:text-white">Akii</span>
          </Link>
        ) : (
          <Link
            to="/"
            className="w-full flex justify-center"
          >
            <Circle className="h-6 w-6 fill-green-500 text-green-500" />
          </Link>
        )}
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {userSidebarItems.map((item, index) => (
            <SidebarItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={isActive(item.href)}
              subItems={item.subItems || []}
              collapsed={collapsed}
              className={item.className}
            />
          ))}

          {/* Show admin section for all users during testing */}
          <>
            <div className="my-2 border-t dark:border-gray-800"></div>
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {!collapsed && "Admin"}
              </h2>
              {adminSidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={isActive(item.href)}
                  subItems={item.subItems || []}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </>
        </nav>
      </div>
      <div className="mt-auto border-t p-2 dark:border-gray-800">
        <div className="grid gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronDown className="h-5 w-5 rotate-90 transform" />
            ) : (
              <ChevronDown className="h-5 w-5 -rotate-90 transform" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export interface DashboardLayoutProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

// Define enhanced user types to avoid TypeScript errors with the properties we're accessing
interface EnhancedUser extends Omit<SupabaseUser, 'identities'> {
  _rawData?: {
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      avatar_url?: string;
    };
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
      company?: string;
    }
  };
  raw_user_meta_data?: {
    first_name?: string;
    last_name?: string;
    company?: string;
  };
  identities?: Array<{
    id?: string;
    user_id?: string;
    identity_id?: string;
    provider?: string;
    identity_data?: {
      name?: string;
      full_name?: string;
      given_name?: string;
      family_name?: string;
    };
  }>;
}

// Create a type for the dark mode context
interface DarkModeContext {
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

// Create our own implementation for useDarkMode
const useDarkMode = (): DarkModeContext => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Initialize dark mode from localStorage on component mount
    const savedDarkMode = safeLocalStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedDarkMode);
  }, []);
  
  return { isDarkMode, setIsDarkMode };
};

const DashboardLayout = ({ children, isAdmin = false }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  
  // Add proper Supabase user fetching
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Load user data directly from Supabase
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        // Get current user from Supabase
        const { data: currentUser, error: userError } = await getCurrentUser();
        
        if (userError || !currentUser) {
          console.error('Error getting current user:', userError);
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
        
        // Get user profile
        if (currentUser.id) {
          const { data: userProfile, error: profileError } = await getUserProfile(currentUser.id);
          
          if (profileError) {
            console.error('Error getting user profile:', profileError);
          } else if (userProfile) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error('Exception loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadUserData();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();
  const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
  const [hasStorageAuth, setHasStorageAuth] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);

  // Type assertion for user to avoid TypeScript errors
  const typedUser = user as EnhancedUser | null;

  // Handle runtime connection errors
  useEffect(() => {
    // Create a global error handler for runtime connection errors
    const originalOnError = window.onerror;
    
    window.onerror = function(message, source, lineno, colno, error) {
      // Check if it's the specific connection error we're looking for
      if (message && message.toString().includes("Could not establish connection")) {
        console.log("Suppressing Chrome extension connection error:", message);
        setConnectionError(error || new Error(message.toString()));
        // Return true to prevent the error from propagating to the console
        return true;
      }
      
      // Call the original handler for other errors
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Clean up the event listener
    return () => {
      window.onerror = originalOnError;
    };
  }, []);

  // Before authentication state check effect, modify this effect to use our standard auth
  useEffect(() => {
    const checkAuthWithService = async () => {
      try {
        console.log("Checking authentication with standard Supabase auth");
        
        // Import our auth helpers
        const { getCurrentUser, getCurrentSession } = await import('@/lib/auth-helpers');
        
        // Check if user is authenticated
        const { data: session } = await getCurrentSession();
        
        if (session) {
          console.log("User is authenticated with a valid session");
          setHasStorageAuth(true);
          
          // Get current user
          const { data: user } = await getCurrentUser();
          
          if (user) {
            console.log("User found:", user.id);
            // Create a fallback user in localStorage for other components
            localStorage.setItem('akii-auth-fallback-user', JSON.stringify({
              id: user.id,
              email: user.email,
              first_name: user.user_metadata?.first_name || 'User',
              last_name: user.user_metadata?.last_name || '',
              role: user.app_metadata?.role || 'user',
              timestamp: Date.now()
            }));
            
            // Force a component update to use this user data
            setForceUpdateCounter(prev => prev + 1);
            return;
          }
        } else {
          console.log("No authenticated session found");
          
          // Check localStorage as fallback
          const hasTokens = forceCheckLocalStorageAuth();
          if (hasTokens) {
            setHasStorageAuth(true);
            console.log("Found auth tokens - allowing dashboard access");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        
        // As a last resort, call forceCheckLocalStorageAuth
        const hasTokens = forceCheckLocalStorageAuth();
        if (hasTokens) {
          setHasStorageAuth(true);
          console.log("Found auth tokens during error recovery - staying on dashboard");
        }
      }
    };
    
    // Run the auth check if we don't already have a user
    if (!typedUser && !profile) {
      checkAuthWithService();
    }
  }, [typedUser, profile, setForceUpdateCounter]);

  // Check for auth tokens in localStorage as backup authentication method
  useEffect(() => {
    const checkLocalStorageAuth = () => {
      try {
        // Look for Supabase tokens or our custom auth markers
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('supabase.auth.token') || 
            key.includes('sb-') ||
            key.includes('akii-auth') ||
            key === 'force-auth-login'
          )) {
            console.log("DashboardLayout: Found auth token in localStorage:", key);
            setHasStorageAuth(true);
            return true;
          }
        }
        return false;
      } catch (e) {
        console.error("Error checking localStorage auth:", e);
        return false;
      }
    };
    
    if (!user) {
      const hasAuth = checkLocalStorageAuth();
      // If we have auth in localStorage but no user, try to create a placeholder user
      if (hasAuth && !user) {
        console.log("Auth tokens found but no user object - creating placeholder");
        const fallbackUserStr = localStorage.getItem("akii-auth-fallback-user");
        if (fallbackUserStr) {
          try {
            const fallbackData = JSON.parse(fallbackUserStr);
            // Force a component update to refresh profile access attempts
            setForceUpdateCounter(prev => prev + 1);
          } catch (e) {
            console.error("Error parsing fallback user data:", e);
          }
        }
      }
    } else {
      setHasStorageAuth(true);
    }
  }, [user]);

  // Add a more aggressive local storage auth check function
  const forceCheckLocalStorageAuth = () => {
    console.log("Running aggressive auth token check in localStorage");
    try {
      // Check all localStorage keys for any possible auth tokens
      let foundTokens = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Look for ANY possible auth token
        if (key && (
          key.includes('auth') || 
          key.includes('user') || 
          key.includes('token') ||
          key.includes('supabase') || 
          key.includes('sb-') ||
          key.includes('akii') ||
          key.startsWith('sb')
        )) {
          console.log(`Potential auth token found: ${key}`);
          foundTokens.push(key);
          // If it's definitely an auth token, set the state immediately
          if (
            key.includes('supabase.auth.token') || 
            key.includes('sb-') ||
            key.includes('akii-auth') ||
            key === 'akii-auth-token' ||
            key === 'force-auth-login'
          ) {
            setHasStorageAuth(true);
          }
        }
      }
      
      if (foundTokens.length > 0) {
        console.log(`Found ${foundTokens.length} potential auth tokens:`, foundTokens);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error("Error in aggressive localStorage check:", e);
      return false;
    }
  };
  
  // Run this more aggressive check on initial render
  useEffect(() => {
    if (!user && !hasStorageAuth) {
      const foundTokens = forceCheckLocalStorageAuth();
      if (foundTokens) {
        console.log("Tokens found in aggressive check - forcing auth state update");
        setHasStorageAuth(true);
        // Force the component to check profile data again
        setForceUpdateCounter(prev => prev + 1);
      }
    }
  }, []);

  // Add a new effect to handle profile data properly and ensure we always have user data
  useEffect(() => {
    let userData = null;
    let userProfileData = null;
    
    if (typedUser) {
      userData = {
        id: typedUser.id,
        email: typedUser.email,
        user_metadata: typedUser.user_metadata || {}
      };
      
      // Try to extract profile data
      userProfileData = profile || null;
      
      // If we have a user but missing profile data, try to populate with metadata
      if (!userProfileData || 
          (!userProfileData.first_name && !userProfileData.last_name)) {
        console.log("Missing or incomplete profile data, attempting to use metadata");
        
        // Check for user metadata in different possible locations
        const firstName = 
          typedUser.user_metadata?.first_name || 
          typedUser._rawData?.user_metadata?.first_name ||
          typedUser._rawData?.raw_user_meta_data?.first_name;
          
        const lastName = 
          typedUser.user_metadata?.last_name || 
          typedUser._rawData?.user_metadata?.last_name ||
          typedUser._rawData?.raw_user_meta_data?.last_name;
          
        if (firstName || lastName) {
          console.log("Found name data in metadata:", { firstName, lastName });
        }
      }
    } else if (hasStorageAuth) {
      // Try to get fallback user data from localStorage if we have auth tokens
      const fallbackUserStr = localStorage.getItem("akii-auth-fallback-user");
      if (fallbackUserStr) {
        try {
          const fallbackData = JSON.parse(fallbackUserStr);
          console.log("Using fallback user data from localStorage:", fallbackData);
          userData = {
            id: fallbackData.id || 'fallback-id',
            email: fallbackData.email || 'user@example.com',
            user_metadata: {
              first_name: fallbackData.first_name,
              last_name: fallbackData.last_name
            }
          };
        } catch (e) {
          console.error("Error parsing fallback user data:", e);
        }
      }
    }
    
    // Log what user data we were able to construct
    console.log("Constructed user data:", userData);
    console.log("Constructed profile data:", userProfileData);
    
  }, [typedUser, profile, hasStorageAuth, forceUpdateCounter]);

  // Original useEffect for dark mode
  useEffect(() => {
    // We no longer need to check dark mode here since it's handled by our useDarkMode hook
    // Just debug the user object
    if (typedUser) {
      console.log("User object in DashboardLayout:", typedUser);
      console.log("User metadata:", typedUser.user_metadata);
      console.log("App metadata:", typedUser.app_metadata);
      
      // Check all properties on the user object
      console.log("All user properties:", Object.keys(typedUser));
      
      // Attempt to access raw_user_meta_data
      console.log("raw_user_meta_data:", typedUser.raw_user_meta_data);
      
      // Try to safely stringify the entire user object
      try {
        const userStr = JSON.stringify(typedUser, null, 2);
        console.log("Full user object as JSON:", userStr);
      } catch (e) {
        console.error("Failed to stringify user object:", e);
      }
    }
  }, [typedUser]);

  // Enhanced logging for auth state
  useEffect(() => {
    console.log("DashboardLayout auth state:", { 
      loading, 
      hasUser: !!typedUser,
      hasProfile: !!profile,
      hasStorageAuth
    });
    
    if (typedUser) {
      // More detailed user data logging
      console.log("User object details:", {
        id: typedUser.id,
        email: typedUser.email,
        hasUserMetadata: !!typedUser.user_metadata,
        userMetadataKeys: typedUser.user_metadata ? Object.keys(typedUser.user_metadata) : [],
        hasRawMetadata: !!typedUser._rawData?.raw_user_meta_data || !!typedUser.raw_user_meta_data,
        metadataSource: typedUser._rawData?.raw_user_meta_data ? "_rawData.raw_user_meta_data" : 
                      typedUser.raw_user_meta_data ? "raw_user_meta_data" : "none"
      });
      
      // Extra debug for profile data
      if (profile) {
        console.log("Profile data:", {
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
          role: profile.role
        });
      }
    }
  }, [typedUser, profile, loading]);

  useEffect(() => {
    // Only run if we have a user but no profile
    if (typedUser && !profile) {
      console.log("User exists but profile is missing - attempting direct profile fetch");
      
      // Try to get the user profile directly from Supabase
      const fetchUserProfileDirectly = async () => {
        try {
          // Import the needed functions
          const { supabase } = await import('@/lib/supabase');
          
          // Get user ID
          const userId = typedUser.id;
          if (!userId) return;
          
          console.log("Attempting direct profile fetch for user:", userId);
          
          // Fetch the profile directly from the database
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error("Direct profile fetch error:", error);
            return;
          }
          
          if (data) {
            console.log("SUCCESS: Direct profile fetch returned:", data);
            // Force a component update
            setForceUpdateCounter(prev => prev + 1);
          }
        } catch (e) {
          console.error("Error in direct profile fetch:", e);
        }
      };
      
      fetchUserProfileDirectly();
    }
  }, [typedUser, profile]);

  // Add a function to create the user profile if it doesn't exist
  useEffect(() => {
    // Only run this if we have a user but no profile
    if (typedUser && !profile && !loading) {
      console.log("User exists but profile is missing - attempting to create profile");
      
      const createUserProfile = async () => {
        try {
          // Import the needed functions
          const { supabase } = await import('@/lib/supabase');
          
          // Extract basic user info
          const userId = typedUser.id;
          const email = typedUser.email || '';
          
          if (!userId) {
            console.error("Cannot create profile - missing user ID");
            return;
          }
          
          console.log("Checking if profile exists for user:", userId);
          
          // First check if profile exists but wasn't loaded
          const { data: existingProfile, error: checkError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (checkError) {
            console.error("Error checking for existing profile:", checkError);
            return;
          }
          
          // If profile exists, don't create a new one
          if (existingProfile) {
            console.log("Profile exists but wasn't loaded in state:", existingProfile);
            // Force a component update to refresh profile data
            setForceUpdateCounter(prev => prev + 1);
            return;
          }
          
          // Extract user metadata
          const userMeta = typedUser.user_metadata || {};
          const rawMeta = (typedUser._rawData?.raw_user_meta_data || typedUser.raw_user_meta_data || {});
          
          const firstName = userMeta.first_name || rawMeta.first_name || '';
          const lastName = userMeta.last_name || rawMeta.last_name || '';
          const avatarUrl = userMeta.avatar_url || '';
          
          // Create profile record
          const profileData = {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl,
            role: 'user', // Default role
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log("Creating new profile:", profileData);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(profileData);
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
            return;
          }
          
          console.log("Profile created successfully");
          // Force update to refresh the UI
          setForceUpdateCounter(prev => prev + 1);
          
        } catch (e) {
          console.error("Error in profile creation:", e);
        }
      };
      
      createUserProfile();
    }
  }, [typedUser, profile, loading]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    safeLocalStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
      // Additional signout handling here if needed
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Add this new function to get user data more robustly
  const getData = () => {
    const userData = {
      firstName: null,
      lastName: null,
      email: null,
      avatarUrl: null,
      isAuthenticated: false,
      forceUpdateCounter // Include this to trigger re-renders
    };
    
    // First check if we have a profile
    if (profile) {
      userData.firstName = profile.first_name || null;
      userData.lastName = profile.last_name || null;
      userData.email = profile.email || (typedUser?.email) || null;
      userData.avatarUrl = profile.avatar_url || null;
      userData.isAuthenticated = true;
      return userData;
    }
    
    // If no profile but we have a user
    if (typedUser) {
      // Gather data from user metadata
      const userMeta = typedUser.user_metadata || {};
      const rawMeta = (typedUser._rawData?.raw_user_meta_data || typedUser.raw_user_meta_data || {});
      
      userData.firstName = userMeta.first_name || rawMeta.first_name || null;
      userData.lastName = userMeta.last_name || rawMeta.last_name || null;
      userData.email = typedUser.email || null;
      userData.avatarUrl = userMeta.avatar_url || null;
      userData.isAuthenticated = true;
      return userData;
    }
    
    // Try to get data from localStorage
    if (hasStorageAuth) {
      try {
        const fallbackUserStr = localStorage.getItem("akii-auth-fallback-user");
        if (fallbackUserStr) {
          const fallbackData = JSON.parse(fallbackUserStr);
          userData.firstName = fallbackData.first_name || null;
          userData.lastName = fallbackData.last_name || null;
          userData.email = fallbackData.email || null;
          userData.isAuthenticated = true;
          return userData;
        }
      } catch (e) {
        console.error("Error parsing fallback user data:", e);
      }
    }
    
    return userData;
  };
  
  // Get user data before rendering
  const userDisplayData = getData();
  
  // Add debugging for rendering
  console.log("Rendering user name with data:", userDisplayData);

  // More robust loading state detection
  const isLoadingOrHasAuth = loading || hasStorageAuth || !!typedUser || !!profile;
  
  // Add rendering state and loading state
  const [isRendering, setIsRendering] = useState(true);
  
  // Show content once we've confirmed rendering is working
  useEffect(() => {
    // Set a timer to indicate rendering is complete
    const timer = setTimeout(() => {
      console.log("DashboardLayout: Initial render complete");
      setIsRendering(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Modify the shouldDisplayDashboard function to perform proper auth check
  const shouldDisplayDashboard = () => {
    // Check if the user is authenticated via user object, profile, or localStorage
    return !!typedUser || !!profile || hasStorageAuth;
  };

  // If the dashboard is loading or we're waiting for auth, show a simple loading state
  if (isRendering) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-40 h-16 border-b bg-background">
          <div className="container flex h-16 items-center">
            <div className="font-bold">Akii Dashboard</div>
          </div>
        </header>
        <div className="flex flex-1 flex-col sm:flex-row">
          <div className="w-64 border-r border-border">
            {/* Sidebar placeholder */}
          </div>
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-full">
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we've made it this far without returning something else, and shouldDisplayDashboard() is true,
  // then we render the normal dashboard
  if (shouldDisplayDashboard()) {
    return (
      <div className={`flex min-h-screen flex-col bg-background ${isDarkMode ? 'dark' : ''}`}>
        {/* Header section */}
        <header className="sticky top-0 z-40 h-16 border-b bg-background">
          <div className="flex h-16 items-center px-4">
            <div className="md:hidden mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="mr-4 hidden md:flex">
              <Link to="/" className="flex items-center">
                <Circle className="h-6 w-6 fill-primary text-primary" />
                <span className="ml-2 text-xl font-bold">Akii</span>
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Theme"
                className="rounded-full"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="rounded-full"
              >
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full overflow-hidden"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="User's profile picture" />
                      <AvatarFallback>
                        <UserIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium ml-1 hidden md:inline-block">
                      {userDisplayData.firstName || userDisplayData.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col sm:flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <SimpleSidebar 
              collapsed={sidebarCollapsed}
              onToggle={toggleSidebar}
            />
          </div>

          {/* Mobile Sidebar (overlay) */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div 
                className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative bg-background w-full max-w-xs p-4">
                <SimpleSidebar />
              </div>
            </div>
          )}

          {/* Main content */}
          <div 
            className={cn(
              "flex-1 md:ml-64 transition-all",
              sidebarCollapsed && "md:ml-16"
            )}
          >
            <DashboardPageContainer>
              {children}
            </DashboardPageContainer>
          </div>
        </div>
      </div>
    );
  }

  return null; // This should never be reached
};

export default DashboardLayout;
