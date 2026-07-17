import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Token from 'file:///c:/Users/Anvesh/OneDrive/ドキュメント/Desktop/Projects/Rugas/server/src/models/Token.js';
import Queue from 'file:///c:/Users/Anvesh/OneDrive/ドキュメント/Desktop/Projects/Rugas/server/src/models/Queue.js';

dotenv.config({ path: 'c:/Users/Anvesh/OneDrive/ドキュメント/Desktop/Projects/Rugas/server/.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const q = await Queue.findOne();
  if (!q) {
    console.log("No queue");
    process.exit(0);
  }

  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyAvgWait = await Token.aggregate([
    {
      $match: {
        queueId: q._id,
        calledAt: { $ne: null, $gte: sevenDaysAgo },
      },
    },
    {
      $project: {
        day: {
          $dateToString: { format: '%Y-%m-%d', date: '$calledAt' },
        },
        waitTime: {
          $divide: [
            { $subtract: ['$calledAt', '$createdAt'] },
            60000,
          ],
        },
        serviceTime: {
          $cond: [
            { $ifNull: ['$completedAt', false] },
            { $divide: [{ $subtract: ['$completedAt', '$calledAt'] }, 60000] },
            null
          ]
        }
      },
    },
    {
      $group: {
        _id: '$day',
        avgWaitTime: { $avg: '$waitTime' },
        avgServiceTime: { $avg: '$serviceTime' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        avgWaitTime: { $round: ['$avgWaitTime', 2] },
        avgServiceTime: { $round: [{ $ifNull: ['$avgServiceTime', 0] }, 2] },
        tokensCalled: '$count',
      },
    },
  ]);

  console.log(JSON.stringify(dailyAvgWait, null, 2));
  process.exit(0);
}

test().catch(console.error);
