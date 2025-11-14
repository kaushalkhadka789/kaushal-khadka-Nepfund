import { useGetTopDonorsQuery } from '../services/api';
import TierBadge from '../components/TierBadge';
import { FiAward, FiHeart, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const TopDonors = () => {
  const { data, isLoading, error } = useGetTopDonorsQuery({ limit: 50 });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">
        Error loading leaderboard
      </div>
    );
  }

  const leaderboard = data?.data || [];

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Top Donors Leaderboard</h1>
        <p className="text-gray-600 text-lg">
          Recognizing our most generous contributors
        </p>
      </div>

      {/* Top 3 Highlight Cards */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 text-center transform scale-95"
          >
            <div className="text-4xl mb-2">🥈</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {leaderboard[1]?.name || 'Anonymous'}
            </div>
            <TierBadge tier={leaderboard[1]?.tier} size="sm" className="mx-auto mb-2" />
            <div className="text-xl font-bold text-primary-600">
              {leaderboard[1]?.points.toLocaleString()} pts
            </div>
            <div className="text-sm text-gray-600">
              {leaderboard[1]?.totalDonations || 0} donations
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-8 text-center transform scale-105 relative"
            style={{
              boxShadow: '0 10px 40px rgba(255, 215, 0, 0.3)',
            }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                🏆 CHAMPION
              </span>
            </div>
            <div className="text-5xl mb-3">🥇</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {leaderboard[0]?.name || 'Anonymous'}
            </div>
            <TierBadge tier={leaderboard[0]?.tier} size="md" className="mx-auto mb-3" />
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {leaderboard[0]?.points.toLocaleString()} pts
            </div>
            <div className="text-sm text-gray-600">
              {leaderboard[0]?.totalDonations || 0} donations
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 text-center transform scale-95"
          >
            <div className="text-4xl mb-2">🥉</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {leaderboard[2]?.name || 'Anonymous'}
            </div>
            <TierBadge tier={leaderboard[2]?.tier} size="sm" className="mx-auto mb-2" />
            <div className="text-xl font-bold text-primary-600">
              {leaderboard[2]?.points.toLocaleString()} pts
            </div>
            <div className="text-sm text-gray-600">
              {leaderboard[2]?.totalDonations || 0} donations
            </div>
          </motion.div>
        </div>
      )}

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Donated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaderboard.map((donor, index) => (
                <motion.tr
                  key={donor.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {getRankIcon(donor.rank)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {donor.avatar ? (
                        <img
                          src={`http://localhost:5000/${donor.avatar}`}
                          alt={donor.name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-500 text-sm">
                            {donor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{donor.name}</div>
                        <div className="text-sm text-gray-500">{donor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TierBadge tier={donor.tier} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {donor.points.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <FiHeart className="w-4 h-4 text-red-500" />
                      {donor.totalDonations}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      रु {donor.totalDonated.toLocaleString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No donors yet. Be the first to make a donation!
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TopDonors;

