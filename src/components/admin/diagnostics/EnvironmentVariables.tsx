import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { maskSecret, isSensitiveKey } from '@/utils/diagnostics';

interface EnvironmentVariablesProps {
  variables: {[key: string]: {value: string; success: boolean}} | Record<string, string | undefined>;
  title?: string;
  showStatus?: boolean;
  maxHeight?: string;
}

export function EnvironmentVariables({
  variables,
  title = "Environment Variables",
  showStatus = true,
  maxHeight = "400px"
}: EnvironmentVariablesProps) {
  
  // Normalize variables format
  const normalizedVariables: {[key: string]: {value: string; success: boolean}} = {};
  
  Object.entries(variables).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && 'value' in value && 'success' in value) {
      normalizedVariables[key] = value as {value: string; success: boolean};
    } else {
      const strValue = String(value || '');
      normalizedVariables[key] = {
        value: strValue,
        success: strValue !== undefined && strValue !== ""
      };
    }
  });
  
  // Get variables sorted by name
  const sortedVars = Object.entries(normalizedVariables).sort(([a], [b]) => a.localeCompare(b));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className={`rounded-md border max-h-[${maxHeight}]`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Variable</TableHead>
                <TableHead>Value</TableHead>
                {showStatus && <TableHead className="w-24">Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVars.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={showStatus ? 3 : 2} 
                    className="h-24 text-center text-muted-foreground"
                  >
                    No environment variables found. Run diagnostics to check configuration.
                  </TableCell>
                </TableRow>
              ) : (
                sortedVars.map(([key, { value, success }]) => (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-xs">{key}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {/* Mask secrets and API keys */}
                      {key.toLowerCase().includes('key') ||
                       key.toLowerCase().includes('secret') ||
                       key.toLowerCase().includes('password') ||
                       key.toLowerCase().includes('token')
                        ? maskSecret(value)
                        : value || 'Not set'}
                    </TableCell>
                    {showStatus && (
                      <TableCell>
                        {success ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Set
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" /> Missing
                          </Badge>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 