import { Router } from 'express';
import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// GET /api/queues — List all queues for the authenticated manager
router.get('/', async (req, res) => {
  try {
    const queues = await Queue.find({ managerId: req.managerId }).sort({ createdAt: -1 });

    // Attach waiting token count to each queue
    const queuesWithCounts = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await Token.countDocuments({
          queueId: queue._id,
          status: 'waiting',
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const servedToday = await Token.countDocuments({
          queueId: queue._id,
          status: 'completed',
          completedAt: { $gte: startOfDay }
        });

        const inServiceToken = await Token.findOne({
          queueId: queue._id,
          status: 'in-service'
        });

        return {
          ...queue.toObject(),
          waitingCount,
          servedToday,
          inServiceToken,
        };
      })
    );

    res.json({ queues: queuesWithCounts });
  } catch (error) {
    console.error('List queues error:', error);
    res.status(500).json({ message: 'Server error fetching queues.' });
  }
});

// POST /api/queues — Create a new queue
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Queue name is required.' });
    }

    const queue = await Queue.create({
      name: name.trim(),
      managerId: req.managerId,
    });

    res.status(201).json({ queue: { ...queue.toObject(), waitingCount: 0 } });
  } catch (error) {
    console.error('Create queue error:', error);
    res.status(500).json({ message: 'Server error creating queue.' });
  }
});

// GET /api/queues/:id — Get queue details with all tokens
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const queue = await Queue.findOne({
      _id: req.params.id,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found.' });
    }

    // Get tokens sorted: waiting by position asc, then in-service, then completed/cancelled by createdAt desc
    const waitingTokens = await Token.find({
      queueId: queue._id,
      status: 'waiting',
    }).sort({ position: 1 });

    const inServiceTokens = await Token.find({
      queueId: queue._id,
      status: 'in-service',
    }).sort({ calledAt: -1 });

    const completedTokens = await Token.find({
      queueId: queue._id,
      status: { $in: ['completed', 'cancelled'] },
    }).sort({ createdAt: -1 });

    const tokens = [...waitingTokens, ...inServiceTokens, ...completedTokens];

    res.json({
      queue: queue.toObject(),
      tokens,
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ message: 'Server error fetching queue.' });
  }
});

// GET /api/queues/:id/analytics — Get analytics data for a queue
router.get('/:id/analytics', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const queue = await Queue.findOne({
      _id: req.params.id,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found.' });
    }

    const tokens = await Token.find({ queueId: queue._id });

    // Base stats
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const waiting = tokens.filter((t) => t.status === 'waiting').length;
    const servedToday = tokens.filter(
      (t) => t.status === 'completed' && t.completedAt >= startOfDay
    ).length;
    const cancelledToday = tokens.filter(
      (t) => t.status === 'cancelled' && t.cancelledAt >= startOfDay
    ).length;

    // Avg Wait Time (Completed tokens)
    const completedTokens = tokens.filter((t) => t.status === 'completed');
    let totalWaitTime = 0;
    completedTokens.forEach((t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.calledAt || t.completedAt).getTime();
      totalWaitTime += (end - start);
    });
    const avgWaitMs = completedTokens.length ? totalWaitTime / completedTokens.length : 0;
    const avgWait = Math.round(avgWaitMs / 60000); // in minutes

    // Hourly Data (Today's queue length trend)
    const hourlyMap = {};
    for (let i = 8; i <= 17; i++) { // 8 AM to 5 PM
      const hourStr = i > 12 ? `${i - 12} PM` : `${i} AM`;
      hourlyMap[hourStr] = 0;
    }
    
    tokens.forEach((t) => {
      if (t.createdAt >= startOfDay) {
        const hour = new Date(t.createdAt).getHours();
        if (hour >= 8 && hour <= 17) {
          const hourStr = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
          hourlyMap[hourStr]++;
        }
      }
    });
    const hourlyData = Object.keys(hourlyMap).map((hour) => ({
      hour,
      count: hourlyMap[hour],
    }));

    // Weekly Data (Avg wait time by day for last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayTokens = completedTokens.filter((t) => t.createdAt >= d && t.createdAt < nextD);
      let dTotalWait = 0;
      dayTokens.forEach((t) => {
        const start = new Date(t.createdAt).getTime();
        const end = new Date(t.calledAt || t.completedAt).getTime();
        dTotalWait += (end - start);
      });
      const dAvgWait = dayTokens.length ? Math.round((dTotalWait / dayTokens.length) / 60000) : 0;
      
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyData.push({ day: dayStr, avgWait: dAvgWait });
    }

    res.json({
      stats: { waiting, served: servedToday, avgWait, cancelled: cancelledToday },
      hourly: hourlyData,
      weekly: weeklyData,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics.' });
  }
});

// DELETE /api/queues/:id — Delete queue and all its tokens
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const queue = await Queue.findOne({
      _id: req.params.id,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or not authorized.' });
    }

    // Delete all tokens in this queue
    await Token.deleteMany({ queueId: queue._id });

    // Delete the queue
    await Queue.deleteOne({ _id: queue._id });

    res.json({ message: 'Queue and all tokens deleted successfully.' });
  } catch (error) {
    console.error('Delete queue error:', error);
    res.status(500).json({ message: 'Server error deleting queue.' });
  }
});

// POST /api/queues/:id/tokens — Add a token to a queue
router.post('/:id/tokens', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const { personName } = req.body;

    if (!personName || !personName.trim()) {
      return res.status(400).json({ message: 'Person name is required.' });
    }

    const queue = await Queue.findOne({
      _id: req.params.id,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or not authorized.' });
    }

    // Find max position among waiting tokens
    const lastWaiting = await Token.findOne({
      queueId: queue._id,
      status: 'waiting',
    }).sort({ position: -1 });

    const position = lastWaiting ? lastWaiting.position + 1 : 0;

    // Create the token
    const token = await Token.create({
      queueId: queue._id,
      tokenNumber: queue.nextTokenNum,
      personName: personName.trim(),
      position,
    });

    // Increment the queue's nextTokenNum
    queue.nextTokenNum += 1;
    await queue.save();

    res.status(201).json({ token });
  } catch (error) {
    console.error('Add token error:', error);
    res.status(500).json({ message: 'Server error adding token.' });
  }
});

// POST /api/queues/:id/call-next — Call the next waiting token
router.post('/:id/call-next', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const queue = await Queue.findOne({
      _id: req.params.id,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(404).json({ message: 'Queue not found or not authorized.' });
    }

    // Check if any token is already in-service
    const inServiceToken = await Token.findOne({
      queueId: queue._id,
      status: 'in-service',
    });

    if (inServiceToken) {
      return res.status(400).json({
        message: 'A token is already in service. Complete or cancel it first.',
        token: inServiceToken,
      });
    }

    // Find the next waiting token (lowest position)
    const nextToken = await Token.findOne({
      queueId: queue._id,
      status: 'waiting',
    }).sort({ position: 1 });

    if (!nextToken) {
      return res.status(404).json({ message: 'No waiting tokens in this queue.' });
    }

    nextToken.status = 'in-service';
    nextToken.calledAt = new Date();
    await nextToken.save();

    res.json({ token: nextToken });
  } catch (error) {
    console.error('Call next error:', error);
    res.status(500).json({ message: 'Server error calling next token.' });
  }
});

export default router;
