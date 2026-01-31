import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { createAuthMiddleware } from '../middleware/auth';
import {
  validateRegistration,
  validateLogin,
  validateRefreshToken,
  validatePasswordUpdate,
  handleValidationErrors
} from '../middleware/validation';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';

export const createAuthRoutes = (db: Pool, redis: RedisClientType): Router => {
  const router = Router();
  const authController = new AuthController(db, redis);
  const authMiddleware = createAuthMiddleware(db);

  // Public routes
  router.post('/register', 
    validateRegistration, 
    handleValidationErrors, 
    authController.register
  );

  router.post('/login', 
    validateLogin, 
    handleValidationErrors, 
    authController.login
  );

  router.post('/refresh', 
    validateRefreshToken, 
    handleValidationErrors, 
    authController.refreshToken
  );

  router.post('/validate', authController.validateToken);

  // Protected routes
  router.post('/logout', authMiddleware, authController.logout);
  
  router.get('/profile', authMiddleware, authController.getProfile);
  
  router.put('/profile', authMiddleware, authController.updateProfile);
  
  router.put('/password', 
    authMiddleware,
    validatePasswordUpdate, 
    handleValidationErrors, 
    authController.changePassword
  );

  return router;
};