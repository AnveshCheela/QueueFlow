import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Token from './server/src/models/Token.js';
import Queue from './server/src/models/Queue.js';

dotenv.config({ path: './server/.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/queueflow');
  const queues = await Queue.find();
  for (const q of queues) {
    const t = await Token.findOne({ queueId: q._id, status: 'in-service' });
    console.log(`Queue: ${q.name}, In-Service Token:`, t ? t.personName : 'None');
  }
  process.exit(0);
}
run();
