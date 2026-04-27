import mongoose from 'mongoose';

interface IUser {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: number | null;
}
const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Number,
    default: null
  }
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
