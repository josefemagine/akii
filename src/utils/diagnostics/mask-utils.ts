/**
 * Utilities for masking sensitive data in the diagnostics system
 */

/**
 * Masks secrets in strings by showing only the first and last few characters
 * @param value The string value to mask
 * @returns A masked string with only first and last parts visible
 */
export const maskSecret = (value: string): string => {
  if (!value || value.length < 8) return "***";
  return `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
};

/**
 * Determines if a key name likely contains sensitive information
 * @param key The key name to check
 * @returns True if the key likely contains sensitive information
 */
export const isSensitiveKey = (key: string): boolean => {
  const sensitivePatterns = [
    'key',
    'secret',
    'password',
    'token',
    'auth',
    'credential',
    'cert',
    'private'
  ];
  
  const lowercaseKey = key.toLowerCase();
  return sensitivePatterns.some(pattern => lowercaseKey.includes(pattern));
};

/**
 * Safely masks an object's sensitive values for display
 * @param obj The object containing potentially sensitive data
 * @returns A new object with sensitive values masked
 */
export const maskSensitiveData = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && isSensitiveKey(key)) {
      result[key] = maskSecret(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = maskSensitiveData(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}; 