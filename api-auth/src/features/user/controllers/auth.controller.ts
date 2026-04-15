import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import HTTP_STATUS from '~/globals/constants/http.constant';

class AuthController {
  public async signUp(req: Request, res: Response) {
    const { name, email, password } = req.body;
    const authData = await authService.signUp(name, email, password);

    res.status(HTTP_STATUS.CREATED).json({
      message: 'Sign up successfully',
      data: authData
    });
  }

  public async signIn(req: Request, res: Response) {}

  public async getCurrentUser(req: Request, res: Response) {}

  public async logout(req: Request, res: Response) {}
}

export const authController: AuthController = new AuthController();
