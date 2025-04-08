import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/UnifiedAuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminCheck() {
  // Add a state to catch any errors during rendering
  const [renderError, setRenderError] = useState<string | null>(null);

  // Wrap everything in a try-catch to debug rendering issues
  try {
    const { user, profile, isAdmin } = useAuth();
    const [email, setEmail] = useState("josef@holm.com");
    const [message, setMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<any>(null);

    const checkUserRole = async () => {
      if (!email) return;
      setLoading(true);
      setMessage(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email as string)
          .single();

        if (error) {
          setMessage({ type: "error", text: `Error: ${error.message}` });
          return;
        }

        setProfileData(data);
        setMessage({
          type: "success",
          text: `User found: ${data?.email || email} with role: ${data?.role || "none"}`,
        });
      } catch (err) {
        setMessage({
          type: "error",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      } finally {
        setLoading(false);
      }
    };

    const grantAdminRole = async () => {
      if (!profileData) {
        await checkUserRole();
        if (!profileData) return;
      }

      setLoading(true);
      setMessage(null);

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role: "admin", status: "active" } as any)
          .eq("id", profileData.id);

        if (error) {
          setMessage({
            type: "error",
            text: `Error updating role: ${error.message}`,
          });
          return;
        }

        setMessage({
          type: "success",
          text: `Role updated to admin for ${email}. Please log out and log back in.`,
        });

        // Update the profile data
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email as string)
          .single();

        if (data) {
          setProfileData(data);
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: `Error: ${err instanceof Error ? err.message : String(err)}`,
        });
      } finally {
        setLoading(false);
      }
    };

    // Log current auth status to help debug
    useEffect(() => {
      console.log("AdminCheck mounting with auth:", {
        user: user?.email || "not logged in",
        role: profile?.role || "none",
        isAdmin,
      });
    }, [user, profile, isAdmin]);

    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Checker</CardTitle>
            <CardDescription>Check and fix admin access issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Current User Status</h3>
                <div className="text-sm">
                  <p>
                    <strong>Email:</strong> {user?.email || "Not logged in"}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile?.role || "None"}
                  </p>
                  <p>
                    <strong>Admin Access:</strong> {isAdmin ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Check User Role</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                    />
                    <Button onClick={checkUserRole} disabled={loading}>
                      {loading ? "Checking..." : "Check"}
                    </Button>
                  </div>
                </div>

                {profileData && (
                  <div className="space-y-2">
                    <h4 className="font-medium">User Profile:</h4>
                    <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(profileData, null, 2)}
                    </pre>

                    <Button
                      onClick={grantAdminRole}
                      disabled={loading || profileData?.role === "admin"}
                      className="mt-2"
                    >
                      {loading ? "Updating..." : "Grant Admin Access"}
                    </Button>
                  </div>
                )}

                {message && (
                  <Alert
                    variant={
                      message.type === "error" ? "destructive" : "default"
                    }
                  >
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    // If any error occurs during rendering, show a helpful message
    const errorMessage = error instanceof Error ? error.message : String(error);
    useEffect(() => {
      console.error("AdminCheck rendering error:", error);
      setRenderError(errorMessage);
    }, [errorMessage]);

    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Admin Check</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Error rendering component: {renderError || errorMessage}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <p>Please check the browser console for more details.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
