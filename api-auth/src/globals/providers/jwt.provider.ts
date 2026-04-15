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
      expiresIn: '1h'
    });
  }
}

export const jwtProvider: JwtProvider = new JwtProvider();
