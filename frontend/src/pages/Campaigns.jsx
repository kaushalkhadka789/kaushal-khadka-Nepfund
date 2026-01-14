import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import {
  FiSearch,
  FiHeart,
  FiClock,
  FiTrendingUp,
  FiAlertCircle,
  FiFilter
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = 'http://localhost:5000/';

/* ==================== Loading Skeleton ==================== */
const CampaignSkeleton = () => (
  <div className="bg-white overflow-hidden shadow-sm border border-gray-100">
    <div className="h-56 bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-4">
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
      <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse mt-4" />
      <div className="flex justify-between mt-2">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

/* ==================== Campaign Card ==================== */
const CampaignCard = ({ campaign, index }) => {
  const progress = Math.min(
    (campaign.raisedAmount / campaign.goalAmount) * 100,
    100
  ).toFixed(1);

  const daysLeft = Math.ceil(
    (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const isUrgent = campaign.isUrgent || daysLeft < 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="
        group
        bg-white
        overflow-hidden
        shadow-sm
        hover:shadow-xl
        border border-gray-100
        transition-all duration-300
        flex flex-col
        h-full
      "
    >
      <Link to={`/campaign/${campaign._id}`} className="block relative h-56 overflow-hidden">
        {campaign.images?.length ? (
          <img
            src={`${BASE_URL}${campaign.images[0]}`}
            alt={campaign.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
            <FiHeart className="w-12 h-12 opacity-20" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-700 text-xs font-bold rounded-full shadow-sm uppercase tracking-wide">
            {campaign.category}
          </span>
        </div>

        {isUrgent && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1 animate-pulse">
              <FiAlertCircle /> Urgent
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <Link to={`/campaign/${campaign._id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
            {campaign.description}
          </p>
        </Link>

        <div className="mt-auto">
          <div className="mb-2 flex justify-between items-end">
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              {progress}% Raised
            </span>
            <span className="text-xs font-bold text-gray-700">
              रु {campaign.raisedAmount?.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isUrgent
                  ? 'bg-gradient-to-r from-red-500 to-pink-600'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600'
              }`}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <FiClock className={daysLeft < 3 ? 'text-red-500' : ''} />
              <span className={daysLeft < 3 ? 'text-red-600 font-medium' : ''}>
                {daysLeft > 0 ? `${daysLeft} Days Left` : 'Ended'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <FiTrendingUp className="text-green-500" />
              <span>{campaign.donorCount || 0} Donors</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ==================== Main Component ==================== */
const Campaigns = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, error } = useGetCampaignsQuery({
    status: 'approved',
    search: debouncedSearch || undefined,
    sortBy: 'createdAt',
    limit: 24
  });
  
  const campaigns = data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero & Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            Find a Cause You <span className="text-primary-600">Love</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto"
          >
            Browse through hundreds of impactful campaigns and help make the world a better place today.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by title, category, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 focus:bg-white transition-all shadow-sm hover:shadow-md"
            />
            {/* Optional: Filter Icon Button */}
            <div className="absolute inset-y-2 right-2">
              <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100 text-gray-500">
                <FiFilter className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : 'Trending Campaigns'}
            <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">
              {campaigns.length}
            </span>
          </h2>
          {/* Sort Dropdown could go here */}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <CampaignSkeleton key={i} />)}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
            <div className="inline-flex p-4 rounded-full bg-red-50 text-red-500 mb-4">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Unable to load campaigns</h3>
            <p className="text-gray-500 mt-2">Something went wrong while fetching the data.</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && campaigns.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
              <FiSearch className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No campaigns found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms or browse all categories.</p>
            <button onClick={() => setSearch('')} className="mt-4 text-primary-600 font-medium hover:underline">
              Clear Search
            </button>
          </div>
        )}

        {/* Campaigns Grid */}
        {!isLoading && !error && campaigns.length > 0 && (
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {campaigns.map((campaign, index) => (
                <CampaignCard key={campaign._id} campaign={campaign} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;