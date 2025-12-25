import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['visitor', 'creator', 'admin'],
    default: 'visitor'
  },
  status: {
    type: String,
    enum: ['active', 'frozen'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  campaignsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }],
  donationsMade: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  totalDonated: {
    type: Number,
    default: 0
  },
  rewardPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // OTP-based password reset fields (do not affect normal login/registration)
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  }
}, {
  timestamps: true
});

// Ensure rewardPoints is initialized
userSchema.pre('save', function(next) {
  if (this.rewardPoints === undefined || this.rewardPoints === null) {
    this.rewardPoints = 0;
  }
  next();
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});

// Match user password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const User = mongoose.model('User', userSchema);

export default User;

