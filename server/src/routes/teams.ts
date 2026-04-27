import { Router, Response } from 'express';
import crypto from 'crypto';
import { Team } from '../models/Team';
import { TeamMembership } from '../models/TeamMembership';
import { User } from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omits ambiguous 0/O/1/I

async function generateUniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = Array.from(crypto.randomBytes(6))
      .map(b => CODE_CHARS[b % CODE_CHARS.length])
      .join('');
    if (!await Team.exists({ teamCode: code })) return code;
  }
  throw new Error('Failed to generate unique team code');
}

// Get the authenticated user's current team (works for coaches and members)
router.get('/mine', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const membership = await TeamMembership.findOne({ userId: req.userId, leftAt: null })
    .populate('teamId')
    .lean();

  if (!membership) { res.json({ team: null, membership: null }); return; }

  res.json({ team: membership.teamId, membership });
});

// Create a new team (coach only, one active team per coach)
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).lean();
  if (!user || !(user as any).isCoach) {
    res.status(403).json({ error: 'Only coaches can create a team' });
    return;
  }

  const existing = await TeamMembership.findOne({ userId: req.userId, role: 'coach', leftAt: null });
  if (existing) {
    res.status(409).json({ error: 'You already have an active team' });
    return;
  }

  const { name, photoUrl } = req.body;
  if (!name?.trim()) {
    res.status(400).json({ error: 'Team name is required' });
    return;
  }

  const teamCode = await generateUniqueCode();
  const team = await Team.create({ name: name.trim(), photoUrl: photoUrl ?? '', teamCode });
  await TeamMembership.create({
    userId:   req.userId,
    teamId:   team._id,
    role:     'coach',
    joinedAt: new Date(),
  });

  res.status(201).json({ team });
});

export default router;
