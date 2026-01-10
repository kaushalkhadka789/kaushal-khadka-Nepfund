import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiClock, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CampaignCard from '../components/CampaignCard';

const UrgentCampaigns = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    search: search || undefined,
    sortBy: 'createdAt',
    limit: 24,
  });

  const campaigns = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-lg">
            <FiZap className="w-6 h-6 text-yellow-300 animate-pulse" />
            <span className="text-white font-bold text-lg tracking-wide">URGENT CAUSES</span>
            <FiZap className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 bg-clip-text text-transparent">
            Every Second Counts
          </h1>
          <p className="text-gray-700 text-xl max-w-2xl mx-auto leading-relaxed">
            Time-sensitive campaigns that need your immediate support to make a life-changing impact
          </p>
        </motion.div>

        {/* Enhanced Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative group">
            <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-red-600 transition-colors" />
            <input
              type="text"
              placeholder="Search urgent campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all shadow-md hover:shadow-lg bg-white"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading urgent campaigns...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12 px-6 bg-red-50 border-2 border-red-200 rounded-2xl"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiZap className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-semibold text-lg">Error loading urgent campaigns</p>
            <p className="text-gray-600 mt-2">Please try again later</p>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && campaigns.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl shadow-xl"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiZap className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Urgent Campaigns</h3>
            <p className="text-gray-600 text-lg">Check back soon for time-sensitive causes that need your help</p>
          </motion.div>
        )}

        {/* Campaigns Grid - New CampaignCard Design */}
        {!isLoading && !error && campaigns.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign._id} 
                campaign={campaign} 
                variant="grid"
                showDonateButton={false}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UrgentCampaigns;