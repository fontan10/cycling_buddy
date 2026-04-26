import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { connectDB } from './db';
import reportRoutes from './routes/reports';
import commentRoutes from './routes/comments';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' })); // required for Apple's form POST callback
app.use(passport.initialize());

app.use((_req: Request, _res: Response, next: NextFunction) => {
  connectDB().then(() => next()).catch(next);
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', commentRoutes);

export default app;
