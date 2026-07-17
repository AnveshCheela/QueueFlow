import { Router } from 'express';
import mongoose from 'mongoose';
import Queue from '../models/Queue.js';
import Token from '../models/Token.js';

const router = Router();

// GET /api/public/queues/:id — Get queue details with tokens (NO AUTH REQUIRED)
router.get('/queues/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid queue ID.' });
    }

    const queue = await Queue.findById(req.params.id);
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found.' });
    }

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
    }).sort({ createdAt: -1 }).limit(10); // Limit to last 10 completed for performance

    const tokens = [...waitingTokens, ...inServiceTokens, ...completedTokens];

    res.json({
      queue: queue.toObject(),
      tokens,
    });
  } catch (error) {
    console.error('Get public queue error:', error);
    res.status(500).json({ message: 'Server error fetching queue.' });
  }
});

export default router;
