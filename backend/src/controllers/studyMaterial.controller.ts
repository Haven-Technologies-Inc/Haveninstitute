import { Request, Response } from 'express';
import { studyMaterialService, MaterialFilters, PaginationOptions } from '../services/studyMaterial.service';
import { ResponseHandler, errorCodes } from '../utils/response';

export class StudyMaterialController {
  async getMaterials(req: Request, res: Response) {
    try {
      const filters: MaterialFilters = {
        materialType: req.query.materialType as any,
        category: req.query.category as any,
        subscriptionTier: req.query.subscriptionTier as string,
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
        isActive: req.query.isActive === 'false' ? false : true,
        search: req.query.search as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      };

      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
        sortBy: (req.query.sortBy as string) || 'createdAt',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      };

      const result = await studyMaterialService.getMaterials(filters, pagination);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve materials', 500);
    }
  }

  async getMaterialById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const material = await studyMaterialService.getMaterialById(id);
      await studyMaterialService.recordView(id);
      return ResponseHandler.success(res, material);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study material not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Study material not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve material', 500);
    }
  }

  async createMaterial(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const material = await studyMaterialService.createMaterial({ ...req.body, uploadedBy: userId });
      return ResponseHandler.success(res, material, 201);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to create material', 400);
    }
  }

  async updateMaterial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const material = await studyMaterialService.updateMaterial(id, req.body);
      return ResponseHandler.success(res, material);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study material not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Study material not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to update material', 400);
    }
  }

  async deleteMaterial(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const hard = req.query.hard === 'true';
      const result = await studyMaterialService.deleteMaterial(id, hard);
      return ResponseHandler.success(res, result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Study material not found') {
        return ResponseHandler.error(res, errorCodes.RES_NOT_FOUND, 'Study material not found', 404);
      }
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to delete material', 500);
    }
  }

  async getFeatured(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const materials = await studyMaterialService.getFeatured(limit);
      return ResponseHandler.success(res, materials);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve featured materials', 500);
    }
  }

  async getPopular(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const materials = await studyMaterialService.getPopular(limit);
      return ResponseHandler.success(res, materials);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve popular materials', 500);
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const stats = await studyMaterialService.getStatistics();
      return ResponseHandler.success(res, stats);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve statistics', 500);
    }
  }

  async getUserLibrary(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const pagination: PaginationOptions = {
        page: parseInt(req.query.page as string) || 1,
        limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
        sortBy: (req.query.sortBy as string) || 'lastAccessed',
        sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC',
      };
      const result = await studyMaterialService.getUserLibrary(userId, pagination);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve library', 500);
    }
  }

  async getMaterialProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const progress = await studyMaterialService.getUserMaterialProgress(userId, id);
      return ResponseHandler.success(res, progress);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve progress', 500);
    }
  }

  async updateProgress(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const progress = await studyMaterialService.updateProgress(userId, id, req.body);
      return ResponseHandler.success(res, progress);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to update progress', 500);
    }
  }

  async addBookmark(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const result = await studyMaterialService.addBookmark(userId, id, req.body);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to add bookmark', 500);
    }
  }

  async addHighlight(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const result = await studyMaterialService.addHighlight(userId, id, req.body);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to add highlight', 500);
    }
  }

  async toggleFavorite(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const result = await studyMaterialService.toggleFavorite(userId, id);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to toggle favorite', 500);
    }
  }

  async rateMaterial(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { rating } = req.body;
      const result = await studyMaterialService.rateMaterial(userId, id, rating);
      return ResponseHandler.success(res, result);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.VAL_INVALID_INPUT, error instanceof Error ? error.message : 'Failed to submit rating', 400);
    }
  }

  async recordDownload(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await studyMaterialService.recordDownload(id);
      return ResponseHandler.success(res, null);
    } catch (error) {
      return ResponseHandler.error(res, errorCodes.SYS_INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to record download', 500);
    }
  }
}

export const studyMaterialController = new StudyMaterialController();
