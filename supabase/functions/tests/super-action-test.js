var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
import { createClient } from '@supabase/supabase-js';
import 'https://deno.land/x/dotenv@v3.2.2/load.ts';
import assert from "https://deno.land/std@0.208.0/assert/assert.ts";
import assertEquals from "https://deno.land/std@0.208.0/assert/assert_equals.ts";
// Alias the imported functions
const assertDeno = assert;
const assertEqualsDeno = assertEquals;
// Set up the configuration for the Supabase client
const supabaseUrl = (_a = Deno.env.get('SUPABASE_URL')) !== null && _a !== void 0 ? _a : '';
const supabaseKey = (_b = Deno.env.get('SUPABASE_ANON_KEY')) !== null && _b !== void 0 ? _b : '';
const options = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
};
// Test the super-action function
const testSuperAction = () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a Supabase client
    const client = createClient(supabaseUrl, supabaseKey, options);
    // Verify if the Supabase URL and key are provided
    if (!supabaseUrl)
        throw new Error('supabaseUrl is required.');
    if (!supabaseKey)
        throw new Error('supabaseKey is required.');
    // Test the super-action function
    const { data, error } = yield client.functions.invoke('super-action', {
        body: {
            action: 'get-config-variables',
            auth: {
                userId: '', // Empty for testing
            }
        },
    });
    // Check for errors
    if (error) {
        throw new Error('Super-action function error: ' + error.message);
    }
    // Assert that we got a response
    assertDeno(data, 'Response data should exist');
    // Assert the response structure
    assertDeno(data.success !== undefined, 'Response should have a success field');
    assertDeno(data.variables !== undefined, 'Response should have a variables field');
    // Check for specific variables
    const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
    ];
    for (const varName of requiredVars) {
        assertDeno(data.variables[varName] !== undefined, `Response should include ${varName}`);
    }
});
// Test direct HTTP call to super-action
const testSuperActionHttp = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(`${supabaseUrl}/functions/v1/super-action`, {
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
    });
    assertDeno(response.ok, 'HTTP response should be successful');
    const data = yield response.json();
    assertDeno(data.success !== undefined, 'Response should have a success field');
    assertDeno(data.variables !== undefined, 'Response should have a variables field');
});
// Test the super-action function's AWS permission test
const testAwsPermissionTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = createClient(supabaseUrl, supabaseKey, options);
    // Verify if the Supabase URL and key are provided
    if (!supabaseUrl)
        throw new Error('supabaseUrl is required.');
    if (!supabaseKey)
        throw new Error('supabaseKey is required.');
    // Test the aws-permission-test action
    const { data, error } = yield client.functions.invoke('super-action', {
        body: {
            action: 'aws-permission-test'
        }
    });
    // Check for errors
    if (error) {
        throw new Error('Super-action function error: ' + error.message);
    }
    // Assert that we got a response
    assertDeno(data, 'Response data should exist');
    // Assert the response structure
    assertDeno(data.test_results, 'Response should have test_results');
    assertDeno(data.test_results.credentials, 'Response should have credentials info');
    assertDeno(data.test_results.permissions, 'Response should have permissions info');
});
// Test the ListFoundationModels action
const testListFoundationModels = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = createClient(supabaseUrl, supabaseKey, options);
    const { data, error } = yield client.functions.invoke('super-action', {
        body: {
            action: 'ListFoundationModels'
        }
    });
    if (error) {
        throw new Error('ListFoundationModels error: ' + error.message);
    }
    assertDeno(data, 'Response data should exist');
    assertDeno(Array.isArray(data.models), 'Response should have models array');
    // If we got models, check their structure
    if (data.models.length > 0) {
        const model = data.models[0];
        assertDeno(model.modelId, 'Model should have modelId');
        assertDeno(model.modelName, 'Model should have modelName');
        assertDeno(model.providerName, 'Model should have providerName');
    }
});
// Test CORS headers
const testCorsHeaders = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Test preflight request
    const preflightResponse = yield fetch(`${supabaseUrl}/functions/v1/super-action`, {
        method: 'OPTIONS',
        headers: {
            'Origin': 'https://www.akii.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type,authorization'
        }
    });
    assertEqualsDeno(preflightResponse.status, 204, 'Preflight response should have 204 status');
    assertEqualsDeno(preflightResponse.headers.get('Access-Control-Allow-Origin'), 'https://www.akii.com', 'Should allow akii.com origin');
    assertDeno((_a = preflightResponse.headers.get('Access-Control-Allow-Methods')) === null || _a === void 0 ? void 0 : _a.includes('POST'), 'Should allow POST method');
});
// Register the tests
Deno.test('Super-action Function Test (Client)', testSuperAction);
Deno.test('Super-action Function Test (HTTP)', testSuperActionHttp);
Deno.test('AWS Permission Test', testAwsPermissionTest);
Deno.test('List Foundation Models Test', testListFoundationModels);
Deno.test('CORS Headers Test', testCorsHeaders);
