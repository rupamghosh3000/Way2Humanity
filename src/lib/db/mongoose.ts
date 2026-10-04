import mongoose from 'mongoose';
import { config } from '../config';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isMemoryFallback?: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, isMemoryFallback: false };
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (cached?.isMemoryFallback) {
    return null;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000, // 4-second timeout if MongoDB server is offline
      connectTimeoutMS: 4000,
    };

    cached!.promise = mongoose.connect(config.db.url, opts).then((m) => {
      console.log('MongoDB connected successfully');
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (e) {
    console.warn('MongoDB connection unavailable (local daemon or Atlas offline). Falling back to MemoryStore mode.');
    cached!.promise = null;
    cached!.isMemoryFallback = true;
    return null;
  }
}
