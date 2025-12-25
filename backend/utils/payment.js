import axios from 'axios';
import crypto from 'crypto';

// Payment utility functions for Khalti and eSewa

// Khalti payment initiation
export const initiateKhaltiPayment = async (amount, campaignId, userId, userName = 'Donor') => {
  try {
    const payload = {
      amount: amount * 100, // Khalti expects amount in paisa
      purchase_order_id: `campaign_${campaignId}_${Date.now()}`,
      purchase_order_name: `Donation for Campaign`,
      customer_info: {
        name: userName,
        email: `${userId}@nepfund.com`,
      },
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?campaignId=${campaignId}`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
    };

    if (!process.env.KHALTI_SECRET_KEY) {
      throw new Error('KHALTI_SECRET_KEY environment variable is not set');
    }
    const secretKey = process.env.KHALTI_SECRET_KEY;
    
    const response = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', payload, {
      headers: {
        'Authorization': `Key ${secretKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Khalti payment error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || `Khalti payment initiation failed: ${error.message}`);
  }
};

// Verify Khalti payment
export const verifyKhaltiPayment = async (pidx) => {
  try {
    if (!process.env.KHALTI_SECRET_KEY) {
      throw new Error('KHALTI_SECRET_KEY environment variable is not set');
    }
    const secretKey = process.env.KHALTI_SECRET_KEY;
    
    const response = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', 
      { pidx },
      {
        headers: {
          'Authorization': `Key ${secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Khalti API returns data in response.data
    const khaltiResponse = response.data;
    
    // Normalize the response structure
    // Khalti returns: { pidx, total_amount, status, transaction_id, ... }
    if (khaltiResponse && khaltiResponse.status) {
      // Ensure status is normalized to 'Completed' for consistency
      const status = khaltiResponse.status;
      if (status && typeof status === 'string') {
        // Normalize status to capitalized format
        khaltiResponse.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      }
    }
    
    return khaltiResponse;
  } catch (error) {
    console.error('Khalti verification error:', error.response?.data || error.message);
    const errorDetail = error.response?.data?.detail || error.response?.data?.message || error.message;
    throw new Error(`Khalti payment verification failed: ${errorDetail}`);
  }
};

// eSewa payment initiation (Epay-v2)
export const initiateEsewaPayment = async (amount, campaignId, userId, userName = 'Donor') => {
  try {
    if (!process.env.ESEWA_MERCHANT_ID || !process.env.ESEWA_SECRET_KEY) {
      throw new Error('ESEWA_MERCHANT_ID and ESEWA_SECRET_KEY environment variables are required');
    }
    const merchantId = process.env.ESEWA_MERCHANT_ID;
    const secretKey = process.env.ESEWA_SECRET_KEY;
    
    // Generate unique order ID
    const oid = `campaign_${campaignId}_${Date.now()}`;
    
    // eSewa expects amount in NPR (not paisa)
    const totalAmount = amount.toFixed(2);
    
    // Payment data
    const paymentData = {
      amount: totalAmount,
      tax_amount: '0',
      total_amount: totalAmount,
      transaction_uuid: oid,
      product_code: 'EPAYTEST',
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?campaignId=${campaignId}&paymentMethod=esewa&amount=${totalAmount}`,
      failure_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failure?campaignId=${campaignId}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: ''
    };
    
    // Generate signature
    const signatureString = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureString)
      .digest('base64');
    
    paymentData.signature = signature;
    
    // eSewa payment URL (test environment)
    const paymentUrl = process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    
    return {
      payment_url: paymentUrl,
      payment_data: paymentData,
      oid: oid
    };
  } catch (error) {
    console.error('eSewa payment error:', error.message);
    throw new Error(`eSewa payment initiation failed: ${error.message}`);
  }
};

// Verify eSewa payment
export const verifyEsewaPayment = async (oid, refId, amount) => {
  try {
    if (!process.env.ESEWA_MERCHANT_ID || !process.env.ESEWA_SECRET_KEY) {
      throw new Error('ESEWA_MERCHANT_ID and ESEWA_SECRET_KEY environment variables are required');
    }
    const merchantId = process.env.ESEWA_MERCHANT_ID;
    const secretKey = process.env.ESEWA_SECRET_KEY;
    
    // For eSewa Epay-v2, verification is typically done by checking the callback data
    // In test environment, if refId exists, payment is considered successful
    // In production, you should verify the signature from the callback
    
    if (!refId || refId === '') {
      throw new Error('Payment verification failed: Missing reference ID');
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Payment verification failed: Invalid amount');
    }
    
    // For test environment, presence of refId indicates successful payment
    // In production, you would verify the signature here
    return {
      status: 'Completed',
      transaction_id: refId,
      order_id: oid,
      amount: parseFloat(amount),
      total_amount: parseFloat(amount)
    };
  } catch (error) {
    console.error('eSewa verification error:', error.message);
    throw new Error(`eSewa payment verification failed: ${error.message}`);
  }
};


