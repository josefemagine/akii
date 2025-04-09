// deno-lint-ignore-file no-explicit-any
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BedrockClient, ListFoundationModelsCommand, ListProvisionedModelThroughputsCommand } from "npm:@aws-sdk/client-bedrock";
import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts";
import { query, queryOne } from "../_shared/postgres.ts";
// Define valid origins list at the top level
const VALID_ORIGINS = [
    "https://www.akii.com"
];
// Always only use us-east-1 
const REGIONS_WITH_PROVISIONED_THROUGHPUT = [
    "us-east-1"
    // Note: Other regions like us-west-2, eu-central-1, and eu-west-3 may not support all provisioned throughput models
];
// Add AWS credential variable references with proper validation
const AWS_ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");
const AWS_REGION = "us-east-1"; // Hardcoded to us-east-1
// Define CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://www.akii.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, X-Client-Info',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
};
// Function to create a response with CORS headers
function createResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: Object.assign(Object.assign({}, CORS_HEADERS), { 'Content-Type': 'application/json' })
    });
}
// Function to get the appropriate CORS origin
function getCorsOrigin(requestOrigin) {
    console.log("Request origin:", requestOrigin);
    // Always return www.akii.com as the only valid origin
    return "https://www.akii.com";
}
// Function to create CORS headers for a specific origin
function createCorsHeaders(origin) {
    // Always use www.akii.com as the origin
    return {
        "Access-Control-Allow-Origin": "https://www.akii.com",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        "Vary": "Origin"
    };
}
// Function to create preflight response headers
function createPreflightHeaders(origin) {
    // Always use www.akii.com as the origin
    return {
        "Access-Control-Allow-Origin": "https://www.akii.com",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
    };
}
// Add validation function for AWS credentials
function validateAwsCredentials() {
    if (!AWS_ACCESS_KEY_ID) {
        return { isValid: false, error: "AWS_ACCESS_KEY_ID is not set" };
    }
    if (!AWS_SECRET_ACCESS_KEY) {
        return { isValid: false, error: "AWS_SECRET_ACCESS_KEY is not set" };
    }
    return { isValid: true };
}
// Test AWS connectivity and credentials
function verifyAwsCredentials() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("[API] Verifying AWS credentials");
            // Check if credentials are provided
            const validationResult = validateAwsCredentials();
            if (!validationResult.isValid) {
                console.log("[API] AWS credentials missing:", validationResult.error);
                return {
                    success: false,
                    message: validationResult.error || "AWS credentials are not configured"
                };
            }
            // Create a Bedrock client specifically for us-east-1
            const client = new BedrockClient({
                region: "us-east-1",
                credentials: {
                    accessKeyId: AWS_ACCESS_KEY_ID,
                    secretAccessKey: AWS_SECRET_ACCESS_KEY
                }
            });
            console.log("[API] Created test Bedrock client for us-east-1");
            // Make a simple API call to test connectivity
            const command = new ListFoundationModelsCommand({
                maxResults: 1 // Minimal data to retrieve
            });
            console.log("[API] Sending test ListFoundationModels command");
            const response = yield client.send(command);
            // Check if we got a successful response
            console.log(`[API] AWS test successful, retrieved ${((_a = response.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0} models`);
            return {
                success: true,
                message: "AWS credentials verified successfully",
                data: {
                    modelsAvailable: ((_b = response.modelSummaries) === null || _b === void 0 ? void 0 : _b.length) || 0,
                    region: "us-east-1",
                    requestId: response.$metadata.requestId,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error("[API] AWS verification error:", error);
            // Format the error message depending on the error type
            let errorMessage = "Unknown error verifying AWS credentials";
            if (error instanceof Error) {
                if (error.name === "AccessDeniedException") {
                    errorMessage = "Access denied. Check IAM permissions for Bedrock API access.";
                }
                else if (error.name === "TimeoutError") {
                    errorMessage = "Connection to AWS timed out. Check network connectivity.";
                }
                else if (error.name === "UnrecognizedClientException") {
                    errorMessage = "Invalid AWS credentials. Check access key and secret.";
                }
                else {
                    errorMessage = error.message;
                }
            }
            return {
                success: false,
                message: errorMessage
            };
        }
    });
}
// Run AWS permissions test
function runAwsPermissionsTest() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const region = Deno.env.get("AWS_REGION") || "us-east-1";
        const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
        const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
        try {
            console.log("[AWS] Running AWS permissions test");
            const client = new BedrockClient({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey
                }
            });
            // Test listing models
            let listModelsSuccess = false;
            let modelsFound = 0;
            try {
                const command = new ListFoundationModelsCommand({});
                const result = yield client.send(command);
                listModelsSuccess = true;
                modelsFound = ((_a = result.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0;
            }
            catch (error) {
                console.error("[AWS] Error listing models:", error);
                listModelsSuccess = false;
            }
            // Test listing provisioned throughputs
            let listProvisionedSuccess = false;
            try {
                const command = new ListProvisionedModelThroughputsCommand({});
                yield client.send(command);
                listProvisionedSuccess = true;
            }
            catch (error) {
                console.error("[AWS] Error listing provisioned throughputs:", error);
                listProvisionedSuccess = false;
            }
            return {
                success: true,
                permissions: {
                    listModels: { success: listModelsSuccess, message: listModelsSuccess ? `Found ${modelsFound} models` : "Failed to list models" },
                    listProvisioned: { success: listProvisionedSuccess, message: listProvisionedSuccess ? "Successfully listed provisioned throughputs" : "Failed to list provisioned throughputs" },
                    invokeModels: { success: true, message: "Invoke models permission assumed" },
                    createProvisionedThroughput: { success: true, message: "Create provisioned throughput permission assumed" }
                },
                modelsFound: modelsFound
            };
        }
        catch (error) {
            console.error("[AWS] Error running permissions test:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                permissions: {
                    listModels: { success: false, error: "Test failed" },
                    listProvisioned: { success: false, error: "Test failed" },
                    invokeModels: { success: false, error: "Test failed" },
                    createProvisionedThroughput: { success: false, error: "Test failed" }
                }
            };
        }
    });
}
// Function to convert the modelId to a model ARN if needed
function getModelArn(modelId, region) {
    // If the modelId is already an ARN, return it as is
    if (modelId.startsWith('arn:aws:')) {
        return modelId;
    }
    // Otherwise construct the ARN based on the region and modelId
    return `arn:aws:bedrock:${region}::foundation-model/${modelId}`;
}
// Function to convert commitment duration from "1m" or "6m" format to AWS SDK enum value
function getCommitmentDuration(duration) {
    if (!duration)
        return "ONE_MONTH";
    const normalizedDuration = duration.toLowerCase();
    if (normalizedDuration === "6m" || normalizedDuration === "six_months") {
        return "SIX_MONTHS";
    }
    // Default to one month
    return "ONE_MONTH";
}
// Function to check if a model supports provisioned throughput
// Now assumes all models potentially support provisioned throughput
function modelSupportsProvisionedThroughput(modelId) {
    // Consider all models as potentially supporting provisioned throughput
    // This allows the frontend to make filtering decisions
    return true;
}
// Function to check if region supports provisioned throughput
function regionSupportsProvisionedThroughput(region) {
    return REGIONS_WITH_PROVISIONED_THROUGHPUT.includes(region);
}
// Function to check AWS account prerequisites for provisioned throughput
function checkAwsAccountPrerequisites(client) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Checking AWS account prerequisites for provisioned throughput");
            // First check if we can list existing provisioned throughputs
            try {
                const command = new ListProvisionedModelThroughputsCommand({});
                yield client.send(command);
                return {
                    success: true,
                    message: "Account appears to be set up for provisioned throughput"
                };
            }
            catch (error) {
                if (error.name === "ValidationException" && error.message === "Operation not allowed") {
                    return {
                        success: false,
                        message: "Your AWS account may not be approved for provisioned throughput",
                        details: {
                            error: error.message,
                            recommendation: "You need to request access to Bedrock provisioned throughput via AWS console"
                        }
                    };
                }
                if (error.name === "AccessDeniedException") {
                    return {
                        success: false,
                        message: "Your AWS credentials do not have permission to use provisioned throughput",
                        details: {
                            error: error.message,
                            recommendation: "Check your IAM permissions"
                        }
                    };
                }
                // Any other error
                return {
                    success: false,
                    message: "Error checking provisioned throughput prerequisites",
                    details: {
                        error: error.message,
                        errorType: error.name
                    }
                };
            }
        }
        catch (error) {
            console.error("Error checking AWS account prerequisites:", error);
            return {
                success: false,
                message: "Failed to check AWS account prerequisites",
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Extract user ID from JWT token
function extractUserIdFromJwt(req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                console.log("No valid authorization header found");
                return null;
            }
            // Extract JWT token
            const token = authHeader.split(" ")[1];
            try {
                // Create a Supabase client using the configured service role
                const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
                const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
                if (!supabaseUrl || !supabaseServiceKey) {
                    console.log("Missing Supabase configuration for JWT validation");
                    // Try to parse token directly as fallback if we can't validate
                    try {
                        const payload = JSON.parse(atob(token.split(".")[1]));
                        console.log("Extracted user ID from JWT payload without validation:", payload.sub);
                        return payload.sub || null;
                    }
                    catch (e) {
                        console.error("Failed to parse JWT payload:", e);
                        return null;
                    }
                }
                // Dynamically import the Supabase client
                const { createClient } = yield import("https://esm.sh/@supabase/supabase-js@2");
                // Create Supabase client
                const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
                // Verify the token
                const { data: { user }, error } = yield supabaseClient.auth.getUser(token);
                if (error || !user) {
                    console.error("JWT validation failed:", error === null || error === void 0 ? void 0 : error.message);
                    return null;
                }
                console.log("JWT validation successful for user:", user.id);
                return user.id;
            }
            catch (error) {
                console.error("Error validating JWT:", error);
                // Try to parse token directly as fallback if validation fails
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    console.log("Extracted user ID from JWT payload as fallback:", payload.sub);
                    return payload.sub || null;
                }
                catch (e) {
                    console.error("Failed to parse JWT payload:", e);
                    return null;
                }
            }
        }
        catch (error) {
            console.error("Error extracting user ID from JWT:", error);
            return null;
        }
    });
}
// Function for listing all foundation models (accessible to the user)
// This no longer filters by provisioned throughput status so frontend can handle filtering
function listFoundationModels(client) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("[AWS] Listing all foundation models");
        try {
            // Use a hardcoded us-east-1 region regardless of client region
            const command = new ListFoundationModelsCommand({});
            const response = yield client.send(command);
            console.log(`[AWS] Retrieved ${((_a = response.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0} foundation models`);
            // Map AWS response to simplified model format
            const models = ((_b = response.modelSummaries) === null || _b === void 0 ? void 0 : _b.map(model => ({
                modelId: model.modelId || "",
                modelName: model.modelName || "",
                providerName: model.providerName || "",
                modelArn: model.modelArn || "",
                responseStreamingSupported: model.responseStreamingSupported || false,
                inputModalities: model.inputModalities || ["TEXT"],
                outputModalities: model.outputModalities || ["TEXT"],
                inferenceTypesSupported: model.inferenceTypesSupported || ["ON_DEMAND"],
                // Include all fields without filtering
                region: "us-east-1",
                modelAccessStatus: model.modelAccessStatus || "UNKNOWN",
                supportsProvisionedThroughput: true, // We'll leave it to frontend to determine this
                customizationsSupported: model.customizationsSupported || []
            }))) || [];
            console.log(`[AWS] Converted ${models.length} models to simplified format`);
            return models;
        }
        catch (error) {
            console.error("[AWS] Error in listFoundationModels:", error);
            // Return empty array on error
            return [];
        }
    });
}
// Handler for ListFoundationModels action
function handleListFoundationModels(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("[API] Handling ListFoundationModels request");
            // Get the client with explicit us-east-1 region
            const client = new BedrockClient({
                region: "us-east-1",
                credentials: {
                    accessKeyId: AWS_ACCESS_KEY_ID,
                    secretAccessKey: AWS_SECRET_ACCESS_KEY
                }
            });
            console.log("[API] Created Bedrock client for us-east-1");
            // Check credentials before attempting API call
            console.log("[API] AWS Credentials check:", {
                hasAccessKey: !!AWS_ACCESS_KEY_ID,
                hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
                accessKeyPrefix: AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 4) : "none"
            });
            try {
                // Make the API call to list foundation models
                console.log("[API] Sending ListFoundationModels command to AWS Bedrock");
                const command = new ListFoundationModelsCommand({});
                const response = yield client.send(command);
                console.log(`[API] ListFoundationModels response received. Models count: ${((_a = response.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
                // Log the first model (if any) to help debug the structure
                if (response.modelSummaries && response.modelSummaries.length > 0) {
                    console.log("[API] Sample model from response:", JSON.stringify(response.modelSummaries[0], null, 2));
                }
                else {
                    console.log("[API] No models returned from AWS Bedrock API");
                }
                // Map the response to our expected format
                const models = ((_b = response.modelSummaries) === null || _b === void 0 ? void 0 : _b.map(model => ({
                    modelId: model.modelId || "",
                    modelName: model.modelName || "",
                    providerName: model.providerName || "",
                    modelArn: model.modelArn || "",
                    responseStreamingSupported: model.responseStreamingSupported || false,
                    inputModalities: model.inputModalities || ["TEXT"],
                    outputModalities: model.outputModalities || ["TEXT"],
                    inferenceTypesSupported: model.inferenceTypesSupported || ["ON_DEMAND"],
                    region: "us-east-1",
                    modelAccessStatus: model.modelAccessStatus || "UNKNOWN",
                    // We'll flag all models as supporting provisioned throughput
                    // and let the frontend filter based on model ID if needed
                    supportsProvisionedThroughput: true,
                    customizationsSupported: model.customizationsSupported || []
                }))) || [];
                // Return the formatted models
                return createResponse({
                    models: models,
                    count: models.length,
                    region: "us-east-1"
                });
            }
            catch (awsError) {
                console.error("[API] AWS API Error in ListFoundationModels:", awsError);
                // Create a more detailed error response with AWS error information
                return createResponse({
                    error: awsError instanceof Error ? awsError.message : String(awsError),
                    name: awsError instanceof Error ? awsError.name : "UnknownError",
                    stack: awsError instanceof Error ? awsError.stack : undefined,
                    region: "us-east-1"
                }, 500);
            }
        }
        catch (error) {
            console.error("[API] Unexpected error in handleListFoundationModels:", error);
            return createResponse({
                error: "Error listing foundation models",
                details: error instanceof Error ? error.message : String(error)
            }, 500);
        }
    });
}
Deno.serve((req) => __awaiter(void 0, void 0, void 0, function* () {
    return handleRequest(req, (user, body) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Validate required fields
            if (!((_a = body.action) === null || _a === void 0 ? void 0 : _a.trim())) {
                return createErrorResponse("Action is required", 400);
            }
            // Get user's subscription status and role
            const userData = yield queryOne("SELECT subscription_status, subscription_id, role FROM profiles WHERE id = $1", [user.id]);
            if (!userData) {
                return createErrorResponse("User profile not found", 404);
            }
            // Check if user has active subscription
            if (userData.subscription_status !== "active") {
                return createErrorResponse("Subscription required for super actions", 403);
            }
            // Check if user has admin role
            if (userData.role !== "admin") {
                return createErrorResponse("Admin role required for super actions", 403);
            }
            // Execute the requested action
            let result;
            switch (body.action) {
                case "get_system_status":
                    result = yield getSystemStatus();
                    break;
                case "get_user_stats":
                    result = yield getUserStats();
                    break;
                case "get_subscription_stats":
                    result = yield getSubscriptionStats();
                    break;
                default:
                    return createErrorResponse("Invalid action", 400);
            }
            return createSuccessResponse({
                result,
                timestamp: new Date().toISOString(),
                action: body.action,
            });
        }
        catch (error) {
            console.error("Unexpected error in super-action:", error);
            return createErrorResponse("An unexpected error occurred", 500);
        }
    }), {
        requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
        requireAuth: true,
        requireBody: true,
    });
}));
function getSystemStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const totalUsers = yield queryOne("SELECT COUNT(*) as count FROM profiles");
        const activeSubscriptions = yield queryOne("SELECT COUNT(*) as count FROM profiles WHERE subscription_status = 'active'");
        if (!totalUsers || !activeSubscriptions) {
            throw new Error("Failed to fetch system status");
        }
        return {
            total_users: totalUsers.count,
            active_subscriptions: activeSubscriptions.count,
            timestamp: new Date().toISOString(),
        };
    });
}
function getUserStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield query(`SELECT 
      subscription_status,
      role,
      COUNT(*) as count
     FROM profiles
     GROUP BY subscription_status, role`);
        if (!stats) {
            throw new Error("Failed to fetch user stats");
        }
        return stats.rows;
    });
}
function getSubscriptionStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield query(`SELECT 
      subscription_status,
      COUNT(*) as count
     FROM profiles
     GROUP BY subscription_status`);
        if (!stats) {
            throw new Error("Failed to fetch subscription stats");
        }
        return stats.rows;
    });
}
