import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Queue name is required'],
    trim: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true,
  },
  nextTokenNum: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;
