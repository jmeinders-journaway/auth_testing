import bcrypt from 'bcrypt';
import crypto from 'crypto';
import UserModel from '../models/user.model';
import {BadRequestException, NotFoundException, UnAuthorizedException} from '~/globals/cores/error.core';
import {jwtProvider} from '~/globals/providers/jwt.provider';
import {ResetPasswordInput, UserJwtPayload} from '../models/auth.model';
import { mailProvider } from '~/globals/providers/mail.provider';

const SALT_ROUNDS = 10;
const RESET_PASSWORD_TOKEN_BYTES = 32;
const RESET_PASSWORD_EXPIRE_MS = 10 * 60 * 1000;
const INVALID_CREDENTIALS_MESSAGE = 'Email or password is wrong';

/**
 * Authentication Service - Handles business logic for user authentication
 */
class AuthService {
  public async signUp(name: string, email: string, password: string) {
    await this.validateEmailIsUnique(email);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await this.createUser(name, email, hashedPassword);

    const accessToken = this.generateAuthToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);
    const userWithoutPassword = this.excludePasswordFromUser(newUser);

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  public async signIn(email: string, password: string) {
    const userByEmail = await this.findUserByEmail(email);
    await this.verifyPassword(password, userByEmail);

    const accessToken = this.generateAuthToken(userByEmail);
    const refreshToken = this.generateRefreshToken(userByEmail);
    const userWithoutPassword = this.excludePasswordFromUser(userByEmail);

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  public async refreshToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new BadRequestException('Please provide refresh token');
    }

    let refreshTokenPayload: UserJwtPayload;
    try {
      refreshTokenPayload = jwtProvider.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnAuthorizedException('Invalid refresh token');
    }

    const user = await UserModel.findById(refreshTokenPayload.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const newAccessToken = this.generateAuthToken(user);
    const userWithoutPassword = this.excludePasswordFromUser(user);

    return {
      accessToken: newAccessToken,
      user: userWithoutPassword
    };
  }

  public async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Please provide email');
    }

    const user = await UserModel.findOne({email});
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    // Generate a secure random token for reset-password flow.
    const resetPasswordToken = crypto.randomBytes(RESET_PASSWORD_TOKEN_BYTES).toString('hex');
    // Keep token valid for 10 minutes.
    const resetPasswordExpires = Date.now() + RESET_PASSWORD_EXPIRE_MS;

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?email=${encodeURIComponent(user.email)}&token=${resetPasswordToken}`;

    await mailProvider.sendEmail({
      to: user.email,
      subject: 'Reset password request',
      text: `Your reset password request. Click this link to reset your password: ${resetUrl}`,
      html: `<p>Your reset password request.</p><p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    return {
      message: 'Reset password email sent successfully'
    };
  }

  public async resetPassword(input: ResetPasswordInput) {
    const { email, resetToken, newPassword, confirmNewPassword } = input;

    if (!email || !resetToken || !newPassword || !confirmNewPassword) {
      throw new BadRequestException('Please provide email, reset token, new password and confirm password');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New password and confirm password are not the same');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('Please request forgot password again');
    }

    const isTokenInvalid = user.resetPasswordToken !== resetToken;
    const isTokenExpired = Date.now() > user.resetPasswordExpires;
    if (isTokenInvalid || isTokenExpired) {
      throw new BadRequestException('Your reset password request already expired. Please try again');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  }

  private async verifyPassword(password: string, userByEmail: InstanceType<typeof UserModel>) {
    const matchedPassword = await bcrypt.compare(password, userByEmail.password);
    if (!matchedPassword) {
      throw new BadRequestException(INVALID_CREDENTIALS_MESSAGE);
    }
  }

  private async findUserByEmail(email: string) {
    const userByEmail = await UserModel.findOne({email});
    if (!userByEmail) {
      throw new BadRequestException(INVALID_CREDENTIALS_MESSAGE);
    }
    return userByEmail;
  }

  private generateAuthToken(newUser: { _id: unknown; name: string; email: string }) {
    const payload: UserJwtPayload = {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email
    };

    return jwtProvider.generateToken(payload);
  }

  private generateRefreshToken(newUser: { _id: unknown; name: string; email: string }) {
    const payload: UserJwtPayload = {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email
    };

    return jwtProvider.generateRefreshToken(payload);
  }

  private async createUser(name: string, email: string, hashedPassword: string) {
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    return newUser;
  }

  public async updateProfile(userId: string, name: string) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Name is required');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = name.trim();
    await user.save();

    return this.excludePasswordFromUser(user);
  }

  private excludePasswordFromUser(user: InstanceType<typeof UserModel>) {
    const {password, ...userWithoutPassword} = user.toObject();
    return userWithoutPassword;
  }

  private async validateEmailIsUnique(email: string) {
    const existingUser = await UserModel.findOne({email});
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
  }
}

export const authService: AuthService = new AuthService();
