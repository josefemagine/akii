import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FoundationModel, BedrockModel } from '@/types/bedrock';

interface BedrockModelSelectProps {
  models: FoundationModel[] | BedrockModel[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  isLoading?: boolean;
  label?: string;
}

export const BedrockModelSelect: React.FC<BedrockModelSelectProps> = ({
  models,
  selectedModelId,
  onModelChange,
  isLoading = false,
  label = 'Model'
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="model-select">{label}</Label>
      <Select
        disabled={isLoading || models.length === 0}
        value={selectedModelId}
        onValueChange={onModelChange}
      >
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => {
            // Get id and display values based on object shape (handle both types)
            const id = 'id' in model ? model.id : (model.modelId || '');
            const name = 'name' in model ? model.name : (model.modelName || 'Unnamed Model');
            const provider = 'provider' in model ? model.provider : (model.providerName || '');
            
            return (
              <SelectItem key={id} value={id}>
                {name} - {provider}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {models.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">No models available.</p>
      )}
    </div>
  );
};

export default BedrockModelSelect; 