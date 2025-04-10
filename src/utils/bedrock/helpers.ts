/**
 * Utility functions for AWS Bedrock
 */
import { FoundationModel } from '@/types/bedrock.ts';

/**
 * Maps a model ID to a user-friendly plan name
 * @param modelId The AWS Bedrock model ID
 * @returns A user-friendly plan name
 */
export function getPlanFromModelId(modelId: string): string {
  const planMap: Record<string, string> = {
    'amazon.titan-text-lite-v1': 'starter',
    'amazon.titan-text-express-v1': 'pro',
    'anthropic.claude-instant-v1': 'business',
    'anthropic.claude-v2': 'business'
  };
  
  return planMap[modelId] || 'custom';
}

/**
 * Default plan configuration - maps to AWS Bedrock models and commitment options
 */
export const DEFAULT_PLAN_CONFIG = {
  starter: {
    modelId: "amazon.titan-text-lite-v1",
    commitmentDuration: "ONE_MONTH",
    modelUnits: 1
  },
  pro: {
    modelId: "amazon.titan-text-express-v1",
    commitmentDuration: "ONE_MONTH",
    modelUnits: 2
  },
  business: {
    modelId: "anthropic.claude-instant-v1",
    commitmentDuration: "ONE_MONTH", 
    modelUnits: 5
  },
};

/**
 * Default filter options for the models
 */
export const DEFAULT_MODEL_FILTERS = [
  {
    key: 'provider',
    label: 'Provider',
    options: [
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'amazon', label: 'Amazon' },
      { value: 'ai21', label: 'AI21 Labs' },
      { value: 'cohere', label: 'Cohere' },
      { value: 'meta', label: 'Meta' },
      { value: 'stability', label: 'Stability AI' }
    ]
  },
  {
    key: 'modality',
    label: 'Modality',
    options: [
      { value: 'TEXT', label: 'Text' },
      { value: 'IMAGE', label: 'Image' },
      { value: 'EMBEDDING', label: 'Embedding' }
    ]
  },
  {
    key: 'streaming',
    label: 'Streaming',
    options: [
      { value: 'true', label: 'Supported' },
      { value: 'false', label: 'Not Supported' }
    ]
  }
];

/**
 * Normalizes a foundation model object to ensure it has consistent field names
 * @param model The foundation model object from the API
 * @returns A normalized foundation model object
 */
export function normalizeFoundationModel(model: any): FoundationModel {
  return {
    modelId: model.modelId || model.id,
    modelName: model.modelName || model.name,
    providerName: model.providerName || model.provider,
    inputModalities: model.inputModalities || model.inputs,
    outputModalities: model.outputModalities || model.outputs,
    inferenceTypesSupported: model.inferenceTypesSupported || model.inferenceTypes,
    customizationsSupported: model.customizationsSupported || model.customizations,
    responseStreamingSupported: Boolean(model.responseStreamingSupported),
    ...model
  };
}

/**
 * Filters foundation models based on the provided criteria
 * @param models Array of foundation models
 * @param filters Object containing filter criteria
 * @returns Filtered array of foundation models
 */
export function filterFoundationModels(
  models: FoundationModel[],
  filters: Record<string, string>
): FoundationModel[] {
  if (!models || !models.length) return [];
  if (!filters || Object.keys(filters).length === 0) return models;

  return models.filter(model => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      
      switch (key) {
        case 'provider':
          const providerName = model.providerName || model.provider || '';
          if (!providerName.toLowerCase().includes(value.toLowerCase())) {
            return false;
          }
          break;
          
        case 'modality':
          const inputMods = model.inputModalities || model.inputs || [];
          const outputMods = model.outputModalities || model.outputs || [];
          const hasMod = [...inputMods, ...outputMods].some(
            m => m.toUpperCase() === value.toUpperCase()
          );
          if (!hasMod) {
            return false;
          }
          break;
          
        case 'streaming':
          const isStreaming = Boolean(model.responseStreamingSupported);
          if ((value === 'true' && !isStreaming) || (value === 'false' && isStreaming)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  });
} 