/**
 * Discussions API Tests
 * Tests for community forum endpoints
 */

import request from 'supertest';
import app from '../src/app';

describe('Discussions API', () => {
  describe('GET /api/v1/discussions/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.feature).toBe('discussions');
    });
  });

  describe('GET /api/v1/discussions/categories', () => {
    it('should return discussion categories', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/discussions/posts', () => {
    it('should return posts list (public access)', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/posts')
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support filtering by category', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/posts')
        .query({ categoryId: '1' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should support filtering by type', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/posts')
        .query({ type: 'question' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/discussions/posts', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/discussions/posts')
        .send({
          title: 'Test Post',
          content: 'Test content for discussion',
          type: 'question',
          categoryId: '1'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/discussions/posts/:id/comments', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/discussions/posts/1/comments')
        .send({ content: 'Test comment' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/discussions/posts/:id/vote', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/v1/discussions/posts/1/vote')
        .send({ value: 1 });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/discussions/trending', () => {
    it('should return trending posts', async () => {
      const res = await request(app)
        .get('/api/v1/discussions/trending');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
