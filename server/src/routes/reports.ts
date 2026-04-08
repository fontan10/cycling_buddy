import { Router, Response } from 'express';
import { Report } from '../models/Report';
import { ReportLike } from '../models/ReportLike';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// List all reports (non-deleted)
router.get('/', async (_req, res) => {
  try {
    const reports = await Report.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get a single report
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, isDeleted: false });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Create a report (anonymous or authenticated)
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, address, coords, description, photoUrl } = req.body;
    const report = await Report.create({
      categoryId,
      address,
      coords,
      description,
      photoUrl,
      userId: req.userId ?? null,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Soft delete a report
router.delete('/:id', async (req, res) => {
  try {
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Like a report
router.post('/:id/likes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ReportLike.create({ reportId: req.params.id, userId: req.userId });
    const likeCount = await ReportLike.countDocuments({ reportId: req.params.id });
    await Report.findByIdAndUpdate(req.params.id, { likeCount });
    res.status(201).json({ likeCount });
  } catch (err: any) {
    if (err.code === 11000) return res.status(409).json({ error: 'Already liked' });
    res.status(400).json({ error: err.message });
  }
});

// Unlike a report
router.delete('/:id/likes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const like = await ReportLike.findOneAndDelete({ reportId: req.params.id, userId: req.userId });
    if (!like) return res.status(404).json({ error: 'Like not found' });
    const likeCount = await ReportLike.countDocuments({ reportId: req.params.id });
    await Report.findByIdAndUpdate(req.params.id, { likeCount });
    res.json({ likeCount });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
