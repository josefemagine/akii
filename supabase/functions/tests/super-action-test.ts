import { createClient } from '@supabase/supabase-js'
import 'https://deno.land/x/dotenv@v3.2.2/load.ts'
import assert from "https://deno.land/std@0.208.0/assert/assert.ts";
import assertEquals from "https://deno.land/std@0.208.0/assert/assert_equals.ts";

// Alias the imported functions
const assertDeno = assert;
const assertEqualsDeno = assertEquals;

// Add Deno types
declare global {
  interface Window {
    __configData?: {
      variables: Record<string, string>;
    };
  }
}

declare namespace Deno {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Set up the configuration for the Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
}

// Test the super-action function
const testSuperAction = async () => {
  // Create a Supabase client
  const client = createClient(supabaseUrl, supabaseKey, options)

  // Verify if the Supabase URL and key are provided
  if (!supabaseUrl) throw new Error('supabaseUrl is required.')
  if (!supabaseKey) throw new Error('supabaseKey is required.')

  // Test the super-action function
  const { data, error } = await client.functions.invoke('super-action', {
    body: {
      action: 'get-config-variables',
      auth: {
        userId: '', // Empty for testing
      }
    },
  })

  // Check for errors
  if (error) {
    throw new Error('Super-action function error: ' + (error instanceof Error ? error.message : String(error)))
  }

  // Assert that we got a response
  assertDeno(data, 'Response data should exist')
  
  // Assert the response structure
  assertDeno(data.success !== undefined, 'Response should have a success field')
  assertDeno(data.variables !== undefined, 'Response should have a variables field')

  // Check for specific variables
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ]

  for (const varName of requiredVars) {
    assertDeno(
      data.variables[varName] !== undefined,
      `Response should include ${varName}`
    )
  }
}

// Test direct HTTP call to super-action
const testSuperActionHttp = async () => {
  const response = await fetch(`${supabaseUrl}/functions/v1/super-action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
    body: JSON.stringify({
      action: 'get-config-variables',
      auth: {
        userId: '',
      }
    })
  })

  assertDeno(response.ok, 'HTTP response should be successful')
  const data = await response.json()
  
  assertDeno(data.success !== undefined, 'Response should have a success field')
  assertDeno(data.variables !== undefined, 'Response should have a variables field')
}

// Test the super-action function's AWS permission test
const testAwsPermissionTest = async () => {
  const client = createClient(supabaseUrl, supabaseKey, options)

  // Verify if the Supabase URL and key are provided
  if (!supabaseUrl) throw new Error('supabaseUrl is required.')
  if (!supabaseKey) throw new Error('supabaseKey is required.')

  // Test the aws-permission-test action
  const { data, error } = await client.functions.invoke('super-action', {
    body: { 
      action: 'aws-permission-test'
    }
  })

  // Check for errors
  if (error) {
    throw new Error('Super-action function error: ' + (error instanceof Error ? error.message : String(error)))
  }

  // Assert that we got a response
  assertDeno(data, 'Response data should exist')
  
  // Assert the response structure
  assertDeno(data.test_results, 'Response should have test_results')
  assertDeno(data.test_results.credentials, 'Response should have credentials info')
  assertDeno(data.test_results.permissions, 'Response should have permissions info')
}

// Test the ListFoundationModels action
const testListFoundationModels = async () => {
  const client = createClient(supabaseUrl, supabaseKey, options)

  const { data, error } = await client.functions.invoke('super-action', {
    body: { 
      action: 'ListFoundationModels'
    }
  })

  if (error) {
    throw new Error('ListFoundationModels error: ' + (error instanceof Error ? error.message : String(error)))
  }

  assertDeno(data, 'Response data should exist')
  assertDeno(Array.isArray(data.models), 'Response should have models array')
  
  // If we got models, check their structure
  if (data.models.length > 0) {
    const model = data.models[0]
    assertDeno(model.modelId, 'Model should have modelId')
    assertDeno(model.modelName, 'Model should have modelName')
    assertDeno(model.providerName, 'Model should have providerName')
  }
}

// Test CORS headers
const testCorsHeaders = async () => {
  // Test preflight request
  const preflightResponse = await fetch(`${supabaseUrl}/functions/v1/super-action`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://www.akii.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type,authorization'
    }
  })

  assertEqualsDeno(preflightResponse.status, 204, 'Preflight response should have 204 status')
  assertEqualsDeno(
    preflightResponse.headers.get('Access-Control-Allow-Origin'),
    'https://www.akii.com',
    'Should allow akii.com origin'
  )
  assertDeno(
    preflightResponse.headers.get('Access-Control-Allow-Methods')?.includes('POST'),
    'Should allow POST method'
  )
}

// Register the tests
Deno.test('Super-action Function Test (Client)', testSuperAction)
Deno.test('Super-action Function Test (HTTP)', testSuperActionHttp)
Deno.test('AWS Permission Test', testAwsPermissionTest)
Deno.test('List Foundation Models Test', testListFoundationModels)
Deno.test('CORS Headers Test', testCorsHeaders) 