import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Database, InfoIcon } from "lucide-react";
import { BedrockConfig } from "@/lib/bedrock-config";
import { ClientStatus } from "@/types/bedrock";

// Mock data notice component
export const MockDataNotice = () => {
  if (!BedrockConfig.isLocalDevelopment || !BedrockConfig.useMockData) {
    return null;
  }
  
  return (
    <Alert className="mb-4">
      <Database className="h-4 w-4" />
      <AlertTitle>Using Mock Data</AlertTitle>
      <AlertDescription>
        You're currently viewing mock data in development mode. Real API endpoints will be used in production.
      </AlertDescription>
    </Alert>
  );
};

// Server error notice component to display information about Edge Function errors
export const ServerErrorNotice = ({ errorDetails }: { errorDetails: any }) => {
  if (!errorDetails) return null;
  
  // Handle different types of errors
  const isModuleError = errorDetails.code === 'EDGE_FUNCTION_MODULE_ERROR';
  const isBootError = errorDetails.code === 'EDGE_FUNCTION_BOOT_ERROR' || 
                      (errorDetails.original && errorDetails.original.includes('BOOT_ERROR'));
  const isMissingExport = errorDetails.code === 'EDGE_FUNCTION_MISSING_EXPORT';
  
  if (!isModuleError && !isBootError && !isMissingExport) return null;
  
  // Extract the AWS documentation link if available
  const docLink = isMissingExport && 
                 errorDetails.details?.suggestion && 
                 errorDetails.details.suggestion.includes('https://') ? 
                 errorDetails.details.suggestion.match(/(https:\/\/[^\s]+)/)?.[1] : null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Server-Side Error Detected</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          {isModuleError ? (
            <>
              The Supabase Edge Function has a module import error. It's trying to import 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.missingExport || 'unknown export'}
              </code> 
              from 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.module || 'unknown module'}
              </code> 
              but that export doesn't exist.
            </>
          ) : isMissingExport ? (
            <>
              The Supabase Edge Function is looking for the function 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.missingExport}
              </code> 
              in the module 
              <code className="px-1 mx-1 bg-red-900/20 rounded">
                {errorDetails.details?.module}
              </code> 
              but it's not available.
            </>
          ) : (
            'The Supabase Edge Function is failing to initialize.'
          )}
        </p>
        
        <div className="text-sm bg-red-900/10 p-2 rounded">
          <div className="font-semibold mb-1">Resolution:</div>
          <p>
            {isModuleError || isMissingExport ? (
              <>
                {errorDetails.details?.resolution || 
                  `This requires updating the server-side Edge Function code to correct the ${isModuleError ? 'module import' : 'missing function'}.`}
                
                {isMissingExport && errorDetails.details?.suggestion && (
                  <div className="mt-1 text-xs">
                    <strong>Suggestion:</strong> {docLink ? (
                      <span>
                        Use <code className="px-1 bg-red-900/20 rounded">ListFoundationModels</code> instead. 
                        See <a 
                          href={docLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          AWS Bedrock API Reference
                        </a>
                      </span>
                    ) : (
                      errorDetails.details.suggestion
                    )}
                  </div>
                )}
              </>
            ) : (
              'Check the Supabase Edge Function logs for detailed error information.'
            )}
          </p>
        </div>
        
        <div className="pt-1 mt-1 border-t border-red-800/20 text-xs text-red-300">
          Error Code: {errorDetails.code || 'UNKNOWN'}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// AWS credentials notice component
export const AwsCredentialsNotice = ({ clientStatus }: { clientStatus: ClientStatus }) => {
  // Only show this notice when using fallback data
  if (!clientStatus?.usingFallback) return null;
  
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800 font-medium">AWS Credentials Notice</AlertTitle>
      <AlertDescription className="text-blue-700">
        <p>The warnings about "<code className="bg-blue-100 px-1 rounded">No AWS credentials found in environment variables</code>" are expected.</p>
        <p className="mt-1">AWS credentials should be configured through this interface rather than environment variables. Enter your AWS Access Key and Secret below to configure AWS Bedrock.</p>
      </AlertDescription>
    </Alert>
  );
}; 