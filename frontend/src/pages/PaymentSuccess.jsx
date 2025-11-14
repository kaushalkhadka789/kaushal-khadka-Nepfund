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
    const campaignIdParam = searchParams.get('campaignId');
    
    // Prevent duplicate processing (React StrictMode can cause double renders)
    if (pidx && campaignIdParam && !hasProcessed.current && !verified && !verifying) {
      hasProcessed.current = true; // Mark as processing
      setCampaignId(campaignIdParam);
      setVerifying(true); // Set verifying state immediately
      verifyAndCreateDonation(pidx, campaignIdParam);
    } else if (!pidx || !campaignIdParam) {
      // No payment parameters - not a payment success page
      setVerifying(false);
      setVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const verifyAndCreateDonation = async (pidx, cId) => {
    try {
      // Verify payment with Khalti
      const verifyResponse = await axios.post(
        '/api/payment/khalti/verify',
        { pidx },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if verification was successful
      // Khalti API returns status in different possible formats
      const verificationData = verifyResponse.data?.data || verifyResponse.data;
      const paymentStatus = verificationData?.status || verificationData?.state;
      const isCompleted = paymentStatus === 'Completed' || paymentStatus === 'completed' || paymentStatus === 'COMPLETED';
      
      // Also check if the response indicates success
      const isSuccessful = verifyResponse.data?.success !== false && isCompleted;

      if (isSuccessful) {
        // Extract amount - handle different possible response structures
        const amountInPaisa = verificationData?.total_amount || verificationData?.amount || 0;
        const amount = amountInPaisa / 100; // Convert from paisa to NPR
        
        if (amount <= 0) {
          console.error('Invalid amount from payment verification:', verificationData);
          throw new Error('Invalid payment amount received');
        }
        
        try {
          // Create donation record
          const result = await createDonation({
            campaignId: cId,
            amount: amount,
            paymentMethod: 'khalti',
            paymentId: pidx,
            isAnonymous: false,
            message: '',
          }).unwrap();

          setVerified(true);
          setVerifying(false);
          
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
        } catch (donationError) {
          // If donation creation fails but payment was verified, don't show error
          // The payment was successful, so show success message
          console.error('Donation creation error:', donationError);
          
          // Check if it's a duplicate error (payment already processed)
          if (donationError?.data?.message?.includes('already') || donationError?.data?.message?.includes('duplicate')) {
            setVerified(true);
            setVerifying(false);
            toast.success('Payment already processed. Thank you for your donation!', { duration: 4000 });
          } else {
            // Real error - payment verified but donation creation failed
            setVerifying(false);
            hasProcessed.current = false;
            toast.error('Payment verified but failed to record donation. Please contact support.', { duration: 6000 });
          }
        }
      } else {
        // Payment verification failed or status is not completed
        setVerifying(false);
        hasProcessed.current = false; // Reset on failure
        const errorMessage = verificationData?.status || 'Payment status unknown';
        toast.error(`Payment verification failed: ${errorMessage}`, { duration: 5000 });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerifying(false);
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

