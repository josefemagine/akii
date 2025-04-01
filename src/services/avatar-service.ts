import supabase from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface UploadAvatarOptions {
  onProgress?: (progress: number) => void;
}

export interface AvatarUploadResult {
  url: string | null;
  error: Error | null;
}

/**
 * Uploads a profile picture to Supabase storage
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  options?: UploadAvatarOptions
): Promise<AvatarUploadResult> {
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
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets || !buckets.some(b => b.name === bucketName)) {
      throw new Error(`Storage bucket "${bucketName}" not found`);
    }
    
    // Perform the upload
    const { data, error } = await supabase.storage
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
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { url: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Updates a user's profile with a new avatar URL
 */
export async function updateUserAvatar(userId: string, avatarUrl: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user profile with avatar URL:', error);
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

/**
 * Determines the most appropriate avatar URL based on priority:
 * 1. User's custom uploaded avatar
 * 2. Google profile image (if authenticated via Google)
 * 3. Default avatar
 */
export function getAvatarUrl(user: User | null): string {
  if (!user) {
    return 'https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png';
  }
  
  // Check for custom avatar in profile
  const profile = user.user_metadata?.profile || {};
  if (profile.avatar_url) {
    return profile.avatar_url;
  }
  
  // Check for Google profile image
  if (user.app_metadata?.provider === 'google' && user.user_metadata?.avatar_url) {
    return user.user_metadata.avatar_url;
  }
  
  // Default avatar
  return 'https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png';
} 