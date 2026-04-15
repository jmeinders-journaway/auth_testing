import bcrypt from 'bcrypt';
import UserModel from '../models/user.model';
import { BadRequestException } from '~/globals/cores/error.core';
import { jwtProvider } from '~/globals/providers/jwt.provider';
import { UserJwtPayload } from '../models/auth.model';

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
}

export const authService: AuthService = new AuthService();
