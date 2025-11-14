import { Link } from 'react-router-dom';
import { useGetMyDonationsQuery, useGetMyRewardsQuery } from '../services/api';
import { FiHeart, FiCalendar, FiAward } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const MyDonations = () => {
  const { data, isLoading } = useGetMyDonationsQuery();
  const user = useSelector((state) => state.auth.user);
  const { data: rewardsData } = useGetMyRewardsQuery(undefined, {
    skip: !user,
  });
  
  const userPoints = user?.rewardPoints || 0;
  const userTier = rewardsData?.data?.tier || getTier(userPoints);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Hide rows for deleted campaigns
  const donations = (data?.data || []).filter((d) => !!d.campaign);
  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">My Donations</h1>
          {userTier && (
            <TierBadge tier={userTier} size="md" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2">
              <FiHeart className="w-6 h-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-primary-600">
                  रु {totalDonated.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2">
              <FiAward className="w-6 h-6 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Reward Points</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-2">
              <FiHeart className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-red-500">
                  {donations.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">You haven't made any donations yet.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Browse Campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div
              key={donation._id}
              className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 flex-1">
                {donation.campaign?.images && donation.campaign.images.length > 0 && (
                  <img
                    src={`http://localhost:5000/${donation.campaign.images[0]}`}
                    alt={donation.campaign.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <Link
                    to={`/campaign/${donation.campaign?._id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition"
                  >
                    {donation.campaign?.title}
                  </Link>
                  <p className="text-sm text-gray-600 mb-1">
                    {donation.campaign?.category}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {donation.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  रु {donation.amount.toLocaleString()}
                </p>
                <p className={`text-sm ${donation.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                  {donation.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDonations;

