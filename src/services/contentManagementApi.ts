// Content Management API
// Comprehensive CRUD operations for all content types

export type ContentType = 'quiz' | 'flashcard' | 'article' | 'video' | 'book' | 'module';
export type ContentStatus = 'draft' | 'published' | 'archived' | 'scheduled';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  content: any; // Flexible content structure based on type
  category: string;
  subcategory?: string;
  tags: string[];
  difficulty?: DifficultyLevel;
  status: ContentStatus;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata: {
    views: number;
    likes: number;
    completions: number;
    averageRating: number;
    totalRatings: number;
    estimatedTime?: number; // in minutes
    prerequisites?: string[];
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    slug?: string;
  };
  scheduling: {
    publishDate?: string;
    expiryDate?: string;
    featured: boolean;
    featuredUntil?: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
  parentId?: string; // For duplicated content
}

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  category?: string;
  subcategory?: string;
  difficulty?: DifficultyLevel;
  author?: string;
  tags?: string[];
  search?: string;
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ContentStats {
  total: number;
  byType: Record<ContentType, number>;
  byStatus: Record<ContentStatus, number>;
  byDifficulty: Record<DifficultyLevel, number>;
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  publishedToday: number;
  scheduledCount: number;
  draftCount: number;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
  successIds: string[];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============= STORAGE =============

const CONTENT_STORAGE_KEY = 'content_items';
const CONTENT_HISTORY_KEY = 'content_history';

const getStoredContent = (): ContentItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveContent = (items: ContentItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(items));
  }
};

