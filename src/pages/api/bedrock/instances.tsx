import React from "react";
import { BedrockClient, ListProvisionedModelThroughputsCommand, CreateProvisionedModelThroughputCommand } from "@aws-sdk/client-bedrock";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
interface instancesProps {}


// Initialize AWS Bedrock client with credentials from environment variables
const bedrockClient = new BedrockClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // Check user session and authorization
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user || !session.user.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Handle GET request - List all instances
    if (req.method === "GET") {
      const listCommand = new ListProvisionedModelThroughputsCommand({});
      const response = await bedrockClient.send(listCommand);
      
      // Transform the response to a more usable format for the frontend
      const instances = response.provisionedModelThroughputs.map(instance => ({
        id: instance.provisionedModelId,
        name: instance.provisionedModelName,
        modelId: instance.modelId,
        status: instance.provisionedModelThroughputStatus,
        throughput: instance.provisionedThroughput.provisionedModelThroughput,
        creationTime: instance.creationTime,
        // Extract plan from tags if available
        plan: instance.tags?.plan || "Custom"
      }));
      
      return res.status(200).json(instances);
    }
    
    // Handle POST request - Create a new instance
    else if (req.method === "POST") {
      const { modelId, provisionedModelName, commitmentDuration, throughputCapacity, plan } = req.body;
      
      // Validate request data
      if (!modelId || !provisionedModelName || !commitmentDuration || !throughputCapacity) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Prepare tags including the plan information
      const tags = plan ? { plan } : {};
      
      const createCommand = new CreateProvisionedModelThroughputCommand({
        modelId,
        provisionedModelName,
        provisionedThroughput: {
          commitmentDuration,
          provisionedModelThroughput: throughputCapacity,
        },
        tags,
      });
      
      const response = await bedrockClient.send(createCommand);
      
      return res.status(201).json({
        id: response.provisionedModelId,
        name: provisionedModelName,
        modelId,
        status: "Creating", // Initial status
        throughput: throughputCapacity,
        creationTime: new Date().toISOString(),
        plan,
      });
    }
    
    // Handle unsupported HTTP methods
    else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("AWS Bedrock API error:", error);
    return res.status(500).json({ 
      error: "Failed to process request", 
      message: error.message 
    });
  }
} 