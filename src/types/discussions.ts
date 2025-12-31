/**
 * Discussions Feature - TypeScript Interfaces
 * Tailored for NCLEX Nursing Student Community
 */

// ============= ENUMS =============

export type PostType = 'question' | 'discussion' | 'study-tip' | 'resource' | 'case-study' | 'mnemonics';
export type PostStatus = 'open' | 'answered' | 'resolved' | 'closed';
export type ReactionType = 'like' | 'helpful' | 'insightful' | 'save';
export type UserRole = 'student' | 'instructor' | 'admin' | 'moderator';
export type SortOption = 'latest' | 'popular' | 'unanswered' | 'trending';

// ============= NURSING-SPECIFIC CATEGORIES =============

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  isNclexCategory: boolean;
  subcategories?: string[];
  createdAt: string;
  updatedAt: string;
}

// NCLEX Client Needs Categories
export const NCLEX_CATEGORIES: Omit<DiscussionCategory, 'id' | 'postCount' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Safe & Effective Care',
    slug: 'safe-effective-care',
    description: 'Management of care, safety & infection control',
    icon: 'Shield',
    color: '#3b82f6',
    isNclexCategory: true,
    subcategories: ['Management of Care', 'Safety & Infection Control']
  },
  {
    name: 'Health Promotion',
    slug: 'health-promotion',
    description: 'Prevention, screening & lifestyle education',
    icon: 'Heart',
    color: '#10b981',
    isNclexCategory: true,
    subcategories: ['Health Promotion', 'Disease Prevention']
  },
  {
    name: 'Psychosocial Integrity',
    slug: 'psychosocial',
    description: 'Mental health, coping & therapeutic communication',
    icon: 'Brain',
    color: '#8b5cf6',
    isNclexCategory: true,
    subcategories: ['Mental Health', 'Coping Mechanisms', 'Therapeutic Communication']
  },
  {
    name: 'Physiological Integrity',
    slug: 'physiological',
    description: 'Basic care, pharmacology, reduction of risk & adaptation',
    icon: 'Activity',
    color: '#ef4444',
    isNclexCategory: true,
    subcategories: ['Basic Care', 'Pharmacology', 'Risk Reduction', 'Physiological Adaptation']
  },
  {
    name: 'Pharmacology',
    slug: 'pharmacology',
    description: 'Medications, drug calculations & interactions',
    icon: 'Pill',
    color: '#f59e0b',
    isNclexCategory: true,
    subcategories: ['Drug Classes', 'Calculations', 'Interactions', 'Side Effects']
  },
  {
    name: 'NCLEX Strategy',
    slug: 'nclex-strategy',
    description: 'Test-taking tips, priority questions & study methods',
    icon: 'Target',
    color: '#06b6d4',
    isNclexCategory: true,
    subcategories: ['Priority Questions', 'SATA Tips', 'Time Management']
  },
  {
    name: 'Lab Values',
    slug: 'lab-values',
    description: 'Normal ranges, critical values & interpretation',
    icon: 'TestTube',
    color: '#ec4899',
    isNclexCategory: true,
    subcategories: ['Blood Chemistry', 'CBC', 'Cardiac Markers', 'ABGs']
  },
  {
    name: 'Clinical Skills',
    slug: 'clinical-skills',
    description: 'Procedures, assessments & nursing interventions',
    icon: 'Stethoscope',
    color: '#14b8a6',
    isNclexCategory: true,
    subcategories: ['Assessment', 'Procedures', 'Documentation']
  }
];

// ============= USER =============

export interface DiscussionAuthor {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  badges: AuthorBadge[];
  stats: {
    postsCount: number;
    helpfulCount: number;
    reputation: number;
  };
}

export interface AuthorBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// ============= POSTS =============

