import express from 'express';
import asyncWrapper from '~/globals/cores/asyncWrapper.core';
import { authMiddleware } from '~/globals/middlewares/auth.middleware';
import { authController } from '../controllers/auth.controller';

const authRoute = express.Router();

authRoute.post('/signup', asyncWrapper(authController.signUp));
authRoute.post('/sign-in', asyncWrapper(authController.signIn));
authRoute.post('/forgot-password', asyncWrapper(authController.forgotPassword));
authRoute.post('/reset-password', asyncWrapper(authController.resetPassword));
authRoute.post('/refresh-token', asyncWrapper(authController.refreshToken));
authRoute.get('/protected', authMiddleware.verifyUser, asyncWrapper(authController.protected));
authRoute.get('/me', authMiddleware.verifyUser, asyncWrapper(authController.getCurrentUser));
authRoute.patch('/me', authMiddleware.verifyUser, asyncWrapper(authController.updateProfile));
authRoute.post('/logout', asyncWrapper(authController.logout));

export default authRoute;
