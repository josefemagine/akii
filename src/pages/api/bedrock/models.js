import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";
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

// Map of model IDs to more friendly display names
const modelDisplayNames = {
  "anthropic.claude-instant-v1": "Claude Instant",
  "anthropic.claude-v2": "Claude 2",
  "anthropic.claude-v2:1": "Claude 2.1",
  "anthropic.claude-3-sonnet-20240229-v1:0": "Claude 3 Sonnet",
  "anthropic.claude-3-haiku-20240307-v1:0": "Claude 3 Haiku",
  "amazon.titan-text-lite-v1": "Amazon Titan Text Lite",
  "amazon.titan-text-express-v1": "Amazon Titan Text Express",
  "amazon.titan-embed-text-v1": "Amazon Titan Embed Text",
  "meta.llama2-13b-chat-v1": "Meta Llama 2 13B Chat",
  "meta.llama2-70b-chat-v1": "Meta Llama 2 70B Chat",
  "cohere.command-text-v14": "Cohere Command",
  "ai21.j2-ultra-v1": "AI21 Jurassic-2 Ultra",
  "ai21.j2-mid-v1": "AI21 Jurassic-2 Mid",
};

export default async function handler(req, res) {
  // Check user session and authorization
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || !session.user || !session.user.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Only handle GET request - List all foundation models
    if (req.method === "GET") {
      const listCommand = new ListFoundationModelsCommand({});
      const response = await bedrockClient.send(listCommand);
      
      // Transform the response to a more usable format for the frontend
      const models = response.modelSummaries
        .filter(model => 
          // Only include models that can be provisioned
          model.responseStreamingSupported && 
          !model.inferenceTypesSupported.includes("ON_DEMAND_ONLY")
        )
        .map(model => ({
          modelId: model.modelId,
          modelName: modelDisplayNames[model.modelId] || model.modelId,
          provider: model.providerName,
          inferenceTypes: model.inferenceTypesSupported,
          streaming: model.responseStreamingSupported,
          inputModalities: model.inputModalities,
          outputModalities: model.outputModalities,
          customizationSupported: model.customizationsSupported
        }))
        .sort((a, b) => {
          // Sort models by provider and then by name
          if (a.provider !== b.provider) {
            return a.provider.localeCompare(b.provider);
          }
          return a.modelName.localeCompare(b.modelName);
        });
      
      return res.status(200).json(models);
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