/**
 * AWS Bedrock Types
 */

/**
 * Type for AWS Bedrock instance in our database
 */
export interface BedrockInstance {
  id: number;
  instance_id: string;
  model_id: string;
  commitment_duration: string;
  model_units: number;
  status: string;
  created_at: string;
  deleted_at: string | null;
}

/**
 * Simple Bedrock model interface for UI display
 */
export interface BedrockModel {
  id: string;
  name: string;
  provider: string;
}

/**
 * Foundation model from AWS Bedrock API
 */
export interface FoundationModel {
  // Standard field names we use in the app
  modelId?: string;
  modelName?: string;
  providerName?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  inferenceTypesSupported?: string[];
  customizationsSupported?: string[];
  responseStreamingSupported?: boolean;
  
  // Alternative field names from the API
  id?: string;
  name?: string;
  provider?: string;
  inputs?: string[];
  outputs?: string[];
  inferenceTypes?: string[];
  customizations?: string[];
  
  // Allow any other properties
  [key: string]: any;
}

/**
 * Environment diagnostics from the API
 */
export interface EnvironmentDiagnostics {
  apiVersion?: string;
  environment?: string;
  awsRegion?: string;
  auth?: string;
  timestamp?: string;
  [key: string]: any;
}

/**
 * Connection status enum
 */
export type ConnectionStatus = 'unknown' | 'checking' | 'connected' | 'error';

/**
 * Authentication status enum
 */
export type AuthStatus = 'unknown' | 'checking' | 'authenticated' | 'unauthenticated' | 'expired' | 'error';

/**
 * Plan configuration for AWS Bedrock
 */
export interface PlanConfig {
  [key: string]: {
    modelId: string;
    commitmentDuration: string;
    modelUnits: number;
  };
}

/**
 * Model filter interface
 */
export interface ModelFilter {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

/**
 * Options for creating a new instance
 */
export interface InstanceCreationOptions {
  modelId: string;
  commitmentDuration: string;
  modelUnits: number;
  provisionedModelName: string;
}

/**
 * Client status information
 */
export interface ClientStatus {
  usingFallback?: boolean;
  configured?: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Props for the Bedrock Dashboard Content component
 */
export interface BedrockDashboardContentProps {
  loading: boolean;
  refreshing: boolean;
  authStatus: AuthStatus;
  error: string | null;
  connectionStatus: ConnectionStatus;
  instances: BedrockInstance[];
  testModalOpen: boolean;
  oldTestModalOpen?: boolean;
  testData: any;
  setTestModalOpen: (open: boolean) => void;
  awsTestModalOpen: boolean;
  setAwsTestModalOpen: (open: boolean) => void;
  showDiagnostics: boolean;
  envDiagnostics: EnvironmentDiagnostics;
  testingConnection: boolean;
  submitting: boolean;
  selectedPlan: string;
  selectedModelId: string;
  availableModels: FoundationModel[];
  loadingModels: boolean;
  showFilters: boolean;
  activeFilters: Record<string, string>;
  planConfig: PlanConfig;
  client?: any;
  credentials?: any;
  clientStatus?: any;
  user?: any;
  directUser?: any;
  isAdmin?: boolean;
  checkAuthStatus: () => Promise<any>;
  handleLogin: () => void;
  refreshInstances: () => Promise<any>;
  fetchEnvironmentDiagnostics: () => Promise<any>;
  fetchDetailedTestData: () => Promise<any>;
  fetchAvailableModels: (filters?: any) => Promise<any>;
  handleProvisionInstance: () => Promise<void>;
  handleDeleteInstance: (instanceId: string) => Promise<void>;
  setShowFilters: (show: boolean) => void;
  setActiveFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setAvailableModels: (models: FoundationModel[]) => void;
  setSelectedModelId: (id: string) => void;
  setSelectedPlan: (plan: string) => void;
  testConnection: () => Promise<any>;
  openTestModal: () => void;
  customInstanceName: string;
  setCustomInstanceName: (name: string) => void;
  toast: any;
}

/**
 * Props for the API Config Panel component
 */
export interface ApiConfigPanelProps {
  connectionStatus: ConnectionStatus;
  authStatus: AuthStatus;
  handleLogin: () => void;
  checkAuthStatus: () => Promise<any>;
  refreshInstances: () => Promise<any>;
  testingConnection: boolean;
  refreshing: boolean;
  credentials: any;
  clientStatus: ClientStatus;
  testConnection: () => Promise<any>;
  openTestModal: () => void;
}

/**
 * Props for the Model Filters component
 */
export interface ModelFiltersProps {
  activeFilters: Record<string, string>;
  setActiveFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loadingModels: boolean;
  fetchAvailableModels: (filters?: any) => Promise<any>;
}

/**
 * Props for the Instance List component
 */
export interface InstanceListProps {
  instances: BedrockInstance[];
  loading: boolean;
  refreshing: boolean;
  handleDeleteInstance: (instanceId: string) => Promise<void>;
  refreshInstances: () => Promise<any>;
} 