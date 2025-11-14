import { Link } from 'react-router-dom';
import { useGetMyCampaignsQuery } from '../services/api';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ensureSocketConnected } from '../services/socket';
import { FiEdit, FiTrash2, FiEye, FiClock } from 'react-icons/fi';

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
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">My Campaigns</h1>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't created any campaigns yet.</p>
          <Link
            to="/create-campaign"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Create Your First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
            const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={campaign._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {campaign.images && campaign.images.length > 0 && (
                  <img
                    src={`http://localhost:5000/${campaign.images[0]}`}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                      {campaign.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      रु {campaign.raisedAmount?.toLocaleString()} / रु {campaign.goalAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/campaign/${campaign._id}`}
                      className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    {campaign.status !== 'completed' && campaign.status !== 'rejected' && (
                      <Link
                        to={`/edit-campaign/${campaign._id}`}
                        className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCampaigns;

