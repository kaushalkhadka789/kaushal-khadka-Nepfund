import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
  initiateKhaltiPayment, 
  verifyKhaltiPayment, 
  initiateEsewaPayment, 
  verifyEsewaPayment 
} from '../utils/payment.js';
import User from '../models/User.model.js';

// NEW: Imports for Receipt and Email
import { generateReceiptBuffer } from '../utils/receiptGenerator.js';
import { sendDonationReceiptEmail } from '../utils/sendEmail.js';

const router = express.Router();

// ---------------------------------------------------------
// KHALTI ROUTES
// ---------------------------------------------------------

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
    const isCompleted = ['Completed', 'completed', 'COMPLETED'].includes(status);

    if (!isCompleted) {
      return res.status(200).json({
        success: false,
        message: `Payment status: ${status}. Payment is not completed.`,
        data: verification
      });
    }

    // --- AUTOMATED EMAIL LOGIC ---
    if (isCompleted) {
      const user = await User.findById(req.user.id);
      
      // Debugging: Check what Khalti is actually sending
      console.log("Khalti Verification Data:", verification);

      // Khalti returns 'total_amount' in Paisa (not 'amount')
      // We check total_amount first, then fallback to amount, then 0
      const rawAmount = verification?.total_amount || verification?.amount || 0;
      const khaltiAmountInRupees = Number(rawAmount) / 100;
      
      console.log("Extracted Amount (Paisa):", rawAmount, "-> Amount (NPR):", khaltiAmountInRupees);

      if (user && user.email) {
        const pdfBuffer = generateReceiptBuffer(khaltiAmountInRupees, user.name, pidx);
        await sendDonationReceiptEmail(user.email, user.name, pdfBuffer);
      }
    }
    // ------------------------------

    res.status(200).json({
      success: true,
      message: 'Payment verified and receipt sent to inbox.',
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

// ---------------------------------------------------------
// ESEWA ROUTES
// ---------------------------------------------------------

// Initiate eSewa payment
router.post('/esewa/initiate', protect, async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    
    if (!amount || !campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and campaign ID are required'
      });
    }

    const user = await User.findById(req.user.id);
    const paymentData = await initiateEsewaPayment(
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

// Verify eSewa payment
router.post('/esewa/verify', protect, async (req, res) => {
  try {
    const { oid, refId, amount } = req.body;
    
    if (!oid || !refId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Reference ID, and Amount are required'
      });
    }

    const verification = await verifyEsewaPayment(oid, refId, amount);

    // Check if payment is completed
    const status = verification?.status || verification?.state;
    const isCompleted = ['Completed', 'completed', 'COMPLETED'].includes(status);

    if (!isCompleted) {
      return res.status(200).json({
        success: false,
        message: `Payment status: ${status}. Payment is not completed.`,
        data: verification
      });
    }

    // --- AUTOMATED EMAIL LOGIC ---
    if (isCompleted) {
      const user = await User.findById(req.user.id);
      
      // Ensure the amount from req.body is a Number
      const esewaAmount = Number(amount) || 0;

      if (user && user.email) {
        const pdfBuffer = generateReceiptBuffer(esewaAmount, user.name, refId);
        await sendDonationReceiptEmail(user.email, user.name, pdfBuffer);
      }
    }
    // ------------------------------

    res.status(200).json({
      success: true,
      message: 'Payment verified and receipt sent to inbox.',
      data: verification
    });
  } catch (error) {
    console.error('eSewa payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

export default router;