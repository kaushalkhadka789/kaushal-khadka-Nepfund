import { useGetMyRewardsQuery } from '../services/api';
import TierBadge from '../components/TierBadge';
import { FiAward, FiTrendingUp, FiClock, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MyRewards = () => {
  const { data, isLoading, error } = useGetMyRewardsQuery();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
        Error loading rewards
      </div>
    );
  }

  const rewards = data?.data;
  if (!rewards) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        No rewards data available
      </div>
    );
  }

  const { points, tier, tierProgress, totalDonations, recentTransactions } = rewards;
  const { currentTier, nextTier, progress, pointsNeeded, amountNeeded } = tierProgress;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Rewards</h1>
        <Link
          to="/top-donors"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
        >
          <FiTrendingUp />
          View Leaderboard
        </Link>
      </div>

      {/* Tier Badge and Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Donor Status</h2>
            <div className="flex items-center gap-4">
              <TierBadge tier={tier} size="lg" />
              <div className="text-3xl font-bold text-gray-700">
                {points.toLocaleString()} <span className="text-lg text-gray-500">points</span>
              </div>
            </div>
          </div>
          <div className="text-6xl">
            {tier.icon}
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier ? (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to {nextTier.name} Tier</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-3 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${tier.color} 0%, ${nextTier.color} 100%)`,
                }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Donate NPR {amountNeeded.toLocaleString()} more to reach {nextTier.name} Tier! ({pointsNeeded} points needed)
            </p>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800">
              🎉 Congratulations! You've reached the highest tier!
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-700">
            You are a <span className="text-primary-600">{tier.name} Donor</span>.
            {nextTier && ` Donate NPR ${amountNeeded.toLocaleString()} more to reach ${nextTier.name}!`}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 text-center"
        >
          <FiAward className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{points.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 text-center"
        >
          <FiHeart className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalDonations}</div>
          <div className="text-sm text-gray-600">Total Donations</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 text-center"
        >
          <FiTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{tier.name}</div>
          <div className="text-sm text-gray-600">Current Tier</div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      {recentTransactions && recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiClock className="w-5 h-5" />
            Recent Reward Transactions
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{tx.campaignTitle}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+{tx.pointsEarned} pts</p>
                  <p className="text-sm text-gray-500">
                    NPR {tx.donationAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyRewards;

