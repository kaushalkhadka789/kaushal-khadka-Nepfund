import axios from 'axios';

// Payment utility functions for Khalti only

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

    const secretKey = process.env.KHALTI_SECRET_KEY || 'b7d8e3859c5f4c5ca5956698f87adbf5';
    
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
    const secretKey = process.env.KHALTI_SECRET_KEY || 'b7d8e3859c5f4c5ca5956698f87adbf5';
    
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


