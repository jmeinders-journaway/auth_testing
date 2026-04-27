import { Request, Response } from 'express';
import { BadRequestException } from '~/globals/cores/error.core';
import { authService } from '../services/auth.service';
import HTTP_STATUS from '~/globals/constants/http.constant';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true, //JavaScript can not access the cookie
  sameSite: 'strict' as const, //only send to same domain, prevents csrf attacks
  secure: process.env.NODE_ENV === 'production', 
  maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS
};

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
  public signUp = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const authData = await authService.signUp(name, email, password);
    this.setRefreshTokenCookie(res, authData.refreshToken);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Sign up successfully',
      data: {
        accessToken: authData.accessToken,
        user: authData.user
      }
    });
  };

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
  public signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const authData = await authService.signIn(email, password);
    this.setRefreshTokenCookie(res, authData.refreshToken);

    res.status(HTTP_STATUS.OK).json({
      message: 'Sign in successfully',
      data: {
        accessToken: authData.accessToken,
        user: authData.user
      }
    });
  };

  public refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    const token = await authService.refreshToken(refreshToken);

    res.status(HTTP_STATUS.OK).json({
      message: 'Refresh token successfully',
      data: token
    });
  };

  /**
   * POST /api/v1/auth/forgot-password
   * Creates reset-password token and stores expiry on user record.
   */
  public forgotPassword = async (req: Request, res: Response) => {
    const {email} = req.body;
    const resetData = await authService.forgotPassword(email);

    res.status(HTTP_STATUS.OK).json({
      message: 'Reset password email sent successfully',
      data: resetData
    });
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { email, resetToken, token, newPassword, confirmNewPassword } = req.body;
    await authService.resetPassword({
      email,
      resetToken: resetToken || token,
      newPassword,
      confirmNewPassword
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Reset password successfully'
    });
  };

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
  public protected = async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: 'This is a protected route',
      data: req.currentUser
    });
  };

  public getCurrentUser = async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json({
      message: 'User information fetched successfully',
      data: req.currentUser
    });
  };

  public updateProfile = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Name is required');
    }

    const updatedUser = await authService.updateProfile(req.currentUser.id, name.trim());

    res.status(HTTP_STATUS.OK).json({
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  };

  public logout = async (req: Request, res: Response) => {
    this.clearRefreshTokenCookie(res);
    res.status(HTTP_STATUS.OK).json({
      message: 'Log out successfully'
    });
  };

  private setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  };

  private clearRefreshTokenCookie = (res: Response) => {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);
  };
}



export const authController: AuthController = new AuthController();
