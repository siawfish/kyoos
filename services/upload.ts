import { api } from './api';
import { Asset, AssetModule, Media, MimeType } from '@/redux/app/types';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: Asset[];
  error?: string;
}

/**
 * Upload media files to the server
 * @param media Array of Media objects with local URIs
 * @param module The module to upload to (e.g., MESSAGES)
 * @returns Promise with uploaded asset URLs
 */
export const uploadMedia = async (
  media: Media[],
  module: AssetModule = AssetModule.MESSAGES
): Promise<{ data?: Asset[]; error?: string }> => {
  try {
    if (!media || media.length === 0) {
      return { data: [] };
    }

    const formData = new FormData();
    formData.append('module', module);

    // Add each file to the form data
    for (const item of media) {
      if (!item.uri) {
        console.warn('Skipping media item without uri:', item);
        continue;
      }

      // Get file extension from uri or type
      const uriParts = item.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1]?.toLowerCase() || 'jpg';
      
      // Determine mime type
      let mimeType = item.type || getMimeTypeFromExtension(fileExtension);
      
      // Create file name
      const fileName = item.id || `file_${Date.now()}.${fileExtension}`;

      // Create the file object for FormData
      const file = {
        uri: item.uri,
        type: mimeType,
        name: fileName,
      } as any;

      formData.append('assets', file);
    }

    const response = await api.post<UploadResponse>('/api/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      return { data: response.data.data };
    }

    return { error: response.data.message || 'Upload failed' };
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return { 
      error: error?.message || error?.error || 'Failed to upload files' 
    };
  }
};

/**
 * Convert Media array to Asset array after uploading
 * This uploads all local files and returns Assets with remote URLs
 */
export const uploadAttachments = async (
  attachments: Media[]
): Promise<{ data?: Asset[]; error?: string }> => {
  // Filter only attachments that have local URIs and need uploading
  const localAttachments = attachments.filter(a => a.uri && !a.url);
  
  // Attachments that already have URLs don't need uploading
  const remoteAttachments = attachments
    .filter(a => a.url)
    .map(a => ({
      id: a.id || '',
      url: a.url!,
      type: a.type?.toString() || 'image/jpeg',
    }));

  if (localAttachments.length === 0) {
    return { data: remoteAttachments };
  }

  const { data: uploadedAssets, error } = await uploadMedia(localAttachments);
  
  if (error) {
    return { error };
  }

  return { 
    data: [...remoteAttachments, ...(uploadedAssets || [])] 
  };
};

/**
 * Get MIME type from file extension
 */
const getMimeTypeFromExtension = (extension: string): MimeType => {
  const extLower = extension.toLowerCase();
  
  const mimeMap: { [key: string]: MimeType } = {
    'jpg': MimeType.JPEG,
    'jpeg': MimeType.JPEG,
    'png': MimeType.PNG,
    'gif': MimeType.GIF,
    'webp': MimeType.WEBP,
    'heic': MimeType.HEIC,
    'heif': MimeType.HEIF,
    'mp4': MimeType.MP4,
    'mov': MimeType.MOV,
    'm4v': MimeType.M4V,
    'avi': MimeType.AVI,
    'wmv': MimeType.WMV,
    'webm': MimeType.WEBM,
    'pdf': MimeType.PDF,
  };

  return mimeMap[extLower] || MimeType.OCTET_STREAM;
};
