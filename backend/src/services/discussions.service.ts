/**
 * Discussions Service
 * Business logic for the Discussions feature
 */

import slugify from 'slugify';
import { 
  DiscussionCategory, DiscussionPost, DiscussionComment, 
  DiscussionReaction, DiscussionBookmark, DiscussionTag,
  IDiscussionPost
} from '../models/Discussion';

// Helper to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  
  while (await DiscussionPost.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// Helper to create excerpt
function createExcerpt(content: string, maxLength = 200): string {
  const plainText = content.replace(/[#*_`~[\]]/g, '').trim();
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength).trim() + '...'
    : plainText;
}

export const discussionsService = {
  // ============= CATEGORIES =============

  async getCategories() {
    return DiscussionCategory.find({ isActive: true }).sort({ order: 1 });
  },

  async getCategoryById(id: string) {
    return DiscussionCategory.findById(id);
  },

  async getCategoryBySlug(slug: string) {
    return DiscussionCategory.findOne({ slug });
  },

  // ============= POSTS =============

  async getPosts(params: {
    page: number;
    limit: number;
    categoryId?: string;
    type?: string;
    status?: string;
    sort?: string;
    search?: string;
    tags?: string[];
    authorId?: string;
    userId?: string;
  }) {
    const { page, limit, categoryId, type, status, sort, search, tags, authorId } = params;
    
    const query: Record<string, unknown> = {};
    
    if (categoryId) query.category = categoryId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (authorId) query.author = authorId;
    if (tags?.length) query.tags = { $in: tags };
    if (search) {
      query.$text = { $search: search };
    }
    
    let sortOption: Record<string, 1 | -1> = { isPinned: -1, createdAt: -1 };
    
    switch (sort) {
      case 'popular':
        sortOption = { isPinned: -1, likeCount: -1, commentCount: -1 };
        break;
      case 'unanswered':
        query.hasAcceptedAnswer = false;
        query.type = 'question';
        sortOption = { isPinned: -1, createdAt: -1 };
        break;
      case 'trending':
        sortOption = { isPinned: -1, viewCount: -1, lastActivityAt: -1 };
        break;
    }
    
    const [posts, total] = await Promise.all([
      DiscussionPost.find(query)
        .populate('author', 'firstName lastName displayName avatar role isVerified')
        .populate('category', 'name slug icon color')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DiscussionPost.countDocuments(query),
    ]);
    
    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  async getPostById(id: string, _userId?: string) {
    return DiscussionPost.findById(id)
      .populate('author', 'firstName lastName displayName avatar role isVerified badges')
      .populate('category', 'name slug icon color')
      .lean();
  },

  async getPostBySlug(slug: string, _userId?: string) {
    return DiscussionPost.findOne({ slug })
      .populate('author', 'firstName lastName displayName avatar role isVerified badges')
      .populate('category', 'name slug icon color')
      .lean();
  },

  async createPost(data: {
    title: string;
    content: string;
    type: string;
    categoryId: string;
    tags?: string[];
    nclexTopics?: string[];
    authorId: string;
  }) {
    const slug = await generateUniqueSlug(data.title);
    const excerpt = createExcerpt(data.content);
    
    const post = await DiscussionPost.create({
      slug,
      title: data.title,
      content: data.content,
      excerpt,
      type: data.type,
      author: data.authorId,
      category: data.categoryId,
      tags: data.tags || [],
      nclexTopics: data.nclexTopics || [],
    });
    
    // Update category post count
    await DiscussionCategory.findByIdAndUpdate(data.categoryId, { $inc: { postCount: 1 } });
    
    // Update tag counts
    if (data.tags?.length) {
      for (const tagName of data.tags) {
        await DiscussionTag.findOneAndUpdate(
          { slug: slugify(tagName, { lower: true }) },
          { $inc: { count: 1 }, $setOnInsert: { name: tagName } },
          { upsert: true }
        );
      }
    }
    
    return post.populate(['author', 'category']);
  },

  async updatePost(id: string, data: Partial<IDiscussionPost>, userId: string, userRole: string) {
    const post = await DiscussionPost.findById(id);
    if (!post) throw new Error('Post not found');
    
    const isAuthor = post.author.toString() === userId;
    const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
    
    if (!isAuthor && !isModOrAdmin) {
      throw new Error('Not authorized');
    }
    
    if (data.content) {
      data.excerpt = createExcerpt(data.content);
    }
    
    return DiscussionPost.findByIdAndUpdate(id, data, { new: true })
      .populate(['author', 'category']);
  },

  async deletePost(id: string, userId: string, userRole: string) {
    const post = await DiscussionPost.findById(id);
    if (!post) throw new Error('Post not found');
    
    const isAuthor = post.author.toString() === userId;
    const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
    
    if (!isAuthor && !isModOrAdmin) {
      throw new Error('Not authorized');
    }
    
    // Delete related data
    await Promise.all([
      DiscussionComment.deleteMany({ post: id }),
      DiscussionReaction.deleteMany({ target: id, targetType: 'post' }),
      DiscussionBookmark.deleteMany({ post: id }),
      DiscussionCategory.findByIdAndUpdate(post.category, { $inc: { postCount: -1 } }),
    ]);
    
    await post.deleteOne();
  },

  async incrementViewCount(id: string) {
    await DiscussionPost.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  },

  async toggleReaction(targetId: string, targetType: 'post' | 'comment', type: string, userId: string) {
    const existing = await DiscussionReaction.findOne({ user: userId, target: targetId, type });
    
    if (existing) {
      await existing.deleteOne();
      
      const Model = targetType === 'post' ? DiscussionPost : DiscussionComment;
      await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: -1 } });
      
      return { added: false, count: -1 };
    } else {
      await DiscussionReaction.create({ user: userId, target: targetId, targetType, type });
      
      const Model = targetType === 'post' ? DiscussionPost : DiscussionComment;
      const doc = await Model.findByIdAndUpdate(targetId, { $inc: { likeCount: 1 } }, { new: true });
      
      return { added: true, count: doc?.likeCount || 0 };
    }
  },

  async togglePin(id: string, isPinned: boolean) {
    return DiscussionPost.findByIdAndUpdate(id, { isPinned }, { new: true });
  },

  async toggleLock(id: string, isLocked: boolean) {
    return DiscussionPost.findByIdAndUpdate(id, { isLocked }, { new: true });
  },

  async markResolved(id: string, userId: string) {
    const post = await DiscussionPost.findById(id);
    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Not authorized');
    
    return DiscussionPost.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
  },

  async getRelatedPosts(id: string, limit: number) {
    const post = await DiscussionPost.findById(id);
    if (!post) return [];
    
    return DiscussionPost.find({
      _id: { $ne: id },
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } },
      ],
    })
      .populate('author', 'firstName lastName displayName')
      .populate('category', 'name slug color')
      .sort({ viewCount: -1 })
      .limit(limit)
      .lean();
  },

  // ============= COMMENTS =============

  async getCommentsByPost(postId: string) {
    return DiscussionComment.find({ post: postId })
      .populate('author', 'firstName lastName displayName avatar role isVerified badges')
      .sort({ isAcceptedAnswer: -1, createdAt: 1 })
      .lean();
  },

  async createComment(data: {
    postId: string;
    content: string;
    parentId?: string;
    authorId: string;
    isInstructor: boolean;
  }) {
    const comment = await DiscussionComment.create({
      post: data.postId,
      content: data.content,
      parent: data.parentId || null,
      author: data.authorId,
      isInstructorResponse: data.isInstructor,
    });
    
    // Update post comment count and last activity
    await DiscussionPost.findByIdAndUpdate(data.postId, {
      $inc: { commentCount: 1 },
      lastActivityAt: new Date(),
    });
    
    // Update parent reply count if applicable
    if (data.parentId) {
      await DiscussionComment.findByIdAndUpdate(data.parentId, { $inc: { replyCount: 1 } });
    }
    
    return comment.populate('author');
  },

  async updateComment(id: string, content: string, userId: string) {
    const comment = await DiscussionComment.findById(id);
    if (!comment) throw new Error('Comment not found');
    if (comment.author.toString() !== userId) throw new Error('Not authorized');
    
    return DiscussionComment.findByIdAndUpdate(
      id,
      { content, isEdited: true, editedAt: new Date() },
      { new: true }
    ).populate('author');
  },

  async deleteComment(id: string, userId: string, userRole: string) {
    const comment = await DiscussionComment.findById(id);
    if (!comment) throw new Error('Comment not found');
    
    const isAuthor = comment.author.toString() === userId;
    const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
    
    if (!isAuthor && !isModOrAdmin) throw new Error('Not authorized');
    
    // Update post comment count
    await DiscussionPost.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
    
    // Delete reactions
    await DiscussionReaction.deleteMany({ target: id, targetType: 'comment' });
    
    await comment.deleteOne();
  },

  async acceptAnswer(commentId: string, userId: string) {
    const comment = await DiscussionComment.findById(commentId).populate('post');
    if (!comment) throw new Error('Comment not found');
    
    const post = await DiscussionPost.findById(comment.post);
    if (!post) throw new Error('Post not found');
    if (post.author.toString() !== userId) throw new Error('Not authorized');
    
    // Unmark previous accepted answer
    await DiscussionComment.updateMany({ post: post._id }, { isAcceptedAnswer: false });
    
    // Mark new accepted answer
    await DiscussionComment.findByIdAndUpdate(commentId, { isAcceptedAnswer: true });
    
    // Update post
    await DiscussionPost.findByIdAndUpdate(post._id, {
      hasAcceptedAnswer: true,
      acceptedAnswer: commentId,
      status: 'answered',
    });
    
    return DiscussionComment.findById(commentId).populate('author');
  },

  // ============= BOOKMARKS =============

  async getBookmarks(userId: string) {
    return DiscussionBookmark.find({ user: userId })
      .populate({
        path: 'post',
        populate: [
          { path: 'author', select: 'firstName lastName displayName' },
          { path: 'category', select: 'name slug color' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();
  },

  async toggleBookmark(userId: string, postId: string) {
    const existing = await DiscussionBookmark.findOne({ user: userId, post: postId });
    
    if (existing) {
      await existing.deleteOne();
      await DiscussionPost.findByIdAndUpdate(postId, { $inc: { bookmarkCount: -1 } });
      return { bookmarked: false };
    } else {
      await DiscussionBookmark.create({ user: userId, post: postId });
      await DiscussionPost.findByIdAndUpdate(postId, { $inc: { bookmarkCount: 1 } });
      return { bookmarked: true };
    }
  },

  async updateBookmarkNotes(userId: string, postId: string, notes: string) {
    return DiscussionBookmark.findOneAndUpdate(
      { user: userId, post: postId },
      { notes },
      { new: true }
    );
  },

  // ============= TAGS =============

  async getTrendingTags(limit: number) {
    return DiscussionTag.find().sort({ count: -1 }).limit(limit).lean();
  },

  async searchTags(query: string) {
    return DiscussionTag.find({
      name: { $regex: query, $options: 'i' },
    }).limit(10).lean();
  },

  async getTagsByCategory(categoryId: string) {
    return DiscussionTag.find({ category: categoryId }).sort({ count: -1 }).lean();
  },

  // ============= SEARCH =============

  async search(params: {
    query?: string;
    categoryId?: string;
    type?: string;
    status?: string;
    tags?: string[];
    authorId?: string;
    dateFrom?: string;
    dateTo?: string;
    hasAcceptedAnswer?: boolean;
    isUnanswered?: boolean;
    page: number;
    limit: number;
  }) {
    const filter: Record<string, unknown> = {};
    
    if (params.query) filter.$text = { $search: params.query };
    if (params.categoryId) filter.category = params.categoryId;
    if (params.type) filter.type = params.type;
    if (params.status) filter.status = params.status;
    if (params.tags?.length) filter.tags = { $in: params.tags };
    if (params.authorId) filter.author = params.authorId;
    if (params.hasAcceptedAnswer !== undefined) filter.hasAcceptedAnswer = params.hasAcceptedAnswer;
    if (params.isUnanswered) {
      filter.type = 'question';
      filter.hasAcceptedAnswer = false;
    }
    if (params.dateFrom || params.dateTo) {
      filter.createdAt = {};
      if (params.dateFrom) (filter.createdAt as Record<string, Date>).$gte = new Date(params.dateFrom);
      if (params.dateTo) (filter.createdAt as Record<string, Date>).$lte = new Date(params.dateTo);
    }
    
    const [posts, total] = await Promise.all([
      DiscussionPost.find(filter)
        .populate('author', 'firstName lastName displayName')
        .populate('category', 'name slug color')
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .lean(),
      DiscussionPost.countDocuments(filter),
    ]);
    
    return {
      posts,
      total,
      page: params.page,
      limit: params.limit,
      hasMore: params.page * params.limit < total,
    };
  },

  async searchSuggest(query: string) {
    const [posts, tags] = await Promise.all([
      DiscussionPost.find({ $text: { $search: query } })
        .select('title slug type')
        .limit(5)
        .lean(),
      DiscussionTag.find({ name: { $regex: query, $options: 'i' } })
        .limit(5)
        .lean(),
    ]);
    
    return { posts, tags };
  },

  // ============= ANALYTICS =============

  async getAnalytics() {
    const [totalPosts, totalComments, postsThisWeek, trendingTags, popularCategories] = await Promise.all([
      DiscussionPost.countDocuments(),
      DiscussionComment.countDocuments(),
      DiscussionPost.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      DiscussionTag.find().sort({ count: -1 }).limit(10).lean(),
      DiscussionCategory.find({ isActive: true }).sort({ postCount: -1 }).limit(5).lean(),
    ]);
    
    return {
      totalPosts,
      totalComments,
      postsThisWeek,
      trendingTags,
      popularCategories,
    };
  },

  async trackEvent(userId: string, event: string, data: Record<string, unknown>) {
    // Implement event tracking logic (e.g., save to analytics collection)
    console.log('Discussion event:', { userId, event, data, timestamp: new Date() });
  },

  // ============= USER ACTIVITY =============

  async getPostsByAuthor(authorId: string, page: number, limit: number) {
    const [posts, total] = await Promise.all([
      DiscussionPost.find({ author: authorId })
        .populate('category', 'name slug color')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DiscussionPost.countDocuments({ author: authorId }),
    ]);
    
    return {
      data: posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  },

  async getCommentsByAuthor(authorId: string, page: number, limit: number) {
    const [comments, total] = await Promise.all([
      DiscussionComment.find({ author: authorId })
        .populate('post', 'title slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DiscussionComment.countDocuments({ author: authorId }),
    ]);
    
    return {
      data: comments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  },
};
