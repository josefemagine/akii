import * as React from "react";
import { forwardRef, useCallback } from "react";
import { cn } from "@/lib/utils.ts";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const FileInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    const combinedRef = useCombinedRefs(ref);

    return (
      <input
        type="file"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        ref={combinedRef}
        {...props}
      />
    );
  }
);

FileInput.displayName = "FileInput";

function useCombinedRefs(...refs: any[]) {
  return React.useCallback((element: any) => {
    refs.forEach((ref) => {
      if (!ref) {
        return;
      }
      if (typeof ref === "function") {
        ref(element);
      } else {
        ref.current = element;
      }
    });
  }, [refs]);
}

export { FileInput };
