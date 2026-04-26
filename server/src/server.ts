import dotenv from 'dotenv';
dotenv.config();

import app from './index';
import { connectDB } from './db';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
