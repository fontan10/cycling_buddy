import { Router, Response } from 'express';
import { Report } from '../models/Report';
import { ReportComment } from '../models/ReportComment';
import { ReportCommentLike } from '../models/ReportCommentLike';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// List comments for a report (non-deleted)
router.get('/reports/:reportId/comments', async (req, res) => {
  try {
    const comments = await ReportComment.find({
      reportId: req.params.reportId,
      isDeleted: false,
    }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Add a comment to a report
router.post('/reports/:reportId/comments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const comment = await ReportComment.create({
      reportId: req.params.reportId,
      userId:   req.userId,
      text,
    });
    const commentCount = await ReportComment.countDocuments({
      reportId: req.params.reportId,
      isDeleted: false,
    });
    await Report.findByIdAndUpdate(req.params.reportId, { commentCount });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Soft delete a comment (owner only)
router.delete('/comments/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const comment = await ReportComment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' });
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();
    const commentCount = await ReportComment.countDocuments({
      reportId: comment.reportId,
      isDeleted: false,
    });
    await Report.findByIdAndUpdate(comment.reportId, { commentCount });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Like a comment
router.post('/comments/:id/likes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ReportCommentLike.create({ commentId: req.params.id, userId: req.userId });
    const likeCount = await ReportCommentLike.countDocuments({ commentId: req.params.id });
    res.status(201).json({ likeCount });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already liked' });
    res.status(400).json({ error: err.message });
  }
});

// Unlike a comment
router.delete('/comments/:id/likes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const like = await ReportCommentLike.findOneAndDelete({ commentId: req.params.id, userId: req.userId });
    if (!like) return res.status(404).json({ error: 'Like not found' });
    const likeCount = await ReportCommentLike.countDocuments({ commentId: req.params.id });
    res.json({ likeCount });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
