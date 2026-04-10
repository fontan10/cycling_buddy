/**
 * One-time migration: backfill the `location` GeoJSON field for all existing
 * reports that were created before geospatial support was added.
 *
 * Run with:
 *   npx tsx --env-file=.env src/scripts/migrateCoords.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Report } from '../models/Report';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cycling_buddy';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await Report.updateMany(
    { location: { $exists: false }, 'coords.lat': { $exists: true } },
    [
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: ['$coords.lng', '$coords.lat'],
          },
        },
      },
    ],
  );

  console.log(`Migrated ${result.modifiedCount} report(s).`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
