/**
 * Authentication Service Tests
 * Tests for user registration, login, token management, and password operations
 */

import request from 'supertest';
import app from '../src/app';

describe('Authentication API', () => {
  // Test user credentials
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'SecurePassword123!'
  };

  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty('password');

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
      userId = res.body.data.user.id;
    });

    it('should reject registration with existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Weak Password User',
          email: 'weak@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'SecurePassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('user');

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');

      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should send password reset email for valid user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email });

      // Should return success even if email doesn't exist (security)
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should handle non-existent email gracefully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Should return success to prevent email enumeration
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/change-password', () => {
    it('should change password with valid credentials', async () => {
      const newPassword = 'NewSecurePassword456!';

      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Update test user password for subsequent tests
      testUser.password = newPassword;
    });

    it('should reject change with wrong current password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongCurrentPassword!',
          newPassword: 'AnotherNewPassword789!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should invalidate token after logout', async () => {
      // Try to use the old token after logout
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      // Token should be invalid
      expect(res.status).toBe(401);
    });
  });
});
