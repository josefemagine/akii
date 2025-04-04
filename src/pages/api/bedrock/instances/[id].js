import { 
  BedrockClient, 
  GetProvisionedModelThroughputCommand,
  DeleteProvisionedModelThroughputCommand 
} from "@aws-sdk/client-bedrock";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

  // Get instance ID from the request URL
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: "Instance ID is required" });
  }

  try {
    // Handle GET request - Get instance details
    if (req.method === "GET") {
      const getCommand = new GetProvisionedModelThroughputCommand({
        provisionedModelId: id
      });
      
      const response = await bedrockClient.send(getCommand);
      
      // Transform the response to a more usable format for the frontend
      const instance = {
        id: response.provisionedModelId,
        name: response.provisionedModelName,
        modelId: response.modelId,
        status: response.provisionedModelThroughputStatus,
        throughput: response.provisionedThroughput.provisionedModelThroughput,
        creationTime: response.creationTime,
        expirationTime: response.provisionedThroughput.expirationTime,
        commitmentDuration: response.provisionedThroughput.commitmentDuration,
        // Extract plan from tags if available
        plan: response.tags?.plan || "Custom"
      };
      
      return res.status(200).json(instance);
    }
    
    // Handle DELETE request - Delete an instance
    else if (req.method === "DELETE") {
      const deleteCommand = new DeleteProvisionedModelThroughputCommand({
        provisionedModelId: id
      });
      
      await bedrockClient.send(deleteCommand);
      
      return res.status(200).json({
        message: "Instance deletion initiated successfully",
        id
      });
    }
    
    // Handle unsupported HTTP methods
    else {
      res.setHeader("Allow", ["GET", "DELETE"]);
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