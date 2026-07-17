import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Queue',
    required: true,
    index: true,
  },
  tokenNumber: {
    type: Number,
    required: [true, 'Token number is required'],
  },
  personName: {
    type: String,
    required: [true, 'Person name is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'in-service', 'completed', 'cancelled'],
    default: 'waiting',
  },
  position: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  calledAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
});

// Compound index for efficient queue queries
tokenSchema.index({ queueId: 1, status: 1, position: 1 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