const logHistory = (action: string, contentId: string, details: any) => {
  if (typeof window === 'undefined') return;
  const history = JSON.parse(localStorage.getItem(CONTENT_HISTORY_KEY) || '[]');
  history.unshift({
    id: `hist-${Date.now()}`,
    action,
    contentId,
    details,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(CONTENT_HISTORY_KEY, JSON.stringify(history.slice(0, 500)));
};

// ============= CREATE OPERATIONS =============

export async function createContent(data: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<ContentItem> {
  await delay(400);
  
  const items = getStoredContent();
  
  const newItem: ContentItem = {
    ...data,
    id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    metadata: {
      views: 0,
      likes: 0,
      completions: 0,
      averageRating: 0,
      totalRatings: 0,
      ...data.metadata
    }
  };
  
  items.push(newItem);
  saveContent(items);
  logHistory('create', newItem.id, { title: newItem.title, type: newItem.type });
  
  return newItem;
}

export async function duplicateContent(contentId: string, newTitle?: string): Promise<ContentItem> {
  await delay(400);
  
  const items = getStoredContent();
  const original = items.find(item => item.id === contentId);
  
  if (!original) {
    throw new Error('Content not found');
  }
  
  const duplicate: ContentItem = {
    ...original,
    id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: newTitle || `${original.title} (Copy)`,
    status: 'draft',
    parentId: contentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: undefined,
    version: 1,
    metadata: {
      views: 0,
      likes: 0,
      completions: 0,
      averageRating: 0,
      totalRatings: 0,
      estimatedTime: original.metadata.estimatedTime,
      prerequisites: original.metadata.prerequisites
    }
  };
  
  items.push(duplicate);
  saveContent(items);
  logHistory('duplicate', duplicate.id, { originalId: contentId, title: duplicate.title });
  
  return duplicate;
}

// ============= READ OPERATIONS =============

export async function getAllContent(filters?: ContentFilters): Promise<ContentItem[]> {
  await delay(300);
  
  let items = getStoredContent();
  
  // Apply filters
  if (filters) {
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }
    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters.subcategory) {
      items = items.filter(item => item.subcategory === filters.subcategory);
    }
    if (filters.difficulty) {
      items = items.filter(item => item.difficulty === filters.difficulty);
    }
    if (filters.author) {
      items = items.filter(item => item.author.id === filters.author);
    }
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search) ||
        item.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    if (filters.featured !== undefined) {
      items = items.filter(item => item.scheduling.featured === filters.featured);
    }
    if (filters.dateFrom) {
      items = items.filter(item => new Date(item.createdAt) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      items = items.filter(item => new Date(item.createdAt) <= new Date(filters.dateTo!));
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    
    items.sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortBy === 'views' || sortBy === 'likes' || sortBy === 'rating') {
        aVal = sortBy === 'rating' ? a.metadata.averageRating : a.metadata[sortBy];
        bVal = sortBy === 'rating' ? b.metadata.averageRating : b.metadata[sortBy];
      } else {
        aVal = a[sortBy];
        bVal = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // Pagination
    if (filters.offset !== undefined && filters.limit !== undefined) {
      items = items.slice(filters.offset, filters.offset + filters.limit);
    } else if (filters.limit !== undefined) {
      items = items.slice(0, filters.limit);
    }
  }
  
  return items;
}

export async function getContentById(contentId: string): Promise<ContentItem | null> {
  await delay(200);
  
  const items = getStoredContent();
  const item = items.find(item => item.id === contentId);
  
  if (item) {
    // Increment view count
    item.metadata.views++;
    saveContent(items);
  }
  
  return item || null;
}

export async function getContentBySlug(slug: string): Promise<ContentItem | null> {
  await delay(200);
  
  const items = getStoredContent();
  return items.find(item => item.seo.slug === slug) || null;
}

export async function getRelatedContent(contentId: string, limit: number = 5): Promise<ContentItem[]> {
  await delay(300);
  
  const items = getStoredContent();
  const item = items.find(i => i.id === contentId);
  
  if (!item) return [];
  
  // Find related content based on category, tags, and difficulty
  const related = items
    .filter(i => 
      i.id !== contentId &&
      i.status === 'published' &&
      (i.category === item.category ||
       i.tags.some(tag => item.tags.includes(tag)))
    )
    .sort((a, b) => {
      const aScore = 
        (a.category === item.category ? 3 : 0) +
        (a.tags.filter(tag => item.tags.includes(tag)).length * 2) +
        (a.difficulty === item.difficulty ? 1 : 0);
      const bScore = 
        (b.category === item.category ? 3 : 0) +
        (b.tags.filter(tag => item.tags.includes(tag)).length * 2) +
        (b.difficulty === item.difficulty ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
  
  return related;
}

// ============= UPDATE OPERATIONS =============

export async function updateContent(contentId: string, data: Partial<ContentItem>): Promise<ContentItem> {
  await delay(400);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  items[index] = {
    ...items[index],
    ...data,
    id: contentId, // Prevent ID changes
    updatedAt: new Date().toISOString(),
    version: items[index].version + 1
  };
  
  saveContent(items);
  logHistory('update', contentId, { updates: Object.keys(data) });
  
  return items[index];
}

export async function updateContentStatus(contentId: string, status: ContentStatus): Promise<ContentItem> {
  await delay(300);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  items[index].status = status;
  items[index].updatedAt = new Date().toISOString();
  
  if (status === 'published' && !items[index].publishedAt) {
    items[index].publishedAt = new Date().toISOString();
  }
  
  saveContent(items);
  logHistory('status_change', contentId, { status });
  
  return items[index];
}

export async function toggleFeatured(contentId: string): Promise<ContentItem> {
  await delay(300);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  items[index].scheduling.featured = !items[index].scheduling.featured;
  items[index].updatedAt = new Date().toISOString();
  
  saveContent(items);
  logHistory('toggle_featured', contentId, { featured: items[index].scheduling.featured });
  
  return items[index];
}

export async function incrementLikes(contentId: string): Promise<ContentItem> {
  await delay(200);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  items[index].metadata.likes++;
  saveContent(items);
  
  return items[index];
}

export async function addRating(contentId: string, rating: number): Promise<ContentItem> {
  await delay(300);
  
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  const item = items[index];
  const totalRatings = item.metadata.totalRatings + 1;
  const newAverage = ((item.metadata.averageRating * item.metadata.totalRatings) + rating) / totalRatings;
  
  item.metadata.averageRating = Math.round(newAverage * 10) / 10;
  item.metadata.totalRatings = totalRatings;
  
  saveContent(items);
  
  return item;
}

// ============= DELETE OPERATIONS =============

export async function deleteContent(contentId: string, permanent: boolean = false): Promise<{ success: boolean; message: string }> {
  await delay(400);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    return { success: false, message: 'Content not found' };
  }
  
  if (permanent) {
    items.splice(index, 1);
    logHistory('delete_permanent', contentId, { title: items[index]?.title });
  } else {
    items[index].status = 'archived';
    items[index].updatedAt = new Date().toISOString();
    logHistory('archive', contentId, { title: items[index].title });
  }
  
  saveContent(items);
  
  return { 
    success: true, 
    message: permanent ? 'Content deleted permanently' : 'Content archived' 
  };
}

export async function restoreContent(contentId: string): Promise<ContentItem> {
  await delay(300);
  
  const items = getStoredContent();
  const index = items.findIndex(item => item.id === contentId);
  
  if (index === -1) {
    throw new Error('Content not found');
  }
  
  items[index].status = 'draft';
  items[index].updatedAt = new Date().toISOString();
  
  saveContent(items);
  logHistory('restore', contentId, { title: items[index].title });
  
  return items[index];
}

// ============= BULK OPERATIONS =============

export async function bulkCreateContent(contentData: Array<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>>): Promise<BulkOperationResult> {
  await delay(600);
  
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    successIds: []
  };
  
  for (const data of contentData) {
    try {
      const item = await createContent(data);
      result.success++;
      result.successIds.push(item.id);
    } catch (error: any) {
      result.failed++;
      result.errors.push(error.message || 'Unknown error');
    }
  }
  
  return result;
}

export async function bulkUpdateContent(contentIds: string[], updates: Partial<ContentItem>): Promise<BulkOperationResult> {
  await delay(600);
  
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    successIds: []
  };
  
  const items = getStoredContent();
  
  for (const contentId of contentIds) {
    try {
      const index = items.findIndex(item => item.id === contentId);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...updates,
          id: contentId,
          updatedAt: new Date().toISOString(),
          version: items[index].version + 1
        };
        result.success++;
        result.successIds.push(contentId);
      } else {
        result.failed++;
        result.errors.push(`Content ${contentId} not found`);
      }
    } catch (error: any) {
      result.failed++;
      result.errors.push(error.message || 'Unknown error');
    }
  }
  
  saveContent(items);
  logHistory('bulk_update', 'multiple', { count: result.success, ids: result.successIds });
  
  return result;
}

