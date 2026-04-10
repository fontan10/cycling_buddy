import { Schema, model, Types } from 'mongoose';

const reportCommentSchema = new Schema(
  {
    reportId:  { type: Types.ObjectId, ref: 'Report', required: true },
    userId:    { type: Types.ObjectId, ref: 'User', required: true },
    text:      { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ReportComment = model('ReportComment', reportCommentSchema);
