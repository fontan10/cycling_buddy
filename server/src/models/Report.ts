import { Schema, model } from 'mongoose';

const reportSchema = new Schema(
  {
    categoryId:  { type: String, required: true },
    address:     { type: String, required: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    description: { type: String, default: '' },
    photoUrl:    { type: String, default: '' },
  },
  { timestamps: true },
);

export const Report = model('Report', reportSchema);
