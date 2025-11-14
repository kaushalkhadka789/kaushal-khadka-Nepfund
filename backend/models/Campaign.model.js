import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a campaign title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  titleNp: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a campaign description'],
    trim: true
  },
  descriptionNp: {
    type: String,
    trim: true
  },
  story: {
    type: String,
    required: [true, 'Please provide a detailed story'],
    trim: true
  },
  storyNp: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Medical & Health Emergency',
      'Education Support',
      'Natural Disaster Relief',
      'Child Welfare',
      'Women Empowerment',
      'Animal Rescue & Shelter',
      'Environmental Conservation',
      'Rural Infrastructure Development',
      'Startup & Innovation',
      'Sports & Talent Support',
      'Community Projects',
      'Elderly Care & Support',
      'Emergency Shelter / Housing',
      'Social Cause / Awareness Campaigns',
      'Memorial & Tribute Campaigns'
    ]
  },
  goalAmount: {
    type: Number,
    required: [true, 'Please provide a goal amount'],
    min: [1, 'Goal amount must be at least 1']
  },
  raisedAmount: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  images: [{
    type: String
  }],
  documents: [{
    url: { type: String, required: true },
    mime: { type: String },
    type: { type: String, enum: ['image', 'document'], default: 'document' },
    name: { type: String },
    verified: { type: Boolean, default: false }
  }],
  fundraiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'closed'],
    default: 'pending'
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  updates: [{
    title: String,
    content: String,
    image: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  donorCount: {
    type: Number,
    default: 0
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isSuccessStory: {
    type: Boolean,
    default: false
  },
  storyDetails: {
    type: new mongoose.Schema({
      message: {
        type: String,
        default: ''
      },
      images: {
        type: [String],
        default: []
      },
      videoUrl: {
        type: String,
        default: ''
      }
    }, { _id: false }),
    default: () => ({ message: '', images: [], videoUrl: '' })
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate progress percentage
campaignSchema.virtual('progress').get(function() {
  return Math.min((this.raisedAmount / this.goalAmount) * 100, 100).toFixed(2);
});

campaignSchema.set('toJSON', { virtuals: true });
campaignSchema.set('toObject', { virtuals: true });

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;

