import { Op } from 'sequelize';
import { StudyMaterial, UserStudyMaterial, MaterialType, MaterialCategory } from '../models/StudyMaterial';
import { User } from '../models/User';

export interface MaterialFilters {
  materialType?: MaterialType;
  category?: MaterialCategory;
  subscriptionTier?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateMaterialInput {
  title: string;
  description?: string;
  materialType: MaterialType;
  category?: MaterialCategory;
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
  publishedDate?: Date;
  subscriptionTier?: string;
  price?: number;
  isFeatured?: boolean;
  uploadedBy?: string;
}

export interface UpdateMaterialInput extends Partial<CreateMaterialInput> {
  isActive?: boolean;
}

class StudyMaterialService {
  /**
   * Get all materials with filtering and pagination
   */
  async getMaterials(filters: MaterialFilters, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (filters.materialType) {
      where.materialType = filters.materialType;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.subscriptionTier) {
      where.subscriptionTier = filters.subscriptionTier;
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      where.isActive = true; // Default to active only
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
        { author: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await StudyMaterial.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      include: [{ model: User, as: 'uploader', attributes: ['id', 'fullName'] }],
    });

    return {
      materials: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get a single material by ID
   */
  async getMaterialById(id: string) {
    const material = await StudyMaterial.findByPk(id, {
      include: [{ model: User, as: 'uploader', attributes: ['id', 'fullName'] }],
    });
    if (!material) {
      throw new Error('Study material not found');
    }
    return material;
  }

  /**
   * Create a new study material
   */
  async createMaterial(input: CreateMaterialInput) {
    const material = await StudyMaterial.create(input as any);
    return material;
  }

  /**
   * Update an existing material
   */
  async updateMaterial(id: string, input: UpdateMaterialInput) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      throw new Error('Study material not found');
    }
    await material.update(input);
    return material;
  }

  /**
   * Delete a material
   */
  async deleteMaterial(id: string, hard = false) {
    const material = await StudyMaterial.findByPk(id);
    if (!material) {
      throw new Error('Study material not found');
    }

    if (hard) {
      await material.destroy();
      return { message: 'Material permanently deleted' };
    } else {
      await material.update({ isActive: false });
      return { message: 'Material deactivated' };
    }
  }

  /**
   * Increment view count
   */
  async recordView(id: string) {
    const material = await StudyMaterial.findByPk(id);
    if (material) {
      await material.update({ viewCount: material.viewCount + 1 });
    }
  }

  /**
   * Increment download count
   */
  async recordDownload(id: string) {
    const material = await StudyMaterial.findByPk(id);
    if (material) {
      await material.update({ downloadCount: material.downloadCount + 1 });
    }
  }

  /**
   * Get user's library (materials with progress)
   */
  async getUserLibrary(userId: string, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'lastAccessed', sortOrder = 'DESC' } = pagination;
    const offset = (page - 1) * limit;

    const { count, rows } = await UserStudyMaterial.findAndCountAll({
      where: { userId },
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      include: [{ model: StudyMaterial, as: 'material' }],
    });

