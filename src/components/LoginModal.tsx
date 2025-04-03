const onSubmit = async (data: LoginFormValues) => {
  setIsLoading(true);
  setError(null);

  try {
    console.log("LoginModal: Starting email sign-in process");

    // Try to close the modal BEFORE the signIn attempt
    // This ensures the modal won't block the redirect
    onClose();

    // Set a flag in localStorage to indicate we're in the middle of login
    localStorage.setItem("akii-login-in-progress", "true");
    localStorage.setItem("akii-login-time", Date.now().toString());
    localStorage.setItem("akii-login-email", data.email);
    
    // Attempt the sign-in
    const response = await auth.signIn(data.email, data.password);

    if (response.error) {
      setError(response.error.message);
      console.error("LoginModal: Sign-in error:", response.error.message);
      localStorage.removeItem("akii-login-in-progress");
      localStorage.removeItem("akii-login-time");
      localStorage.removeItem("akii-login-email");
      return;
    }

    console.log("LoginModal: Sign-in successful, checking session");
    
    // If we have a valid session, redirect to dashboard
    if (response.data?.session) {
      // Store the redirect path
      localStorage.setItem("akii-auth-redirect", "/dashboard");
      forceRedirectToDashboard();
    }
  } catch (error) {
    console.error("LoginModal: Error during sign-in:", error instanceof Error ? error.message : "Unknown error");
    setError(
      "There was an error signing in. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
}; 