export interface DiscussionPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  contentHtml?: string;
  excerpt: string;
  type: PostType;
  status: PostStatus;
  
  // Relations
  author: DiscussionAuthor;
  categoryId: string;
  category: DiscussionCategory;
  
  // Metadata
  tags: string[];
  nclexTopics: string[];
  isPinned: boolean;
  isLocked: boolean;
  isFeatured: boolean;
  
  // Engagement
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount: number;
  
  // Answer tracking (for questions)
  hasAcceptedAnswer: boolean;
  acceptedAnswerId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  type: PostType;
  categoryId: string;
  tags: string[];
  nclexTopics?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  type?: PostType;
  categoryId?: string;
  tags?: string[];
  status?: PostStatus;
}

// ============= COMMENTS =============

export interface DiscussionComment {
  id: string;
  content: string;
  contentHtml?: string;
  
  // Relations
  postId: string;
  author: DiscussionAuthor;
  parentId?: string;
  replies?: DiscussionComment[];
  
  // Metadata
  isAcceptedAnswer: boolean;
  isInstructorResponse: boolean;
  
  // Engagement
  likeCount: number;
  replyCount: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
}

// ============= REACTIONS =============

export interface DiscussionReaction {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  type: ReactionType;
  createdAt: string;
}

// ============= BOOKMARKS =============

export interface DiscussionBookmark {
  id: string;
  userId: string;
  postId: string;
  post?: DiscussionPost;
  notes?: string;
  createdAt: string;
}

// ============= TAGS =============

export interface DiscussionTag {
  name: string;
  slug: string;
  count: number;
  isNclexTopic: boolean;
  category?: string;
}

// ============= SEARCH =============

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  type?: PostType;
  status?: PostStatus;
  tags?: string[];
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAcceptedAnswer?: boolean;
  isUnanswered?: boolean;
}

export interface SearchResult {
  posts: DiscussionPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: {
    categories: { id: string; name: string; count: number }[];
    types: { type: PostType; count: number }[];
    tags: { name: string; count: number }[];
  };
}

// ============= PAGINATION =============

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============= NOTIFICATIONS =============

export interface DiscussionNotification {
  id: string;
  userId: string;
  type: 'reply' | 'mention' | 'like' | 'accepted_answer' | 'new_follower';
  title: string;
  message: string;
  postId?: string;
  commentId?: string;
  fromUser: DiscussionAuthor;
  isRead: boolean;
  createdAt: string;
}

// ============= ANALYTICS =============

export interface DiscussionAnalytics {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  activeToday: number;
  postsThisWeek: number;
  topContributors: DiscussionAuthor[];
  trendingTags: DiscussionTag[];
  popularCategories: DiscussionCategory[];
}

// ============= POST TYPE CONFIG =============

export const POST_TYPE_CONFIG: Record<PostType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  question: {
    label: 'Question',
    icon: 'HelpCircle',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    description: 'Ask the community for help'
  },
  discussion: {
    label: 'Discussion',
    icon: 'MessageCircle',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    description: 'Start a conversation'
  },
  'study-tip': {
    label: 'Study Tip',
    icon: 'Lightbulb',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    description: 'Share study strategies'
  },
  resource: {
    label: 'Resource',
    icon: 'FileText',
    color: '#10b981',
    bgColor: '#d1fae5',
    description: 'Share helpful materials'
  },
  'case-study': {
    label: 'Case Study',
    icon: 'ClipboardList',
    color: '#ef4444',
    bgColor: '#fee2e2',
    description: 'Discuss clinical scenarios'
  },
  mnemonics: {
    label: 'Mnemonic',
    icon: 'Sparkles',
    color: '#ec4899',
    bgColor: '#fce7f3',
    description: 'Share memory tricks'
  }
};

// ============= WEBSOCKET EVENTS =============

export type DiscussionWSEvent = 
  | { type: 'post:created'; payload: DiscussionPost }
  | { type: 'post:updated'; payload: DiscussionPost }
  | { type: 'post:deleted'; payload: { id: string } }
  | { type: 'comment:created'; payload: DiscussionComment }
  | { type: 'comment:updated'; payload: DiscussionComment }
  | { type: 'reaction:added'; payload: DiscussionReaction }
  | { type: 'reaction:removed'; payload: { id: string } }
  | { type: 'user:typing'; payload: { postId: string; user: DiscussionAuthor } }
  | { type: 'user:online'; payload: { userId: string; count: number } };
