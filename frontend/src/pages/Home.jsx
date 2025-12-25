import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiHeart, FiClock, FiZap, FiChevronLeft, FiChevronRight, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { ensureSocketConnected } from '../services/socket';
import {
  FaHospital, FaBook, FaHouseDamage, FaChild, FaFemale, FaPaw, FaLeaf,
  FaTools, FaLightbulb, FaMedal, FaUsers, FaUserClock, FaHome, FaBullhorn, FaHandsHelping
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SuccessStories from '../components/SuccessStories';
import HowItWorks from '../components/HowItWorks';

// category data with icons
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
  
  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Hero carousel images
  const heroImages = [
    '/banner.jpg',
    '/hero-2.jpg',
    '/hero-3.jpg',
    '/hero-4.jpg',
  ];
  
  // Auto-rotate carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, heroImages.length]);
  
  // Navigation functions
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };
  
  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const { data, isLoading, error, refetch } = useGetCampaignsQuery({
    status: 'approved',
    category: category || undefined,
    search: search || undefined,
    sortBy,
    limit: 12,
  });

  // Fetch urgent campaigns
  const { data: urgentData, isLoading: urgentLoading } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    limit: 6,
    sortBy: 'createdAt',
  });

  const initialCampaigns = useMemo(() => {
    const allCampaigns = data?.data || [];
    const nonUrgentCampaigns = allCampaigns.filter((campaign) => !campaign.isUrgent);
    return nonUrgentCampaigns.slice(0, 6);
  }, [data]);

  const [homeCampaigns, setHomeCampaigns] = useState(initialCampaigns);
  const [urgentCampaigns, setUrgentCampaigns] = useState([]);

  useEffect(() => {
    setHomeCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  useEffect(() => {
    if (urgentData?.data) {
      setUrgentCampaigns(urgentData.data.slice(0, 6));
    }
  }, [urgentData]);

  // Real-time: campaign approved
  useEffect(() => {
    const socket = ensureSocketConnected();
    if (!socket) return;
    const onApproved = (campaign) => {
      if (!campaign || campaign.status !== 'approved') return;
      
      if (campaign.isUrgent) {
        setUrgentCampaigns((prev) => {
          const filtered = prev.filter((c) => c._id !== campaign._id);
          return [campaign, ...filtered].slice(0, 6);
        });
      } else {
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

  // Real-time: campaign updated
  useEffect(() => {
    const socket = ensureSocketConnected();
    if (!socket) return;
    const onCampaignUpdate = (updated) => {
      if (updated.isUrgent) {
        setUrgentCampaigns((prev) => {
          return prev.map((c) =>
            c._id === updated._id
              ? { ...c, raisedAmount: updated.raisedAmount, goalAmount: updated.goalAmount, donorCount: updated.donorCount, status: updated.status }
              : c
          );
        });
      } else {
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
    <div className="min-h-screen bg-gray-50/50">
      {/* HERO SECTION - ADJUSTED HEIGHT */}
      <div 
        // Changed h-[600px] to h-[480px] for a smaller, more accessible header
        className="relative h-[480px] overflow-hidden" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        
        {/* Background Images */}
        <AnimatePresence initial={false}>
          {heroImages.map((image, index) => (
            index === currentSlide && (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
              >
                <img
                  src={image}
                  alt="Hero"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        {/* Navigation Controls - Highly Visible - UPDATED Z-INDEX to 30 */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md text-white transition-all transform hover:scale-110">
          <FiChevronLeft className="w-7 h-7" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md text-white transition-all transform hover:scale-110">
          <FiChevronRight className="w-7 h-7" />
        </button>
        
        {/* Content */}
        <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.h1
              key={currentSlide + "title"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              // Reduced text size slightly for the smaller hero section
              className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p
              key={currentSlide + "subtitle"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-100 font-light max-w-2xl mx-auto drop-shadow-md"
            >
              {t('home.hero.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link to="/create-campaign" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-base shadow-lg hover:shadow-primary-600/30 transition-all duration-300">
                {t('home.hero.startCampaign')}
              </Link>
              <Link to="/campaigns" className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-base transition-all duration-300">
                {t('home.hero.browseCampaigns')}
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Dots - UPDATED Z-INDEX to 30 */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </div>

      {/* URGENT CAUSES SECTION - Rectangular Card Adjustments */}
      {urgentCampaigns.length > 0 && (
        <section className="bg-red-50/50 py-16 border-b border-red-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  URGENT CAUSES
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Needs Immediate Attention</h2>
              </div>
              <Link
                to="/urgent-campaigns"
                className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors group"
              >
                View All Urgent <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {urgentLoading ? (
              <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {urgentCampaigns.slice(0, 3).map((campaign) => {
                  const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100);
                  const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Link key={campaign._id} to={`/campaign/${campaign._id}`} className="group h-full">
                      <div className="h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col relative transform hover:-translate-y-0.5">
                        
                        {/* Rectangular Image Area - reduced height */}
                        <div className="relative h-44 overflow-hidden">
                          {campaign.images?.[0] ? (
                            <img
                              src={`http://localhost:5000/${campaign.images[0]}`}
                              alt={campaign.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">{t('home.noImage')}</div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Floating Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1">
                              <FiZap className="fill-current w-3 h-3" /> Urgent
                            </span>
                          </div>
                        </div>

                        {/* Content Area - reduced padding and font size */}
                        <div className="p-4 flex flex-col flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                            {campaign.title}
                          </h3>
                          <p className="text-gray-500 text-xs line-clamp-2 mb-4">{campaign.description}</p>

                          {/* Progress & Stats */}
                          <div className="mt-auto">
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-red-500 to-pink-600 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between text-xs font-medium mb-4 text-gray-700">
                               <span>Raised: {Math.min(progress, 100).toFixed(0)}%</span>
                               <span className="text-red-500 font-semibold">{daysLeft} Days Left</span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                               <div className="flex flex-col">
                                 <span className="text-xs text-gray-400 uppercase font-semibold">Raised</span>
                                 <span className="text-gray-900 font-bold text-sm">रु {campaign.raisedAmount?.toLocaleString()}</span>
                               </div>
                               <div className="flex flex-col text-right">
                                 <span className="text-xs text-gray-400 uppercase font-semibold">Goal</span>
                                 <span className="text-gray-900 font-bold text-sm">रु {campaign.goalAmount?.toLocaleString()}</span>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            
            <div className="mt-8 text-center md:hidden">
               <Link to="/urgent-campaigns" className="inline-flex items-center justify-center px-6 py-3 border border-red-200 text-red-600 font-medium rounded-full hover:bg-red-50 transition-colors w-full">
                 View All Urgent Causes
               </Link>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH & DISCOVER SECTION */}
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-10 sticky top-4 z-30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('home.search.placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-lg transition-all outline-none"
              />
            </div>
            <div className="min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 rounded-lg outline-none cursor-pointer"
              >
                <option value="createdAt">{t('home.sort.newest')}</option>
                <option value="raisedAmount">{t('home.sort.mostFunded')}</option>
                <option value="donorCount">{t('home.sort.mostPopular')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-10">
           <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Explore Categories</h3>
           <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            <div className="flex space-x-3 min-w-max">
              <button
                onClick={() => setCategory('')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 font-medium text-sm ${
                  category === '' 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span>All</span>
              </button>
              {categoryKeys.map((cat, idx) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(categoryNames[idx])}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 font-medium text-sm ${
                    category === categoryNames[idx]
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="whitespace-nowrap">{t(`home.category.${cat.key}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LOADING & ERROR STATES - Simplified for space */}
        {isLoading && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-xl h-[380px] animate-pulse border border-gray-100">
                 <div className="h-40 bg-gray-200 rounded-t-xl"></div>
                 <div className="p-4 space-y-3">
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-3 bg-gray-200 rounded w-full"></div>
                   <div className="h-2 bg-gray-200 rounded-full mt-6"></div>
                 </div>
               </div>
             ))}
           </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-red-500 font-medium mb-2">Oops!</p>
            <p className="text-gray-600">{t('home.error')}</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Try Again</button>
          </div>
        )}

        {!isLoading && !error && homeCampaigns.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <FiSearch className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-500">{t('home.noCampaigns')}</p>
          </div>
        )}

        {/* MAIN CAMPAIGN GRID - Rectangular Card Adjustments */}
        {!isLoading && !error && homeCampaigns.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {homeCampaigns.map((campaign) => {
              const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100);
              const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
              const isEnded = daysLeft <= 0 || progress >= 100;

              return (
                <Link key={campaign._id} to={`/campaign/${campaign._id}`} className="group h-full block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    // Simplified rounding and removed scale effect
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
                  >
                    {/* Image Header - reduced height */}
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
                        <span className="backdrop-blur-md bg-white/90 text-primary-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          {campaign.category}
                        </span>
                      </div>

                      {/* Floating Status Badge (Right) */}
                      <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${isEnded ? 'bg-gray-800/80 text-white' : 'bg-white/90 text-green-700'}`}>
                            {isEnded ? t('home.ended') : 'Active'}
                          </span>
                      </div>
                    </div>

                    {/* Body - reduced padding and font size */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {campaign.title}
                      </h3>
                      <p className="text-gray-500 text-xs mb-4 line-clamp-2">{campaign.description}</p>

                      {/* Progress Section */}
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-2">
                           <div className="flex flex-col">
                              <span className="text-xs text-gray-400 font-semibold uppercase">Raised</span>
                              <span className="text-primary-700 font-bold text-sm">
                                {Math.min(progress, 100).toFixed(0)}%
                              </span>
                           </div>
                           <div className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                             <FiClock className="mr-1 w-3 h-3" />
                             {daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}
                           </div>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        {/* Stats Footer - reduced font size */}
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

      <HowItWorks />
      <SuccessStories />

      {/* STATS SECTION */}
      <div className="py-16 bg-primary-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-primary-200">
                {homeCampaigns.length}+
              </div>
              <div className="text-primary-200 font-medium uppercase tracking-wider text-xs">{t('home.stats.active')}</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-primary-200">
                रु {(homeCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0) / 1000000).toFixed(1)}M+
              </div>
              <div className="text-primary-200 font-medium uppercase tracking-wider text-xs">{t('home.stats.raised')}</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-primary-200">
                {homeCampaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0)}+
              </div>
              <div className="text-primary-200 font-medium uppercase tracking-wider text-xs">{t('home.stats.donors')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;