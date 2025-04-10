import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ServiceCheckResult, ConfigData } from "@/types/diagnostics";

/**
 * Checks the authentication service
 */
export const checkAuthService = async (): Promise<ServiceCheckResult> => {
  const startTime = performance.now();
  const name = "Authentication Service";
  
  try {
    // Check if we can get the user session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "success",
      message: "Authentication service is working correctly",
      details: `Successfully fetched session. Response time: ${responseTime.toFixed(2)}ms`,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "error",
      message: "Authentication service check failed",
      details: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Checks the storage service
 */
export const checkStorageService = async (): Promise<ServiceCheckResult> => {
  const startTime = performance.now();
  const name = "Storage Service";
  const testBucketName = "diagnostic-test-bucket";
  const testFilename = `test-file-${Date.now()}.txt`;
  const testContent = "This is a test file for diagnostic purposes";
  
  try {
    // 1. Check if bucket exists or create it
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw new Error(`Failed to list buckets: ${bucketsError.message}`);
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === testBucketName);
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(testBucketName, {
        public: false
      });
      
      if (createError) {
        throw new Error(`Failed to create test bucket: ${createError.message}`);
      }
    }
    
    // 2. Upload test file
    const { error: uploadError } = await supabase.storage
      .from(testBucketName)
      .upload(testFilename, testContent);
    
    if (uploadError) {
      throw new Error(`Failed to upload test file: ${uploadError.message}`);
    }
    
    // 3. Verify file exists
    const { data: fileUrl, error: urlError } = await supabase.storage
      .from(testBucketName)
      .createSignedUrl(testFilename, 60);
    
    if (urlError || !fileUrl) {
      throw new Error(`Failed to get file URL: ${urlError?.message || "No URL returned"}`);
    }
    
    // 4. Clean up - delete test file
    const { error: deleteFileError } = await supabase.storage
      .from(testBucketName)
      .remove([testFilename]);
    
    if (deleteFileError) {
      console.warn(`Warning: Could not delete test file: ${deleteFileError.message}`);
    }
    
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "success",
      message: "Storage service is working correctly",
      details: `Successfully created, accessed, and deleted a test file. Response time: ${responseTime.toFixed(2)}ms`,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "error",
      message: "Storage service check failed",
      details: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Checks the database service
 */
export const checkDatabaseService = async (): Promise<ServiceCheckResult> => {
  const startTime = performance.now();
  const name = "Database Service";
  
  try {
    // 1. Try to run a simple query to check database connectivity
    const { data: queryResult, error: queryError } = await supabase
      .from('_diagnostics_test')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    // If table doesn't exist, this will error but that's expected
    // We'll create it below
    
    // 2. Try to create a temporary diagnostic table
    const { error: createError } = await supabase.rpc('create_diagnostics_table');
    
    if (createError) {
      // If the function doesn't exist, try direct SQL
      const { error: sqlError } = await supabase.functions.invoke('super-action', {
        body: {
          action: 'run_sql',
          sql: `
            CREATE TABLE IF NOT EXISTS public._diagnostics_test (
              id SERIAL PRIMARY KEY,
              test_value TEXT,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
        }
      });
      
      if (sqlError) {
        throw new Error(`Failed to create test table: ${sqlError.message}`);
      }
    }
    
    // 3. Insert test record
    const testValue = `test-value-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('_diagnostics_test')
      .insert([{ test_value: testValue }]);
    
    if (insertError) {
      throw new Error(`Failed to insert test record: ${insertError.message}`);
    }
    
    // 4. Query for the record we just inserted
    const { data: selectResult, error: selectError } = await supabase
      .from('_diagnostics_test')
      .select('*')
      .eq('test_value', testValue)
      .single();
    
    if (selectError || !selectResult) {
      throw new Error(`Failed to query test record: ${selectError?.message || "No record found"}`);
    }
    
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "success",
      message: "Database service is working correctly",
      details: `Successfully created a test table, inserted and queried data. Response time: ${responseTime.toFixed(2)}ms`,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "error",
      message: "Database service check failed",
      details: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Checks the edge functions service
 */
export const checkEdgeFunctionsService = async (): Promise<ServiceCheckResult> => {
  const startTime = performance.now();
  const name = "Edge Functions Service";
  
  try {
    // Test the health-check edge function if it exists
    const { data, error } = await supabase.functions.invoke('health-check');
    
    if (error) {
      throw new Error(`Failed to invoke health-check function: ${error.message}`);
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response from health-check function');
    }
    
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "success",
      message: "Edge Functions service is working correctly",
      details: `Successfully invoked health-check function. Response time: ${responseTime.toFixed(2)}ms`,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "error",
      message: "Edge Functions service check failed",
      details: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Checks the super-action edge function
 */
export const checkSuperActionFunction = async (): Promise<ServiceCheckResult & { configData?: ConfigData }> => {
  const startTime = performance.now();
  const name = "Super Action Function";
  
  try {
    // Call the super-action function to get environment variables
    const { data, error } = await supabase.functions.invoke('super-action', {
      body: { action: 'get_config' }
    });
    
    if (error) {
      throw new Error(`Failed to invoke super-action function: ${error.message}`);
    }
    
    if (!data || !data.success) {
      throw new Error(data?.error || 'Invalid response from super-action function');
    }
    
    const configData = data as ConfigData;
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "success",
      message: "Super action function is working correctly",
      details: `Successfully retrieved configuration data. Found ${Object.keys(configData.variables).length} variables.`,
      responseTime,
      timestamp: new Date().toISOString(),
      configData
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;
    
    return {
      name,
      status: "error",
      message: "Super action function check failed",
      details: error instanceof Error ? error.message : String(error),
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
}; 