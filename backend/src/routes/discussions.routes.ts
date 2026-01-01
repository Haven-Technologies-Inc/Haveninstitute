/**
 * Discussions API Routes
 * RESTful endpoints for the Discussions feature
 */

import { Router } from 'express';
// import { authenticate, optionalAuth } from '../middleware/authenticate';
// import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// TODO: Fix discussions controller and uncomment routes
// Temporarily disabled to get backend running

router.get('/health', (req, res) => {
  res.json({ status: 'Discussions temporarily disabled' });
});

export default router;
