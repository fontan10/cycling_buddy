import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email:        { type: String, unique: true, sparse: true },
    displayName:  { type: String, default: '' },
    avatarUrl:    { type: String, default: '' },
    passwordHash: { type: String },
    googleId:     { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
