import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cycling_buddy';
  await mongoose.connect(uri);
  isConnected = true;
}
