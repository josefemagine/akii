var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { CheckCircle, X, Upload, Loader2 } from 'lucide-react';
import { getSupabaseClient } from "@/lib/supabase";
const DEFAULT_AVATAR = 'https://injxxchotrvgvvzelhvj.supabase.co/storage/v1/object/public/images//green-robot-icon.png';
export const AvatarManager = ({ userId, userEmail, initialAvatarUrl, googleAvatarUrl, size = 'md', showUploadOverlay = true, onAvatarChange, className, }) => {
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState(null);
    const fileInputRef = useRef(null);
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
    const handleAvatarUpload = (file) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
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
            // Create unique filename - IMPORTANT: Format should follow what RLS policy expects
            // The RLS policy expects: bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid
            const fileExt = file.name.split('.').pop();
            // Format: userId/avatar-timestamp.ext - this allows the RLS policy to extract the userId from the path
            const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
            const bucketName = 'avatars';
            console.log(`Starting avatar upload to ${bucketName}/${fileName}`);
            // Get the current user's auth session to ensure we're authenticated
            const { data: session } = yield getSupabaseClient().auth.getSession();
            if (!(session === null || session === void 0 ? void 0 : session.session)) {
                throw new Error('User authentication required for uploading avatar');
            }
            // Upload with progress tracking
            const { data, error } = yield getSupabaseClient().storage
                .from(bucketName)
                .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });
            if (error) {
                console.error('Avatar upload error:', error);
                // If the error is related to the bucket not existing, provide a clear message
                if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('bucket')) {
                    throw new Error(`Storage bucket "${bucketName}" not found. Please contact your administrator.`);
                }
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
            const { error: updateError } = yield getSupabaseClient()
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
        }
        catch (error) {
            console.error('Avatar upload failed:', error);
            setUploadStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
        }
        finally {
            // Let the progress bar fill to 100% before resetting
            setTimeout(() => {
                setIsUploading(false);
            }, 500);
        }
    });
    const handleFileChange = (event) => {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            handleAvatarUpload(file);
        }
    };
    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsHovering(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleAvatarUpload(event.dataTransfer.files[0]);
        }
    };
    return (_jsxs("div", { className: `relative ${sizeClasses[size]} ${className || ''}`, children: [_jsxs("div", { className: "h-full w-full rounded-full overflow-hidden relative border-2 border-primary/20", onMouseEnter: () => setIsHovering(true), onMouseLeave: () => setIsHovering(false), onDragOver: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsHovering(true);
                }, onDragLeave: () => setIsHovering(false), onDrop: handleDrop, children: [_jsx("img", { src: avatarUrl || DEFAULT_AVATAR, alt: "User Avatar", className: "h-full w-full object-cover", onError: (e) => {
                            console.warn('Avatar failed to load, using default');
                            e.target.src = DEFAULT_AVATAR;
                        } }), showUploadOverlay && (_jsxs(_Fragment, { children: [_jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*", onChange: handleFileChange }), _jsx("div", { className: `absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity
                ${isHovering && !isUploading ? 'opacity-100' : 'opacity-0'}
                ${!isUploading ? 'cursor-pointer' : ''}`, onClick: () => { var _a; return !isUploading && ((_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click()); }, children: _jsx(Upload, { className: "h-1/3 w-1/3 text-white" }) })] })), isUploading && (_jsxs("div", { className: "absolute inset-0 bg-black/70 flex flex-col items-center justify-center", children: [_jsx(Loader2, { className: "h-1/4 w-1/4 text-white animate-spin mb-2" }), _jsx("div", { className: "w-3/4 h-1.5 bg-gray-700 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary transition-all duration-300 ease-out", style: { width: `${uploadProgress}%` } }) })] })), uploadStatus === 'success' && (_jsx("div", { className: "absolute inset-0 bg-green-500/70 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-1/2 w-1/2 text-white" }) })), uploadStatus === 'error' && (_jsx("div", { className: "absolute inset-0 bg-red-500/70 flex items-center justify-center", children: _jsx(X, { className: "h-1/2 w-1/2 text-white" }) }))] }), errorMessage && (_jsx("div", { className: "absolute -bottom-6 left-0 right-0 text-xs text-center text-red-500", children: errorMessage }))] }));
};
export default AvatarManager;
