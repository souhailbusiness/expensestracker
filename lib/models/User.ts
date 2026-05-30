import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  provider: 'credentials' | 'google';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required(this: IUser) {
        return this.provider === 'credentials';
      },
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid model re-compilation
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
