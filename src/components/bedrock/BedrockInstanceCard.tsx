import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { TrashIcon, RefreshCw } from 'lucide-react';
import { BedrockInstance } from '@/types/bedrock.ts';
import { formatDistanceToNow } from 'date-fns';

interface BedrockInstanceCardProps {
  instance: BedrockInstance;
  onDelete: (instanceId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const BedrockInstanceCard: React.FC<BedrockInstanceCardProps> = ({
  instance,
  onDelete,
  onRefresh,
  isLoading
}) => {
  const getStatusBadge = () => {
    const status = instance.status.toLowerCase();
    
    if (status === 'running' || status === 'active') {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (status === 'initializing' || status === 'pending') {
      return <Badge className="bg-yellow-500">Initializing</Badge>;
    } else if (status === 'failed' || status === 'error') {
      return <Badge className="bg-red-500">Failed</Badge>;
    } else {
      return <Badge className="bg-gray-500">{instance.status}</Badge>;
    }
  };

  const createdAt = instance.created_at 
    ? formatDistanceToNow(new Date(instance.created_at), { addSuffix: true })
    : 'Unknown';

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{instance.instance_id || 'Unnamed Instance'}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-sm text-gray-500">
          ID: {instance.instance_id}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Region:</span> {/* Display appropriate region or just omit this line */}
          </div>
          <div>
            <span className="font-medium">Model:</span> {instance.model_id || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Created:</span> {createdAt}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDelete(instance.instance_id)}
          disabled={isLoading}
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BedrockInstanceCard; 