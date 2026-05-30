import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cachedConnection: Connection | null = null;

export async function connectToDatabase(): Promise<Connection> {
  if (cachedConnection) {
    console.log('[v0] Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI as string, {
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      family: 4, // Use IPv4, skip IPv6
    });
    cachedConnection = connection.connection;
    console.log('[v0] New MongoDB connection established');
    return cachedConnection;
  } catch (error) {
    console.error('[v0] MongoDB connection error:', error);
    throw error;
  }
}

export default connectToDatabase;