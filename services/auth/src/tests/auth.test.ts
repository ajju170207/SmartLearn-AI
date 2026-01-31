import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { createAuthRoutes } from '../routes/auth';
import { createDbPool, createRedisClient } from '../config/database';

describe('Authentication Service', () => {
  let app: express.Application;
  let db: Pool;
  let redis: any;

  beforeAll(async () => {
    // Setup test database and Redis connections
    db = createDbPool();
    redis = createRedisClient();
    await redis.connect();

    // Setup Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRoutes(db, redis));
  });

  afterAll(async () => {
    await db.end();
    await redis.quit();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPassword123!',
        preferences: {
          explanation_style: 'detailed',
          preferred_languages: ['javascript', 'python'],
          learning_goals: ['web development']
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
      expect(response.body.data.user.preferences.explanation_style).toBe('detailed');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser2',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'test@example.com', // Same email as first test
        username: 'testuser3',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(credentials.email);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/validate', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get access token
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      accessToken = response.body.data.access_token;
    });

    it('should validate a valid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });

    it('should reject missing token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token required');
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login to get access token
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      accessToken = response.body.data.access_token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.username).toBe('testuser');
      expect(response.body.data.preferences).toBeDefined();
      expect(response.body.data.learning_context).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });
});