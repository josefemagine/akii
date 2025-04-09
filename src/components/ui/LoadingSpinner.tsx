import React from 'react';

/**
 * A simple loading spinner component for inline loading states
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner; 