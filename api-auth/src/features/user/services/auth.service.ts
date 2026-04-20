import bcrypt from 'bcrypt';
import UserModel from '../models/user.model';
import {BadRequestException, NotFoundException, UnAuthorizedException} from '~/globals/cores/error.core';
import {jwtProvider} from '~/globals/providers/jwt.provider';
import {UserJwtPayload} from '../models/auth.model';

const SALT_ROUNDS = 10;
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
