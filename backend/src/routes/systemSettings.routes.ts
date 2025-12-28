/**
 * System Settings Routes (Admin Only)
 * 
 * API routes for managing system-wide settings like Stripe, Email, OAuth
 */

import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { systemSettingsService } from '../services/systemSettings.service';
import { ResponseHandler } from '../utils/response';
import { SettingKey } from '../models/SystemSettings';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireRole(['admin']));

/**
 * GET /api/admin/settings
 * Get all system settings organized by category
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getAllSettingsForAdmin();
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings/stripe
 * Get Stripe-specific settings
 */
router.get('/stripe', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getSettingsByCategory('stripe');
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/stripe
 * Update Stripe settings
 */
router.put('/stripe', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      secretKey,
      publishableKey,
      webhookSecret,
      proMonthlyPriceId,
      proYearlyPriceId,
      premiumMonthlyPriceId,
      premiumYearlyPriceId,
    } = req.body;

    await systemSettingsService.updateStripeSettings({
      secretKey,
      publishableKey,
      webhookSecret,
      proMonthlyPriceId,
      proYearlyPriceId,
      premiumMonthlyPriceId,
      premiumYearlyPriceId,
    });

    ResponseHandler.success(res, { message: 'Stripe settings updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/settings/stripe/test
 * Test Stripe connection
 */
router.post('/stripe/test', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await systemSettingsService.testStripeConnection();
    
    if (result.success) {
      ResponseHandler.success(res, result);
    } else {
      ResponseHandler.error(res, 'STRIPE_CONNECTION_FAILED', result.message, 400);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings/email
 * Get email settings
 */
router.get('/email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getSettingsByCategory('email');
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/email
 * Update email settings
 */
router.put('/email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = req.body.settings as Array<{ key: SettingKey; value: string | null }>;
    await systemSettingsService.bulkUpdateSettings(settings, 'email');
    ResponseHandler.success(res, { message: 'Email settings updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings/oauth
 * Get OAuth settings
 */
router.get('/oauth', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getSettingsByCategory('oauth');
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/oauth
 * Update OAuth settings
 */
router.put('/oauth', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = req.body.settings as Array<{ key: SettingKey; value: string | null }>;
    await systemSettingsService.bulkUpdateSettings(settings, 'oauth');
    ResponseHandler.success(res, { message: 'OAuth settings updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings/features
 * Get feature flags
 */
router.get('/features', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getSettingsByCategory('features');
    ResponseHandler.success(res, settings);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/features
 * Update feature flags
 */
router.put('/features', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = req.body.settings as Array<{ key: SettingKey; value: string | null }>;
    await systemSettingsService.bulkUpdateSettings(settings, 'features');
    ResponseHandler.success(res, { message: 'Feature flags updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/:key
 * Update a single setting
 */
router.put('/:key', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await systemSettingsService.updateSetting(key as SettingKey, value);
    ResponseHandler.success(res, { message: `Setting ${key} updated successfully` });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/settings/initialize
 * Initialize default settings (one-time setup)
 */
router.post('/initialize', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await systemSettingsService.initializeDefaults();
    ResponseHandler.success(res, { message: 'Settings initialized successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
