import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { TeamMembership } from '../models/TeamMembership';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Update first/last name
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName } = req.body;

  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.userId },
    { firstName: firstName?.trim() ?? '', lastName: lastName?.trim() ?? '' },
    { upsert: true, new: true },
  );

  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  res.json({ user, profile });
});

// Update avatar
router.put('/avatar', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { avatarUrl } = req.body;
  if (typeof avatarUrl !== 'string') {
    res.status(400).json({ error: 'avatarUrl is required' });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { avatarUrl },
    { new: true },
  ).select('-passwordHash');

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

// Opt into the coach role — unlocks team creation
router.post('/become-coach', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const activeMembership = await TeamMembership.findOne({ userId: req.userId, leftAt: null });
  if (activeMembership) {
    res.status(409).json({ error: 'You cannot become a coach while you are a member of a team.' });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { isCoach: true },
    { new: true },
  ).select('-passwordHash');

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

// Resign from the coach role
router.post('/resign-coach', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    { isCoach: false },
    { new: true },
  ).select('-passwordHash');

  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json({ user });
});

// Change password (not available for Google-only accounts)
router.put('/password', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'currentPassword and newPassword are required' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters' });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const passwordHash = user.get('passwordHash') as string | undefined;
  if (!passwordHash) {
    res.status(400).json({ error: 'This account uses Google sign-in and has no password' });
    return;
  }

  const match = await bcrypt.compare(currentPassword, passwordHash);
  if (!match) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  user.set('passwordHash', await bcrypt.hash(newPassword, 12));
  await user.save();
  res.json({ success: true });
});

export default router;
