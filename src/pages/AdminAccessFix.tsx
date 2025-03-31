import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminAccessFix() {
  const [email, setEmail] = useState("josef@holm.com");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"info" | "success" | "error">("info");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [supabaseInfo, setSupabaseInfo] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || "Not set",
    keyAvailable: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        setMessage("Testing Supabase connection...");
        setStatus("info");

        // Try a simple query
        const { data, error } = await supabase
          .from("profiles")
          .select("count")
          .limit(1);

        if (error) {
          setMessage(`Supabase error: ${error.message}`);
          setStatus("error");
        } else {
          setMessage(
            `Supabase connected successfully. Found ${JSON.stringify(data)} results.`,
          );
          setStatus("success");
        }
      } catch (err) {
        setMessage(
          `Connection error: ${err instanceof Error ? err.message : String(err)}`,
        );
        setStatus("error");
      }
    };

    testConnection();
  }, []);

  const createAdminUser = async () => {
    if (!email) return;

    setLoading(true);
    setMessage("Creating admin user...");
    setStatus("info");

    try {
      // First check if the user already exists
      const { data: existingUsers, error: queryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email as any);

      if (queryError) {
        setMessage(`Query error: ${queryError.message}`);
        setStatus("error");
        setLoading(false);
        return;
      }

      // Generate a unique ID if user doesn't exist
      const userId = crypto.randomUUID();
      const timestamp = new Date().toISOString();

      if (existingUsers && existingUsers.length > 0) {
        // User exists, update role to admin
        const user = existingUsers[0];
        setMessage(`Found existing user: ${JSON.stringify(user)}`);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: "admin", updated_at: timestamp } as any)
          .eq("id", (user as any).id);

        if (updateError) {
          setMessage(`Error updating role: ${updateError.message}`);
          setStatus("error");
        } else {
          setMessage(
            `Successfully updated ${email} to admin role. Please sign out and sign in again.`,
          );
          setStatus("success");
        }
      } else {
        // User doesn't exist, create new admin user
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: userId,
            email: email,
            role: "admin",
            status: "active",
            first_name: null,
            last_name: null,
            created_at: timestamp,
            updated_at: timestamp,
          } as any,
        ]);

        if (insertError) {
          setMessage(`Error creating user: ${insertError.message}`);
          setStatus("error");
        } else {
          setMessage(
            `Created new admin user ${email}. You can now sign up with this email address.`,
          );
          setStatus("success");
        }
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const listAllTables = async () => {
    try {
      setMessage("Listing available tables...");
      setStatus("info");

      const { data, error } = await supabase
        .from("pg_catalog.pg_tables")
        .select("tablename")
        .eq("schemaname", "public" as any);

      if (error) {
        setMessage(`Error listing tables: ${error.message}`);
        setStatus("error");
      } else {
        setMessage(`Available tables: ${JSON.stringify(data)}`);
        setStatus("success");
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  };

  const listUsers = async () => {
    try {
      setMessage("Listing all users...");
      setStatus("info");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .limit(10);

      if (error) {
        setMessage(`Error listing users: ${error.message}`);
        setStatus("error");
      } else if (data.length === 0) {
        setMessage("No users found in the profiles table.");
        setStatus("info");
      } else {
        setMessage(`Users found: ${JSON.stringify(data)}`);
        setStatus("success");
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  };

  const forceJosefAdmin = async () => {
    setLoading(true);
    setMessage("Setting Josef as admin with special privileges...");
    setStatus("info");

    try {
      const josefEmail = "josef@holm.com";

      // Set admin override for 30 days
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Set in both localStorage and sessionStorage for maximum compatibility
      localStorage.setItem("akii_admin_override", "true");
      localStorage.setItem("akii_admin_override_email", josefEmail);
      localStorage.setItem("akii_admin_override_expiry", expiry.toISOString());

      sessionStorage.setItem("akii_admin_override", "true");
      sessionStorage.setItem("akii_admin_override_email", josefEmail);
      sessionStorage.setItem(
        "akii_admin_override_expiry",
        expiry.toISOString(),
      );

      // Legacy support
      localStorage.setItem("admin_override", "true");
      localStorage.setItem("admin_override_email", josefEmail);
      localStorage.setItem("admin_override_time", Date.now().toString());

      sessionStorage.setItem("admin_override", "true");
      sessionStorage.setItem("admin_override_email", josefEmail);
      sessionStorage.setItem("admin_override_time", Date.now().toString());

      // Additional admin flags
      localStorage.setItem("auth-user-role", "admin");
      localStorage.setItem("user-role", "admin");
      localStorage.setItem("akii-auth-role", "admin");
      localStorage.setItem("akii-auth-robust-email", josefEmail);
      localStorage.setItem("akii-auth-robust-time", Date.now().toString());
      localStorage.setItem("akii-auth-success", "true");

      setMessage(
        "Josef has been set as admin through multiple storage methods. Refreshing auth context...",
      );
      setStatus("success");

      // Refresh user to update auth context
      await refreshUser();

      // Update message after refresh
      setMessage(
        "Admin access granted to Josef. You can now access the admin dashboard.",
      );
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error: " + ((error as Error).message || "Unknown error"));
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const goToAdmin = () => {
    navigate("/admin");
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Fix</CardTitle>
          <CardDescription>
            Direct tool to grant admin access (no auth required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="font-medium">Supabase Config:</p>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              URL: {supabaseInfo.url}
              <br />
              Key available: {supabaseInfo.keyAvailable ? "Yes" : "No"}
            </pre>
          </div>

          <div className="mb-4">
            <p className="font-medium">Status:</p>
            <div
              className={`p-2 rounded ${
                status === "success"
                  ? "bg-green-100 text-green-800"
                  : status === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {message}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-email">Email to grant admin access:</Label>
              <Input
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="mt-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={createAdminUser} disabled={loading}>
                {loading ? "Processing..." : "Create/Update Admin User"}
              </Button>

              <Button onClick={listUsers} variant="outline" disabled={loading}>
                List Users
              </Button>

              <Button
                onClick={listAllTables}
                variant="outline"
                disabled={loading}
              >
                List Tables
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-purple-50 border-t border-purple-200">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Special Josef Admin Access
            </h3>
            <p className="text-sm text-purple-700 mb-4">
              This will forcefully set josef@holm.com as an admin through
              multiple methods, bypassing all normal verification checks.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={forceJosefAdmin}
                disabled={loading}
                className="bg-purple-700 hover:bg-purple-800"
              >
                {loading ? "Processing..." : "Force Josef as Admin"}
              </Button>
              <Button
                onClick={goToAdmin}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
