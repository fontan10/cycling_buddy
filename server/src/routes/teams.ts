import { Router, Response } from 'express';
import crypto from 'crypto';
import { Team } from '../models/Team';
import { TeamMembership } from '../models/TeamMembership';
import { User, type IUser } from '../models/User';
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

// Join a team by code (enforces single-team restriction per US-12)
router.post('/join', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await TeamMembership.findOne({ userId: req.userId, leftAt: null });
  if (existing) {
    res.status(409).json({ error: 'You are already on a team. Leave your current team before joining another.' });
    return;
  }

  const { teamCode } = req.body;
  if (!teamCode?.trim()) {
    res.status(400).json({ error: 'Team code is required' });
    return;
  }

  const team = await Team.findOne({ teamCode: teamCode.trim().toUpperCase() });
  if (!team) {
    res.status(404).json({ error: 'No team found with that code' });
    return;
  }

  const membership = await TeamMembership.create({
    userId:   req.userId,
    teamId:   team._id,
    role:     'member',
    joinedAt: new Date(),
  });

  res.status(201).json({ team, membership });
});

// Regenerate the team code, revoking the previous one (coach only)
router.post('/regenerate-code', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const membership = await TeamMembership.findOne({ userId: req.userId, role: 'coach', leftAt: null });
  if (!membership) {
    res.status(403).json({ error: 'Only coaches with an active team can regenerate the team code' });
    return;
  }

  const teamCode = await generateUniqueCode();
  const team = await Team.findByIdAndUpdate(membership.teamId, { teamCode }, { new: true });
  res.json({ team });
});

// List all active members of the authenticated user's team
router.get('/mine/members', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const membership = await TeamMembership.findOne({ userId: req.userId, leftAt: null })
    .populate('teamId')
    .lean();

  if (!membership) {
    res.json({ team: null, members: [] });
    return;
  }

  const memberships = await TeamMembership.find({ teamId: (membership.teamId as any)._id, leftAt: null })
    .populate('userId', 'username avatarUrl')
    .sort({ joinedAt: 1 })
    .lean();

  const members = memberships.map(m => ({
    _id: m._id,
    role: m.role,
    joinedAt: m.joinedAt,
    user: m.userId,
  }));

  res.json({ team: membership.teamId, members });
});

// Search for a user by exact username — coach only, returns availability status
router.get('/search-user', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coachMembership = await TeamMembership.findOne({ userId: req.userId, role: 'coach', leftAt: null });
  if (!coachMembership) {
    res.status(403).json({ error: 'Only coaches can search for users' });
    return;
  }

  const { username } = req.query;
  if (!username || typeof username !== 'string' || !username.trim()) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const target = await User.findOne({ username: username.trim().toLowerCase() }).lean<IUser>();
  if (!target) {
    res.json({ found: false });
    return;
  }

  if (String(target._id) === req.userId) {
    res.json({ found: true, available: false, reason: 'cannotAddSelf' });
    return;
  }

  const existingMembership = await TeamMembership.findOne({ userId: target._id, leftAt: null });
  if (existingMembership) {
    res.json({ found: true, available: false, reason: 'alreadyOnTeam' });
    return;
  }

  res.json({
    found: true,
    available: true,
    user: { _id: target._id, username: target.username, avatarUrl: target.avatarUrl },
  });
});

// Add a member to the coach's team by username (coach only)
router.post('/add-member', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const coachMembership = await TeamMembership.findOne({ userId: req.userId, role: 'coach', leftAt: null });
  if (!coachMembership) {
    res.status(403).json({ error: 'Only coaches can add members' });
    return;
  }

  const { username } = req.body;
  if (!username?.trim()) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const target = await User.findOne({ username: username.trim().toLowerCase() }).lean<IUser>();
  if (!target) {
    res.status(404).json({ error: 'No user found with that username' });
    return;
  }

  if (String(target._id) === req.userId) {
    res.status(400).json({ error: 'You cannot add yourself to the team' });
    return;
  }

  const existing = await TeamMembership.findOne({ userId: target._id, leftAt: null });
  if (existing) {
    res.status(409).json({ error: 'This user is already on a team' });
    return;
  }

  const membership = await TeamMembership.create({
    userId:   target._id,
    teamId:   coachMembership.teamId,
    role:     'member',
    joinedAt: new Date(),
  });

  res.status(201).json({
    member: {
      _id:      membership._id,
      role:     membership.role,
      joinedAt: membership.joinedAt,
      user: { _id: target._id, username: target.username, avatarUrl: target.avatarUrl },
    },
  });
});

// Create a new team (coach only, one active team per coach)
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).lean<IUser>();
  if (!user || !user.isCoach) {
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
