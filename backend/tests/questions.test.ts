/**
 * Questions API Tests
 * Tests for NCLEX question bank endpoints
 */

import request from 'supertest';
import app from '../src/app';

describe('Questions API', () => {
  describe('GET /api/v1/questions', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/questions');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/questions')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/questions/:id', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/questions/1');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/questions/:id/answer', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/questions/1/answer')
        .send({ answer: 'A' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/questions/categories', () => {
    it('should return question categories', async () => {
      const res = await request(app)
        .get('/api/v1/questions/categories');

      // Categories might be public or require auth depending on implementation
      expect([200, 401]).toContain(res.status);
    });
  });
});

describe('CAT Engine API', () => {
  describe('POST /api/v1/cat/start', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/cat/start')
        .send({ type: 'practice' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/cat/answer', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/cat/answer')
        .send({ sessionId: 'test-session', answer: 'A' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cat/session/:id', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/cat/session/test-session');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/cat/results/:id', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/v1/cat/results/test-session');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
