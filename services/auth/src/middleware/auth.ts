import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt';
import { UserModel } from '../models/User';
import { Pool } from 'pg';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export const createAuthMiddleware = (db: Pool) => {
  const jwtService = new JwtService();
  const userModel = new UserModel(db);

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = jwtService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        });
      }

      const payload = jwtService.verifyAccessToken(token);
      
      // Verify user still exists
      const user = await userModel.findById(payload.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      req.user = {
        userId: payload.userId,
        email: payload.email,
        username: payload.username
      };

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  };
};

export const createOptionalAuthMiddleware = (db: Pool) => {
  const jwtService = new JwtService();
  const userModel = new UserModel(db);

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = jwtService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return next(); // Continue without authentication
      }

      const payload = jwtService.verifyAccessToken(token);
      
      // Verify user still exists
      const user = await userModel.findById(payload.userId);
      if (user) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          username: payload.username
        };
      }

      next();
    } catch (error) {
      // Continue without authentication if token is invalid
      next();
    }
  };
};