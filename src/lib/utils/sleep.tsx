import React from "react";
interface sleepProps {}

/**
 * Utility function to create a promise that resolves after a specified number of milliseconds
 * @param ms Time to sleep in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms): void => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
