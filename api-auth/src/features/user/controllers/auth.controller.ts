import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import HTTP_STATUS from '~/globals/constants/http.constant';

/**
 * AuthController Class
 * Handles all authentication-related HTTP requests
 */
class AuthController {
  /**
   * POST /api/v1/auth/signup
   * Registers a new user in the system
   *
   * @param req - Express Request object containing { name, email, password } in body
   * @param res - Express Response object used to send back the HTTP response
   *
   * Flow:
   * 1. Destructure user data from request body
   * 2. Call authService.signUp()
   * 3. Send 201 Created status with token and user data
   *
   * @returns Response with { message, data: { accessToken, user } }
   */
  public async signUp(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const authData = await authService.signUp(name, email, password);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Sign up successfully',
      data: authData
    });
  }

  /**
   * POST /api/v1/auth/sign-in
   * Authenticates an existing user and provides access token
   *
   * @param req - Express Request object containing { email, password } in body
   * @param res - Express Response object
   *
   * Flow:
   * 1. Extract credentials from request body
   * 2. Call authService.signIn()
   * 3. Send 200 OK response with token and user data
   *
   * @returns Response with { message, data: { accessToken, user } }
   */
  public async signIn(req: Request, res: Response) {
    const { email, password } = req.body;
    const authData = await authService.signIn(email, password);

    res.status(HTTP_STATUS.OK).json({
      message: 'Sign in successfully',
      data: authData
    });
  }

  /**
   * GET /api/v1/auth/protected
   * Example protected route that requires valid JWT token
   *
   * @param req - Express Request object with currentUser attached by auth middleware
   * @param res - Express Response object
   *
   * Important: This route is protected by auth.middleware.ts
   * @returns Response with message and current user data
   */
  public async protected(req: Request, res: Response) {
    res.status(HTTP_STATUS.OK).json({
      message: 'This is a protected route',
      data: req.currentUser
    });
  }

  public async getCurrentUser(req: Request, res: Response) {}

  public async logout(req: Request, res: Response) {}
}

export const authController: AuthController = new AuthController();
