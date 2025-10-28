import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tms';

export async function connectToDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error', error);
    process.exit(1);
  }
}
