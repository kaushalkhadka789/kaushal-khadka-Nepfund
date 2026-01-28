import { useState, useEffect } from 'react';
import { useGetCampaignsQuery } from '../services/api';
import { 
  FiSearch, 
  FiZap, 
  FiFilter, 
  FiAlertCircle 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CampaignCard from '../components/CampaignCard';

// --- Components ---

// 1. Shimmering Skeleton Loader
const CampaignSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-[400px] flex flex-col">
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-6 flex-1 flex flex-col gap-4">
      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
      <div className="mt-auto flex gap-3">
        <div className="h-10 bg-gray-200 rounded-xl flex-1 animate-pulse" />
      </div>
    </div>
  </div>
);

// 2. Filter Badge Component
const FilterBadge = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border whitespace-nowrap ${
      active
        ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200'
        : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
    }`}
  >
    {label}
  </button>
);

const UrgentCampaigns = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Debounce search to prevent API spam
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // API Query
  // Note: Ensure your backend 'useGetCampaignsQuery' actually accepts a 'category' param.
  // If your backend uses a different name (e.g. 'type', 'tag'), change the property name below.
  const { data, isLoading, error, isFetching } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    search: debouncedSearch || undefined,
    // Only pass category if it's NOT 'All'. 
    // Also ensuring we pass the string exactly as the API likely expects it.
    category: selectedCategory !== 'All' ? selectedCategory : undefined, 
    sortBy: 'createdAt',
    limit: 24,
  });

  const campaigns = data?.data || [];
  
  // Quick Filters - defined outside render to stay constant
  const categories = ['All', 'Medical', 'Disaster', 'Education', 'Environment'];

  return (
    <div className="min-h-screen bg-[#FDFBF9] relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-red-50/80 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[200px] left-[-100px] w-[300px] h-[300px] bg-red-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        
        {/* --- Hero Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-6"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100/50 border border-red-200 rounded-full text-red-700 font-bold text-xs uppercase tracking-wider mb-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            Emergency Response
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Every Second <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
              Makes a Difference
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            These campaigns are time-sensitive and require immediate action. 
            Your contribution today can save a life or prevent a disaster.
          </p>
        </motion.div>

        {/* --- Interactive Search & Filter Toolbar --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-4 z-40 mb-12"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-gray-200/50 rounded-3xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              
              {/* Search Field */}
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all shadow-inner"
                  placeholder="Find urgent causes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Category Pills */}
              <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-2 mr-2 text-gray-400 shrink-0">
                    <FiFilter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                  {categories.map((cat) => (
                    <FilterBadge
                      key={cat}
                      label={cat}
                      active={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* --- Content Area --- */}
        <div className="min-h-[400px]">
          
          {/* 1. Loading State (Skeletons) */}
          {(isLoading || isFetching) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <CampaignSkeleton key={i} />
              ))}
            </div>
          )}

          {/* 2. Error State */}
          {!isLoading && error && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm text-center px-4"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <FiAlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load campaigns</h3>
              <p className="text-gray-500 mb-6">Something went wrong while fetching the data.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* 3. Empty State */}
          {!isLoading && !error && campaigns.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <div className="inline-block p-6 rounded-full bg-orange-50 mb-6">
                <FiZap className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No {selectedCategory !== 'All' ? selectedCategory : ''} Campaigns Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                There are currently no urgent campaigns matching your criteria. Try adjusting your filters or search terms.
              </p>
            </motion.div>
          )}

          {/* 4. Campaigns Grid */}
          {!isLoading && !error && campaigns.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {campaigns.map((campaign) => (
                  <motion.div
                    key={campaign._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    }}
                    layout
                    className="h-full"
                  >
                    <div className="h-full transform hover:-translate-y-2 transition-transform duration-300">
                      <CampaignCard 
                        campaign={campaign} 
                        variant="urgent" 
                        showDonateButton={true}
                      />
                      {/* View Details section removed as requested */}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UrgentCampaigns;