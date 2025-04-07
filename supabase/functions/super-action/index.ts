// Minimal Edge Function for AWS Bedrock
import serve from "https://deno.land/std@0.168.0/http/server.ts"; // Use default import

// Import AWS SDK
import { BedrockClient, ListFoundationModelsCommand, ListProvisionedModelThroughputsCommand } from "npm:@aws-sdk/client-bedrock@3.462.0";

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey, X-Client-Info",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json"
};

// Main handler function
serve(async (req) => {
  // Log the origin
  console.log("Origin:", req.headers.get("Origin"));

  // Determine the origin
  const origin = req.headers.get("Origin");
  const allowedOrigins = ["https://www.akii.com", "https://api.akii.com"];

  // Set CORS headers based on the origin
  if (origin && allowedOrigins.includes(origin)) {
    CORS_HEADERS["Access-Control-Allow-Origin"] = origin;
  } else {
    CORS_HEADERS["Access-Control-Allow-Origin"] = "null"; // or handle as needed
  }

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[CORS] Handling OPTIONS preflight request");
    return new Response(null, { 
      status: 204,
      headers: CORS_HEADERS
    });
  }
  
  try {
    // Parse the request body for action and data
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    // Extract action and data
    const action = requestData.action || "";
    const data = requestData.data || {};
    
    // Get AWS configuration
    const region = Deno.env.get("AWS_REGION") || "us-east-1";
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID") || "";
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY") || "";
    
    // Create AWS client
    const client = new BedrockClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
    
    // Handle different actions
    if (action === "ListProvisionedModelThroughputs") {
      console.log("Listing provisioned model throughputs");
      const command = new ListProvisionedModelThroughputsCommand({});
      const result = await client.send(command);
      
      // Process the result
      const instances = (result.provisionedModelSummaries || []).map(model => ({
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
      
      return new Response(JSON.stringify({
        success: true,
        instances,
        count: instances.length
      }), {
        headers: CORS_HEADERS,
        status: 200
      });
    } else if (action === "ListFoundationModels") {
      console.log("Listing foundation models");
      const command = new ListFoundationModelsCommand({});
      const result = await client.send(command);
      
      const models = (result.modelSummaries || []).map(model => ({
        modelArn: model.modelArn,
        modelId: model.modelId,
        modelName: model.modelName,
        providerName: model.providerName,
        inputModalities: model.inputModalities,
        outputModalities: model.outputModalities,
        responseStreamingSupported: model.responseStreamingSupported,
        customizationsSupported: model.customizationsSupported
      }));
      
      return new Response(JSON.stringify({
        success: true,
        models,
        count: models.length
      }), {
        headers: CORS_HEADERS,
        status: 200
      });
    } else {
      // Default action - test API connection
      console.log("Testing API connection");
      const command = new ListFoundationModelsCommand({});
      const result = await client.send(command);
      
      return new Response(JSON.stringify({
        success: true,
        message: "AWS connection successful",
        models: result.modelSummaries?.length || 0,
        region
      }), {
        headers: CORS_HEADERS,
        status: 200
      });
    }
  } catch (error) {
    console.error("[ERROR]", error);
    // Handle errors
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: CORS_HEADERS
    });
  }
});