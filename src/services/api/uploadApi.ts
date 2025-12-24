import apiClient from './client';

export type UploadType = 'avatar' | 'attachment' | 'material' | 'question_image' | 'other';

export interface UploadedFile {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadType?: UploadType;
  createdAt?: string;
}

export interface UploadOptions {
  uploadType?: UploadType;
  referenceId?: string;
  referenceType?: string;
  isPublic?: boolean;
}

export const uploadApi = {
  // Upload single file
  uploadFile: async (file: File, options: UploadOptions = {}): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.uploadType) formData.append('uploadType', options.uploadType);
    if (options.referenceId) formData.append('referenceId', options.referenceId);
    if (options.referenceType) formData.append('referenceType', options.referenceType);
    if (options.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));

    const response = await apiClient.post('/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Upload multiple files
  uploadFiles: async (files: File[], options: UploadOptions = {}): Promise<UploadedFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (options.uploadType) formData.append('uploadType', options.uploadType);
    if (options.referenceId) formData.append('referenceId', options.referenceId);
    if (options.referenceType) formData.append('referenceType', options.referenceType);
    if (options.isPublic !== undefined) formData.append('isPublic', String(options.isPublic));

    const response = await apiClient.post('/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/uploads/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  // Get user's files
  getMyFiles: async (uploadType?: UploadType): Promise<UploadedFile[]> => {
    const params = uploadType ? `?uploadType=${uploadType}` : '';
    const response = await apiClient.get(`/uploads/my-files${params}`);
    return response.data.data;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/uploads/${fileId}`);
  },
};

export default uploadApi;
