import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ForbiddenException, UnAuthorizedException } from '../cores/error.core';
import { jwtProvider } from '../providers/jwt.provider';

class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction) {
    // Expected format: "Bearer <access_token>"
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnAuthorizedException('No token provided', 'NO_TOKEN');
    }

    try {
      // Pass decoded user data from middleware to controller via request object.
      req.currentUser = jwtProvider.verifyToken(token);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnAuthorizedException('Token expired', 'TOKEN_EXPIRED');
      }

      if (error instanceof JsonWebTokenError) {
        throw new ForbiddenException('Token invalid', 'TOKEN_INVALID');
      }

      throw new UnAuthorizedException('Please login again', 'UNAUTHORIZED');
    }

    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
