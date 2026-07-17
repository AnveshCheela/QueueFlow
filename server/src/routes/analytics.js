import { Router } from 'express';
import mongoose from 'mongoose';
import Token from '../models/Token.js';
import Queue from '../models/Queue.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// Helper: get start of today (UTC)
const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// GET /api/analytics/:queueId/summary
router.get('/:queueId/summary', async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    // Verify ownership
    const queue = await Queue.findOne({
      _id: queueId,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or not authorized.' });
    }

    const startOfToday = getStartOfToday();
    const queueObjId = new mongoose.Types.ObjectId(queueId);

    const [summary] = await Token.aggregate([
      { $match: { queueId: queueObjId } },
      {
        $facet: {
          waitingNow: [
            { $match: { status: 'waiting' } },
            { $count: 'count' },
          ],
          servedToday: [
            {
              $match: {
                status: 'completed',
                completedAt: { $gte: startOfToday },
              },
            },
            { $count: 'count' },
          ],
          avgWaitTime: [
            {
              $match: {
                calledAt: { $ne: null, $gte: startOfToday },
              },
            },
            {
              $project: {
                waitTime: {
                  $divide: [
                    { $subtract: ['$calledAt', '$createdAt'] },
                    60000, // convert ms to minutes
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgWaitTime: { $avg: '$waitTime' },
              },
            },
          ],
          cancelledToday: [
            {
              $match: {
                status: 'cancelled',
                cancelledAt: { $gte: startOfToday },
              },
            },
            { $count: 'count' },
          ],
          totalServed: [
            { $match: { status: 'completed' } },
            { $count: 'count' },
          ],
        },
      },
    ]);

    res.json({
      waitingNow: summary.waitingNow[0]?.count || 0,
      servedToday: summary.servedToday[0]?.count || 0,
      avgWaitTime: Math.round((summary.avgWaitTime[0]?.avgWaitTime || 0) * 100) / 100,
      cancelledToday: summary.cancelledToday[0]?.count || 0,
      totalServed: summary.totalServed[0]?.count || 0,
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ message: 'Server error fetching analytics summary.' });
  }
});

// GET /api/analytics/:queueId/trends
router.get('/:queueId/trends', async (req, res) => {
  try {
    const { queueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(queueId)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    // Verify ownership
    const queue = await Queue.findOne({
      _id: queueId,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or not authorized.' });
    }

    const startOfToday = getStartOfToday();
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const queueObjId = new mongoose.Types.ObjectId(queueId);

    // Hourly trend: tokens created and completed per hour today
    const hourlyCreated = await Token.aggregate([
      {
        $match: {
          queueId: queueObjId,
          createdAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const hourlyCompleted = await Token.aggregate([
      {
        $match: {
          queueId: queueObjId,
          status: 'completed',
          completedAt: { $gte: startOfToday, $lt: endOfToday },
        },
      },
      {
        $group: {
          _id: { $hour: '$completedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build hourly trend array (0-23)
    const createdMap = new Map(hourlyCreated.map((h) => [h._id, h.count]));
    const completedMap = new Map(hourlyCompleted.map((h) => [h._id, h.count]));

    const hourlyTrend = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      created: createdMap.get(hour) || 0,
      completed: completedMap.get(hour) || 0,
    }));

    // Daily average wait time for the last 7 days
    const dailyAvgWait = await Token.aggregate([
      {
        $match: {
          queueId: queueObjId,
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
        },
      },
      {
        $group: {
          _id: '$day',
          avgWaitTime: { $avg: '$waitTime' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          avgWaitTime: { $round: ['$avgWaitTime', 2] },
          tokensCalled: '$count',
        },
      },
    ]);

    res.json({
      hourlyTrend,
      dailyAvgWait,
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({ message: 'Server error fetching analytics trends.' });
  }
});

export default router;
