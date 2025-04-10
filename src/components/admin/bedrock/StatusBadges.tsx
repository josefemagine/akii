import React from "react";
import { Badge } from "@/components/ui/badge.tsx";
import { ConnectionStatus, AuthStatus } from "@/types/bedrock.ts";

// Status badge component
export const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status.toLowerCase()) {
    case 'inservice':
    case 'active':
    case 'creating':
      variant = "default";
      break;
    case 'pending':
      variant = "secondary";
      break;
    case 'failed':
    case 'deleted':
      variant = "destructive";
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

// API connection status badge
export const ConnectionStatusBadge = ({ status }: { status: ConnectionStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let label = "Unknown";
  
  switch (status) {
    case 'connected':
      variant = "default";
      label = "Connected";
      break;
    case 'checking':
      variant = "secondary";
      label = "Checking...";
      break;
    case 'error':
      variant = "destructive";
      label = "Connection Error";
      break;
    default:
      variant = "outline";
      label = "Not Checked";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};

// Authentication status badge
export const AuthStatusBadge = ({ status }: { status: AuthStatus }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let label = "Unknown";
  
  switch (status) {
    case 'authenticated':
      variant = "default";
      label = "Authenticated";
      break;
    case 'checking':
      variant = "secondary";
      label = "Checking Auth...";
      break;
    case 'unauthenticated':
      variant = "destructive";
      label = "Not Authenticated";
      break;
    case 'expired':
      variant = "destructive";
      label = "Session Expired";
      break;
    default:
      variant = "outline";
      label = "Auth Unknown";
  }
  
  return <Badge variant={variant}>{label}</Badge>;
}; 