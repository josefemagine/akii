import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelected?: (file: File | null) => void;
  variant?: "default" | "dropzone";
  dropzoneText?: string;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      className,
      onFileSelected,
      onChange,
      variant = "default",
      dropzoneText = "Click or drag to upload",
      ...props
    },
    ref,
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, fileInputRef);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }

      // Call onFileSelected with the selected file
      if (onFileSelected && e.target.files && e.target.files.length > 0) {
        onFileSelected(e.target.files[0]);
      } else if (onFileSelected) {
        onFileSelected(null);
      }
    };

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (fileInputRef.current) {
          // Create a DataTransfer object to set the files
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(e.dataTransfer.files[0]);
          fileInputRef.current.files = dataTransfer.files;

          // Trigger change event manually
          const changeEvent = new Event("change", { bubbles: true });
          fileInputRef.current.dispatchEvent(changeEvent);

          // Call onFileSelected directly
          if (onFileSelected) {
            onFileSelected(e.dataTransfer.files[0]);
          }
        }
      }
    };

    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    if (variant === "dropzone") {
      return (
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-lg border-2 border-dashed transition-colors cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            className,
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{dropzoneText}</p>
          <input
            type="file"
            className="sr-only"
            onChange={handleChange}
            ref={combinedRef}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        type="file"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onChange={handleChange}
        ref={combinedRef}
        {...props}
      />
    );
  },
);

// Helper function to combine refs
function useCombinedRefs<T>(
  ...refs: Array<React.Ref<T> | null | undefined>
): React.RefCallback<T> {
  return React.useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (!ref) return;

        if (typeof ref === "function") {
          ref(element);
        } else {
          (ref as React.MutableRefObject<T>).current = element;
        }
      });
    },
    [refs],
  );
}

FileInput.displayName = "FileInput";

export { FileInput };
