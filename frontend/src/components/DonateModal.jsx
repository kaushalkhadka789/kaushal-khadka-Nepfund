import { useState, useEffect } from 'react';
import { useCreateDonationMutation } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const DonateModal = ({ campaign, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [createDonation, { isLoading }] = useCreateDonationMutation();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const goalReached = campaign?.raisedAmount >= campaign?.goalAmount || campaign?.status === 'completed';

  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (goalReached) {
      toast.error('Campaign goal has already been reached');
      onClose();
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (paymentMethod === 'khalti') {
      // Handle Khalti payment
      try {
        setIsProcessing(true);
        const response = await axios.post(
          '/api/payment/khalti/initiate',
          {
            amount: parseFloat(amount),
            campaignId: campaign._id,
          },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data.payment_url) {
          // Redirect to Khalti payment page
          window.location.href = response.data.data.payment_url;
        } else {
          toast.error('Failed to initialize payment');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment initialization failed');
        setIsProcessing(false);
      }
    } else if (paymentMethod === 'esewa') {
      // Handle eSewa payment
      try {
        setIsProcessing(true);
        const response = await axios.post(
          '/api/payment/esewa/initiate',
          {
            amount: parseFloat(amount),
            campaignId: campaign._id,
          },
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data.payment_data) {
          // Create and submit form to eSewa
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = response.data.data.payment_url;
          
          const paymentData = response.data.data.payment_data;
          Object.keys(paymentData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = paymentData[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else {
          toast.error('Failed to initialize payment');
          setIsProcessing(false);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Payment initialization failed');
        setIsProcessing(false);
      }
    }
  };

  // Verification is handled on the dedicated PaymentSuccess page to avoid duplicates

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Support this Campaign</h2>
        <p className="text-gray-600 mb-6">{campaign.title}</p>

        {goalReached && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-center">
            <p className="text-green-700 font-semibold">🎉 Goal Reached!</p>
            <p className="text-sm text-green-600 mt-1">This campaign has reached its funding goal.</p>
          </div>
        )}

        <form onSubmit={handleDonate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount (NPR)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  रु {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="khalti">Khalti</option>
              <option value="esewa">eSewa</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Donate anonymously</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Leave an encouraging message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isProcessing || goalReached}
            className={`w-full py-3 rounded-lg transition font-semibold ${
              goalReached
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50'
            }`}
          >
            {goalReached
              ? 'Goal Reached'
              : isLoading || isProcessing
              ? 'Processing...'
              : `Donate रु ${amount || '0'}`}
          </button>
          {paymentMethod === 'khalti' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              You will be redirected to Khalti payment gateway
            </p>
          )}
          {paymentMethod === 'esewa' && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              You will be redirected to eSewa payment gateway
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default DonateModal;

