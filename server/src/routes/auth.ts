import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';
import { User } from '../models/User';
import { UserProfile } from '../models/UserProfile';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function signPendingToken(data: { googleId: string; email?: string; avatarUrl?: string }): string {
  return jwt.sign({ pendingGoogle: true, ...data }, JWT_SECRET, { expiresIn: '10m' });
}

// ─── Strategies ────────────────────────────────────────────────────────────

// Accepts either a username or email in the `login` field
passport.use(
  new LocalStrategy({ usernameField: 'login' }, async (login, password, done) => {
    try {
      const isEmail = login.includes('@');
      const query = isEmail
        ? { email: login.toLowerCase() }
        : { username: login.toLowerCase() };
      const user = await User.findOne(query);
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
          return done(null, {
            isNewGoogleUser: true,
            googleId:  profile.id,
            email,
            avatarUrl: profile.photos?.[0]?.value,
            firstName: profile.name?.givenName,
            lastName:  profile.name?.familyName,
          } as any);
        } else {
          if (!user.get('googleId')) user.set('googleId', profile.id);
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

function generateCandidate(): string {
  const name = uniqueNamesGenerator({ dictionaries: [adjectives, animals], style: 'capital', separator: '' });
  const num = Math.floor(Math.random() * 90) + 10;
  return `${name}${num}`;
}

// ─── Routes ────────────────────────────────────────────────────────────────

// Suggest unique usernames — generates candidates in bulk, filters taken ones in one DB query
router.get('/suggest-usernames', async (req: Request, res: Response): Promise<void> => {
  const MAX_COUNT = 20;
  const count = Math.min(Math.max(1, Number(req.query.count) || 5), MAX_COUNT);

  // Overproduce to absorb collisions and self-duplicates
  const candidateSet = new Set<string>();
  while (candidateSet.size < count * 4) candidateSet.add(generateCandidate());

  const candidates = Array.from(candidateSet);
  const lowerCandidates = candidates.map(c => c.toLowerCase());

  const taken = await User.find({ username: { $in: lowerCandidates } }).select('username').lean();
  const takenSet = new Set(taken.map(u => (u as any).username as string));

  const results = candidates.filter(c => !takenSet.has(c.toLowerCase())).slice(0, count);
  res.json({ usernames: results });
});

// Register with username + password (email optional)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }
  if (email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    username: username.toLowerCase(),
    email:    email ? email.toLowerCase() : undefined,
    passwordHash,
  });
  res.status(201).json({ token: signToken(String(user._id)) });
});

// Login with username or email + password
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
    if (user.isNewGoogleUser) {
      const pendingToken = signPendingToken({ googleId: user.googleId, email: user.email, avatarUrl: user.avatarUrl });
      const nameParams = new URLSearchParams();
      if (user.firstName) nameParams.set('firstName', user.firstName);
      if (user.lastName)  nameParams.set('lastName', user.lastName);
      const nameQuery = nameParams.toString() ? `&${nameParams.toString()}` : '';
      res.redirect(`${CLIENT_URL}/auth/google-setup?token=${pendingToken}${nameQuery}`);
    } else {
      res.redirect(`${CLIENT_URL}/auth/callback?token=${signToken(String(user._id))}`);
    }
  },
);

// Complete Google sign-up: validate pending token + chosen username, then create user
router.post('/google/complete', async (req: Request, res: Response): Promise<void> => {
  const { pendingToken, username, firstName, lastName } = req.body;
  if (!pendingToken || !username) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  let payload: any;
  try {
    payload = jwt.verify(pendingToken, JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in with Google again.' });
    return;
  }

  if (!payload.pendingGoogle) {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  const { googleId, email, avatarUrl } = payload;
  const cleanUsername = username.toLowerCase().trim();

  if (await User.findOne({ username: cleanUsername })) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  // Guard against race condition where account was created between redirects
  let user = await User.findOne({ googleId });
  if (!user && email) user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ googleId, email, username: cleanUsername, avatarUrl });
    const profileData: { userId: string; firstName?: string; lastName?: string } = { userId: String(user._id) };
    if (firstName?.trim()) profileData.firstName = firstName.trim();
    if (lastName?.trim())  profileData.lastName  = lastName.trim();
    await UserProfile.create(profileData);
  }

  res.status(201).json({ token: signToken(String(user._id)) });
});

// Get current user (includes firstName/lastName from UserProfile)
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-passwordHash').lean();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const profile = await UserProfile.findOne({ userId: req.userId }).lean();
  res.json({
    ...user,
    firstName: profile?.firstName ?? '',
    lastName:  profile?.lastName  ?? '',
  });
});

export default router;
