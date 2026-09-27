import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  // This is a traditional, low-concurrency development server, so a small reusable
  // pool avoids unnecessary idle MongoDB connections while supporting request bursts.
  await mongoose.connect(env.mongoUri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  });
  console.log('MongoDB connected');
}
