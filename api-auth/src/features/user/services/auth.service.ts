import bcrypt from 'bcrypt';
import UserModel from '../models/user.model';
import {BadRequestException} from '~/globals/cores/error.core';
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
    const userWithoutPassword = this.excludePasswordFromUser(newUser);

    return {
      accessToken,
      user: userWithoutPassword
    };
  }

  public async signIn(email: string, password: string) {
    const userByEmail = await this.findUserByEmail(email);
    await this.verifyPassword(password, userByEmail);

    const accessToken = this.generateAuthToken(userByEmail);
    const userWithoutPassword = this.excludePasswordFromUser(userByEmail);

    return {
      accessToken,
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

  private async createUser(name: string, email: string, hashedPassword: string) {
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    return newUser;
  }

  private async excludePasswordFromUser(user: InstanceType<typeof UserModel>) {
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
