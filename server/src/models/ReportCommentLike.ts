import { Schema, model, Types } from 'mongoose';

const reportCommentLikeSchema = new Schema(
  {
    commentId: { type: Types.ObjectId, ref: 'ReportComment', required: true },
    userId:    { type: String, required: true },
  },
  { timestamps: true },
);

reportCommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const ReportCommentLike = model('ReportCommentLike', reportCommentLikeSchema);
