import api from '../api';

export interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  materialType: 'ebook' | 'video' | 'audio' | 'document' | 'flashcard_deck' | 'notes';
  category: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileType?: string;
  fileSize?: number;
  duration?: number;
  pageCount?: number;
  tags?: string[];
  tableOfContents?: { title: string; page: number }[];
  author?: string;
  publisher?: string;
  isbn?: string;
  publishedDate?: string;
  subscriptionTier: string;
  price?: number;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  averageRating: number;
  ratingCount: number;
  uploadedBy?: string;
  uploader?: { id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}

export interface UserStudyMaterial {
  id: string;
  userId: string;
  materialId: string;
  progress: number;
  currentPage: number;
  currentPosition: number;
  bookmarks?: { page?: number; position?: number; note?: string; createdAt: string }[];
  highlights?: { text: string; page?: number; note?: string; color?: string; createdAt: string }[];
  notes?: string;
  rating?: number;
  isFavorite: boolean;
  lastAccessed?: string;
  timeSpent: number;
  material?: StudyMaterial;
}

export interface MaterialFilters {
  materialType?: string;
  category?: string;
  subscriptionTier?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface MaterialsResponse {
  materials: StudyMaterial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LibraryResponse {
  items: UserStudyMaterial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMaterialInput {
  title: string;
  description?: string;
  materialType: string;
  category?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  fileType?: string;
  fileSize?: number;
  duration?: number;
  pageCount?: number;
  tags?: string[];
  tableOfContents?: { title: string; page: number }[];
  author?: string;
  publisher?: string;
  isbn?: string;
  publishedDate?: string;
  subscriptionTier?: string;
  price?: number;
  isFeatured?: boolean;
}

export interface MaterialStatistics {
  total: number;
  active: number;
  inactive: number;
  byType: { materialType: string; count: number }[];
  byCategory: { category: string; count: number }[];
}

export const studyMaterialApi = {
  // Get all materials with filters and pagination
  async getMaterials(filters?: MaterialFilters, pagination?: PaginationParams): Promise<MaterialsResponse> {
    const params = new URLSearchParams();
    
    if (filters?.materialType) params.append('materialType', filters.materialType);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.subscriptionTier) params.append('subscriptionTier', filters.subscriptionTier);
    if (filters?.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    
    if (pagination?.page) params.append('page', String(pagination.page));
    if (pagination?.limit) params.append('limit', String(pagination.limit));
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await api.get(`/materials?${params.toString()}`);
    return response.data.data;
  },

  // Get a single material by ID
  async getMaterialById(id: string): Promise<StudyMaterial> {
    const response = await api.get(`/materials/${id}`);
    return response.data.data;
  },

  // Get featured materials
  async getFeatured(limit = 6): Promise<StudyMaterial[]> {
    const response = await api.get(`/materials/featured?limit=${limit}`);
    return response.data.data;
  },

  // Get popular materials
  async getPopular(limit = 10): Promise<StudyMaterial[]> {
    const response = await api.get(`/materials/popular?limit=${limit}`);
    return response.data.data;
  },

  // Create a new material (admin only)
  async createMaterial(input: CreateMaterialInput): Promise<StudyMaterial> {
    const response = await api.post('/materials', input);
    return response.data.data;
  },

  // Update a material (admin only)
  async updateMaterial(id: string, input: Partial<CreateMaterialInput>): Promise<StudyMaterial> {
    const response = await api.put(`/materials/${id}`, input);
    return response.data.data;
  },

  // Delete a material (admin only)
  async deleteMaterial(id: string, hard = false): Promise<{ message: string }> {
    const response = await api.delete(`/materials/${id}?hard=${hard}`);
    return response.data.data;
  },

  // Get user's library
  async getUserLibrary(pagination?: PaginationParams): Promise<LibraryResponse> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', String(pagination.page));
    if (pagination?.limit) params.append('limit', String(pagination.limit));
    if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination?.sortOrder) params.append('sortOrder', pagination.sortOrder);

    const response = await api.get(`/materials/user/library?${params.toString()}`);
    return response.data.data;
  },

  // Get progress for a specific material
  async getMaterialProgress(materialId: string): Promise<UserStudyMaterial> {
    const response = await api.get(`/materials/${materialId}/progress`);
    return response.data.data;
  },

  // Update progress for a material
  async updateProgress(materialId: string, data: {
    progress?: number;
    currentPage?: number;
    currentPosition?: number;
    timeSpent?: number;
  }): Promise<UserStudyMaterial> {
    const response = await api.put(`/materials/${materialId}/progress`, data);
    return response.data.data;
  },

  // Add bookmark
  async addBookmark(materialId: string, bookmark: { page?: number; position?: number; note?: string }): Promise<UserStudyMaterial> {
    const response = await api.post(`/materials/${materialId}/bookmark`, bookmark);
    return response.data.data;
  },

  // Add highlight
  async addHighlight(materialId: string, highlight: { text: string; page?: number; note?: string; color?: string }): Promise<UserStudyMaterial> {
    const response = await api.post(`/materials/${materialId}/highlight`, highlight);
    return response.data.data;
  },

  // Toggle favorite
  async toggleFavorite(materialId: string): Promise<UserStudyMaterial> {
    const response = await api.post(`/materials/${materialId}/favorite`);
    return response.data.data;
  },

  // Rate material
  async rateMaterial(materialId: string, rating: number): Promise<UserStudyMaterial> {
    const response = await api.post(`/materials/${materialId}/rate`, { rating });
    return response.data.data;
  },

  // Record download
  async recordDownload(materialId: string): Promise<void> {
    await api.post(`/materials/${materialId}/download`);
  },

  // Get statistics (admin only)
  async getStatistics(): Promise<MaterialStatistics> {
    const response = await api.get('/materials/statistics');
    return response.data.data;
  },
};

export default studyMaterialApi;
