import supabase from "./supabase";
import { v4 as uuidv4 } from "uuid";
import { updateUserProfile } from "./auth-helpers";

export interface UploadResponse {
  url: string | null;
  error: Error | null;
}

/**
 * Upload a profile picture to Supabase storage
 */
export async function uploadProfilePicture(
  userId: string,
  file: File,
): Promise<UploadResponse> {
  try {
    // Debugging: Check if supabase client is available
    if (!supabase) {
      console.error("Supabase client not available!");
      throw new Error("Database connection not available");
    }
    
    if (!file) {
      throw new Error("No file provided");
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Image size must be less than 2MB");
    }

    console.log("Starting avatar upload for user:", userId);
    console.log("File details:", file.name, file.type, file.size);
    
    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    // Only use the avatars bucket with a simple path structure
    const bucketName = "avatars";
    const filePath = fileName;

    console.log(`Uploading avatar to bucket: ${bucketName}, path: ${filePath}`);

    try {
      // First check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets || !buckets.some(b => b.name === bucketName)) {
        console.error(`Bucket ${bucketName} does not exist!`);
        throw new Error(`Storage bucket "${bucketName}" not found. Please contact support.`);
      }
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type
        });
        
      if (error) {
        console.error(`Upload failed:`, error);
        throw error;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;
      console.log("Got public URL:", avatarUrl);

      // Update the user profile with the avatar URL
      const { data: updatedProfile, error: updateError } =
        await updateUserProfile(userId, { avatar_url: avatarUrl });

      if (updateError) {
        console.error("Error updating profile with avatar URL:", updateError);
        throw updateError;
      }

      // Store avatar URL in localStorage for immediate access (backup only)
      try {
        localStorage.setItem("akii-avatar-url", avatarUrl);
        console.log("Avatar URL stored in localStorage as backup:", avatarUrl);
      } catch (storageError) {
        console.error("Failed to store avatar URL in localStorage:", storageError);
      }

      return { url: avatarUrl, error: null };
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return { url: null, error: error as Error };
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { url: null, error: error as Error };
  }
}

/**
 * Delete a profile picture from Supabase storage
 */
export async function deleteProfilePicture(
  userId: string,
  avatarUrl: string,
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extract the file path from the URL - just get the filename
    const urlParts = avatarUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    
    console.log(`Deleting avatar file: ${fileName} from bucket: avatars`);

    // Delete the file from the avatars bucket
    const { error } = await supabase.storage
      .from("avatars")
      .remove([fileName]);

    if (error) {
      console.error("Error deleting avatar file:", error);
      throw error;
    }

    // Update the user profile to remove the avatar URL
    const { error: profileError } = await updateUserProfile(userId, { avatar_url: null });
    
    if (profileError) {
      console.error("Error updating profile after avatar deletion:", profileError);
      throw profileError;
    }
    
    // Also clear from localStorage
    localStorage.removeItem("akii-avatar-url");

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return { success: false, error: error as Error };
  }
}
