import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    username:     { type: String, required: true, unique: true },
    email:        { type: String, unique: true, sparse: true },
    avatarUrl:    { type: String },
    passwordHash: { type: String },
    googleId:     { type: String, unique: true, sparse: true },
    isCoach:      { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = model('User', userSchema);
