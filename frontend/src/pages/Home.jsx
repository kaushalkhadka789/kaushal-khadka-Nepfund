import { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery, useGetPublicStatsQuery } from '../services/api';
import { 
  FiSearch, FiZap, FiChevronLeft, FiChevronRight, FiArrowRight, 
  FiFilter, FiActivity, FiTrendingUp 
} from 'react-icons/fi';
import { ensureSocketConnected } from '../services/socket';
import {
  FaHospital, FaBook, FaHouseDamage, FaChild, FaFemale, FaPaw, FaLeaf,
  FaTools, FaLightbulb, FaMedal, FaUsers, FaUserClock, FaHome, FaBullhorn, FaHandsHelping
} from 'react-icons/fa';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SuccessStories from '../components/SuccessStories';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import CampaignCard from '../components/CampaignCard';

// --- CONFIGURATION ---
const CATEGORIES = [
  { key: 'medical', icon: <FaHospital />, label: 'Medical & Health' },
  { key: 'education', icon: <FaBook />, label: 'Education' },
  { key: 'disaster', icon: <FaHouseDamage />, label: 'Disaster Relief' },
  { key: 'child', icon: <FaChild />, label: 'Child Welfare' },
  { key: 'women', icon: <FaFemale />, label: 'Women Empowerment' },
  { key: 'animal', icon: <FaPaw />, label: 'Animals' },
  { key: 'environment', icon: <FaLeaf />, label: 'Environment' },
  { key: 'infrastructure', icon: <FaTools />, label: 'Infrastructure' },
  { key: 'startup', icon: <FaLightbulb />, label: 'Startups' },
  { key: 'sports', icon: <FaMedal />, label: 'Sports' },
  { key: 'community', icon: <FaUsers />, label: 'Community' },
  { key: 'elderly', icon: <FaUserClock />, label: 'Elderly Care' },
  { key: 'housing', icon: <FaHome />, label: 'Housing' },
  { key: 'social', icon: <FaBullhorn />, label: 'Social Causes' },
  { key: 'memorial', icon: <FaHandsHelping />, label: 'Memorials' },
];

