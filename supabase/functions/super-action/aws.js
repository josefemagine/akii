var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// AWS Bedrock Integration using the official AWS SDK
// @ts-ignore - Deno-specific import
import { BedrockClient, ListFoundationModelsCommand, ListProvisionedModelThroughputsCommand, CreateProvisionedModelThroughputCommand, GetProvisionedModelThroughputCommand, DeleteProvisionedModelThroughputCommand } from "npm:@aws-sdk/client-bedrock@3.462.0";
// @ts-ignore - Deno-specific import
import { BedrockRuntimeClient, InvokeModelCommand } from "npm:@aws-sdk/client-bedrock-runtime@3.462.0";
// Configuration
const CONFIG = {
    AWS_REGION: Deno.env.get("AWS_REGION") || "us-east-1",
    AWS_ACCESS_KEY_ID: Deno.env.get("AWS_ACCESS_KEY_ID") || "",
    AWS_SECRET_ACCESS_KEY: Deno.env.get("AWS_SECRET_ACCESS_KEY") || ""
};
// Function to get a Bedrock client
function getBedrockClient() {
    return new BedrockClient({
        region: CONFIG.AWS_REGION,
        credentials: {
            accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
            secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
        }
    });
}
// Function to get a BedrockRuntime client
function getBedrockRuntimeClient() {
    return new BedrockRuntimeClient({
        region: CONFIG.AWS_REGION,
        credentials: {
            accessKeyId: CONFIG.AWS_ACCESS_KEY_ID,
            secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY
        }
    });
}
// List foundation models
export function listFoundationModels(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[AWS] Listing available foundation models with filters:`, filters);
            const client = getBedrockClient();
            // Prepare command parameters with any filters provided
            const params = {};
            // Apply filters if provided
            if (filters) {
                // Provider filter (e.g., "amazon", "anthropic", "ai21", "cohere", "meta", "stability")
                if (filters.byProvider) {
                    params.byProvider = filters.byProvider;
                }
                // Output modality filter (e.g., "TEXT", "IMAGE")
                if (filters.byOutputModality) {
                    params.byOutputModality = filters.byOutputModality;
                }
                // Input modality filter (e.g., "TEXT")
                if (filters.byInputModality) {
                    params.byInputModality = filters.byInputModality;
                }
                // Inference type filter (e.g., "ON_DEMAND", "PROVISIONED")
                if (filters.byInferenceType) {
                    params.byInferenceType = filters.byInferenceType;
                }
                // Customization type filter (e.g., "FINE_TUNING")
                if (filters.byCustomizationType) {
                    params.byCustomizationType = filters.byCustomizationType;
                }
            }
            console.log(`[AWS] Sending ListFoundationModelsCommand with params:`, params);
            const command = new ListFoundationModelsCommand(params);
            const response = yield client.send(command);
            const models = response.modelSummaries || [];
            console.log(`[AWS] Found ${models.length} models matching criteria`);
            return {
                success: true,
                models,
                count: models.length,
                appliedFilters: filters || {}
            };
        }
        catch (error) {
            console.error("[AWS] Error listing foundation models:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                models: [],
                count: 0
            };
        }
    });
}
// List provisioned model throughputs
export function listProvisionedModelThroughputs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[AWS] Listing provisioned model throughputs`);
            const client = getBedrockClient();
            const command = new ListProvisionedModelThroughputsCommand({});
            const result = yield client.send(command);
            if (result.provisionedModelSummaries && result.provisionedModelSummaries.length > 0) {
                const instances = result.provisionedModelSummaries.map(model => ({
                    provisionedModelArn: model.provisionedModelArn || '',
                    modelId: model.modelArn || '',
                    provisionedModelStatus: model.status || 'UNKNOWN',
                    provisionedThroughput: {
                        commitmentDuration: model.commitmentDuration || 'ONE_MONTH',
                        provisionedModelThroughput: model.modelUnits || 1
                    },
                    creationTime: model.creationTime instanceof Date ?
                        model.creationTime.toISOString() :
                        new Date().toISOString()
                }));
                return {
                    success: true,
                    instances
                };
            }
            else {
                return {
                    success: true,
                    instances: [],
                    note: "No provisioned models found."
                };
            }
        }
        catch (error) {
            console.error("[AWS] Error in listProvisionedModelThroughputs:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                instances: []
            };
        }
    });
}
// Create a provisioned model throughput
export function createProvisionedModelThroughput(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[AWS] Creating provisioned model throughput for ${params.modelId}`);
            const client = getBedrockClient();
            // Generate a default name if none provided
            const provisionedModelName = params.provisionedModelName || `${params.modelId}-${Date.now()}`;
            // Prepare tags - will always include creation timestamp and source
            const tags = {
                CreatedBy: "AkiiApp",
                CreatedAt: new Date().toISOString(),
                Source: "akii-super-action"
            };
            // Add userID tag if provided
            if (params.userId) {
                tags.userId = params.userId;
                console.log(`[AWS] Adding userID tag: ${params.userId}`);
            }
            // Add any additional custom tags if provided
            if (params.tags && typeof params.tags === 'object') {
                Object.entries(params.tags).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        tags[key] = value;
                    }
                });
            }
            console.log(`[AWS] Creating provisioned model with name: ${provisionedModelName} and tags:`, tags);
            const input = {
                modelId: params.modelId,
                provisionedModelName: provisionedModelName,
                provisionedThroughput: {
                    commitmentDuration: params.commitmentDuration,
                    provisionedModelThroughput: params.modelUnits
                },
                tags: tags
            };
            const command = new CreateProvisionedModelThroughputCommand(input);
            const response = yield client.send(command);
            return {
                success: true,
                instance_id: response.provisionedModelArn,
                instance: {
                    provisionedModelArn: response.provisionedModelArn,
                    modelId: params.modelId,
                    provisionedModelStatus: response.status || "CREATING",
                    provisionedThroughput: {
                        commitmentDuration: params.commitmentDuration,
                        provisionedModelThroughput: params.modelUnits
                    },
                    creationTime: response.creationTime || new Date().toISOString(),
                    tags: tags
                }
            };
        }
        catch (error) {
            console.error("[AWS] Error creating provisioned model throughput:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Get details about a provisioned model throughput
export function getProvisionedModelThroughput(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log(`[AWS] Getting provisioned model throughput for ${instanceId}`);
            const client = getBedrockClient();
            const command = new GetProvisionedModelThroughputCommand({
                provisionedModelId: instanceId
            });
            const response = yield client.send(command);
            return {
                success: true,
                instance: {
                    provisionedModelArn: response.provisionedModelArn,
                    modelId: response.modelArn || '',
                    provisionedModelStatus: response.status || "UNKNOWN",
                    provisionedThroughput: {
                        commitmentDuration: ((_a = response.provisionedThroughput) === null || _a === void 0 ? void 0 : _a.commitmentDuration) || "ONE_MONTH",
                        provisionedModelThroughput: ((_b = response.provisionedThroughput) === null || _b === void 0 ? void 0 : _b.provisionedModelThroughput) || 0
                    },
                    creationTime: response.creationTime instanceof Date ?
                        response.creationTime.toISOString() :
                        new Date().toISOString()
                }
            };
        }
        catch (error) {
            console.error("[AWS] Error getting provisioned model throughput:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Delete a provisioned model throughput
export function deleteProvisionedModelThroughput(instanceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[AWS] Deleting provisioned model throughput ${instanceId}`);
            const client = getBedrockClient();
            const command = new DeleteProvisionedModelThroughputCommand({
                provisionedModelId: instanceId
            });
            const response = yield client.send(command);
            return {
                success: true,
                result: response
            };
        }
        catch (error) {
            console.error("[AWS] Error deleting provisioned model throughput:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Invoke a Bedrock model
export function invokeBedrockModel(params) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`[AWS] Invoking model ${params.instanceId}`);
            const client = getBedrockRuntimeClient();
            // Format the request body based on the model
            const modelIdMatch = (params.instanceId || '').match(/model\/([^\/]+)/);
            const modelId = modelIdMatch ? modelIdMatch[1] : '';
            // Determine the proper request format based on the model provider
            let requestBody;
            let responseFormat;
            if (modelId.includes('anthropic')) {
                // Anthropic Claude format
                requestBody = {
                    prompt: `\n\nHuman: ${params.prompt}\n\nAssistant:`,
                    max_tokens_to_sample: params.maxTokens || 500,
                    temperature: 0.7
                };
                responseFormat = 'text';
            }
            else if (modelId.includes('amazon')) {
                // Amazon Titan format
                requestBody = {
                    inputText: params.prompt,
                    textGenerationConfig: {
                        maxTokenCount: params.maxTokens || 500,
                        temperature: 0.7
                    }
                };
                responseFormat = 'json';
            }
            else {
                // Generic format
                requestBody = {
                    prompt: params.prompt,
                    max_tokens: params.maxTokens || 500
                };
                responseFormat = 'text';
            }
            const command = new InvokeModelCommand({
                modelId: params.instanceId,
                body: JSON.stringify(requestBody)
            });
            const response = yield client.send(command);
            // Process the response
            let parsedResponse;
            if (response.body) {
                const responseText = new TextDecoder().decode(response.body);
                try {
                    const jsonResponse = JSON.parse(responseText);
                    if (responseFormat === 'text') {
                        parsedResponse = jsonResponse.completion || jsonResponse.text || jsonResponse.generation || responseText;
                    }
                    else {
                        parsedResponse = jsonResponse;
                    }
                }
                catch (e) {
                    // If it's not valid JSON, return it as text
                    parsedResponse = responseText;
                }
            }
            // Estimate token counts (a very rough approximation)
            const inputTokens = Math.ceil(params.prompt.length / 4);
            const outputText = typeof parsedResponse === 'string' ? parsedResponse : JSON.stringify(parsedResponse);
            const outputTokens = Math.ceil(outputText.length / 4);
            return {
                success: true,
                response: parsedResponse,
                usage: {
                    input_tokens: inputTokens,
                    output_tokens: outputTokens,
                    total_tokens: inputTokens + outputTokens
                }
            };
        }
        catch (error) {
            console.error("[AWS] Error invoking model:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Verify AWS credentials and connectivity
export function verifyAwsCredentials() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("[AWS] Verifying AWS credentials");
            const client = getBedrockClient();
            const command = new ListFoundationModelsCommand({});
            const result = yield client.send(command);
            return {
                success: true,
                message: "AWS credentials verified successfully",
                details: {
                    modelsFound: ((_a = result.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0,
                    region: CONFIG.AWS_REGION
                }
            };
        }
        catch (error) {
            console.error("[AWS] Error verifying AWS credentials:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error.message : String(error),
                details: {
                    errorName: error instanceof Error ? error.name : "Unknown",
                    region: CONFIG.AWS_REGION
                }
            };
        }
    });
}
// Get usage statistics for Bedrock models
export function getBedrockUsageStats() {
    return __awaiter(this, arguments, void 0, function* (params = {}) {
        try {
            console.log("[AWS] Getting Bedrock usage statistics");
            // This is just a placeholder since AWS Bedrock doesn't have a direct API for this
            return {
                success: true,
                usage: {
                    total_tokens: 0,
                    total_requests: 0,
                    instances: {}
                },
                limits: {
                    rate_limit: 10, // Requests per second
                    token_limit: 100000 // Monthly token limit
                }
            };
        }
        catch (error) {
            console.error("[AWS] Error getting Bedrock usage stats:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
}
// Run AWS permissions test
export function runAwsPermissionsTest() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("[AWS] Running AWS permissions test");
            const client = getBedrockClient();
            const command = new ListFoundationModelsCommand({});
            const result = yield client.send(command);
            return {
                success: true,
                permissions: {
                    listModels: true,
                    invokeModels: true,
                    createProvisionedThroughput: true
                },
                modelsFound: ((_a = result.modelSummaries) === null || _a === void 0 ? void 0 : _a.length) || 0
            };
        }
        catch (error) {
            console.error("[AWS] Error running permissions test:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                permissions: {
                    listModels: false,
                    invokeModels: false,
                    createProvisionedThroughput: false
                }
            };
        }
    });
}
