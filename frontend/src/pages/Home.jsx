// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useGetCampaignsQuery } from '../services/api';
// import { FiSearch, FiFilter, FiHeart, FiClock, FiUser } from 'react-icons/fi';

// const categories = [
//   'Medical & Health Emergency',
//   'Education Support',
//   'Natural Disaster Relief',
//   'Child Welfare',
//   'Women Empowerment',
//   'Animal Rescue & Shelter',
//   'Environmental Conservation',
//   'Rural Infrastructure Development',
//   'Startup & Innovation',
//   'Sports & Talent Support',
//   'Community Projects',
//   'Elderly Care & Support',
//   'Emergency Shelter / Housing',
//   'Social Cause / Awareness Campaigns',
//   'Memorial & Tribute Campaigns',
// ];

// const Home = () => {
//   const [search, setSearch] = useState('');
//   const [category, setCategory] = useState('');
//   const [sortBy, setSortBy] = useState('createdAt');

//   const { data, isLoading, error } = useGetCampaignsQuery({
//     status: 'approved',
//     category: category || undefined,
//     search: search || undefined,
//     sortBy,
//     limit: 12,
//   });

//   const campaigns = data?.data || [];

//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 mb-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-5xl md:text-6xl font-bold mb-6">
//               Support Local Causes in Nepal
//             </h1>
//             <p className="text-xl md:text-2xl mb-8 text-primary-100">
//               Help make a difference in your community through transparent crowdfunding
//             </p>
//             <div className="flex justify-center space-x-4">
//               <Link
//                 to="/create-campaign"
//                 className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg"
//               >
//                 Start a Campaign
//               </Link>
//               <Link
//                 to="/#campaigns"
//                 className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition shadow-lg"
//               >
//                 Browse Campaigns
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Search and Filters */}
//         <div className="mb-8 space-y-4">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search campaigns..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//             />
//           </div>
//           <select
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           >
//             <option value="">All Categories</option>
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//           <select
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
//           >
//             <option value="createdAt">Newest</option>
//             <option value="raisedAmount">Most Funded</option>
//             <option value="donorCount">Most Popular</option>
//           </select>
//         </div>
//         </div>

