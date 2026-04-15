import { NextFunction, Request, Response } from 'express';
import { UnAuthorizedException } from '../cores/error.core';
import { jwtProvider } from '../providers/jwt.provider';

class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction) {
    // Expected format: "Bearer <access_token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnAuthorizedException('You are not authenticated');
    }

    try {
      // Pass decoded user data from middleware to controller via request object.
      req.currentUser = jwtProvider.verifyToken(token);
    } catch (error) {
      throw new UnAuthorizedException('Please login again');
    }

    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
