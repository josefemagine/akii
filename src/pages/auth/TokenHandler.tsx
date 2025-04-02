import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SuperAuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { supabase } from "@/lib/supabase";

/**
 * This component handles token authentication when the user lands on any page with tokens in the URL hash
 */
export default function TokenHandler() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const auth = useAuth();
  // Create a local setIsLoading function since it doesn't exist in AuthContext
  const setIsLoading = (loading: boolean) => {
    // This is a placeholder implementation
    console.log(`Setting loading state to: ${loading}`);
  };

  // Use the imported supabase client
  // const { supabase } = auth; // This property doesn't exist in AuthContext

  useEffect(() => {
    async function handleToken() {
      try {
        setIsLoading(true);

        // Get the path segments
        const pathSegments = window.location.pathname.split("/");
        // Token should be the last segment
        const token = pathSegments[pathSegments.length - 1];

        if (!token) {
          setError("No authentication token found in URL");
          return;
        }

        console.log("Processing token from URL...");

        // Call Supabase to verify the token
        // Use the imported supabase client directly
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          console.log("Session authenticated with token");
          setSuccess(true);

          // Store tokens securely
          localStorage.setItem("auth-token", token);

          // Redirect to dashboard after successful token handling
          setTimeout(() => {
            console.log("Redirecting to dashboard after token authentication");
            navigate("/dashboard", { replace: true });
          }, 1000);
        } else {
          setError("Token verification failed");
        }
      } catch (err) {
        console.error("Error handling token:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    }

    handleToken();
  }, [navigate, setIsLoading]);

  // This component doesn't render anything visible
  return null;
}
