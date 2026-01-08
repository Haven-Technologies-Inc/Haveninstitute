/**
 * Subscription Service Tests
 * Tests for subscription management and Stripe integration
 */

import request from 'supertest';
import app from '../src/app';

describe('Subscription API', () => {
  // These tests use mock data since they don't require actual Stripe integration

  describe('GET /api/v1/subscriptions/plans', () => {
    it('should return available subscription plans', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/plans');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/subscriptions/status', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/status');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/subscriptions/status')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/subscriptions/create-checkout', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions/create-checkout')
        .send({ priceId: 'price_123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/subscriptions/cancel', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions/cancel');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/subscriptions/webhook', () => {
    it('should reject requests without stripe signature', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions/webhook')
        .send({ type: 'checkout.session.completed' });

      // Should fail without proper Stripe signature
      expect([400, 401, 500]).toContain(res.status);
    });
  });
});
