import React from "react";
import { Link, Navigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center border-b bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Akii</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Or{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:underline"
              >
                create a new account
              </Link>
            </p>
          </div>

          <LoginForm />
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t bg-white dark:bg-gray-950 dark:border-gray-800">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Akii. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;
