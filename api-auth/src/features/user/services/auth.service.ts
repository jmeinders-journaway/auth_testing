import bcrypt from 'bcrypt';
import UserModel from '../models/user.model';
import { BadRequestException } from '~/globals/cores/error.core';
import { jwtProvider } from '~/globals/providers/jwt.provider';
import { UserJwtPayload } from '../models/auth.model';
//exctract steps later REMINDER
class AuthService {
  public async signUp(name: string, email: string, password: string) {
    // STEP 1: Check if email already exists in database
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // STEP 2: Hash the password
    // Salt rounds = 10 means bcrypt will run 2^10 = 1024 hashing rounds to generate the hash, which provides a good balance between security and performance.
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // STEP 3: Create new user, storing the hased pw
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    // STEP 4: Generate JWT for authentication
    // Create the payload this data will be embedded INSIDE the token
    // IMPORTANT: The payload is BASE64 ENCODED, NOT ENCRYPTED!
    const payload: UserJwtPayload = {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email
    };

    const accessToken = jwtProvider.generateToken(payload);

    // STEP 5: Prepare response
    //to object so it the mongoose doc is a plain js object
    //destrucute to get password and use ... to get the rest of the user data without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    // Return both the token (for authentication) and user data (for UI display)
    return {
      accessToken,
      user: userWithoutPassword
    };
  }

  public async signIn(email: string, password: string) {
    // Use a single message to avoid leaking whether email or password is incorrect.
    const invalidCredentialsMessage = 'Email or password is wrong';

    // STEP 1: Find user by email
    const userByEmail = await UserModel.findOne({ email });
    if (!userByEmail) {
      throw new BadRequestException(invalidCredentialsMessage);
    }

    // STEP 2: Compare passwords
    const matchedPassword = await bcrypt.compare(password, userByEmail.password);
    if (!matchedPassword) {
      throw new BadRequestException(invalidCredentialsMessage);
    }

    // STEP 3: Generate JWT token for authenticated user
    const payload: UserJwtPayload = {
      id: String(userByEmail._id),
      name: userByEmail.name,
      email: userByEmail.email
    };
    const accessToken = jwtProvider.generateToken(payload);

    // STEP 4: Return user data without password
    const { password: _, ...userWithoutPassword } = userByEmail.toObject();
    return {
      accessToken,
      user: userWithoutPassword
    };
  }
}

export const authService: AuthService = new AuthService();
