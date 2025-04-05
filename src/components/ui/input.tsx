import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete, ...props }, ref) => {
    // Set default autocomplete attribute based on input type if not provided
    const getAutoComplete = () => {
      if (autoComplete) {
        // Use provided autocomplete if specified
        return autoComplete;
      }
      
      // Default values for password fields
      if (type === "password") {
        // For common password field IDs
        const id = props.id?.toLowerCase() || '';
        if (id.includes("new") || id.includes("create") || id === "password" || id === "confirmPassword") {
          return "new-password";
        }
        if (id.includes("current") || id.includes("old")) {
          return "current-password";
        }
        // Default for other password fields
        return "current-password";
      }
      
      // No default for other types
      return undefined;
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        autoComplete={getAutoComplete()}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
