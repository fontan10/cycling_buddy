import { Schema, model, Types } from 'mongoose';

const reportCommentSchema = new Schema(
  {
    reportId:  { type: Types.ObjectId, ref: 'Report', required: true },
    userId:    { type: String, required: true },
    text:      { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const ReportComment = model('ReportComment', reportCommentSchema);
