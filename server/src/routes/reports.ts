import { Router, Response } from 'express';
import { Report } from '../models/Report';
import { ReportLike } from '../models/ReportLike';
import { Team } from '../models/Team';
import { TeamMembership } from '../models/TeamMembership';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const REPORT_POINTS = 50;

const router = Router();

// List all reports (non-deleted), with optional proximity filter:
//   ?lat=<latitude>&lng=<longitude>&radius=<meters>  (radius defaults to 5000m)
router.get('/', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const filter: Record<string, unknown> = { isDeleted: false };

    if (lat !== undefined && lng !== undefined) {
      const parsedLat = parseFloat(lat as string);
      const parsedLng = parseFloat(lng as string);
      const maxDistance = radius !== undefined ? parseFloat(radius as string) : 5000;

      if (isNaN(parsedLat) || isNaN(parsedLng) || isNaN(maxDistance)) {
        return res.status(400).json({ error: 'lat, lng, and radius must be valid numbers' });
      }

      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
          $maxDistance: maxDistance,
        },
      };
    }

    // $near returns results sorted by distance; fall back to createdAt for unfiltered queries
    const reports = lat !== undefined
      ? await Report.find(filter)
      : await Report.find(filter).sort({ createdAt: -1 });

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
    const { categoryId, subcategoryId, address, coords, description, photoUrl } = req.body;
    const report = await Report.create({
      categoryId,
      subcategoryId: subcategoryId ?? null,
      address,
      coords,
      location: {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
      },
      description,
      photoUrl,
      userId: req.userId ?? null,
    });

    // TODO: points go to the user's *current* team, not the team they were in at
    // submission time — if they switch teams, a later deletion will deduct from the
    // wrong team.
    if (req.userId) {
      const membership = await TeamMembership.findOne({ userId: req.userId, leftAt: null }).lean();
      if (membership) {
        await Team.findByIdAndUpdate(membership.teamId, { $inc: { totalPoints: REPORT_POINTS } });
      }
    }

    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Soft delete a report
router.delete('/:id', async (req, res) => {
  try {
    // isDeleted: false ensures idempotency — a repeat call finds nothing and returns
    // 404, preventing a double point deduction.
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });

    // TODO: same team-ownership caveat as the create route — deducts from the
    // reporter's *current* team, not necessarily the team that earned the points.
    if (report.userId) {
      const membership = await TeamMembership.findOne({ userId: report.userId, leftAt: null }).lean();
      if (membership) {
        await Team.findByIdAndUpdate(membership.teamId, { $inc: { totalPoints: -REPORT_POINTS } });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Check if current user has liked a report
router.get('/:id/likes/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const liked = await ReportLike.exists({ reportId: req.params.id, userId: req.userId });
    res.json({ liked: !!liked });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Like a report
router.post('/:id/likes', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await ReportLike.create({ reportId: req.params.id, userId: req.userId });
    const report = await Report.findByIdAndUpdate(req.params.id, { $inc: { likeCount: 1 } }, { new: true });
    res.status(201).json({ likeCount: report!.likeCount });
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
    const report = await Report.findByIdAndUpdate(req.params.id, { $inc: { likeCount: -1 } }, { new: true });
    res.json({ likeCount: report!.likeCount });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
