import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateDonationMutation, useGetMyRewardsQuery } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiAward } from 'react-icons/fi';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [createDonation] = useCreateDonationMutation();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [campaignId, setCampaignId] = useState('');
  const [rewardInfo, setRewardInfo] = useState(null);
  const hasProcessed = useRef(false); // Prevent duplicate processing
  
  // Refetch rewards after donation to get updated tier
  const { data: rewardsData, refetch: refetchRewards } = useGetMyRewardsQuery(undefined, {
    skip: !verified,
  });

  useEffect(() => {
    const pidx = searchParams.get('pidx');
    const oid = searchParams.get('oid');
    const refId = searchParams.get('refId');
    const campaignIdParam = searchParams.get('campaignId');
    const paymentMethod = searchParams.get('paymentMethod') || 'khalti';
    
    // eSewa sometimes appends data with ? instead of &, so we need to parse the full URL
    let dataParam = searchParams.get('data');
    if (!dataParam && paymentMethod === 'esewa') {
      // Try to extract data from the full URL string (eSewa might use ?data= instead of &data=)
      const fullUrl = window.location.href;
      // Try multiple patterns to find the data parameter
      const patterns = [
        /[?&]data=([^&?#]+)/,  // Standard pattern
        /\?data=([^?#]+)/,     // Pattern with ? at start
        /data=([^&?#]+)/        // Simple pattern
      ];
      
      for (const pattern of patterns) {
        const match = fullUrl.match(pattern);
        if (match && match[1]) {
          dataParam = decodeURIComponent(match[1]);
          console.log('Extracted data param from URL using pattern:', pattern);
          break;
        }
      }
      
      // If still not found, try splitting by ? and looking for data=
      if (!dataParam) {
        const urlParts = fullUrl.split('?');
        for (let i = 1; i < urlParts.length; i++) {
          const part = urlParts[i];
          if (part.startsWith('data=')) {
            dataParam = decodeURIComponent(part.substring(5).split('&')[0].split('#')[0]);
            console.log('Extracted data param by splitting URL');
            break;
          }
        }
      }
    }
    
    // Prevent duplicate processing (React StrictMode can cause double renders)
    if (paymentMethod === 'khalti' && pidx && campaignIdParam && !hasProcessed.current && !verified) {
      hasProcessed.current = true;
      setCampaignId(campaignIdParam);
      setVerifying(true);
      verifyAndCreateDonation(pidx, campaignIdParam, 'khalti');
    } else if (paymentMethod === 'esewa' && campaignIdParam && !hasProcessed.current && !verified) {
      // eSewa can send data in two ways:
      // 1. As a 'data' parameter (base64 encoded JSON)
      // 2. As direct query parameters (oid, refId, amt)
      let esewaOid = oid;
      let esewaRefId = refId;
      // Try to get amount from URL first (we set it in success_url)
      let esewaAmount = searchParams.get('amt') || searchParams.get('amount');
      
      // If data parameter exists, decode it
      if (dataParam) {
        try {
          console.log('Processing eSewa data param, length:', dataParam.length);
          
          // Clean the data param - remove any trailing fragments or extra characters
          let cleanData = dataParam.trim();
          
          // Try URL decode first (eSewa might URL-encode the base64 string)
          let base64String = cleanData;
          try {
            // Try decoding multiple times in case of double encoding
            base64String = decodeURIComponent(cleanData);
            // If that worked, try once more in case of double encoding
            try {
              base64String = decodeURIComponent(base64String);
            } catch (e) {
              // Single encoding, that's fine
            }
          } catch (e) {
            // If URL decode fails, use original (might already be decoded)
            base64String = cleanData;
          }
          
          // Base64 decode and parse JSON
          const decodedData = JSON.parse(atob(base64String));
          
          console.log('Successfully decoded eSewa data:', decodedData);
          
          // eSewa data structure: typically contains transaction_code (refId), status, etc.
          // transaction_code is the reference ID we need
          if (decodedData.transaction_code) {
            esewaRefId = decodedData.transaction_code;
            console.log('Found transaction_code:', esewaRefId);
          } else {
            esewaRefId = decodedData.reference_id || decodedData.refId || decodedData.referenceId || esewaRefId;
            if (esewaRefId) {
              console.log('Found refId from alternative field:', esewaRefId);
            }
          }
          
          esewaOid = decodedData.transaction_uuid || decodedData.oid || decodedData.uuid || esewaOid;
          
          // Amount might not be in the data, so keep the one from URL if available
          if (decodedData.amount || decodedData.amt || decodedData.total_amount || decodedData.totalAmount) {
            esewaAmount = decodedData.amount || decodedData.amt || decodedData.total_amount || decodedData.totalAmount;
            console.log('Found amount in data:', esewaAmount);
          }
          
          console.log('Final extracted eSewa payment info:', { esewaOid, esewaRefId, esewaAmount });
        } catch (error) {
          console.error('Error decoding eSewa data:', error);
          console.error('Error details:', error.message, error.stack);
          console.log('Raw data param (first 200 chars):', dataParam.substring(0, 200));
          console.log('Full URL:', window.location.href);
          // If decoding fails, try to use direct query params as fallback
        }
      } else {
        console.log('No data parameter found in URL');
      }
      
      // Check if we have the required data
      // For eSewa, refId (transaction_code) is the most important - it proves payment was made
      // If we don't have oid, we can use refId as oid for verification
      // Amount should be available from URL parameter
      if (esewaRefId && esewaAmount) {
        hasProcessed.current = true;
        setCampaignId(campaignIdParam);
        setVerifying(true);

        const oidToUse = esewaOid || esewaRefId;
        console.log('eSewa callback processing:', { oid: esewaOid, refId: esewaRefId, amount: esewaAmount, oidToUse });
        verifyAndCreateDonation(oidToUse, campaignIdParam, 'esewa', { refId: esewaRefId, amount: esewaAmount });
      } else {
        // Log what we have for debugging
        console.log('eSewa payment data extraction:', {
          oid: esewaOid,
          refId: esewaRefId,
          amount: esewaAmount,
          hasDataParam: !!dataParam,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (!hasProcessed.current) {
          // If we don't have required data, show error
          setVerifying(false);
          setVerified(false);
          toast.error('Unable to extract payment information from eSewa callback. Please contact support.');
        }
      }
    } else if (!pidx && !oid && !dataParam) {
      setVerifying(false);
      setVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyAndCreateDonation = async (paymentId, cId, method = 'khalti', esewaData = {}) => {
    try {
      let verifyResponse;
      
      if (method === 'khalti') {
        // Verify payment with Khalti
        verifyResponse = await axios.post(
          '/api/payment/khalti/verify',
          { pidx: paymentId },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (method === 'esewa') {
        // Verify payment with eSewa
        // eSewa sends oid, refId, and amt in callback
        if (!esewaData.refId || !esewaData.amount) {
          throw new Error('Missing eSewa payment data');
        }
        verifyResponse = await axios.post(
          '/api/payment/esewa/verify',
          { 
            oid: paymentId,
            refId: esewaData.refId,
            amount: esewaData.amount
          },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        throw new Error('Invalid payment method');
      }

      // Check if verification was successful
      // Payment API returns status in different possible formats
      const verificationData = verifyResponse.data?.data || verifyResponse.data;
      const paymentStatus = verificationData?.status || verificationData?.state;
      const isCompleted = paymentStatus === 'Completed' || paymentStatus === 'completed' || paymentStatus === 'COMPLETED';
      
      // Also check if the response indicates success
      const isSuccessful = verifyResponse.data?.success !== false && isCompleted;

      if (isSuccessful) {
        // Extract amount - handle different possible response structures
        let amount;
        if (method === 'khalti') {
          const amountInPaisa = verificationData?.total_amount || verificationData?.amount || 0;
          amount = amountInPaisa / 100; // Convert from paisa to NPR
        } else if (method === 'esewa') {
          amount = parseFloat(verificationData?.total_amount || verificationData?.amount || esewaData.amount || 0);
        } else {
          amount = 0;
        }
        
        if (amount <= 0) {
          console.error('Invalid amount from payment verification:', verificationData);
          throw new Error('Invalid payment amount received');
        }
        
        try {
          // Create donation record
          const paymentIdToUse = method === 'khalti' ? paymentId : (esewaData.refId || paymentId);
          const result = await createDonation({
            campaignId: cId,
            amount: amount,
            paymentMethod: method,
            paymentId: paymentIdToUse,
            isAnonymous: false,
            message: '',
          }).unwrap();

          // Check if response indicates success
          if (result && (result.success === true || result.rewardInfo || result.isDuplicate !== undefined)) {
            setVerified(true);
            
            // Store reward information
            if (result.rewardInfo) {
              setRewardInfo(result.rewardInfo);
              // Refetch rewards to get updated tier
              refetchRewards();
            }
            
            // Show toast only once (duplicate check is handled by backend and useRef guard)
            // Backend returns isDuplicate flag if donation already existed
            if (result.isDuplicate) {
              // Donation already exists - payment was already processed
              // Show success but don't show reward info again
              toast.success('Payment already processed. Thank you for your donation!', { duration: 4000 });
            } else if (result.rewardInfo) {
              const tier = getTier(result.rewardInfo.totalPoints);
              toast.success(
                `🎉 Thank you for your donation! You earned ${result.rewardInfo.pointsEarned} points. Your total: ${result.rewardInfo.totalPoints} (${tier.name} Tier).`,
                { duration: 6000 }
              );
            } else {
              toast.success('Thank you for your donation!', { duration: 4000 });
            }
            
            // Redirect to campaign after 5 seconds (give time to see reward info)
            setTimeout(() => {
              navigate(`/campaign/${cId}`);
            }, 5000);
          } else {
            // Response doesn't indicate success, but payment was verified
            // Still show success since payment went through
            console.warn('Donation response format unexpected:', result);
            setVerified(true);
            if (result?.rewardInfo) {
              setRewardInfo(result.rewardInfo);
              refetchRewards();
            }
            toast.success('Thank you for your donation!', { duration: 4000 });
            setTimeout(() => {
              navigate(`/campaign/${cId}`);
            }, 5000);
          }
        } catch (donationError) {
          // Payment was verified successfully, so money went through
          // Even if donation creation has issues, we should show success
          // Log the error for debugging but don't show error to user
          console.error('Donation creation error (payment was verified):', donationError);
          
          // Check error response structure for any useful data
          const errorData = donationError?.data || donationError?.error?.data || {};
          const errorMessage = errorData?.message || donationError?.message || '';
          
          // Always show success since payment was verified
          setVerified(true);
          
          // Try to extract reward info if available in error response
          if (errorData?.rewardInfo) {
            setRewardInfo(errorData.rewardInfo);
            refetchRewards();
          } else {
            // Try to refetch rewards to get updated points
            try {
              refetchRewards();
            } catch (refetchError) {
              console.error('Failed to refetch rewards:', refetchError);
            }
          }
          
          // Show success message (payment went through)
          // Don't show error toast - payment was successful
          if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('duplicate')) {
            toast.success('Payment already processed. Thank you for your donation!', { duration: 4000 });
          } else {
            toast.success('Thank you for your donation!', { duration: 4000 });
          }
          
          // Redirect after showing success
          setTimeout(() => {
            navigate(`/campaign/${cId}`);
          }, 5000);
        }
      } else {
        // Payment verification failed or status is not completed
        hasProcessed.current = false; // Reset on failure
        const errorMessage = verificationData?.status || 'Payment status unknown';
        toast.error(`Payment verification failed: ${errorMessage}`, { duration: 5000 });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      hasProcessed.current = false; // Reset on error so user can retry
      
      // Check if it's a network error or API error
      if (error.response) {
        // API returned an error response
        const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Payment verification failed';
        toast.error(errorMessage, { duration: 5000 });
      } else if (error.request) {
        // Request was made but no response received
        toast.error('Unable to verify payment. Please check your internet connection.', { duration: 5000 });
      } else {
        // Something else happened
        toast.error(error.message || 'Payment verification failed', { duration: 5000 });
      }
    } finally {
      // Always set verifying to false when the function completes
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {verified ? (
          <>
            <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your generous donation. Your contribution will make a real difference.
            </p>
            
            {/* Reward Points Display */}
            {rewardInfo && (
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 mb-6 border-2 border-primary-200">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <FiAward className="w-6 h-6 text-primary-600" />
                  <h3 className="text-lg font-bold text-primary-900">Reward Points Earned!</h3>
                </div>
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    +{rewardInfo.pointsEarned} points
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Points: <span className="font-semibold">{rewardInfo.totalPoints}</span>
                  </div>
                </div>
                {rewardsData?.data?.tier && (
                  <div className="flex items-center justify-center">
                    <TierBadge tier={rewardsData.data.tier} size="md" />
                  </div>
                )}
                {rewardsData?.data?.tierProgress?.nextTier && (
                  <p className="text-sm text-center text-gray-600 mt-3">
                    Donate NPR {rewardsData.data.tierProgress.amountNeeded.toLocaleString()} more to reach {rewardsData.data.tierProgress.nextTier.name} Tier!
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={() => navigate(`/campaign/${campaignId}`)}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              View Campaign
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification</h1>
            <p className="text-gray-600 mb-6">
              There was an issue verifying your payment. Please contact support if the amount was deducted.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Go to Homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;

