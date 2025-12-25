import User from '../models/User.model.js';
import { validationResult } from 'express-validator';
import { sendWelcomeEmail, sendEmail } from '../utils/sendEmail.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (rewardPoints will be initialized to 0 by default in schema)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      rewardPoints: 0 // Explicitly set to ensure it's initialized
    });

    // Send welcome email (non-blocking - don't fail registration if email fails)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      // Log error but don't fail registration
      console.error('Failed to send welcome email:', emailError.message);
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and password matches
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is frozen
    if (user.status === 'frozen') {
      return res.status(403).json({
        success: false,
        message: 'Account has been frozen. Please contact administrator.'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        avatar: user.avatar,
        createdAt: user.createdAt,
        rewardPoints: user.rewardPoints || 0,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('campaignsCreated')
      .populate('donationsMade')
      .select('+rewardPoints'); // Explicitly include rewardPoints

    // Ensure rewardPoints is initialized if missing
    if (user && (user.rewardPoints === undefined || user.rewardPoints === null)) {
      user.rewardPoints = 0;
      await user.save();
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Only allow password reset for users that actually exist
    const user = await User.findOne({ email });

    // For security, respond with success even if user doesn't exist,
    // but do NOT send OTP if there is no real user.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, an OTP has been sent',
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP via existing email utility
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const textContent = `Your NepFund password reset OTP is ${otp}. It is valid for 10 minutes. If you did not request this, you can ignore this email.`;

    const htmlContent = `
      <p>Dear ${user.name || 'User'},</p>
      <p>You requested to reset your NepFund password.</p>
      <p><strong>Your OTP is: ${otp}</strong></p>
      <p>This code is valid for 10 minutes.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p><a href="${frontendUrl}/login">Back to NepFund</a></p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'NepFund Password Reset OTP',
        text: textContent,
        html: htmlContent,
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      // Even if email fails, do not reveal details to the client
    }

    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, an OTP has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    // OTP is valid
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reset password using OTP-verified email
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required',
      });
    }

    // Find user with OTP fields to ensure a reset has been initiated
    const user = await User.findOne({ email }).select('+password +otp +otpExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Unable to reset password for this account',
      });
    }

    // Optionally enforce that a non-expired OTP exists
    if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP verification is required or has expired',
      });
    }

    // Set new password; pre-save hook will hash it
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

