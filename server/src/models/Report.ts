import { Schema, model, Types } from 'mongoose';

const reportSchema = new Schema(
  {
    userId:       { type: Types.ObjectId, ref: 'User', default: null },
    categoryId:   { type: String, required: true },
    address:      { type: String, required: true },
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    // GeoJSON Point — enables $near / $geoWithin queries with a 2dsphere index
    location: {
      type:        { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    description:  { type: String, default: '' },
    photoUrl:     { type: String, default: '' },
    likeCount:    { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isDeleted:    { type: Boolean, default: false },
    deletedAt:    { type: Date, default: null },
  },
  { timestamps: true },
);

reportSchema.index({ location: '2dsphere' });

export const Report = model('Report', reportSchema);
