import { Link } from 'react-router-dom';
import { useGetMyCampaignsQuery } from '../services/api';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ensureSocketConnected } from '../services/socket';
import { FiEdit, FiTrash2, FiEye, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MyCampaigns = () => {
  const { data, isLoading, refetch } = useGetMyCampaignsQuery();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const socket = ensureSocketConnected({ userId: user?._id, role: 'user' });
    if (!socket) return;

    const onCampaignUpdated = () => {
      refetch();
    };

    socket.on('campaign:updated', onCampaignUpdated);
    return () => {
      socket.off('campaign:updated', onCampaignUpdated);
    };
  }, [user?._id, refetch]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading your campaigns...</p>
      </div>
    );
  }

  // NOTE: Logic preserved - filtering out rejected campaigns
  const campaigns = (data?.data || []).filter((c) => c.status !== 'rejected');

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50/50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-10">
        My Campaigns
      </h1>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-100">
          <p className="text-gray-500 text-lg mb-6">You haven't created any campaigns yet. Start your mission now!</p>
          <Link
            to="/create-campaign"
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-full font-semibold shadow-lg hover:bg-primary-700 transition transform hover:scale-[1.02]"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100);
            const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isEnded = daysLeft <= 0 || progress >= 100;
            const canEdit = campaign.status !== 'completed' && campaign.status !== 'rejected';

            return (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
              >
                {/* Image Header - Fixed height h-44 for rectangular card */}
                <div className="relative w-full h-44 overflow-hidden">
                  {campaign.images && campaign.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/${campaign.images[0]}`}
                      alt={campaign.title}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />
                  ) : (
                     <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-medium">No Image</div>
                  )}
                  
                  {/* Category Badge - Top Left */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full shadow-sm">
                      {campaign.category}
                    </span>
                  </div>

                  {/* Status Badge - Top Right */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                {/* Content Body - p-4 for consistency */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  {/* Progress Section */}
                  <div className="my-3 flex-none">
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold text-primary-700">{Math.min(progress, 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Raised: <span className="font-semibold text-gray-800">रु {campaign.raisedAmount?.toLocaleString()}</span> / Goal: <span className="font-semibold text-gray-800">रु {campaign.goalAmount?.toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Days Left */}
                  <div className="flex items-center text-sm text-gray-600 mt-auto pt-3 border-t border-gray-100">
                    <FiClock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{isEnded ? 'Campaign Ended' : `${daysLeft} days left`}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-4">
                    <Link
                      to={`/campaign/${campaign._id}`}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View Campaign</span>
                    </Link>
                    {canEdit && (
                      <Link
                        to={`/edit-campaign/${campaign._id}`}
                        className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>Edit Details</span>
                      </Link>
                    )}
                    {/* Trash icon maintained for future logic if delete functionality is added */}
                    {/* {!canEdit && (
                        <button disabled className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 text-sm bg-red-100 text-red-400 rounded-lg cursor-not-allowed">
                            <FiTrash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>
                    )} */}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;