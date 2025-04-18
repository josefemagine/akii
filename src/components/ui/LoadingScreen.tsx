import React from "react";

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: '#111927' }}>
            <div className="w-12 h-12 border-t-4 border-primary rounded-full animate-spin mb-4"></div>
            <p className="text-foreground text-lg">{message}</p>
        </div>
    );
};

export default LoadingScreen;
