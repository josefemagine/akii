import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, X, Upload, Loader2 } from 'lucide-react';
import { supabase, getSupabaseClient } from "@/lib/supabase-singleton";

export interface AvatarManagerProps {
  userId?: string;
  userEmail?: string;
  initialAvatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadOverlay?: boolean;
  onAvatarChange?: (url: string | null) => void;
  className?: string;
}

const DEFAULT_AVATAR = 'https://api.akii.com/storage/v1/object/public/images//green-robot-icon.png';

export const AvatarManager: React.FC<AvatarManagerProps> = ({
  userId,
  userEmail,
  initialAvatarUrl,
  googleAvatarUrl,
  size = 'md',
  showUploadOverlay = true,
  onAvatarChange,
  className,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size class map
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
  };

  // Determine avatar URL based on our priority logic
  useEffect(() => {
    // Priority 1: User's custom uploaded avatar
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl);
      return;
    }
    
    // Priority 2: Google profile image
    if (googleAvatarUrl) {
      setAvatarUrl(googleAvatarUrl);
      return;
    }
    
    // Priority 3: Default avatar
    setAvatarUrl(DEFAULT_AVATAR);
  }, [initialAvatarUrl, googleAvatarUrl]);

  // Reset status after showing success/error for a few seconds
  useEffect(() => {
    if (uploadStatus === 'success' || uploadStatus === 'error') {
      const timer = setTimeout(() => {
        setUploadStatus('idle');
        setErrorMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  const handleAvatarUpload = async (file: File) => {
    if (!userId) {
      console.error('Cannot upload avatar: User ID is not provided');
      setErrorMessage('User ID is required');
      setUploadStatus('error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.error('File must be an image');
      setErrorMessage('Only image files are allowed');
      setUploadStatus('error');
      return;
    }

    // Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      console.error('Image size must be less than 2MB');
      setErrorMessage('Image size must be less than 2MB');
      setUploadStatus('error');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      const bucketName = 'avatars';
      
      console.log(`Starting avatar upload to ${bucketName}/${fileName}`);
      
      // First, check if the bucket exists
      const { data: buckets } = await getSupabaseClient().storage.listBuckets();
      
      if (!buckets || !buckets.some(b => b.name === bucketName)) {
        // If bucket doesn't exist, try to create it
        console.log(`Bucket ${bucketName} not found, creating...`);
        try {
          await getSupabaseClient().storage.createBucket(bucketName, {
            public: true
          });
        } catch (createError) {
          console.error(`Failed to create bucket: ${bucketName}`, createError);
          throw new Error(`Storage bucket "${bucketName}" not available`);
        }
      }
      
      // Upload with progress tracking
      const { data, error } = await getSupabaseClient().storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        throw error;
      }
      
      // Still update progress to 100% for UI feedback
      console.log('Upload completed: 100%');
      setUploadProgress(100);
      
      // Get the public URL
      const { data: publicUrlData } = getSupabaseClient().storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      console.log('Avatar upload successful, URL:', publicUrl);
      
      // Update user profile with new avatar URL
      const { error: updateError } = await getSupabaseClient()
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Failed to update profile with new avatar URL:', updateError);
      }
      
      // Update local state
      setAvatarUrl(publicUrl);
      setUploadStatus('success');
      
      // Notify parent component
      if (onAvatarChange) {
        onAvatarChange(publicUrl);
      }
      
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      // Let the progress bar fill to 100% before resetting
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setIsHovering(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleAvatarUpload(event.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className || ''}`}>
      {/* Avatar Display */}
      <div 
        className="h-full w-full rounded-full overflow-hidden relative border-2 border-primary/20"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsHovering(true);
        }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleDrop}
      >
        <img 
          src={avatarUrl || DEFAULT_AVATAR} 
          alt="User Avatar"
          className="h-full w-full object-cover"
          onError={(e) => {
            console.warn('Avatar failed to load, using default');
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />
        
        {/* Upload Overlay */}
        {showUploadOverlay && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <div 
              className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity
                ${isHovering && !isUploading ? 'opacity-100' : 'opacity-0'}
                ${!isUploading ? 'cursor-pointer' : ''}`}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <Upload className="h-1/3 w-1/3 text-white" />
            </div>
          </>
        )}
        
        {/* Upload Progress Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="h-1/4 w-1/4 text-white animate-spin mb-2" />
            <div className="w-3/4 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Success Indicator */}
        {uploadStatus === 'success' && (
          <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center">
            <CheckCircle className="h-1/2 w-1/2 text-white" />
          </div>
        )}
        
        {/* Error Indicator */}
        {uploadStatus === 'error' && (
          <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center">
            <X className="h-1/2 w-1/2 text-white" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {errorMessage && (
        <div className="absolute -bottom-6 left-0 right-0 text-xs text-center text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default AvatarManager; 