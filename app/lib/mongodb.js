import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    try {
      // Test the cached connection
      await cached.conn.connection.db.command({ ping: 1 });
      console.log('Using cached database connection');
      return {
        conn: cached.conn,
        db: cached.conn.connection.db
      };
    } catch (error) {
      console.log('Cached connection failed, creating new connection');
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    try {
      console.log('Connecting to MongoDB...');
      console.log('Database URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Log URI with hidden password
      
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        const dbName = mongoose.connection.db.databaseName;
        console.log(`Connected to MongoDB database: ${dbName}`);
        
        // Test the connection with a simple command
        return mongoose.connection.db.command({ ping: 1 })
          .then(() => {
            console.log('Successfully authenticated with MongoDB');
            return mongoose;
          })
          .catch((error) => {
            console.error('Authentication test failed:', error);
            cached.promise = null;
            throw error;
          });
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      cached.promise = null;
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.conn) {
      throw new Error('Failed to establish MongoDB connection: connection is null');
    }
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    console.error('Failed to establish MongoDB connection:', e);
    throw e;
  }

  if (!cached.conn.connection?.db) {
    throw new Error('MongoDB connection successful but database handle is missing');
  }

  return {
    conn: cached.conn,
    db: cached.conn.connection.db
  };
} 