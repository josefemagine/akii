/**
 * Utility to safely check for browser extension APIs
 */

// Check if we're in a browser extension context
export const isExtensionContext = (): boolean => {
  try {
    return (
      typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id
    );
  } catch (error) {
    console.warn("Error checking extension context:", error);
    return false;
  }
};

// Safe wrapper for chrome.runtime.sendMessage
export const safeSendMessage = (
  message: any,
  callback?: (response: any) => void,
): void => {
  if (isExtensionContext()) {
    try {
      chrome.runtime.sendMessage(message, callback);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  } else {
    console.warn(
      "Attempted to use chrome.runtime.sendMessage in non-extension context",
    );
  }
};

// Safe wrapper for adding message listeners
export const safeAddMessageListener = (
  callback: (message: any, sender: any, sendResponse: any) => boolean | void,
): void => {
  if (isExtensionContext() && chrome.runtime.onMessage) {
    try {
      chrome.runtime.onMessage.addListener(callback);
    } catch (error) {
      console.error("Error adding message listener:", error);
    }
  } else {
    console.warn(
      "Attempted to add chrome.runtime.onMessage listener in non-extension context",
    );
  }
};
