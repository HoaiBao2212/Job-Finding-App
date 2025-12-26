// Cloudinary Upload Service - Unsigned Upload
// No API secrets exposed on frontend

const CLOUDINARY_CLOUD_NAME = "dftafsqrh";
const CLOUDINARY_UPLOAD_PRESET = "JobFinding";

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

/**
 * Upload file to Cloudinary using unsigned upload
 * @param file - Image file to upload
 * @returns Promise with secure_url of uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Upload to Cloudinary failed"
      );
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Delete file from Cloudinary (optional utility)
 * Note: This requires Cloudinary authentication and should be done on backend
 */
export function getCloudinaryDeleteUrl(publicId: string): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`;
}
