import React from "react";

interface LoadingSpinnerProps {}

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin" />
    </div>
  );
};

export default LoadingSpinner;
