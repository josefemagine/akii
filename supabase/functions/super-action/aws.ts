// AWS Bedrock Integration
// This file provides real implementations of AWS Bedrock API calls

import { CONFIG } from "./config.ts";

// Instance type definition 
interface ProvisionedModel {
  provisionedModelArn: string;
  modelId: string;
  provisionedModelStatus: string;
  provisionedThroughput: {
    commitmentDuration: string;
    provisionedModelThroughput: number;
  };
  creationTime: string;
}

// Helper for environment variables
const getEnv = (name: string, defaultValue: string = ""): string => {
  // @ts-ignore - Deno.env access
  return Deno?.env?.get?.(name) || defaultValue;
};

// AWS API request signing utilities
async function getAwsSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const kDate = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw", 
      encoder.encode(`AWS4${key}`), 
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    encoder.encode(dateStamp)
  );
  
  const kRegion = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw", 
      new Uint8Array(kDate), 
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    encoder.encode(regionName)
  );
  
  const kService = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw", 
      new Uint8Array(kRegion), 
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    encoder.encode(serviceName)
  );
  
  const kSigning = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw", 
      new Uint8Array(kService), 
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    encoder.encode("aws4_request")
  );
  
  return kSigning;
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function signAwsRequest(
  method: string,
  url: URL,
  region: string,
  service: string,
  headers: Record<string, string>,
  body?: string
): Promise<Record<string, string>> {
  const accessKey = CONFIG.AWS_ACCESS_KEY_ID;
  const secretKey = CONFIG.AWS_SECRET_ACCESS_KEY;
  
  if (!accessKey || !secretKey) {
    throw new Error("AWS credentials not found");
  }
  
  const amzdate = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStamp = amzdate.substring(0, 8);
  
  // Add required headers
  headers['host'] = url.host;
  headers['x-amz-date'] = amzdate;
  
  // Sort headers by key
  const sortedHeaders = Object.keys(headers).sort().reduce((acc, key) => {
    acc[key.toLowerCase()] = headers[key];
    return acc;
  }, {} as Record<string, string>);
  
  // Create canonical request
  const canonicalHeaders = Object.keys(sortedHeaders)
    .map(key => `${key}:${sortedHeaders[key]}\n`)
    .join('');
  
  const signedHeaders = Object.keys(sortedHeaders)
    .join(';');
  
  const payloadHash = await sha256(body || '');
  
  const canonicalRequest = [
    method,
    url.pathname,
    url.search,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzdate,
    credentialScope,
    await sha256(canonicalRequest)
  ].join('\n');
  
  // Calculate signature
  const signature = Array.from(new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw", 
        new Uint8Array(await getAwsSignatureKey(secretKey, dateStamp, region, service)), 
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(stringToSign)
    )
  ))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Add Authorization header
  headers['Authorization'] = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return headers;
}

// Helper function to make AWS API requests
async function awsApiRequest(
  operation: string,
  service: string,
  region: string,
  body?: any
): Promise<any> {
  const endpoint = `https://${service}.${region}.amazonaws.com/`;
  const url = new URL(endpoint);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (service === 'bedrock') {
    headers['X-Amz-Target'] = `Bedrock.${operation}`;
  }
  
  const bodyString = body ? JSON.stringify(body) : '';
  
  try {
    console.log(`[AWS] Making ${operation} request to ${service}.${region}.amazonaws.com`);
    
    const signedHeaders = await signAwsRequest(
      'POST',
      url,
      region,
      service,
      headers,
      bodyString
    );
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: signedHeaders,
      body: bodyString,
    });
    
    // Get response text for both success and error cases
    const responseText = await response.text();
    console.log(`[AWS] ${operation} response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[AWS] Error response body:`, responseText);
      throw new Error(`AWS API Error: ${response.status} ${response.statusText} - ${responseText}`);
    }
    
    // Parse JSON response if it's valid JSON
    try {
      return responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.warn(`[AWS] Could not parse response as JSON:`, responseText);
      return { rawResponse: responseText };
    }
  } catch (error) {
    console.error(`Error making AWS API request to ${operation}:`, error);
    throw error;
  }
}

// Create a provisioned model throughput
export async function createProvisionedModelThroughput(params: {
  modelId: string,
  commitmentDuration: string,
  modelUnits: number
}) {
  try {
    console.log(`[AWS] Creating provisioned model for ${params.modelId}`);
    
    // Convert commitment duration to AWS format
    let commitmentTerm = "1m"; // default: 1 month
    if (params.commitmentDuration === "THREE_MONTHS") {
      commitmentTerm = "3m";
    }
    
    // Construct the proper model ID
    let fullModelId = params.modelId;
    if (!fullModelId.includes(':')) {
      fullModelId = `arn:aws:bedrock:${CONFIG.AWS_REGION}::foundation-model/${params.modelId}`;
    }
    
    const result = await awsApiRequest(
      'CreateProvisionedModelThroughput',
      'bedrock',
      CONFIG.AWS_REGION,
      {
        modelId: fullModelId,
        provisionedModelName: `provisioned-${params.modelId.split('/').pop()}-${Date.now()}`,
        provisionedThroughput: {
          commitmentDuration: commitmentTerm,
          provisionedModelThroughput: params.modelUnits
        }
      }
    );
    
    console.log(`[AWS] Successfully created provisioned model:`, result);
    
    return {
      success: true,
      instance: result,
      instance_id: result.provisionedModelArn
    };
  } catch (error) {
    console.error("[AWS] Error creating provisioned model throughput:", error);
    return {
      success: false,
      error: error.message || "Error creating provisioned model throughput in AWS Bedrock"
    };
  }
}

