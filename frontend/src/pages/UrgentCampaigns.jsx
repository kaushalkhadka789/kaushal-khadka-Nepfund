import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiClock, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

        {/* Campaigns Grid - Matched to Home.jsx Layout */}
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
            {campaigns.map((campaign) => {
              const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100);
              const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isEnded = daysLeft <= 0 || progress >= 100;

              return (
                <Link key={campaign._id} to={`/campaign/${campaign._id}`} className="group h-full block">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    // Matches Home.jsx styles: rounded-xl, shadow-sm, border
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-red-100 h-full flex flex-col"
                  >
                    {/* Image Header - Fixed height h-44 */}
                    <div className="relative h-44 overflow-hidden">
                      {campaign.images && campaign.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000/${campaign.images[0]}`}
                          alt={campaign.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                          {t('home.noImage')}
                        </div>
                      )}
                      
                      {/* Floating Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="backdrop-blur-md bg-white/90 text-red-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          {campaign.category}
                        </span>
                      </div>

                      {/* Floating Status Badge (Right) */}
                      <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md flex items-center gap-1 ${isEnded ? 'bg-gray-800/80 text-white' : 'bg-red-600 text-white'}`}>
                            {isEnded ? t('home.ended') : (
                                <>
                                    <FiZap className="w-3 h-3 fill-current" /> Urgent
                                </>
                            )}
                          </span>
                      </div>
                    </div>

                    {/* Body - reduced padding p-4 */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{campaign.description}</p>

                      {/* Progress Section */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-2">
                           <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-semibold uppercase">Raised</span>
                              <span className="text-red-700 font-bold text-sm">
                                {Math.min(progress, 100).toFixed(0)}%
                              </span>
                           </div>
                           <div className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                             <FiClock className="mr-1 w-3 h-3" />
                             {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
                           </div>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {/* Stats Footer - Grid Layout */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                           <div>
                             <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Raised</p>
                             <p className="font-bold text-gray-900 text-sm truncate">रु {campaign.raisedAmount?.toLocaleString()}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">Goal</p>
                             <p className="font-bold text-gray-900 text-sm truncate">रु {campaign.goalAmount?.toLocaleString()}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UrgentCampaigns;