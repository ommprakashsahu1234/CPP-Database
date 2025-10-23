const mongoose = require('mongoose');

async function connectMongo(mongoUri) {
  if (!mongoUri) {
    throw new Error('Mongo URI is required');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 15_000,
  });
}

module.exports = { connectMongo };
