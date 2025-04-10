import React from 'react';
import { BedrockInstance } from '@/types/bedrock';
import { BedrockInstanceCard } from './BedrockInstanceCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface BedrockInstanceListProps {
  instances: BedrockInstance[];
  isLoading: boolean;
  onDeleteInstance: (instanceId: string) => void;
  onRefreshInstances: () => void;
}

export const BedrockInstanceList: React.FC<BedrockInstanceListProps> = ({
  instances,
  isLoading,
  onDeleteInstance,
  onRefreshInstances
}) => {
  if (!instances.length && !isLoading) {
    return (
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>
          No Bedrock instances found. Create a new instance to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {instances.map(instance => (
        <BedrockInstanceCard
          key={instance.instance_id}
          instance={instance}
          onDelete={onDeleteInstance}
          onRefresh={onRefreshInstances}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

export default BedrockInstanceList; 