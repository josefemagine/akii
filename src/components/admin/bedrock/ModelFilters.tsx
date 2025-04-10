import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw } from "lucide-react";
import { ModelFilter, ModelFiltersProps } from "@/types/bedrock";

// Define the available filters
const modelFilters: ModelFilter[] = [
  {
    key: 'byProvider',
    label: 'Provider',
    options: [
      { value: 'amazon', label: 'Amazon' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'ai21labs', label: 'AI21 Labs' },
      { value: 'cohere', label: 'Cohere' },
      { value: 'meta', label: 'Meta' },
      { value: 'stability', label: 'Stability AI' }
    ]
  },
  {
    key: 'byOutputModality',
    label: 'Output Type',
    options: [
      { value: 'TEXT', label: 'Text' },
      { value: 'IMAGE', label: 'Image' },
      { value: 'EMBEDDING', label: 'Embedding' }
    ]
  },
  {
    key: 'byInferenceType',
    label: 'Inference Type',
    options: [
      { value: 'ON_DEMAND', label: 'On-Demand' },
      { value: 'PROVISIONED', label: 'Provisioned' }
    ]
  }
];

const ModelFilters: React.FC<ModelFiltersProps> = ({ 
  activeFilters, 
  setActiveFilters, 
  loadingModels, 
  fetchAvailableModels 
}) => {
  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev: Record<string, string>) => {
      // If value is empty, remove the filter
      if (!value) {
        const newFilters = { ...prev };
        delete newFilters[filterKey];
        return newFilters;
      }
      // Otherwise set the new filter value
      return { ...prev, [filterKey]: value };
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  return (
    <div className="p-4 border rounded-md mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filter Models</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearFilters}
          disabled={Object.keys(activeFilters).length === 0}
        >
          Clear Filters
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modelFilters.map(filter => (
          <div key={filter.key} className="space-y-2">
            <Label htmlFor={filter.key}>{filter.label}</Label>
            <Select
              value={activeFilters[filter.key] || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger id={filter.key}>
                <SelectValue placeholder={`All ${filter.label}s`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All {filter.label}s</SelectItem>
                {filter.options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={loadingModels}
          onClick={(e) => {
            e.preventDefault();
            fetchAvailableModels(activeFilters);
          }}
        >
          {loadingModels ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ModelFilters; 