// Type definitions for Deno APIs
// This file provides type declarations for Deno runtime APIs

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  export interface BuildInfo {
    target: string;
    arch: string;
    os: string;
    vendor: string;
    env?: string;
  }

  export const build: BuildInfo;

  export interface ConnInfo {
    localAddr: Deno.NetAddr;
    remoteAddr: Deno.NetAddr;
  }

  export interface NetAddr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  // Add more Deno API declarations as needed
}

// Declare module for npm: imports used in Deno
declare module "npm:*" {
  const content: any;
  export = content;
  export default content;
}

// Declare module for https: imports used in Deno
declare module "https://*" {
  const content: any;
  export = content;
  export default content;
}

// Specifically handle the AWS SDK modules
declare module "npm:@aws-sdk/client-bedrock*" {
  export class BedrockClient {
    constructor(options?: any);
    send(command: any): Promise<any>;
  }
  
  export class ListFoundationModelsCommand {
    constructor(options?: any);
  }
  
  export class ListProvisionedModelThroughputsCommand {
    constructor(options?: any);
  }
  
  export class CreateProvisionedModelThroughputCommand {
    constructor(options?: any);
  }
  
  export class GetProvisionedModelThroughputCommand {
    constructor(options?: any);
  }
  
  export class DeleteProvisionedModelThroughputCommand {
    constructor(options?: any);
  }
}

declare module "npm:@aws-sdk/client-bedrock-runtime*" {
  export class BedrockRuntimeClient {
    constructor(options?: any);
    send(command: any): Promise<any>;
  }
  
  export class InvokeModelCommand {
    constructor(options?: any);
  }
} 