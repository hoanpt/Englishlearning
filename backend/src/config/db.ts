import mongoose from 'mongoose';
import { seedDB } from './seed';

export const connectDB = async (): Promise<void> => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/english-learning';
    const conn = await mongoose.connect(connString);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    // Seed vocabulary data
    await seedDB();
  } catch (error) {
    console.error(`⚠️ Warning: Error connecting to MongoDB: ${(error as Error).message}`);
    console.error(`Make sure your MongoDB server is running on 127.0.0.1:27017 or check your MONGODB_URI in .env`);
  }
};
