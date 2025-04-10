#!/usr/bin/env node

/**
 * This script fixes specific components that still have JSX syntax issues:
 * 1. file-input.tsx
 * 2. LoadingSpinner.tsx
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const UI_COMPONENTS_DIR = path.join(SRC_DIR, 'components/ui');
const LOG_PATH = path.join(__dirname, '../tmp/fixed-remaining-components.log');

// Ensure tmp directory exists
if (!fs.existsSync(path.join(__dirname, '../tmp'))) {
  fs.mkdirSync(path.join(__dirname, '../tmp'), { recursive: true });
}

// Clear previous log
fs.writeFileSync(LOG_PATH, '');

// Log helper
function log(message) {
  console.log(`[Remaining Fix] ${message}`);
  fs.appendFileSync(LOG_PATH, `${new Date().toISOString()} - ${message}\n`);
}

// Fix file-input.tsx
function fixFileInput() {
  const filePath = path.join(UI_COMPONENTS_DIR, 'file-input.tsx');
  
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`);
    return false;
  }
  
  log(`Fixing component: ${filePath}`);
  
  // Create backup of the original file
  const backupPath = `${filePath}.bak2`;
  if (!fs.existsSync(backupPath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, content);
    log(`Created backup at ${backupPath}`);
  }
  
  // Write the fixed version
  const fixedContent = `import * as React from "react";
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
`;
  
  fs.writeFileSync(filePath, fixedContent);
  log(`Fixed ${filePath}`);
  return true;
}

// Fix LoadingSpinner.tsx
function fixLoadingSpinner() {
  const filePath = path.join(UI_COMPONENTS_DIR, 'LoadingSpinner.tsx');
  
  if (!fs.existsSync(filePath)) {
    log(`File not found: ${filePath}`);
    return false;
  }
  
  log(`Fixing component: ${filePath}`);
  
  // Create backup of the original file
  const backupPath = `${filePath}.bak2`;
  if (!fs.existsSync(backupPath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, content);
    log(`Created backup at ${backupPath}`);
  }
  
  // Write the fixed version
  const fixedContent = `import React from "react";

interface LoadingSpinnerProps {}

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
`;
  
  fs.writeFileSync(filePath, fixedContent);
  log(`Fixed ${filePath}`);
  return true;
}

// Main execution
async function main() {
  log('Starting remaining component fixes...');
  
  // Fix specific components
  let fixedCount = 0;
  
  if (fixFileInput()) {
    fixedCount++;
  }
  
  if (fixLoadingSpinner()) {
    fixedCount++;
  }
  
  log(`Fixed ${fixedCount} components.`);
  log('Remaining component fixes completed!');
}

// Run the script
main().catch(error => {
  log(`Unexpected error: ${error.message}`);
  process.exit(1);
}); 