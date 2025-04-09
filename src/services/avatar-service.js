var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import supabase from '@/lib/supabase';
// Define default avatar as a constant at the top of the file
const DEFAULT_AVATAR_URL = 'https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/avatars/b574f273-e0e1-4cb8-8c98-f5a7569234c8/green-robot-icon.png';
/**
 * Uploads a profile picture to Supabase storage
 */
export function uploadAvatar(userId, file, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validation
            if (!supabase) {
                throw new Error('Database connection not available');
            }
            if (!file) {
                throw new Error('No file provided');
            }
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }
            // Max size: 2MB
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Image size must be less than 2MB');
            }
            console.log('Starting avatar upload for user:', userId);
            console.log('File details:', file.name, file.type, file.size);
            // Create a unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
            const bucketName = 'avatars';
            // Check if bucket exists
            const { data: buckets } = yield supabase.storage.listBuckets();
            if (!buckets || !buckets.some(b => b.name === bucketName)) {
                throw new Error(`Storage bucket "${bucketName}" not found`);
            }
            // Perform the upload
            const { data, error } = yield supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
            if (error) {
                throw error;
            }
            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);
            const avatarUrl = publicUrlData.publicUrl;
            console.log('Avatar upload successful. URL:', avatarUrl);
            return { url: avatarUrl, error: null };
        }
        catch (error) {
            console.error('Error uploading avatar:', error);
            return { url: null, error: error instanceof Error ? error : new Error(String(error)) };
        }
    });
}
/**
 * Updates a user's profile with a new avatar URL
 */
export function updateUserAvatar(userId, avatarUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { error } = yield supabase
                .from('profiles')
                .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
                .eq('id', userId);
            if (error) {
                throw error;
            }
            return { success: true, error: null };
        }
        catch (error) {
            console.error('Error updating user profile with avatar URL:', error);
            return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
        }
    });
}
/**
 * Determines the most appropriate avatar URL based on priority:
 * 1. User's custom uploaded avatar
 * 2. Google profile image (if authenticated via Google)
 * 3. Default avatar
 */
export function getAvatarUrl(user) {
    var _a, _b, _c;
    if (!user) {
        return DEFAULT_AVATAR_URL;
    }
    // Check for custom avatar in profile
    const profile = ((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.profile) || {};
    if (profile.avatar_url) {
        return profile.avatar_url;
    }
    // Check for Google profile image
    if (((_b = user.app_metadata) === null || _b === void 0 ? void 0 : _b.provider) === 'google' && ((_c = user.user_metadata) === null || _c === void 0 ? void 0 : _c.avatar_url)) {
        return user.user_metadata.avatar_url;
    }
    // Default avatar
    return DEFAULT_AVATAR_URL;
}
