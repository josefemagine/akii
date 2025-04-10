import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { uploadAvatar, updateUserAvatar } from '@/services/avatar-service';

interface UseAvatarOptions {
  onAvatarChange?: (url: string | null) => void;
}

interface UseAvatarReturn {
  avatarUrl: string | null;
  isLoading: boolean;
  uploadProgress: number;
  uploadStatus: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage: string | null;
  uploadUserAvatar: (file: File) => Promise<void>;
  resetUploadStatus: () => void;
}

const DEFAULT_AVATAR = 'https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png';

export function useAvatar(options?: UseAvatarOptions): UseAvatarReturn {
  const { user, refreshAuthState } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine avatar URL based on our priority logic
  useEffect(() => {
    // Priority 1: User's custom uploaded avatar
    if (user && typeof user === 'object' && 'avatar_url' in user) {
      setAvatarUrl(user.avatar_url as string);
      return;
    }
    
    // Priority 2: Google profile image
    if (user && typeof user === 'object' && 'user_metadata' in user) {
      const metadata = user.user_metadata as Record<string, any>;
      if (metadata?.avatar_url) {
        setAvatarUrl(metadata.avatar_url);
        return;
      }
    }
    
    // Priority 3: Default avatar
    setAvatarUrl(DEFAULT_AVATAR);
  }, [user]);

  const uploadUserAvatar = useCallback(async (file: File) => {
    if (!user?.id) {
      setErrorMessage('You must be logged in to upload an avatar');
      setUploadStatus('error');
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Upload the file
      const { url, error } = await uploadAvatar(user.id, file, {
        onProgress: (progress) => setUploadProgress(progress),
      });

      if (error) {
        throw error;
      }

      if (!url) {
        throw new Error('No URL returned from upload');
      }

      // Update user profile with new avatar URL
      const { success, error: profileError } = await updateUserAvatar(user.id, url);
      
      if (!success || profileError) {
        throw profileError || new Error('Failed to update profile with new avatar');
      }

      // Refresh auth state to get the updated profile
      await refreshAuthState();

      // Update local state
      setAvatarUrl(url);
      setUploadStatus('success');
      
      // Notify callback if provided
      if (options?.onAvatarChange) {
        options.onAvatarChange(url);
      }
      
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshAuthState, options]);

  const resetUploadStatus = useCallback(() => {
    setUploadStatus('idle');
    setErrorMessage(null);
    setUploadProgress(0);
  }, []);

  return {
    avatarUrl,
    isLoading,
    uploadProgress,
    uploadStatus,
    errorMessage,
    uploadUserAvatar,
    resetUploadStatus,
  };
} 