const mongoose = require('mongoose');

let cached;
let cachedPromise;

const connectDB = async () => {
  // If we already have a live connection, reuse it.
  if (cached && mongoose.connection.readyState === 1) return cached;

  // Serverless: reuse the connection stored on global across warm invocations.
  const isServerless = process.env.VERCEL === '1';
  if (
    isServerless &&
    global.mongooseConnection &&
    global.mongooseConnection.connection.readyState === 1
  ) {
    cached = global.mongooseConnection;
    return cached;
  }

  // Deduplicate concurrent connect() calls while the previous attempt runs.
  if (!cachedPromise) {
    cachedPromise = (async () => {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: isServerless ? 8000 : 30000,
        // Never silently buffer operations against a stale/disconnected
        // serverless connection; surface the real error instead.
        bufferCommands: false,
      });

      if (isServerless) {
        global.mongooseConnection = conn;
      }
      cached = conn;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })();
  }

  try {
    return await cachedPromise;
  } finally {
    cachedPromise = null;
  }
};

module.exports = connectDB;