import dotenv from 'dotenv';
dotenv.config();

import app from './index';
import { connectDB } from './db';

const PORT = process.env.PORT || 5000;
const DEBUG = process.env.DEBUG === 'true';

const log = (...args: unknown[]) => { if (DEBUG) console.log(...args); };

connectDB()
  .then(() => {
    log('Connected to MongoDB');
    app.listen(PORT, () => {
      const url = process.env.SERVER_URL || `http://localhost:${PORT}`;
      log(`Server listening at ${url}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
