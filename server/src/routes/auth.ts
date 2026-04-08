import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// ─── Strategies ────────────────────────────────────────────────────────────

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      const passwordHash = user?.get('passwordHash') as string | undefined;
      if (!user || !passwordHash) return done(null, false);
      const match = await bcrypt.compare(password, passwordHash);
      if (!match) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }),
);

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  `${SERVER_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        let user = await User.findOne({ googleId: profile.id });
        if (!user && email) user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            googleId:    profile.id,
            email,
            displayName: profile.displayName,
            avatarUrl:   profile.photos?.[0]?.value ?? '',
          });
        } else {
          if (!user.get('googleId')) user.set('googleId', profile.id);
          if (!user.get('displayName')) user.set('displayName', profile.displayName);
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    },
  ),
);

// Passport sessions are not used — auth is stateless via JWT
passport.serializeUser(() => {});
passport.deserializeUser(() => {});

// ─── Routes ────────────────────────────────────────────────────────────────

// Register with email + password
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: email.toLowerCase(), passwordHash, displayName });
  res.status(201).json({ token: signToken(String(user._id)) });
});

// Login with email + password
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', { session: false }, (err: Error, user: any) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ token: signToken(String(user._id)) });
  })(req, res, next);
});

// Google OAuth — initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth — callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login?error=google_failed` }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    res.redirect(`${CLIENT_URL}/auth/callback?token=${signToken(String(user._id))}`);
  },
);

// Get current user
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;
