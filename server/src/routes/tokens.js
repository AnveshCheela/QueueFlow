import { Router } from 'express';
import mongoose from 'mongoose';
import Token from '../models/Token.js';
import Queue from '../models/Queue.js';
import auth from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(auth);

// PATCH /api/tokens/:tokenId/move — Move a token up or down in the queue
router.patch('/:tokenId/move', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { direction } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ message: 'Invalid token ID.' });
    }

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ message: 'Direction must be "up" or "down".' });
    }

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found.' });
    }

    if (token.status !== 'waiting') {
      return res.status(400).json({ message: 'Only waiting tokens can be moved.' });
    }

    // Verify ownership: the queue must belong to the authenticated manager
    const queue = await Queue.findOne({
      _id: token.queueId,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(403).json({ message: 'Not authorized to modify this token.' });
    }

    // Find the adjacent waiting token
    let adjacentToken;

    if (direction === 'up') {
      // Find the waiting token with the next lower position
      adjacentToken = await Token.findOne({
        queueId: token.queueId,
        status: 'waiting',
        position: { $lt: token.position },
      }).sort({ position: -1 });
    } else {
      // Find the waiting token with the next higher position
      adjacentToken = await Token.findOne({
        queueId: token.queueId,
        status: 'waiting',
        position: { $gt: token.position },
      }).sort({ position: 1 });
    }

    if (!adjacentToken) {
      return res.status(400).json({
        message: `Token is already at the ${direction === 'up' ? 'top' : 'bottom'} of the queue.`,
      });
    }

    // Swap positions
    const tempPosition = token.position;
    token.position = adjacentToken.position;
    adjacentToken.position = tempPosition;

    await token.save();
    await adjacentToken.save();

    res.json({
      message: `Token moved ${direction} successfully.`,
      token,
      swappedWith: adjacentToken,
    });
    
    // Emit socket event
    req.app.get('io').to(token.queueId.toString()).emit('queue-updated');
    req.app.get('io').emit('queues-updated');
  } catch (error) {
    console.error('Move token error:', error);
    res.status(500).json({ message: 'Server error moving token.' });
  }
});

// PATCH /api/tokens/:tokenId/complete — Mark an in-service token as completed
router.patch('/:tokenId/complete', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ message: 'Invalid token ID.' });
    }

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found.' });
    }

    // Verify ownership
    const queue = await Queue.findOne({
      _id: token.queueId,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(403).json({ message: 'Not authorized to modify this token.' });
    }

    if (token.status !== 'in-service') {
      return res.status(400).json({
        message: 'Only in-service tokens can be completed.',
      });
    }

    token.status = 'completed';
    token.completedAt = new Date();
    await token.save();

    res.json({ token });
    
    // Emit socket event
    req.app.get('io').to(token.queueId.toString()).emit('queue-updated');
    req.app.get('io').emit('queues-updated');
  } catch (error) {
    console.error('Complete token error:', error);
    res.status(500).json({ message: 'Server error completing token.' });
  }
});

// PATCH /api/tokens/:tokenId/cancel — Cancel a waiting or in-service token
router.patch('/:tokenId/cancel', async (req, res) => {
  try {
    const { tokenId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tokenId)) {
      return res.status(400).json({ message: 'Invalid token ID.' });
    }

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: 'Token not found.' });
    }

    // Verify ownership
    const queue = await Queue.findOne({
      _id: token.queueId,
      managerId: req.managerId,
    });

    if (!queue) {
      return res.status(403).json({ message: 'Not authorized to modify this token.' });
    }

    if (!['waiting', 'in-service'].includes(token.status)) {
      return res.status(400).json({
        message: 'Only waiting or in-service tokens can be cancelled.',
      });
    }

    token.status = 'cancelled';
    token.cancelledAt = new Date();
    await token.save();

    res.json({ token });
    
    // Emit socket event
    req.app.get('io').to(token.queueId.toString()).emit('queue-updated');
    req.app.get('io').emit('queues-updated');
  } catch (error) {
    console.error('Cancel token error:', error);
    res.status(500).json({ message: 'Server error cancelling token.' });
  }
});

export default router;