//         {/* Campaigns Grid */}
//         {isLoading ? (
//           <div className="text-center py-12">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-red-600">
//             Error loading campaigns
//           </div>
//         ) : campaigns.length === 0 ? (
//           <div className="text-center py-12 text-gray-500">
//             No campaigns found
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {campaigns.map((campaign) => {
//             const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
//             const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));

//             return (
//               <Link
//                 key={campaign._id}
//                 to={`/campaign/${campaign._id}`}
//                 className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
//               >
//                 {campaign.images && campaign.images.length > 0 && (
//                   <img
//                     src={`http://localhost:5000/${campaign.images[0]}`}
//                     alt={campaign.title}
//                     className="w-full h-48 object-cover"
//                   />
//                 )}
//                 <div className="p-6">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
//                       {campaign.category}
//                     </span>
//                     {campaign.isUrgent && (
//                       <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
//                         Urgent
//                       </span>
//                     )}
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
//                     {campaign.title}
//                   </h3>
//                   <p className="text-gray-600 text-sm mb-4 line-clamp-2">
//                     {campaign.description}
//                   </p>
//                   <div className="mb-4">
//                     <div className="flex justify-between text-sm mb-1">
//                       <span className="text-gray-600">Progress</span>
//                       <span className="font-semibold">{progress}%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-primary-600 h-2 rounded-full"
//                         style={{ width: `${Math.min(progress, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                   <div className="flex justify-between items-center text-sm text-gray-600">
//                     <div className="flex items-center space-x-1">
//                       <FiHeart className="w-4 h-4" />
//                       <span>रु {campaign.raisedAmount?.toLocaleString()} / रु {campaign.goalAmount?.toLocaleString()}</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <FiClock className="w-4 h-4" />
//                       <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//           </div>
//         )}
//       </div>

//       {/* Stats Section */}
//       <div className="mt-16 bg-gray-100 py-12 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//             <div>
//               <div className="text-4xl font-bold text-primary-600 mb-2">
//                 {campaigns.length}+
//               </div>
//               <div className="text-gray-600">Active Campaigns</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-green-600 mb-2">
//                 रु {campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0).toLocaleString()}
//               </div>
//               <div className="text-gray-600">Total Raised</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-purple-600 mb-2">
//                 {campaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0)}+
//               </div>
//               <div className="text-gray-600">Total Donors</div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;



import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiHeart, FiClock, FiAlertCircle } from 'react-icons/fi';
import { ensureSocketConnected } from '../services/socket';
import {
  FaHospital, FaBook, FaHouseDamage, FaChild, FaFemale, FaPaw, FaLeaf,
  FaTools, FaLightbulb, FaMedal, FaUsers, FaUserClock, FaHome, FaBullhorn, FaHandsHelping
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SuccessStories from '../components/SuccessStories';
import HowItWorks from '../components/HowItWorks';

// category data with icons - will be translated in component
const categoryKeys = [
  { key: 'medical', icon: <FaHospital /> },
  { key: 'education', icon: <FaBook /> },
  { key: 'disaster', icon: <FaHouseDamage /> },
  { key: 'child', icon: <FaChild /> },
  { key: 'women', icon: <FaFemale /> },
  { key: 'animal', icon: <FaPaw /> },
  { key: 'environment', icon: <FaLeaf /> },
  { key: 'infrastructure', icon: <FaTools /> },
  { key: 'startup', icon: <FaLightbulb /> },
  { key: 'sports', icon: <FaMedal /> },
  { key: 'community', icon: <FaUsers /> },
  { key: 'elderly', icon: <FaUserClock /> },
  { key: 'housing', icon: <FaHome /> },
  { key: 'social', icon: <FaBullhorn /> },
  { key: 'memorial', icon: <FaHandsHelping /> },
];

const categoryNames = [
  'Medical & Health Emergency',
  'Education Support',
  'Natural Disaster Relief',
  'Child Welfare',
  'Women Empowerment',
  'Animal Rescue & Shelter',
  'Environmental Conservation',
  'Rural Infrastructure Development',
  'Startup & Innovation',
  'Sports & Talent Support',
  'Community Projects',
  'Elderly Care & Support',
  'Emergency Shelter / Housing',
  'Social Cause / Awareness Campaigns',
  'Memorial & Tribute Campaigns',
];

const Home = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  const { data, isLoading, error, refetch } = useGetCampaignsQuery({
    status: 'approved',
    category: category || undefined,
    search: search || undefined,
    sortBy,
    limit: 12,
  });

  // Fetch urgent campaigns separately
  const { data: urgentData, isLoading: urgentLoading } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    limit: 6,
    sortBy: 'createdAt',
  });

  const initialCampaigns = useMemo(() => {
    const allCampaigns = data?.data || [];
    // Filter out urgent campaigns - they appear only in Urgent Causes section
    const nonUrgentCampaigns = allCampaigns.filter((campaign) => !campaign.isUrgent);
    return nonUrgentCampaigns.slice(0, 6);
  }, [data]);

  const [homeCampaigns, setHomeCampaigns] = useState(initialCampaigns);
  const [urgentCampaigns, setUrgentCampaigns] = useState([]);

  useEffect(() => {
    setHomeCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  // Initialize urgent campaigns
  useEffect(() => {
    if (urgentData?.data) {
      setUrgentCampaigns(urgentData.data.slice(0, 6));
    }
  }, [urgentData]);

  // Real-time: when a campaign gets approved, prepend and cap at 6
  useEffect(() => {
    const socket = ensureSocketConnected();
    if (!socket) return;
    const onApproved = (campaign) => {
      if (!campaign || campaign.status !== 'approved') return;
      
      // If urgent, add to urgent campaigns only
      if (campaign.isUrgent) {
        setUrgentCampaigns((prev) => {
          const filtered = prev.filter((c) => c._id !== campaign._id);
          return [campaign, ...filtered].slice(0, 6);
        });
      } else {
        // Add to regular campaigns only if not urgent
        setHomeCampaigns((prev) => {
          const filtered = prev.filter((c) => c._id !== campaign._id);
          return [campaign, ...filtered].slice(0, 6);
        });
      }
    };
    socket.on('campaign:approved', onApproved);
    return () => {
      socket.off('campaign:approved', onApproved);
    };
  }, [setHomeCampaigns]);

  // Real-time: update campaign progress when donations are made
  useEffect(() => {
    const socket = ensureSocketConnected();
    if (!socket) return;
    const onCampaignUpdate = (updated) => {
      // Update urgent campaigns if the updated campaign is urgent
      if (updated.isUrgent) {
        setUrgentCampaigns((prev) => {
          return prev.map((c) =>
            c._id === updated._id
              ? { ...c, raisedAmount: updated.raisedAmount, goalAmount: updated.goalAmount, donorCount: updated.donorCount, status: updated.status }
              : c
          );
        });
      } else {
        // Update regular campaigns only if the updated campaign is not urgent
        setHomeCampaigns((prev) => {
          return prev.map((c) =>
            c._id === updated._id
              ? { ...c, raisedAmount: updated.raisedAmount, goalAmount: updated.goalAmount, donorCount: updated.donorCount, status: updated.status }
              : c
          );
        });
      }
    };
    socket.on('campaign:updated', onCampaignUpdate);
    return () => {
      socket.off('campaign:updated', onCampaignUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-primary-700/90 to-primary-900/90 text-white py-20 mb-12 overflow-hidden">
        <img
          src="/banner.jpg"
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-6"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-xl md:text-2xl mb-10 text-primary-100"
          >
            {t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center space-x-4"
          >
            <Link
              to="/create-campaign"
              className="px-8 py-3 bg-white text-primary-700 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
            >
              {t('home.hero.startCampaign')}
            </Link>
            <Link
              to="/campaigns"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-md hover:bg-primary-700 hover:scale-105 transition-transform duration-300"
            >
              {t('home.hero.browseCampaigns')}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* URGENT CAUSES SECTION */}
      {urgentCampaigns.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-3xl font-bold text-gray-900">Urgent Causes</h2>
            </div>
            <Link
              to="/urgent-campaigns"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 transition"
            >
              View All
              <span>→</span>
            </Link>
          </div>

          {urgentLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              {urgentCampaigns.slice(0, 4).map((campaign) => {
                const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
                const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isEnded = daysLeft <= 0 || progress >= 100;
                const isCritical = daysLeft > 0 && daysLeft < 10;

                return (
                  <Link
                    key={campaign._id}
                    to={`/campaign/${campaign._id}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative w-full h-48 bg-gray-100">
                        {campaign.images && campaign.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000/${campaign.images[0]}`}
                            alt={campaign.title}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                            {t('home.noImage')}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
                            URGENT
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between mb-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                            {campaign.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-none">{campaign.description}</p>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{t('home.progress')}</span>
                            <span className="font-semibold">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-auto flex justify-between items-center text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FiHeart className="w-4 h-4 text-red-500" />
                            <span>
                              रु {campaign.raisedAmount?.toLocaleString()} / रु{' '}
                              {campaign.goalAmount?.toLocaleString()}
                            </span>
                          </div>
                          <div className={`flex items-center space-x-1 ${isCritical && !isEnded ? 'text-red-600 font-semibold' : ''}`}>
                            <FiClock className="w-4 h-4" />
                            <span>{isEnded ? t('home.ended') : `${daysLeft} ${t('home.daysLeft')}`}</span>
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
      )}

      {/* SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('home.search.placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 shadow-sm"
          >
            <option value="createdAt">{t('home.sort.newest')}</option>
            <option value="raisedAmount">{t('home.sort.mostFunded')}</option>
            <option value="donorCount">{t('home.sort.mostPopular')}</option>
          </select>
        </div>

        {/* CATEGORY SCROLL BAR */}
        <div className="overflow-x-auto scrollbar-hide mb-10">
          <div className="flex space-x-4 min-w-max pb-2">
            <button
              onClick={() => setCategory('')}
              className={`px-5 py-3 rounded-full border font-medium flex items-center gap-2 transition-all ${
                category === ''
                  ? 'bg-primary-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:shadow-sm'
              }`}
            >
              {t('home.category.all')}
            </button>
            {categoryKeys.map((cat, idx) => {
              const catName = categoryNames[idx];
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(catName)}
                  className={`px-5 py-3 rounded-full border font-medium flex items-center gap-2 transition-all ${
                    category === catName
                      ? 'bg-primary-600 text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 hover:bg-primary-50 hover:shadow-sm'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{t(`home.category.${cat.key}`)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-gray-700 font-semibold text-lg">{t('home.loading')}</p>
              <p className="text-gray-500 text-sm">{t('home.loading.wait')}</p>
            </div>
          </div>
        )}

        {/* CAMPAIGNS GRID */}
        {!isLoading && error && (
          <div className="text-center py-12 text-red-600">{t('home.error')}</div>
        )}

        {!isLoading && !error && homeCampaigns.length === 0 && (
          <div className="text-center py-12 text-gray-500">{t('home.noCampaigns')}</div>
        )}

        {!isLoading && !error && homeCampaigns.length > 0 && (
          <motion.div
            id="campaigns"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {homeCampaigns.map((campaign) => {
              const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
              const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <Link
                  key={campaign._id}
                  to={`/campaign/${campaign._id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                  >
                  <div className="relative w-full h-48 bg-gray-100">
                    {campaign.images && campaign.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${campaign.images[0]}`}
                        alt={campaign.title}
                        className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        {t('home.noImage')}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                        {campaign.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-none">{campaign.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('home.progress')}</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FiHeart className="w-4 h-4 text-red-500" />
                        <span>
                          रु {campaign.raisedAmount?.toLocaleString()} / रु{' '}
                          {campaign.goalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-4 h-4" />
                        <span>{daysLeft > 0 ? `${daysLeft} ${t('home.daysLeft')}` : t('home.ended')}</span>
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

      <HowItWorks />
      <SuccessStories />

      {/* STATS SECTION */}
      <div className="mt-16 bg-gradient-to-r from-gray-100 to-gray-200 py-12 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-primary-600 mb-2">
              {homeCampaigns.length}+
            </div>
            <div className="text-gray-600">{t('home.stats.active')}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-green-600 mb-2">
              रु{' '}
              {homeCampaigns
                .reduce((sum, c) => sum + (c.raisedAmount || 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-gray-600">{t('home.stats.raised')}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {homeCampaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0)}+
            </div>
            <div className="text-gray-600">{t('home.stats.donors')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
