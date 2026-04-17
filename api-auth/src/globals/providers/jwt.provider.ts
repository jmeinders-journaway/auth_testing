import jwt from 'jsonwebtoken';
import { UserJwtPayload } from '~/features/user/models/auth.model';
import { InternalServerError } from '../cores/error.core';

class JwtProvider {
  public generateToken(payload: UserJwtPayload) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new InternalServerError('JWT secret is missing');
    }

    return jwt.sign(payload, jwtSecret, {
      expiresIn: '5s'
    });
  }

  public generateRefreshToken(payload: UserJwtPayload) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new InternalServerError('Refresh token secret is missing');
    }

    return jwt.sign(payload, refreshTokenSecret, {
      expiresIn: '7d'
    });
  }

  public verifyToken(token: string): UserJwtPayload {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new InternalServerError('JWT secret is missing');
    }

    return jwt.verify(token, jwtSecret) as UserJwtPayload;
  }

  public verifyRefreshToken(refreshToken: string): UserJwtPayload {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new InternalServerError('Refresh token secret is missing');
    }

    return jwt.verify(refreshToken, refreshTokenSecret) as UserJwtPayload;
  }
}

export const jwtProvider: JwtProvider = new JwtProvider();
