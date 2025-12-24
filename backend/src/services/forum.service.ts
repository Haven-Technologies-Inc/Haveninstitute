/**
 * Forum Service - Business logic for discussion forum
 */

import { Op } from 'sequelize';
import { ForumCategory, ForumPost, ForumComment, ForumReaction, ForumBookmark } from '../models/Forum';
import { User } from '../models/User';

interface CreatePostInput {
  categoryId: string;
  title: string;
  content: string;
  type?: ForumPost['type'];
  tags?: string[];
}

interface UpdatePostInput {
  title?: string;
  content?: string;
  tags?: string[];
  status?: ForumPost['status'];
  isPinned?: boolean;
  isLocked?: boolean;
}

interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

export class ForumService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<ForumCategory[]> {
    return ForumCategory.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    return ForumCategory.findOne({
      where: { slug, isActive: true }
    });
  }

  /**
   * Create a new post
   */
  async createPost(userId: string, input: CreatePostInput): Promise<ForumPost> {
    const category = await ForumCategory.findByPk(input.categoryId);
    if (!category) throw new Error('Category not found');

    const slug = generateSlug(input.title);

    const post = await ForumPost.create({
      ...input,
      slug,
      authorId: userId,
      lastActivityAt: new Date()
    });

    // Update category post count
    await category.increment('postCount');

    return post.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: ForumCategory, as: 'category' }
      ]
    });
  }

  /**
   * Get posts with filtering and pagination
   */
  async getPosts(options: {
    categoryId?: string;
    type?: string;
    status?: string;
    authorId?: string;
    search?: string;
    tags?: string[];
    sortBy?: 'latest' | 'popular' | 'active';
    limit?: number;
    offset?: number;
  }): Promise<{ posts: ForumPost[]; total: number }> {
    const where: any = {};

    if (options.categoryId) where.categoryId = options.categoryId;
    if (options.type) where.type = options.type;
    if (options.status) where.status = options.status;
    if (options.authorId) where.authorId = options.authorId;
    
    if (options.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${options.search}%` } },
        { content: { [Op.iLike]: `%${options.search}%` } }
      ];
    }

    if (options.tags?.length) {
      where.tags = { [Op.overlap]: options.tags };
    }

    let order: any[] = [['isPinned', 'DESC']];
    switch (options.sortBy) {
      case 'popular':
        order.push(['likeCount', 'DESC'], ['viewCount', 'DESC']);
        break;
      case 'active':
        order.push(['lastActivityAt', 'DESC']);
        break;
      default:
        order.push(['createdAt', 'DESC']);
    }

    const { rows: posts, count: total } = await ForumPost.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: ForumCategory, as: 'category', attributes: ['id', 'name', 'slug', 'color'] }
      ],
      order,
      limit: options.limit || 20,
      offset: options.offset || 0
    });

    return { posts, total };
  }

  /**
   * Get post by ID or slug
   */
  async getPost(identifier: string, userId?: string): Promise<ForumPost | null> {
    const where = identifier.includes('-') 
      ? { slug: identifier }
      : { id: identifier };

    const post = await ForumPost.findOne({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: ForumCategory, as: 'category' },
        {
          model: ForumComment,
          as: 'comments',
          include: [
            { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (post) {
      // Increment view count
      await post.increment('viewCount');
    }

    return post;
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, userId: string, input: UpdatePostInput, isAdmin: boolean = false): Promise<ForumPost> {
    const post = await ForumPost.findByPk(postId);
    if (!post) throw new Error('Post not found');
    
    if (post.authorId !== userId && !isAdmin) {
      throw new Error('Not authorized to update this post');
    }

    await post.update({
      ...input,
      lastActivityAt: new Date()
    });

    return post.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        { model: ForumCategory, as: 'category' }
      ]
    });
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const post = await ForumPost.findByPk(postId);
    if (!post) throw new Error('Post not found');
    
    if (post.authorId !== userId && !isAdmin) {
      throw new Error('Not authorized to delete this post');
    }

    const categoryId = post.categoryId;

    // Delete related data
    await ForumReaction.destroy({ where: { postId } });
    await ForumBookmark.destroy({ where: { postId } });
    await ForumComment.destroy({ where: { postId } });
    await post.destroy();

    // Update category count
    await ForumCategory.decrement('postCount', { where: { id: categoryId } });
  }

  /**
   * Create a comment
   */
  async createComment(userId: string, input: CreateCommentInput): Promise<ForumComment> {
    const post = await ForumPost.findByPk(input.postId);
    if (!post) throw new Error('Post not found');
    if (post.isLocked) throw new Error('Post is locked');

    const comment = await ForumComment.create({
      ...input,
      authorId: userId
    });

    // Update post stats
    await post.increment('commentCount');
    await post.update({ lastActivityAt: new Date() });

    return comment.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, userId: string, content: string): Promise<ForumComment> {
    const comment = await ForumComment.findByPk(commentId);
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Not authorized');

    await comment.update({ content, isEdited: true });

    return comment.reload({
      include: [
        { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] }
      ]
    });
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const comment = await ForumComment.findByPk(commentId);
    if (!comment) throw new Error('Comment not found');
    
    if (comment.authorId !== userId && !isAdmin) {
      throw new Error('Not authorized');
    }

    const postId = comment.postId;

    await ForumReaction.destroy({ where: { commentId } });
    await comment.destroy();

    await ForumPost.decrement('commentCount', { where: { id: postId } });
  }

  /**
   * Accept answer (for questions)
   */
  async acceptAnswer(postId: string, commentId: string, userId: string): Promise<ForumPost> {
    const post = await ForumPost.findByPk(postId);
    if (!post) throw new Error('Post not found');
    if (post.authorId !== userId) throw new Error('Only post author can accept answers');
    if (post.type !== 'question') throw new Error('Only question posts can have accepted answers');

    const comment = await ForumComment.findByPk(commentId);
    if (!comment || comment.postId !== postId) throw new Error('Comment not found');

    // Unmark previous accepted answer
    if (post.acceptedAnswerId) {
      await ForumComment.update(
        { isAccepted: false },
        { where: { id: post.acceptedAnswerId } }
      );
    }

    // Mark new accepted answer
    await comment.update({ isAccepted: true });
    await post.update({ acceptedAnswerId: commentId, status: 'resolved' });

    return post;
  }

  /**
   * Toggle reaction (like/unlike)
   */
  async toggleReaction(
    userId: string,
    type: ForumReaction['type'],
    postId?: string,
    commentId?: string
  ): Promise<{ added: boolean; count: number }> {
    if (!postId && !commentId) throw new Error('Must specify post or comment');

    const existingReaction = await ForumReaction.findOne({
      where: { userId, type, postId, commentId }
    });

    if (existingReaction) {
      await existingReaction.destroy();
      
      if (postId) {
        await ForumPost.decrement('likeCount', { where: { id: postId } });
        const post = await ForumPost.findByPk(postId);
        return { added: false, count: post?.likeCount || 0 };
      } else {
        await ForumComment.decrement('likeCount', { where: { id: commentId } });
        const comment = await ForumComment.findByPk(commentId);
        return { added: false, count: comment?.likeCount || 0 };
      }
    } else {
      await ForumReaction.create({ userId, type, postId, commentId });
      
      if (postId) {
        await ForumPost.increment('likeCount', { where: { id: postId } });
        const post = await ForumPost.findByPk(postId);
        return { added: true, count: post?.likeCount || 0 };
      } else {
        await ForumComment.increment('likeCount', { where: { id: commentId } });
        const comment = await ForumComment.findByPk(commentId);
        return { added: true, count: comment?.likeCount || 0 };
      }
    }
  }

  /**
   * Toggle bookmark
   */
  async toggleBookmark(userId: string, postId: string): Promise<boolean> {
    const existing = await ForumBookmark.findOne({
      where: { userId, postId }
    });

    if (existing) {
      await existing.destroy();
      return false;
    } else {
      await ForumBookmark.create({ userId, postId });
      return true;
    }
  }

  /**
   * Get user's bookmarks
   */
  async getBookmarks(userId: string): Promise<ForumPost[]> {
    const bookmarks = await ForumBookmark.findAll({
      where: { userId },
      include: [{
        model: ForumPost,
        include: [
          { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
          { model: ForumCategory, as: 'category', attributes: ['id', 'name', 'slug'] }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });

    return bookmarks.map(b => b.post);
  }

  /**
   * Get user's reactions for posts/comments
   */
  async getUserReactions(userId: string, postIds: string[]): Promise<Map<string, string>> {
    const reactions = await ForumReaction.findAll({
      where: { userId, postId: { [Op.in]: postIds } }
    });

    const map = new Map<string, string>();
    reactions.forEach(r => {
      if (r.postId) map.set(r.postId, r.type);
    });

    return map;
  }

  /**
   * Get trending tags
   */
  async getTrendingTags(limit: number = 10): Promise<{ tag: string; count: number }[]> {
    const posts = await ForumPost.findAll({
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      attributes: ['tags']
    });

    const tagCounts = new Map<string, number>();
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * Search posts
   */
  async search(query: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: ForumPost[]; total: number }> {
    return this.getPosts({
      search: query,
      limit: options.limit,
      offset: options.offset,
      sortBy: 'latest'
    });
  }
}

export const forumService = new ForumService();
export default forumService;
