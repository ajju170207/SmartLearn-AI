import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { JwtService } from '../utils/jwt';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRegistration, LoginCredentials, AuthResponse } from '@shared/types';
import bcrypt from 'bcryptjs';

export class AuthController {
  private userModel: UserModel;
  private jwtService: JwtService;

  constructor(private db: Pool, private redis: RedisClientType) {
    this.userModel = new UserModel(db);
    this.jwtService = new JwtService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: UserRegistration = req.body;

      // Check if email or username already exists
      const [emailExists, usernameExists] = await Promise.all([
        this.userModel.emailExists(userData.email),
        this.userModel.usernameExists(userData.username)
      ]);

      if (emailExists) {
        res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
        return;
      }

      if (usernameExists) {
        res.status(409).json({
          success: false,
          error: 'Username already taken'
        });
        return;
      }

      // Create user
      const user = await this.userModel.createUser(userData);

      // Generate tokens
      const tokens = this.jwtService.generateTokens(user);

      // Store refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      const response: AuthResponse = {
        user,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn
      };

      res.status(201).json({
        success: true,
        data: response,
        message: 'User registered successfully'
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginCredentials = req.body;

      // Find user by email
      const userRow = await this.userModel.findByEmail(credentials.email);
      if (!userRow) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Verify password
      const isValidPassword = await this.userModel.verifyPassword(
        credentials.password,
        userRow.password_hash
      );

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Convert to User object (without password_hash)
      const user = {
        id: userRow.id,
        email: userRow.email,
        username: userRow.username,
        preferences: userRow.preferences,
        learning_context: userRow.learning_context,
        created_at: userRow.created_at,
        updated_at: userRow.updated_at
      };

      // Generate tokens
      const tokens = this.jwtService.generateTokens(user);

      // Store refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      const response: AuthResponse = {
        user,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn
      };

      res.json({
        success: true,
        data: response,
        message: 'Login successful'
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
        return;
      }

      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${payload.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
        return;
      }

      // Get user data
      const user = await this.userModel.findById(payload.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Generate new tokens
      const tokens = this.jwtService.generateTokens(user);

      // Update refresh token in Redis
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      const response: AuthResponse = {
        user,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn
      };

      res.json({
        success: true,
        data: response,
        message: 'Token refreshed successfully'
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      // Remove refresh token from Redis
      await this.redis.del(`refresh_token:${req.user.userId}`);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const user = await this.userModel.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updates.id;
      delete updates.email;
      delete updates.password;
      delete updates.created_at;
      delete updates.updated_at;

      const updatedUser = await this.userModel.updateUser(req.user.userId, updates);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Get user with password hash
      const userRow = await this.userModel.findByEmail(req.user.email);
      if (!userRow) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      // Verify current password
      const isValidPassword = await this.userModel.verifyPassword(
        currentPassword,
        userRow.password_hash
      );

      if (!isValidPassword) {
        res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
        return;
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password in database
      await this.db.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, req.user.userId]
      );

      // Invalidate all refresh tokens for this user
      await this.redis.del(`refresh_token:${req.user.userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully. Please log in again.'
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };

  validateToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = this.jwtService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token required'
        });
        return;
      }

      const payload = this.jwtService.verifyAccessToken(token);
      
      // Verify user still exists
      const user = await this.userModel.findById(payload.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          valid: true,
          user: {
            userId: payload.userId,
            email: payload.email,
            username: payload.username
          }
        }
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const key = `refresh_token:${userId}`;
    const expiry = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.setEx(key, expiry, refreshToken);
  }
}