// NurseHaven API Services - Central Export Hub
// All API services exported from a single location for easy imports

// ============= AUTHENTICATION =============
export * from './authApi';

// ============= CONTENT MANAGEMENT =============
export * from './contentApi';
export * from './contentManagementApi';

// ============= WEBSITE CONTENT =============
export * from './websiteContentApi';

// ============= USER MANAGEMENT =============
export * from './userManagementApi';

// ============= PAYMENT & BILLING =============
export * from './paymentApi';

// ============= QUIZ & FLASHCARDS =============
export * from './quizApi';
export * from './flashcardApi';

// ============= BOOKS =============
export * from './bookApi';

// ============= CAT TESTING =============
export * from './catTestingApi';

// ============= FORUM =============
export * from './forumApi';

// ============= AI SERVICES =============
export * from './aiApi';

// ============= ANALYTICS =============
export * from './analyticsApi';

// ============= NCLEX SIMULATOR =============
export * from './nclexSimulatorApi';

/**
 * API Services Overview:
 * 
 * 1. Authentication (authApi.ts)
 *    - User login/signup
 *    - Role-based authentication
 *    - Session management
 * 
 * 2. Content API (contentApi.ts)
 *    - Questions CRUD
 *    - Flashcards CRUD
 *    - Books CRUD
 *    - Import/Export
 * 
 * 3. Content Management API (contentManagementApi.ts) ✅ NEW
 *    - 65+ endpoints for comprehensive content management
 *    - Advanced filtering and search
 *    - Bulk operations
 *    - Version tracking
 *    - Analytics and statistics
 * 
 * 4. Website Content API (websiteContentApi.ts) ✅ NEW
 *    - 50+ endpoints for landing page management
 *    - Hero, Features, Testimonials, Pricing, FAQs
 *    - Full CRUD operations
 *    - Duplicate and reorder functionality
 *    - Export/Import JSON
 * 
 * 5. User Management API (userManagementApi.ts) ✅
 *    - 5 hierarchical user roles
 *    - Granular permissions
 *    - Profile/avatar management
 *    - Activity tracking
 *    - Bulk operations
 * 
 * 6. Payment API (paymentApi.ts)
 *    - Stripe integration
 *    - Subscription management
 *    - Payment processing
 * 
 * 7. Quiz API (quizApi.ts)
 *    - Quiz sessions
 *    - Score tracking
 *    - Progress analytics
 * 
 * 8. Flashcard API (flashcardApi.ts)
 *    - Flashcard sessions
 *    - Spaced repetition
 *    - Progress tracking
 * 
 * 9. Book API (bookApi.ts)
 *    - Book library
 *    - Chapter management
 *    - Reading progress
 * 
 * 10. CAT Testing API (catTestingApi.ts)
 *     - Adaptive testing
 *     - IRT-based difficulty
 *     - Real-time scoring
 * 
 * 11. Forum API (forumApi.ts)
 *     - Discussion threads
 *     - Comments and replies
 *     - Moderation tools
 * 
 * 12. AI API (aiApi.ts)
 *     - AI chat
 *     - AI analytics
 *     - AI study tools
 * 
 * 13. Analytics API (analyticsApi.ts)
 *     - User analytics
 *     - Content performance
 *     - Revenue metrics
 * 
 * 14. NCLEX Simulator API (nclexSimulatorApi.ts)
 *     - Full NCLEX simulation
 *     - Timed tests
 *     - Score calculation
 */

// ============= TYPE EXPORTS =============

// Re-export commonly used types for convenience
export type {
  // Content Management Types
  ContentType,
  ContentStatus,
  DifficultyLevel,
  ContentItem,
  ContentFilters,
  ContentStats,
  BulkOperationResult
} from './contentManagementApi';

export type {
  // Website Content Types
  WebsiteContent,
  HeroSection,
  Feature,
  Testimonial,
  PricingPlan,
  Statistic,
  FAQ,
  CallToAction,
  FooterSection
} from './websiteContentApi';

export type {
  // User Management Types
  UserRole,
  UserStatus,
  User,
  UserPermissions,
  UserFilters,
  UserStats,
  AuditLog,
  BulkUserOperationResult
} from './userManagementApi';

// ============= API CONFIGURATION =============

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// ============= STORAGE KEYS =============

export const STORAGE_KEYS = {
  // Content Management
  CONTENT_ITEMS: 'content_items',
  CONTENT_HISTORY: 'content_history',
  
  // Website Content
  WEBSITE_CONTENT: 'nursehaven_website_content',
  
  // User Management
  USERS: 'users',
  USER_ACTIVITY: 'user_activity',
  AUDIT_LOGS: 'audit_logs',
  
  // Authentication
  AUTH_TOKEN: 'auth_token',
  USER_SESSION: 'user_session',
  
  // Preferences
  THEME: 'theme',
  LANGUAGE: 'language',
};

// ============= ERROR HANDLERS =============

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }
  
  return new ApiError(
    error.message || 'An unknown error occurred',
    error.statusCode,
    error.errorCode,
    error.details
  );
};

// ============= RESPONSE HELPERS =============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
});

export const createErrorResponse = (error: string): ApiResponse<never> => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
});

// ============= PAGINATION HELPERS =============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

// ============= VALIDATION HELPERS =============

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============= UTILITY FUNCTIONS =============

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    await delay(delayMs);
    return retry(fn, attempts - 1, delayMs * 2);
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitMs);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
};

// ============= DATE HELPERS =============

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
};

// ============= LOCAL STORAGE HELPERS =============

export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// ============= EXPORTS SUMMARY =============

/**
 * Total API Coverage:
 * 
 * ✅ 14 API Services
 * ✅ 115+ Endpoints
 * ✅ Full TypeScript Support
 * ✅ Error Handling
 * ✅ Validation Helpers
 * ✅ Utility Functions
 * ✅ Local Storage Management
 * ✅ Pagination Support
 * ✅ Bulk Operations
 * ✅ Import/Export Functionality
 * 
 * Usage:
 * import { createContent, getAllUsers, updateHeroSection } from './services';
 */
