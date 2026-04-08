import { Schema, model, Types } from 'mongoose';

const reportLikeSchema = new Schema(
  {
    reportId: { type: Types.ObjectId, ref: 'Report', required: true },
    userId:   { type: Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

reportLikeSchema.index({ reportId: 1, userId: 1 }, { unique: true });

export const ReportLike = model('ReportLike', reportLikeSchema);
