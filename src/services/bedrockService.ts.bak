/**
 * Service for AWS Bedrock API calls
 */
import { BedrockClient } from "@/lib/supabase-bedrock-client";
import { createBedrockClient } from "@/lib/aws-bedrock-client";
import { 
  FoundationModel, 
  BedrockInstance, 
  InstanceCreationOptions,
  EnvironmentDiagnostics 
} from "@/types/bedrock";
import { 
  normalizeFoundationModel, 
  filterFoundationModels 
} from "@/utils/bedrock/helpers";

class BedrockService {
  /**
   * Checks the authentication status with AWS Bedrock
   * @returns Authentication result object
   */
  async checkAuth(): Promise<{ connected: boolean; message?: string }> {
    console.log("[BedrockService] Checking auth status...");
    try {
      const result = await BedrockClient.checkAuth();
      console.log("[BedrockService] Auth check result:", result);
      return result || { connected: false, message: "No response from auth check" };
    } catch (err: unknown) {
      console.error("[BedrockService] Auth check error:", err);
      return { 
        connected: false, 
        message: err instanceof Error ? err.message : "Authentication check failed" 
      };
    }
  }

  /**
   * Lists all Bedrock instances for the current user
   * @returns Array of Bedrock instances
   */
  async listInstances(): Promise<BedrockInstance[]> {
    console.log("[BedrockService] Listing instances...");
    try {
      const result = await BedrockClient.listInstances();
      console.log("[BedrockService] Instances retrieved:", result?.length || 0);
      return result || [];
    } catch (err: unknown) {
      console.error("[BedrockService] Error listing instances:", err);
      throw err instanceof Error 
        ? err 
        : new Error("Failed to retrieve instances");
    }
  }

  /**
   * Creates a new Bedrock instance
   * @param options Instance creation options
   * @returns Created instance data
   */
  async createInstance(options: InstanceCreationOptions): Promise<any> {
    console.log("[BedrockService] Creating instance with options:", options);
    try {
      const result = await BedrockClient.createInstance(options);
      console.log("[BedrockService] Instance created:", result);
      return result;
    } catch (err: unknown) {
      console.error("[BedrockService] Error creating instance:", err);
      throw err instanceof Error 
        ? err 
        : new Error("Failed to create instance");
    }
  }

  /**
   * Deletes a Bedrock instance
   * @param instanceId The ID of the instance to delete
   * @returns Result of the deletion operation
   */
  async deleteInstance(instanceId: string): Promise<any> {
    console.log("[BedrockService] Deleting instance:", instanceId);
    try {
      const result = await BedrockClient.deleteInstance(instanceId);
      console.log("[BedrockService] Instance deleted:", result);
      return result;
    } catch (err: unknown) {
      console.error("[BedrockService] Error deleting instance:", err);
      throw err instanceof Error 
        ? err 
        : new Error("Failed to delete instance");
    }
  }

  /**
   * Tests the connection to AWS Bedrock
   * @returns Test results
   */
  async testEnvironment(): Promise<any> {
    console.log("[BedrockService] Testing environment...");
    try {
      const result = await BedrockClient.testEnvironment();
      console.log("[BedrockService] Environment test result:", result);
      return result;
    } catch (err: unknown) {
      console.error("[BedrockService] Environment test error:", err);
      throw err instanceof Error 
        ? err 
        : new Error("Failed to test environment");
    }
  }

  /**
   * Fetches environment diagnostics
   * @returns Environment diagnostics data
   */
  async getEnvironmentDiagnostics(): Promise<EnvironmentDiagnostics> {
    console.log("[BedrockService] Fetching environment diagnostics...");
    try {
      const result = await BedrockClient.getEnvironmentDiagnostics();
      console.log("[BedrockService] Environment diagnostics:", result);
      return result || {};
    } catch (err: unknown) {
      console.error("[BedrockService] Error fetching environment diagnostics:", err);
      return { 
        error: true, 
        message: err instanceof Error ? err.message : "Failed to fetch environment diagnostics" 
      };
    }
  }

  /**
   * Lists foundation models available in AWS Bedrock
   * @param filters Optional filters to apply
   * @returns Array of foundation models
   */
  async listFoundationModels(filters = {}): Promise<FoundationModel[]> {
    console.log("[BedrockService] Listing foundation models with filters:", filters);
    try {
      const result = await BedrockClient.listFoundationModels();
      console.log("[BedrockService] Models retrieved:", result?.length || 0);
      
      // Normalize models
      const normalizedModels = (result || []).map(normalizeFoundationModel);
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        return filterFoundationModels(normalizedModels, filters);
      }
      
      return normalizedModels;
    } catch (err: unknown) {
      console.error("[BedrockService] Error listing foundation models:", err);
      throw err instanceof Error 
        ? err 
        : new Error("Failed to retrieve foundation models");
    }
  }

  /**
   * Gets detailed test data for diagnostics
   * @returns Detailed test data
   */
  async getDetailedTestData(): Promise<any> {
    console.log("[BedrockService] Fetching detailed test data...");
    try {
      const result = await BedrockClient.getDetailedTestData();
      console.log("[BedrockService] Detailed test data:", result);
      return result;
    } catch (err: unknown) {
      console.error("[BedrockService] Error fetching detailed test data:", err);
      return { 
        error: true, 
        message: err instanceof Error ? err.message : "Failed to fetch detailed test data" 
      };
    }
  }
}

// Export a singleton instance
export default new BedrockService(); 