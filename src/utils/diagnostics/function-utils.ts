import { supabase } from "@/lib/supabase";
import { FunctionLog, FunctionInvocation } from "@/types/diagnostics";

/**
 * List of available edge functions
 */
export const EDGE_FUNCTIONS = [
  { name: 'health-check', description: 'Basic health check endpoint' },
  { name: 'super-action', description: 'Configuration and admin actions' },
  { name: 'chat', description: 'Chat functionality' },
  { name: 'stripe-webhook', description: 'Stripe payment webhook handler' }
];

/**
 * Fetches function logs
 * @param functionName Name of the edge function to fetch logs for
 * @returns Array of function logs
 */
export const fetchFunctionLogs = async (functionName: string): Promise<FunctionLog[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('super-action', {
      body: {
        action: 'get_function_logs',
        function_name: functionName,
        limit: 50
      }
    });
    
    if (error) {
      throw new Error(`Failed to fetch function logs: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data.logs)) {
      throw new Error('Invalid response format from get_function_logs');
    }
    
    return data.logs;
  } catch (error) {
    console.error('Error fetching function logs:', error);
    return [];
  }
};

/**
 * Fetches function invocations
 * @param functionName Name of the edge function to fetch invocations for
 * @returns Array of function invocations
 */
export const fetchFunctionInvocations = async (functionName: string): Promise<FunctionInvocation[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('super-action', {
      body: {
        action: 'get_function_invocations',
        function_name: functionName,
        limit: 20
      }
    });
    
    if (error) {
      throw new Error(`Failed to fetch function invocations: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data.invocations)) {
      throw new Error('Invalid response format from get_function_invocations');
    }
    
    return data.invocations;
  } catch (error) {
    console.error('Error fetching function invocations:', error);
    return [];
  }
}; 