// List provisioned model throughputs
export async function listProvisionedModelThroughputs() {
  try {
    console.log(`[AWS] Listing provisioned models`);
    
    const result = await awsApiRequest(
      'ListProvisionedModelThroughputs',
      'bedrock',
      CONFIG.AWS_REGION,
      {}
    );
    
    return {
      success: true,
      instances: result.provisionedModelSummaries || []
    };
  } catch (error) {
    console.error("[AWS] Error listing provisioned models:", error);
    return {
      success: false,
      error: error.message || "Error listing provisioned models in AWS Bedrock"
    };
  }
}

// Get a specific provisioned model throughput
export async function getProvisionedModelThroughput(provisionedModelId: string) {
  try {
    console.log(`[AWS] Getting provisioned model ${provisionedModelId}`);
    
    const result = await awsApiRequest(
      'GetProvisionedModelThroughput',
      'bedrock',
      CONFIG.AWS_REGION,
      {
        provisionedModelId
      }
    );
    
    return {
      success: true,
      instance: result
    };
  } catch (error) {
    console.error(`[AWS] Error getting provisioned model ${provisionedModelId}:`, error);
    return {
      success: false,
      error: error.message || "Error getting provisioned model details from AWS Bedrock"
    };
  }
}

// Delete a provisioned model throughput
export async function deleteProvisionedModelThroughput(provisionedModelId: string) {
  try {
    console.log(`[AWS] Deleting provisioned model ${provisionedModelId}`);
    
    const result = await awsApiRequest(
      'DeleteProvisionedModelThroughput',
      'bedrock',
      CONFIG.AWS_REGION,
      {
        provisionedModelId
      }
    );
    
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error(`[AWS] Error deleting provisioned model ${provisionedModelId}:`, error);
    return {
      success: false,
      error: error.message || "Error deleting provisioned model from AWS Bedrock"
    };
  }
}

// Invoke a model to generate AI text
export async function invokeBedrockModel({
  instanceId,
  prompt,
  maxTokens = 500,
  temperature = 0.7,
  topP = 0.9,
  stopSequences = []
}) {
  try {
    console.log(`[AWS] Invoking model ${instanceId}`);
    
    // Prepare request body based on model type (assuming Claude)
    const requestBody = {
      prompt: prompt,
      max_tokens_to_sample: maxTokens,
      temperature: temperature,
      top_p: topP,
      stop_sequences: stopSequences
    };
    
    // For the invoke endpoint, use bedrock-runtime service instead of bedrock
    const endpoint = `https://bedrock-runtime.${CONFIG.AWS_REGION}.amazonaws.com/model/${instanceId}/invoke`;
    const url = new URL(endpoint);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const bodyString = JSON.stringify(requestBody);
    
    const signedHeaders = await signAwsRequest(
      'POST',
      url,
      CONFIG.AWS_REGION,
      'bedrock',
      headers,
      bodyString
    );
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: signedHeaders,
      body: bodyString
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS Bedrock Runtime Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    
    // Parse response and token usage
    const responseText = responseData.completion || responseData.text || responseData.generation;
    
    // Estimate token usage (AWS doesn't provide this directly)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(responseText.length / 4);
    
    return {
      success: true,
      response: responseText,
      usage: {
        input_tokens: responseData.usage?.input_tokens || inputTokens,
        output_tokens: responseData.usage?.output_tokens || outputTokens,
        total_tokens: responseData.usage?.total_tokens || (inputTokens + outputTokens)
      }
    };
  } catch (error) {
    console.error("[AWS] Error invoking model:", error);
    return {
      success: false,
      error: error.message || "Error invoking model in AWS Bedrock"
    };
  }
}

// Get usage statistics for Bedrock instances
export async function getBedrockUsageStats(options = {}) {
  try {
    console.log(`[AWS] Getting usage statistics`);
    
    // First, get the list of instances
    const instancesResponse = await listProvisionedModelThroughputs();
    
    if (!instancesResponse.success) {
      throw new Error(instancesResponse.error || "Failed to list instances for usage statistics");
    }
    
    const instances = instancesResponse.instances || [];
    
    // AWS doesn't provide a direct API for token usage, so we'll estimate based on billing data
    // This would need to be replaced with a call to AWS Cost Explorer API in a real implementation
    
    // For now, return a placeholder with the actual instances but estimated usage
    const usageData = instances.map(instance => ({
      instance_id: instance.provisionedModelArn,
      // Placeholders for usage data
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0
    }));
    
    // Calculate total usage
    const totalUsage = usageData.reduce((acc, cur) => {
      acc.total_tokens += cur.total_tokens;
      acc.input_tokens += cur.input_tokens;
      acc.output_tokens += cur.output_tokens;
      return acc;
    }, { total_tokens: 0, input_tokens: 0, output_tokens: 0 });
    
    return {
      success: true,
      usage: {
        total_tokens: totalUsage.total_tokens,
        input_tokens: totalUsage.input_tokens,
        output_tokens: totalUsage.output_tokens,
        instances: usageData
      },
      limits: {
        max_tokens: 0, // Unknown - would need to be retrieved from AWS service quotas
        usage_percentage: 0
      }
    };
  } catch (error) {
    console.error("[AWS] Error getting usage statistics:", error);
    return {
      success: false,
      error: error.message || "Error retrieving usage statistics from AWS Bedrock"
    };
  }
} 