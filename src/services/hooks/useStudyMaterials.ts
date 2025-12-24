import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyMaterialApi, MaterialFilters, PaginationParams, CreateMaterialInput } from '../api/studyMaterialApi';

// Query keys
export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (filters: MaterialFilters, pagination: PaginationParams) => 
    [...materialKeys.lists(), { filters, pagination }] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  featured: (limit: number) => [...materialKeys.all, 'featured', limit] as const,
  popular: (limit: number) => [...materialKeys.all, 'popular', limit] as const,
  library: (pagination: PaginationParams) => [...materialKeys.all, 'library', pagination] as const,
  progress: (materialId: string) => [...materialKeys.all, 'progress', materialId] as const,
  statistics: () => [...materialKeys.all, 'statistics'] as const,
};

// Get materials with filters and pagination
export function useStudyMaterials(filters?: MaterialFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: materialKeys.list(filters || {}, pagination || { page: 1, limit: 20 }),
    queryFn: () => studyMaterialApi.getMaterials(filters, pagination),
  });
}

// Get a single material by ID
export function useStudyMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => studyMaterialApi.getMaterialById(id),
    enabled: !!id,
  });
}

// Get featured materials
export function useFeaturedMaterials(limit = 6) {
  return useQuery({
    queryKey: materialKeys.featured(limit),
    queryFn: () => studyMaterialApi.getFeatured(limit),
  });
}

// Get popular materials
export function usePopularMaterials(limit = 10) {
  return useQuery({
    queryKey: materialKeys.popular(limit),
    queryFn: () => studyMaterialApi.getPopular(limit),
  });
}

// Get user's library
export function useUserLibrary(pagination?: PaginationParams) {
  return useQuery({
    queryKey: materialKeys.library(pagination || { page: 1, limit: 20 }),
    queryFn: () => studyMaterialApi.getUserLibrary(pagination),
  });
}

// Get material progress
export function useMaterialProgress(materialId: string) {
  return useQuery({
    queryKey: materialKeys.progress(materialId),
    queryFn: () => studyMaterialApi.getMaterialProgress(materialId),
    enabled: !!materialId,
  });
}

// Get material statistics
export function useMaterialStatistics() {
  return useQuery({
    queryKey: materialKeys.statistics(),
    queryFn: () => studyMaterialApi.getStatistics(),
  });
}

// Create material mutation
export function useCreateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateMaterialInput) => studyMaterialApi.createMaterial(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.statistics() });
    },
  });
}

// Update material mutation
export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateMaterialInput> }) => 
      studyMaterialApi.updateMaterial(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
    },
  });
}

// Delete material mutation
export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, hard = false }: { id: string; hard?: boolean }) => 
      studyMaterialApi.deleteMaterial(id, hard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      queryClient.invalidateQueries({ queryKey: materialKeys.statistics() });
    },
  });
}

// Update progress mutation
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ materialId, data }: { materialId: string; data: { progress?: number; currentPage?: number; currentPosition?: number; timeSpent?: number } }) => 
      studyMaterialApi.updateProgress(materialId, data),
    onSuccess: (_, { materialId }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.progress(materialId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.library({}) });
    },
  });
}

// Add bookmark mutation
export function useAddBookmark() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ materialId, bookmark }: { materialId: string; bookmark: { page?: number; position?: number; note?: string } }) => 
      studyMaterialApi.addBookmark(materialId, bookmark),
    onSuccess: (_, { materialId }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.progress(materialId) });
    },
  });
}

// Add highlight mutation
export function useAddHighlight() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ materialId, highlight }: { materialId: string; highlight: { text: string; page?: number; note?: string; color?: string } }) => 
      studyMaterialApi.addHighlight(materialId, highlight),
    onSuccess: (_, { materialId }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.progress(materialId) });
    },
  });
}

// Toggle favorite mutation
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (materialId: string) => studyMaterialApi.toggleFavorite(materialId),
    onSuccess: (_, materialId) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.progress(materialId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.library({}) });
    },
  });
}

// Rate material mutation
export function useRateMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ materialId, rating }: { materialId: string; rating: number }) => 
      studyMaterialApi.rateMaterial(materialId, rating),
    onSuccess: (_, { materialId }) => {
      queryClient.invalidateQueries({ queryKey: materialKeys.detail(materialId) });
      queryClient.invalidateQueries({ queryKey: materialKeys.progress(materialId) });
    },
  });
}