export async function bulkDeleteContent(contentIds: string[], permanent: boolean = false): Promise<BulkOperationResult> {
  await delay(600);
  
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    successIds: []
  };
  
  const items = getStoredContent();
  
  if (permanent) {
    const filteredItems = items.filter(item => {
      if (contentIds.includes(item.id)) {
        result.success++;
        result.successIds.push(item.id);
        return false;
      }
      return true;
    });
    saveContent(filteredItems);
  } else {
    for (const contentId of contentIds) {
      const index = items.findIndex(item => item.id === contentId);
      if (index !== -1) {
        items[index].status = 'archived';
        items[index].updatedAt = new Date().toISOString();
        result.success++;
        result.successIds.push(contentId);
      } else {
        result.failed++;
        result.errors.push(`Content ${contentId} not found`);
      }
    }
    saveContent(items);
  }
  
  logHistory('bulk_delete', 'multiple', { 
    count: result.success, 
    permanent, 
    ids: result.successIds 
  });
  
  return result;
}

export async function bulkChangeStatus(contentIds: string[], status: ContentStatus): Promise<BulkOperationResult> {
  await delay(500);
  
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    successIds: []
  };
  
  const items = getStoredContent();
  
  for (const contentId of contentIds) {
    const index = items.findIndex(item => item.id === contentId);
    if (index !== -1) {
      items[index].status = status;
      items[index].updatedAt = new Date().toISOString();
      if (status === 'published' && !items[index].publishedAt) {
        items[index].publishedAt = new Date().toISOString();
      }
      result.success++;
      result.successIds.push(contentId);
    } else {
      result.failed++;
      result.errors.push(`Content ${contentId} not found`);
    }
  }
  
  saveContent(items);
  logHistory('bulk_status_change', 'multiple', { status, count: result.success });
  
  return result;
}

// ============= STATISTICS & ANALYTICS =============

