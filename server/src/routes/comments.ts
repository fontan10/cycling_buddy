import { Router } from 'express';
import { Report } from '../models/Report';
import { ReportComment } from '../models/ReportComment';
import { ReportCommentLike } from '../models/ReportCommentLike';

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
router.post('/reports/:reportId/comments', async (req, res) => {
  try {
    const { userId, text } = req.body;
    const comment = await ReportComment.create({ reportId: req.params.reportId, userId, text });
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

// Soft delete a comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const comment = await ReportComment.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const commentCount = await ReportComment.countDocuments({
      reportId: comment.reportId,
      isDeleted: false,
    });
    await Report.findByIdAndUpdate(comment.reportId, { commentCount });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Like a comment
router.post('/comments/:id/likes', async (req, res) => {
  try {
    const { userId } = req.body;
    await ReportCommentLike.create({ commentId: req.params.id, userId });
    const likeCount = await ReportCommentLike.countDocuments({ commentId: req.params.id });
    res.status(201).json({ likeCount });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already liked' });
    res.status(400).json({ error: err.message });
  }
});

// Unlike a comment
router.delete('/comments/:id/likes', async (req, res) => {
  try {
    const { userId } = req.body;
    const like = await ReportCommentLike.findOneAndDelete({ commentId: req.params.id, userId });
    if (!like) return res.status(404).json({ error: 'Like not found' });
    const likeCount = await ReportCommentLike.countDocuments({ commentId: req.params.id });
    res.json({ likeCount });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
