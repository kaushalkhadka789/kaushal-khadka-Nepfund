import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: false, // Optional for bonus points
    default: null
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: false, // Optional for bonus points
    default: null
  },
  donationAmount: {
    type: Number,
    required: true,
    min: 0
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: 0
  },
  bonusPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  reason: {
    type: String,
    enum: ['donation', 'bonus', 'admin_adjustment'],
    default: 'donation'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
rewardTransactionSchema.index({ userId: 1, createdAt: -1 });
rewardTransactionSchema.index({ campaignId: 1 });

const RewardTransaction = mongoose.model('RewardTransaction', rewardTransactionSchema);

export default RewardTransaction;