    return {
      items: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get or create user material progress
   */
  async getUserMaterialProgress(userId: string, materialId: string) {
    let progress = await UserStudyMaterial.findOne({
      where: { userId, materialId },
      include: [{ model: StudyMaterial, as: 'material' }],
    });

    if (!progress) {
      progress = await UserStudyMaterial.create({
        userId,
        materialId,
        progress: 0,
        currentPage: 0,
        currentPosition: 0,
      } as any);
      progress = await UserStudyMaterial.findByPk(progress.id, {
        include: [{ model: StudyMaterial, as: 'material' }],
      });
    }

    return progress;
  }

  /**
   * Update user's progress on a material
   */
  async updateProgress(userId: string, materialId: string, data: {
    progress?: number;
    currentPage?: number;
    currentPosition?: number;
    timeSpent?: number;
  }) {
    let userMaterial = await UserStudyMaterial.findOne({
      where: { userId, materialId },
    });

    if (!userMaterial) {
      userMaterial = await UserStudyMaterial.create({
        userId,
        materialId,
        ...data,
        lastAccessed: new Date(),
      } as any);
    } else {
      const updateData: any = {
        ...data,
        lastAccessed: new Date(),
      };
      if (data.timeSpent) {
        updateData.timeSpent = userMaterial.timeSpent + data.timeSpent;
      }
      await userMaterial.update(updateData);
    }

    return userMaterial;
  }

  /**
   * Add bookmark
   */
  async addBookmark(userId: string, materialId: string, bookmark: { page?: number; position?: number; note?: string }) {
    let userMaterial = await UserStudyMaterial.findOne({
      where: { userId, materialId },
    });

    if (!userMaterial) {
      userMaterial = await UserStudyMaterial.create({
        userId,
        materialId,
        bookmarks: [{ ...bookmark, createdAt: new Date() }],
      } as any);
    } else {
      const bookmarks = userMaterial.bookmarks || [];
      bookmarks.push({ ...bookmark, createdAt: new Date() });
      await userMaterial.update({ bookmarks });
    }

    return userMaterial;
  }

  /**
   * Add highlight
   */
  async addHighlight(userId: string, materialId: string, highlight: { text: string; page?: number; note?: string; color?: string }) {
    let userMaterial = await UserStudyMaterial.findOne({
      where: { userId, materialId },
    });

    if (!userMaterial) {
      userMaterial = await UserStudyMaterial.create({
        userId,
        materialId,
        highlights: [{ ...highlight, createdAt: new Date() }],
      } as any);
    } else {
      const highlights = userMaterial.highlights || [];
      highlights.push({ ...highlight, createdAt: new Date() });
      await userMaterial.update({ highlights });
    }

    return userMaterial;
  }

  /**
   * Toggle favorite
   */
  async toggleFavorite(userId: string, materialId: string) {
    let userMaterial = await UserStudyMaterial.findOne({
      where: { userId, materialId },
    });

    if (!userMaterial) {
      userMaterial = await UserStudyMaterial.create({
        userId,
        materialId,
        isFavorite: true,
      } as any);
    } else {
      await userMaterial.update({ isFavorite: !userMaterial.isFavorite });
    }

    return userMaterial;
  }

  /**
   * Rate a material
   */
  async rateMaterial(userId: string, materialId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    let userMaterial = await UserStudyMaterial.findOne({
      where: { userId, materialId },
    });

    const previousRating = userMaterial?.rating;

    if (!userMaterial) {
      userMaterial = await UserStudyMaterial.create({
        userId,
        materialId,
        rating,
      } as any);
    } else {
      await userMaterial.update({ rating });
    }

    // Update material average rating
    const material = await StudyMaterial.findByPk(materialId);
    if (material) {
      if (previousRating) {
        // Update existing rating
        const newTotal = (material.averageRating * material.ratingCount) - previousRating + rating;
        await material.update({ averageRating: newTotal / material.ratingCount });
      } else {
        // New rating
        const newTotal = (material.averageRating * material.ratingCount) + rating;
        const newCount = material.ratingCount + 1;
        await material.update({ averageRating: newTotal / newCount, ratingCount: newCount });
      }
    }

    return userMaterial;
  }

  /**
   * Get featured materials
   */
  async getFeatured(limit = 6) {
    return StudyMaterial.findAll({
      where: { isActive: true, isFeatured: true },
      order: [['viewCount', 'DESC']],
      limit,
    });
  }

  /**
   * Get popular materials
   */
  async getPopular(limit = 10) {
    return StudyMaterial.findAll({
      where: { isActive: true },
      order: [['viewCount', 'DESC']],
      limit,
    });
  }

  /**
   * Get statistics
   */
  async getStatistics() {
    const total = await StudyMaterial.count();
    const active = await StudyMaterial.count({ where: { isActive: true } });

    const byType = await StudyMaterial.findAll({
      attributes: [
        'materialType',
        [StudyMaterial.sequelize!.fn('COUNT', StudyMaterial.sequelize!.col('id')), 'count'],
      ],
      group: ['materialType'],
      raw: true,
    });

    const byCategory = await StudyMaterial.findAll({
      attributes: [
        'category',
        [StudyMaterial.sequelize!.fn('COUNT', StudyMaterial.sequelize!.col('id')), 'count'],
      ],
      group: ['category'],
      raw: true,
    });

    return {
      total,
      active,
      inactive: total - active,
      byType,
      byCategory,
    };
  }
}

export const studyMaterialService = new StudyMaterialService();
