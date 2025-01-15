import { connect } from 'mongoose';
import { config } from 'dotenv';

config();

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // Add timeout
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit process, let the application handle the error
    throw new Error('Failed to connect to MongoDB');
  }
};

export default connectDB;