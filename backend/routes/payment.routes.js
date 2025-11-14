import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { initiateKhaltiPayment, verifyKhaltiPayment } from '../utils/payment.js';
import User from '../models/User.model.js';

const router = express.Router();

// Initiate Khalti payment
router.post('/khalti/initiate', protect, async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    
    if (!amount || !campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and campaign ID are required'
      });
    }

    const user = await User.findById(req.user.id);
    const paymentData = await initiateKhaltiPayment(
      parseFloat(amount),
      campaignId,
      req.user.id,
      user.name
    );

    res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify Khalti payment
router.post('/khalti/verify', protect, async (req, res) => {
  try {
    const { pidx } = req.body;
    
    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const verification = await verifyKhaltiPayment(pidx);

    // Check if payment is completed
    const status = verification?.status || verification?.state;
    const isCompleted = status === 'Completed' || status === 'completed' || status === 'COMPLETED';

    if (!isCompleted) {
      return res.status(200).json({
        success: false,
        message: `Payment status: ${status}. Payment is not completed.`,
        data: verification
      });
    }

    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

export default router;

