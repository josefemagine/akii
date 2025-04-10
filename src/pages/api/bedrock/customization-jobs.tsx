import React from "react";
import { BedrockClient, ListModelCustomizationJobsCommand } from "@aws-sdk/client-bedrock";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
interface CustomizationJobsProps {}


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
    // Only handle GET request - List all customization jobs
    if (req.method === "GET") {
      const listCommand = new ListModelCustomizationJobsCommand({});
      const response = await bedrockClient.send(listCommand);
      
      // Transform the response to a more usable format for the frontend
      const jobs = response.modelCustomizationJobSummaries.map(job => ({
        jobName: job.jobName,
        jobArn: job.jobArn,
        baseModelId: job.baseModelId,
        outputModelId: job.outputModelId,
        status: job.status,
        creationTime: job.creationTime,
        endTime: job.endTime || null,
        customizationType: job.customizationType,
        hyperParameters: job.hyperParameters,
        // Extract customer from tags if available
        customer: job.tags?.customer || "Internal"
      }));
      
      return res.status(200).json(jobs);
    }
    
    // Handle unsupported HTTP methods
    else {
      res.setHeader("Allow", ["GET"]);
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