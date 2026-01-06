/**
 * Discussions Service
 * Business logic for the Discussions feature
 */

import slugify from 'slugify';
import { Op } from 'sequelize';
import { 
  DiscussionCategory, DiscussionPost, DiscussionComment, 
  DiscussionReaction, DiscussionBookmark, DiscussionTag
} from '../models/Discussion';

// Helper to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  
  while (await DiscussionPost.findOne({ where: { slug } })) {
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
    return DiscussionCategory.findAll({ 
      where: { isActive: true }, 
      order: [['order', 'ASC']] 
    });
  },

  async getCategoryById(id: string) {
    return DiscussionCategory.findByPk(id);
  },

  async getCategoryBySlug(slug: string) {
    return DiscussionCategory.findOne({ where: { slug } });
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
    const offset = (page - 1) * limit;
    
    let where: Record<string, unknown> = { isActive: true };
    
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    
    if (search) {
      where = {
        ...where,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    if (tags?.length) {
      (where as any).tags = { [Op.overlap]: tags };
    }
    
    let order: Array<[string, string]> = [['createdAt', 'DESC']];
    
    switch (sort) {
      case 'popular':
        order = [['isPinned', 'DESC'], ['likeCount', 'DESC'], ['commentCount', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'unanswered':
        where.hasAcceptedAnswer = false;
        where.type = 'question';
        order = [['isPinned', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'trending':
        order = [['isPinned', 'DESC'], ['viewCount', 'DESC'], ['lastActivityAt', 'DESC']];
        break;
    }
    
    const result = await DiscussionPost.findAndCountAll({
      where,
      include: [
        { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
        { association: 'category', attributes: ['id', 'name', 'slug'] }
      ],
      order,
      limit,
      offset
    });
    
    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
        hasNext: page * limit < result.count,
        hasPrev: page > 1,
      },
    };
  },

  async getPostById(id: string, _userId?: string) {
    return DiscussionPost.findByPk(id, {
      include: [
        { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
        { association: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });
  },

  async getPostBySlug(slug: string, _userId?: string) {
    return DiscussionPost.findOne({
      where: { slug },
      include: [
        { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
        { association: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });
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
      authorId: data.authorId,
      categoryId: data.categoryId,
      tags: data.tags || [],
      nclexTopics: data.nclexTopics || [],
      isActive: true,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isPinned: false,
      isLocked: false,
      hasAcceptedAnswer: false,
      status: 'active'
    });
    
    // Update category post count
    await DiscussionCategory.increment('postCount', { where: { id: data.categoryId } });
    
    // Update tag counts
    if (data.tags?.length) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName, { lower: true });
        await DiscussionTag.findOrCreate({
          where: { slug: tagSlug },
          defaults: { name: tagName, count: 1 }
        }).then(([tag]) => {
          if (!tag.isNewRecord) {
            return tag.increment('count');
          }
        });
      }
    }
    
    return post;
  },

  async updatePost(id: string, data: Record<string, unknown>, userId: string, userRole: string) {
    const post = await DiscussionPost.findByPk(id);
    if (!post) throw new Error('Post not found');
    
    const isAuthor = post.authorId === userId;
    const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
    
    if (!isAuthor && !isModOrAdmin) {
      throw new Error('Not authorized');
    }
    
    if (data.title) {
      data.slug = await generateUniqueSlug(data.title as string);
    }
    
    if (data.content) {
      data.excerpt = createExcerpt(data.content as string);
    }
    
    await post.update(data);
    return post.reload();
  },

  async deletePost(id: string, userId: string, userRole: string) {
    const post = await DiscussionPost.findByPk(id);
    if (!post) throw new Error('Post not found');
    
    const isAuthor = post.authorId === userId;
    const isModOrAdmin = ['admin', 'moderator'].includes(userRole);
    
    if (!isAuthor && !isModOrAdmin) {
      throw new Error('Not authorized');
    }
    
    // Soft delete
    await post.update({ isActive: false });
    
    // Update category post count
    await DiscussionCategory.decrement('postCount', { where: { id: post.categoryId } });
    
    return true;
  },

  async incrementViewCount(id: string) {
    await DiscussionPost.increment('viewCount', { where: { id } });
  },

  // ============= COMMENTS =============

  async createComment(postId: string, data: {
    content: string;
    parentId?: string;
  }, authorId: string) {
    const comment = await DiscussionComment.create({
      postId,
      content: data.content,
      parentId: data.parentId,
      authorId,
      isActive: true,
      likeCount: 0
    });
    
    // Update post comment count
    await DiscussionPost.increment('commentCount', { where: { id: postId } });
    
    return comment;
  },

  async getComments(postId: string, options: {
    limit?: number;
    offset?: number;
  } = {}) {
    return DiscussionComment.findAndCountAll({
      where: { postId, isActive: true },
      include: [
        { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }
      ],
      order: [['createdAt', 'ASC']],
      limit: options.limit || 50,
      offset: options.offset || 0
    });
  },

  async updateComment(id: string, content: string, authorId: string) {
    const comment = await DiscussionComment.findOne({ 
      where: { id, authorId } 
    });
    
    if (!comment) return null;

    await comment.update({ content });
    return comment.reload();
  },

  async deleteComment(id: string, authorId: string) {
    const comment = await DiscussionComment.findOne({ 
      where: { id, authorId } 
    });
    
    if (!comment) return false;

    // Soft delete
    await comment.update({ isActive: false });
    
    // Update post comment count
    await DiscussionPost.decrement('commentCount', { where: { id: comment.postId } });
    
    return true;
  },

  // ============= REACTIONS =============

  async toggleReaction(postId: string, emoji: string, userId: string) {
    const existing = await DiscussionReaction.findOne({
      where: { postId, userId, emoji }
    });

    if (existing) {
      await existing.destroy();
      await DiscussionPost.decrement('likeCount', { where: { id: postId } });
      return { action: 'removed', emoji };
    } else {
      await DiscussionReaction.create({
        postId,
        emoji,
        userId
      });
      await DiscussionPost.increment('likeCount', { where: { id: postId } });
      return { action: 'added', emoji };
    }
  },

  async getReactions(postId: string) {
    return DiscussionReaction.findAll({
      where: { postId },
      attributes: [
        'emoji',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['emoji']
    });
  },

  // ============= BOOKMARKS =============

  async toggleBookmark(postId: string, userId: string) {
    const existing = await DiscussionBookmark.findOne({
      where: { postId, userId }
    });

    if (existing) {
      await existing.destroy();
      return { bookmarked: false };
    } else {
      await DiscussionBookmark.create({
        postId,
        userId
      });
      return { bookmarked: true };
    }
  },

  async getBookmarks(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}) {
    return DiscussionBookmark.findAndCountAll({
      where: { userId },
      include: [
        { 
          association: 'post',
          include: [
            { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
            { association: 'category', attributes: ['id', 'name', 'slug'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 20,
      offset: options.offset || 0
    });
  },

  // ============= SEARCH =============

  async searchPosts(query: string, options: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const where: Record<string, unknown> = {
      isActive: true,
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        { excerpt: { [Op.like]: `%${query}%` } }
      ]
    };

    if (options.categoryId) {
      where.categoryId = options.categoryId;
    }

    return DiscussionPost.findAndCountAll({
      where,
      include: [
        { association: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
        { association: 'category', attributes: ['id', 'name', 'slug'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: options.limit || 20,
      offset: options.offset || 0
    });
  },

  // ============= TAGS =============

  async getTrendingTags(limit: number = 10) {
    return DiscussionTag.findAll({
      order: [['count', 'DESC']],
      limit
    });
  },

  async searchTags(query: string) {
    return DiscussionTag.findAll({
      where: {
        name: { [Op.like]: `%${query}%` }
      },
      order: [['count', 'DESC']],
      limit: 20
    });
  }
};

export default discussionsService;