const HERO_IMAGES = [
  '/banner.jpg',
  '/hero-2.jpg',
  '/hero-3.jpg',
  '/hero-4.jpg',
];

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// --- HELPER COMPONENT: ANIMATED COUNTER ---
const AnimatedCounter = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;
    const incrementTime = (duration * 1000) / end;
    
    // For large numbers, jump in chunks
    const step = end > 100 ? Math.ceil(end / 100) : 1;
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 20); // standard tick
    
    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const Home = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  // Queries
  const { data, isLoading, error, refetch } = useGetCampaignsQuery({
    status: 'approved',
    category: category || undefined,
    search: search || undefined,
    sortBy,
    limit: 12,
  });

  const { data: urgentData, isLoading: urgentLoading } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    limit: 3,
    sortBy: 'createdAt',
  });

  // Derived State
  const homeCampaigns = useMemo(() => {
    const all = data?.data || [];
    // If not searching/filtering, exclude urgent from main list to avoid duplication
    // If searching, show everything matching
    if (!search && !category) {
        return all.filter(c => !c.isUrgent).slice(0, 4);
    }
    return all;
  }, [data, search, category]);

  const urgentCampaigns = useMemo(() => urgentData?.data || [], [urgentData]);

  // Carousel Logic
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const changeSlide = (direction) => {
    setIsPaused(true);
    if(direction === 'next') setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    else setCurrentSlide((prev) => (prev - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    setTimeout(() => setIsPaused(false), 5000);
  };

  // Socket Logic (Simplified for brevity, assumes functional)
  useEffect(() => {
    const socket = ensureSocketConnected();
    if (socket) {
      socket.on('campaign:approved', () => { refetch(); });
      socket.on('campaign:updated', () => { refetch(); });
      }
    return () => {
      if (socket) {
        socket.off('campaign:approved');
        socket.off('campaign:updated');
      }
    };
  }, [refetch]);

  // Public stats from backend (fallbacks to derived data if unavailable)
  const { data: statsData } = useGetPublicStatsQuery();

  const stats = {
    active: statsData?.data?.campaigns?.approved ?? data?.total ?? 0,
    raised: statsData?.data?.donations?.total ??
      homeCampaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0),
    donors: statsData?.data?.users?.donors ??
      homeCampaigns.reduce((sum, c) => sum + (c.donorCount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-primary-200 selection:text-primary-900">
      
      {/* --- HERO SECTION --- */}
      <section 
        className="relative h-[85vh] min-h-[600px] overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Carousel Background */}
        <AnimatePresence initial={false}>
              <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
                className="absolute inset-0 z-0"
              >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                <img
              src={HERO_IMAGES[currentSlide]} 
                  alt="Hero"
                  className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'; }} 
                />
              </motion.div>
        </AnimatePresence>
        
        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <motion.div 
            key={currentSlide + "text"}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold tracking-wider uppercase mb-4">
                Global Crowdfunding Platform
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-xl">
                {t('home.hero.title', 'Make a Difference Today')}
              </h1>
            </motion.div>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-gray-200 font-light max-w-xl leading-relaxed drop-shadow-md">
              {t('home.hero.subtitle', 'Join millions of people making a lasting impact. Your contribution can change lives forever.')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 pt-4">
              <Link to="/create-campaign" className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary-500/50 transition-all duration-300 transform hover:-translate-y-1">
                {t('home.hero.startCampaign')}
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-2 group">
                <span className="w-8 h-8 rounded-full bg-white text-primary-900 flex items-center justify-center group-hover:scale-110 transition-transform"><FiArrowRight /></span>
                {t('home.hero.learnMore', 'How it works')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Carousel Controls */}
        <button onClick={() => changeSlide('prev')} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 transition-all">
          <FiChevronLeft size={24} />
        </button>
        <button onClick={() => changeSlide('next')} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/20 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 transition-all">
          <FiChevronRight size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentSlide(idx); setIsPaused(true); }}
              className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-12 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </section>

      {/* --- FLOATING STATS RIBBON --- */}
      <div className="relative z-30 -mt-16 max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-6 md:p-10 flex flex-col md:flex-row justify-around items-center divide-y md:divide-y-0 md:divide-x divide-gray-100 border border-gray-100/50">
           <div className="text-center w-full py-4">
              <div className="text-4xl font-black text-gray-900 mb-1 flex justify-center items-center gap-1">
                <AnimatedCounter value={stats.active} />+
              </div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Active Campaigns</p>
           </div>
           <div className="text-center w-full py-4">
              <div className="text-4xl font-black text-primary-600 mb-1 flex justify-center items-center gap-1">
                Rs. <AnimatedCounter value={stats.raised / 1000} />K
              </div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Funds Raised</p>
           </div>
           <div className="text-center w-full py-4">
              <div className="text-4xl font-black text-gray-900 mb-1 flex justify-center items-center gap-1">
                <AnimatedCounter value={stats.donors} />+
              </div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Unique Donors</p>
           </div>
        </div>
      </div>

      {/* --- URGENT CAUSES SECTION --- */}
      {urgentCampaigns.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-red-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-600 font-bold mb-3"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                  URGENT NEEDS
                </motion.div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Help Before It's <span className="text-red-600 relative inline-block">
                     Too Late
                     <svg className="absolute w-full h-3 -bottom-1 left-0 text-red-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                       <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                     </svg>
                  </span>
                </h2>
              </div>
              <Link to="/urgent-campaigns" className="flex items-center text-gray-600 hover:text-red-600 font-medium transition-colors group">
                View All Urgent Cases <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {urgentLoading ? (
               <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {urgentCampaigns.map((campaign, i) => (
                  <motion.div
                    key={campaign._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/campaign/${campaign._id}`} className="block group h-full">
                      <div className="h-full bg-white overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-900/10 transition-all duration-300 border border-gray-100 flex flex-col">
                        <div className="relative h-56 overflow-hidden">
                          {campaign.images?.[0] ? (
                            <img src={`http://localhost:5000/${campaign.images[0]}`} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center"><FaHouseDamage size={30} className="text-gray-400" /></div>
                          )}
                          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                            <FiZap /> CRITICAL
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                           <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">{campaign.title}</h3>
                           <p className="text-gray-500 text-sm line-clamp-2 mb-4">{campaign.description}</p>

                           <div className="mt-auto pt-4 border-t border-gray-50">
                              <div className="flex justify-between text-sm font-semibold mb-2">
                                <span className="text-gray-900">Rs. {campaign.raisedAmount?.toLocaleString()}</span>
                                <span className="text-gray-400">of Rs. {campaign.goalAmount?.toLocaleString()}</span>
                            </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-pink-600 h-full rounded-full" style={{ width: `${Math.min((campaign.raisedAmount/campaign.goalAmount)*100, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- DISCOVER SECTION --- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-gray-900">Discover Campaigns</h2>
           <p className="text-gray-500 mt-2">Find a cause that resonates with you</p>
        </div>
        
        {/* Floating Filter Bar */}
        <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg p-3 mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                  placeholder="Search campaigns..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-primary-300 rounded-xl outline-none transition-all text-gray-700 placeholder-gray-400"
              />
            </div>
             <div className="flex gap-3">
               <div className="relative min-w-[160px]">
                 <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50/50 hover:bg-white border border-transparent focus:border-primary-300 rounded-xl outline-none appearance-none cursor-pointer text-sm font-medium text-gray-700"
              >
                    <option value="createdAt">Newest First</option>
                    <option value="raisedAmount">Most Funded</option>
                    <option value="donorCount">Most Popular</option>
              </select>
               </div>
            </div>
          </div>
        </div>

        {/* Categories Rail */}
        <div className="mb-12 relative group">
           <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide px-2 snap-x">
              <button
                onClick={() => setCategory('')}
                className={`flex-shrink-0 snap-start px-6 py-3 rounded-full border text-sm font-semibold transition-all duration-300 ${
                  category === '' 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                All Causes
              </button>
             {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.label)}
                  className={`flex-shrink-0 snap-start flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-semibold transition-all duration-300 ${
                    category === cat.label
                    ? 'bg-primary-600 text-white border-primary-600 shadow-lg scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
           {/* Fade edges */}
           <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse border border-gray-100 shadow-sm">
                 <div className="h-48 bg-gray-200 rounded-t-2xl mb-4"></div>
                 <div className="px-4 space-y-3">
                   <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                   <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                   <div className="h-4 bg-gray-200 rounded w-full"></div>
                 </div>
               </div>
             ))}
           </div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
              <p className="text-red-500 font-medium">Failed to load campaigns</p>
              <button onClick={() => refetch()} className="mt-4 text-primary-600 hover:underline">Try Again</button>
           </div>
        ) : homeCampaigns.length === 0 ? (
           <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiSearch className="text-gray-400 size-8" />
          </div>
             <h3 className="text-xl font-bold text-gray-900">No campaigns found</h3>
             <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {homeCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign._id} 
                campaign={campaign} 
                variant="grid"
                showDonateButton={false}
              />
            ))}
          </motion.div>
        )}
        
        {!isLoading && homeCampaigns.length > 0 && (
           <div className="mt-16 text-center">
             <Link to="/campaigns" className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-full hover:border-gray-900 hover:text-gray-900 transition-all duration-300 group">
               Browse All Campaigns <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
        )}
      </section>

      {/* --- TRUST & PROOF SECTIONS --- */}
      <div className="bg-white">
        <HowItWorks />
      </div>

      <div className="bg-gray-50 py-10">
      <SuccessStories />
              </div>

      <div className="bg-white">
        <FAQ />
            </div>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
         
         <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Ready to start your journey?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Create a campaign in minutes, share your story, and start raising funds for the causes you care about most.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/create-campaign" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
                 Start a Fundraiser
               </Link>
               <Link to="/about#contact" className="px-8 py-4 bg-transparent border border-gray-600 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-colors">
                 Contact Support
               </Link>
            </div>
          </div>
      </section>
    </div>
  );
};

export default Home;