export async function getContentStats(): Promise<ContentStats> {
  await delay(300);
  
  const items = getStoredContent();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats: ContentStats = {
    total: items.length,
    byType: {
      quiz: items.filter(i => i.type === 'quiz').length,
      flashcard: items.filter(i => i.type === 'flashcard').length,
      article: items.filter(i => i.type === 'article').length,
      video: items.filter(i => i.type === 'video').length,
      book: items.filter(i => i.type === 'book').length,
      module: items.filter(i => i.type === 'module').length
    },
    byStatus: {
      draft: items.filter(i => i.status === 'draft').length,
      published: items.filter(i => i.status === 'published').length,
      archived: items.filter(i => i.status === 'archived').length,
      scheduled: items.filter(i => i.status === 'scheduled').length
    },
    byDifficulty: {
      easy: items.filter(i => i.difficulty === 'easy').length,
      medium: items.filter(i => i.difficulty === 'medium').length,
      hard: items.filter(i => i.difficulty === 'hard').length
    },
    totalViews: items.reduce((sum, item) => sum + item.metadata.views, 0),
    totalLikes: items.reduce((sum, item) => sum + item.metadata.likes, 0),
    averageRating: items.length > 0 
      ? items.reduce((sum, item) => sum + item.metadata.averageRating, 0) / items.length 
      : 0,
    publishedToday: items.filter(i => 
      i.publishedAt && new Date(i.publishedAt) >= today
    ).length,
    scheduledCount: items.filter(i => i.status === 'scheduled').length,
    draftCount: items.filter(i => i.status === 'draft').length
  };
  
  return stats;
}

export async function getContentHistory(contentId?: string, limit: number = 50): Promise<any[]> {
  await delay(200);
  
  if (typeof window === 'undefined') return [];
  
  const history = JSON.parse(localStorage.getItem(CONTENT_HISTORY_KEY) || '[]');
  
  if (contentId) {
    return history.filter((h: any) => h.contentId === contentId).slice(0, limit);
  }
  
  return history.slice(0, limit);
}

// ============= SEARCH & DISCOVERY =============

export async function searchContent(query: string, filters?: ContentFilters): Promise<ContentItem[]> {
  await delay(300);
  
  return getAllContent({
    ...filters,
    search: query
  });
}

export async function getFeaturedContent(limit: number = 10): Promise<ContentItem[]> {
  await delay(300);
  
  const items = getStoredContent();
  
  return items
    .filter(item => 
      item.scheduling.featured && 
      item.status === 'published' &&
      (!item.scheduling.featuredUntil || new Date(item.scheduling.featuredUntil) > new Date())
    )
    .sort((a, b) => (b.metadata.views + b.metadata.likes) - (a.metadata.views + a.metadata.likes))
    .slice(0, limit);
}

export async function getTrendingContent(limit: number = 10): Promise<ContentItem[]> {
  await delay(300);
  
  const items = getStoredContent();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return items
    .filter(item => 
      item.status === 'published' &&
      new Date(item.createdAt) >= sevenDaysAgo
    )
    .sort((a, b) => {
      const aScore = a.metadata.views + (a.metadata.likes * 2) + (a.metadata.averageRating * 10);
      const bScore = b.metadata.views + (b.metadata.likes * 2) + (b.metadata.averageRating * 10);
      return bScore - aScore;
    })
    .slice(0, limit);
}

export async function getPopularContent(limit: number = 10): Promise<ContentItem[]> {
  await delay(300);
  
  const items = getStoredContent();
  
  return items
    .filter(item => item.status === 'published')
    .sort((a, b) => b.metadata.views - a.metadata.views)
    .slice(0, limit);
}

// ============= EXPORT/IMPORT =============

export async function exportContent(contentIds?: string[]): Promise<string> {
  await delay(500);
  
  const items = getStoredContent();
  const toExport = contentIds 
    ? items.filter(item => contentIds.includes(item.id))
    : items;
  
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    itemCount: toExport.length,
    items: toExport
  }, null, 2);
}

export async function importContent(jsonData: string): Promise<BulkOperationResult> {
  await delay(800);
  
  const result: BulkOperationResult = {
    success: 0,
    failed: 0,
    errors: [],
    successIds: []
  };
  
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid import format');
    }
    
    const items = getStoredContent();
    
    for (const item of data.items) {
      try {
        const newItem: ContentItem = {
          ...item,
          id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft', // Always import as draft
          version: 1
        };
        
        items.push(newItem);
        result.success++;
        result.successIds.push(newItem.id);
      } catch (error: any) {
        result.failed++;
        result.errors.push(error.message || 'Unknown error');
      }
    }
    
    saveContent(items);
    logHistory('import', 'multiple', { count: result.success });
    
  } catch (error: any) {
    result.failed = 1;
    result.errors.push(error.message || 'Invalid JSON');
  }
  
  return result;
}
