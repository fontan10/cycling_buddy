import { Schema, model, Types } from 'mongoose';

const userProfileSchema = new Schema(
  {
    userId:    { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String },
    lastName:  { type: String },
  },
  { timestamps: true },
);

export const UserProfile = model('UserProfile', userProfileSchema);
