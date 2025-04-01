import { supabaseClient } from "./supabase-core";
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

    // Create a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabaseClient.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicUrlData } = supabaseClient.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    // Update the user profile with the avatar URL
    const { data: updatedProfile, error: updateError } =
      await updateUserProfile(userId, { avatar_url: avatarUrl });

    if (updateError) {
      console.error("Error updating profile with avatar URL:", updateError);
      throw updateError;
    }

    // Store avatar URL in localStorage for immediate access
    try {
      localStorage.setItem("akii-avatar-url", avatarUrl);
      console.log("Avatar URL stored in localStorage:", avatarUrl);
    } catch (storageError) {
      console.error(
        "Failed to store avatar URL in localStorage:",
        storageError,
      );
    }

    console.log("Profile updated with new avatar URL:", avatarUrl);
    console.log("Updated profile:", updatedProfile);

    return { url: avatarUrl, error: null };
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
    // Extract the file path from the URL
    const urlParts = avatarUrl.split("/");
    const filePath = `profiles/${urlParts[urlParts.length - 1]}`;

    // Delete the file from storage
    const { error } = await supabaseClient.storage
      .from("avatars")
      .remove([filePath]);

    if (error) throw error;

    // Update the user profile to remove the avatar URL
    await updateUserProfile(userId, { avatar_url: null });

    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return { success: false, error: error as Error };
  }
}
