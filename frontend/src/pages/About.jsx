import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetPublicStatsQuery } from '../services/api';
import { 
  FiShield, FiCheckCircle, FiUsers, FiAward, 
  FiTarget, FiEye, FiTrendingUp, FiClock, FiGlobe,
  FiMapPin, FiActivity
} from 'react-icons/fi';

// --- SUB-COMPONENTS ---

// 1. Animated Counter Component
const Counter = ({ value, label, icon: Icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const [displayValue, setDisplayValue] = useState(0);

  // Parse numeric part from string (e.g., "1Cr+" -> 1, "10K+" -> 10)
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (isInView) {
      motionValue.set(numericValue);
    }
  }, [isInView, motionValue, numericValue]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <div ref={ref} className="text-center group">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
          <div className="w-20 h-20 relative rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-primary-200">
        {displayValue}{suffix}
      </div>
      <div className="text-primary-200 font-medium uppercase tracking-widest text-sm">
        {label}
      </div>
    </div>
  );
};

// 2. Glass Card Component
const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -10, transition: { duration: 0.3 } }}
    className={`bg-white/60 backdrop-blur-lg rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-primary-200/50 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// --- MAIN PAGE ---

const About = () => {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const yBackground = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Fetch real stats from backend (public endpoint)
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetPublicStatsQuery();

  // Format number with suffix (K, L, Cr for Nepali context)
  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(1);
      return cr.endsWith('.0') ? `${cr.replace('.0', '')}Cr+` : `${cr}Cr+`;
    } else if (num >= 100000) {
      const lakh = (num / 100000).toFixed(1);
      return lakh.endsWith('.0') ? `${lakh.replace('.0', '')}L+` : `${lakh}L+`;
    } else if (num >= 1000) {
      const k = (num / 1000).toFixed(1);
      return k.endsWith('.0') ? `${k.replace('.0', '')}K+` : `${k}K+`;
    }
    return num.toString();
  };

  // Calculate impact metrics from real data
  const impactMetrics = [
    { 
      key: 'raised', 
      label: t('about.metrics.raised'), 
      value: statsData?.data?.donations?.total 
        ? formatNumber(statsData.data.donations.total)
        : statsLoading ? '...' : '0', 
      icon: FiTrendingUp 
    },
    { 
      key: 'donors', 
      label: t('about.metrics.donors'), 
      value: statsData?.data?.users?.donors 
        ? formatNumber(statsData.data.users.donors)
        : statsLoading ? '...' : '0', 
      icon: FiUsers 
    },
    { 
      key: 'campaigns', 
      label: t('about.metrics.campaigns'), 
      value: statsData?.data?.campaigns?.approved 
        ? formatNumber(statsData.data.campaigns.approved)
        : statsLoading ? '...' : '0', 
      icon: FiAward 
    },
  ];

  const promises = [
    { key: 'verified', icon: FiShield, title: t('about.promises.verified.title'), description: t('about.promises.verified.description') },
    { key: 'secure', icon: FiCheckCircle, title: t('about.promises.secure.title'), description: t('about.promises.secure.description') },
    { key: 'transparent', icon: FiEye, title: t('about.promises.transparent.title'), description: t('about.promises.transparent.description') },
  ];

  const differentiators = [
    { key: 'local', icon: FiMapPin, title: t('about.differentiators.local.title'), description: t('about.differentiators.local.description'), color: 'text-rose-600', bg: 'bg-rose-50' },
    { key: 'direct', icon: FiTarget, title: t('about.differentiators.direct.title'), description: t('about.differentiators.direct.description'), color: 'text-violet-600', bg: 'bg-violet-50' },
    { key: 'support', icon: FiClock, title: t('about.differentiators.support.title'), description: t('about.differentiators.support.description'), color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden selection:bg-primary-100 selection:text-primary-900">
      
      {/* Animated Background Blobs */}
      <motion.div style={{ y: yBackground }} className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-[100px] mix-blend-multiply filter animate-blob" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-200/30 rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-[600px] h-[600px] bg-rose-200/30 rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-4000" />
      </motion.div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 text-primary-600 font-semibold text-sm mb-8 shadow-sm"
          >
            <FiActivity className="animate-pulse" />
            <span>Empowering Change, Together</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight text-gray-900"
          >
            We connect <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-violet-600 to-rose-600 animate-gradient-x">
              Hearts to Causes
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10"
          >
            {t('about.hero.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* --- MISSION & VISION (Side by Side Glass) --- */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Mission */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent rounded-[2.5rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-8">
                  <FiTarget className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{t('about.mission.title')}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('about.mission.description')}
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative group lg:mt-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-transparent rounded-[2.5rem] transform -rotate-2 group-hover:-rotate-1 transition-transform duration-300" />
              <div className="relative bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100 h-full">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-8">
                  <FiGlobe className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{t('about.vision.title')}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t('about.vision.description')}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- ORIGIN STORY (Centered Typography) --- */}
      <section className="relative py-24 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="bg-white/40 backdrop-blur-xl rounded-[3rem] p-12 md:p-16 border border-white/50 shadow-2xl"
          >
            <div className="text-center mb-10">
              <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Our Journey</span>
              <h2 className="text-4xl md:text-5xl font-extrabold mt-2 mb-6 text-gray-900">{t('about.origin.title')}</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-rose-500 mx-auto rounded-full" />
            </div>
            
            <div className="space-y-6 text-lg text-gray-700 leading-8 font-light text-justify md:text-center">
              <p>{t('about.origin.story1')}</p>
              <p className="font-medium text-gray-900">{t('about.origin.story2')}</p>
              <p>{t('about.origin.story3')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- IMPACT SECTION (Dark & Dynamic) --- */}
      <section className="relative py-24 bg-slate-900 text-white overflow-hidden z-20">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#gradient)" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('about.impact.title')}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t('about.impact.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {impactMetrics.map((metric) => (
              <Counter key={metric.key} {...metric} />
            ))}
          </div>
        </div>
      </section>

      {/* --- PROMISES GRID --- */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.trust.title')}</h2>
            <p className="text-gray-500 text-xl">{t('about.trust.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {promises.map((promise, i) => (
              <GlassCard key={promise.key} delay={i * 0.1} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <promise.icon className="w-8 h-8 text-gray-700 group-hover:text-primary-600 transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{promise.title}</h3>
                <p className="text-gray-500 leading-relaxed">{promise.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* --- DIFFERENTIATORS (Cards with colored accents) --- */}
      <section className="relative py-20 pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t('about.differentiators.title')}</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {differentiators.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} rounded-bl-[100px] -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-110`} />
                
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-6 relative z-10`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h3>
                <p className="text-gray-600 relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;