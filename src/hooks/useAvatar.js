var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { uploadAvatar, updateUserAvatar } from '@/services/avatar-service';
const DEFAULT_AVATAR = 'https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png';
export function useAvatar(options) {
    const { user, refreshAuthState } = useAuth();
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    // Determine avatar URL based on our priority logic
    useEffect(() => {
        // Priority 1: User's custom uploaded avatar
        if (user && typeof user === 'object' && 'avatar_url' in user) {
            setAvatarUrl(user.avatar_url);
            return;
        }
        // Priority 2: Google profile image
        if (user && typeof user === 'object' && 'user_metadata' in user) {
            const metadata = user.user_metadata;
            if (metadata === null || metadata === void 0 ? void 0 : metadata.avatar_url) {
                setAvatarUrl(metadata.avatar_url);
                return;
            }
        }
        // Priority 3: Default avatar
        setAvatarUrl(DEFAULT_AVATAR);
    }, [user]);
    const uploadUserAvatar = useCallback((file) => __awaiter(this, void 0, void 0, function* () {
        if (!(user === null || user === void 0 ? void 0 : user.id)) {
            setErrorMessage('You must be logged in to upload an avatar');
            setUploadStatus('error');
            return;
        }
        try {
            setIsLoading(true);
            setUploadStatus('uploading');
            setUploadProgress(0);
            // Upload the file
            const { url, error } = yield uploadAvatar(user.id, file, {
                onProgress: (progress) => setUploadProgress(progress),
            });
            if (error) {
                throw error;
            }
            if (!url) {
                throw new Error('No URL returned from upload');
            }
            // Update user profile with new avatar URL
            const { success, error: profileError } = yield updateUserAvatar(user.id, url);
            if (!success || profileError) {
                throw profileError || new Error('Failed to update profile with new avatar');
            }
            // Refresh auth state to get the updated profile
            yield refreshAuthState();
            // Update local state
            setAvatarUrl(url);
            setUploadStatus('success');
            // Notify callback if provided
            if (options === null || options === void 0 ? void 0 : options.onAvatarChange) {
                options.onAvatarChange(url);
            }
        }
        catch (error) {
            console.error('Avatar upload failed:', error);
            setUploadStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
        }
        finally {
            setIsLoading(false);
        }
    }), [user, refreshAuthState, options]);
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
