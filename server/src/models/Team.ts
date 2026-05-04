import { Schema, model } from 'mongoose';

const teamSchema = new Schema(
  {
    name:     { type: String, required: true },
    photoUrl: { type: String, default: '' },
    teamCode:    { type: String, required: true, unique: true },
    dissolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Team = model('Team', teamSchema);
