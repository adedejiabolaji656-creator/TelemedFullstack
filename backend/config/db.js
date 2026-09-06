const mongoose = require('mongoose');

let cached;

const connectDB = async () => {
  if (cached) return cached;

  try {
    const isServerless = process.env.VERCEL === '1';
    // Reuse a single connection across warm serverless invocations.
    if (isServerless && global.mongooseConnection) {
      cached = global.mongooseConnection;
      return cached;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: isServerless ? 8000 : 30000,
    });

    if (isServerless) {
      global.mongooseConnection = conn;
    }
    cached = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return cached;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.VERCEL === '1') {
      // Do not exit the process in serverless; the invocation will just fail.
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
