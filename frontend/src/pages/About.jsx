import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast installed
import { useGetPublicStatsQuery } from '../services/api';
import { 
  FiShield, FiCheckCircle, FiUsers, FiAward, 
  FiTarget, FiTrendingUp, FiGlobe,
  FiActivity, FiLinkedin, FiHeart, FiZap, FiLayers,
  FiMail, FiPhone, FiMapPin, FiSend, FiArrowRight
} from 'react-icons/fi';

// --- ASSETS ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070&auto=format&fit=crop",
  story: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
  founder: "/kaushal.jpg"
};

// --- SUB-COMPONENTS ---

// 1. Animated Counter Component
const Counter = ({ value, label, icon: Icon }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const [displayValue, setDisplayValue] = useState(0);

  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    if (isInView) motionValue.set(numericValue);
  }, [isInView, motionValue, numericValue]);

  useEffect(() => {
    springValue.on("change", (latest) => setDisplayValue(Math.floor(latest)));
  }, [springValue]);

  return (
    <div ref={ref} className="text-center group relative z-10">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary-400 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
          <div className="w-20 h-20 relative rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
            <Icon className="w-8 h-8 text-primary-200" />
          </div>
        </div>
      </div>
      <div className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-primary-200">
        {displayValue}{suffix}
      </div>
      <div className="text-slate-400 font-medium uppercase tracking-widest text-sm">
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
    whileHover={{ y: -5, transition: { duration: 0.3 } }}
    className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// --- MAIN PAGE ---

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Fetch real stats
  const { data: statsData } = useGetPublicStatsQuery();

  // Contact Form State
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
  };

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

  const impactMetrics = [
    { 
      key: 'raised', 
      label: t('about.metrics.raised'), 
      value: statsData?.data?.donations?.total ? formatNumber(statsData.data.donations.total) : '0', 
      icon: FiTrendingUp 
    },
    { 
      key: 'donors', 
      label: t('about.metrics.donors'), 
      value: statsData?.data?.users?.donors ? formatNumber(statsData.data.users.donors) : '0', 
      icon: FiUsers 
    },
    { 
      key: 'campaigns', 
      label: t('about.metrics.campaigns'), 
      value: statsData?.data?.campaigns?.approved ? formatNumber(statsData.data.campaigns.approved) : '0', 
      icon: FiAward 
    },
  ];

  const advantages = [
    { 
      icon: FiZap, 
      title: "Speed & Efficiency", 
      desc: "Traditional funding takes months. Crowdfunding rallies support in days, delivering immediate relief when it matters most."
    },
    { 
      icon: FiUsers, 
      title: "Democratized Access", 
      desc: "You don't need to be a large NGO to make a difference. We give a voice and platform to anyone with a genuine cause." 
    },
    { 
      icon: FiLayers, 
      title: "Transparent Impact", 
      desc: "Every donation is tracked. Donors see exactly where their money goes, fostering a community built on trust." 
    },
    { 
      icon: FiHeart, 
      title: "Community Building", 
      desc: "It's more than money. It's about building a network of supporters who believe in your vision and success." 
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden selection:bg-primary-100 selection:text-primary-900">
      
      {/* --- HERO SECTION WITH PARALLAX IMAGE --- */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-50 z-10" />
          <img 
            src={IMAGES.hero} 
            alt="Nepal Landscape" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm mb-6 shadow-lg">
              <FiActivity className="text-primary-400" />
              <span>Empowering Nepal, One Contribution at a Time</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight drop-shadow-lg">
              Bridging the Gap Between <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-rose-200">
                Kindness & Need
              </span>
            </h1>
            
            <p className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              {t('about.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* --- MISSION & VISION --- */}
      <section className="relative py-20 -mt-20 z-30 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-xl border-t-4 border-primary-500"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
                <FiTarget className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('about.mission.title')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {t('about.mission.description')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-10 rounded-3xl shadow-xl border-t-4 border-violet-500"
            >
              <div className="w-14 h-14 rounded-xl bg-violet-50 flex items-center justify-center mb-6">
                <FiGlobe className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{t('about.vision.title')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {t('about.vision.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- ORIGIN STORY --- */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary-100 rounded-[2rem] transform -rotate-3" />
            <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl">
              <img src={IMAGES.story} alt="Our Story" className="w-full h-auto object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">Our Origin</span>
            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{t('about.origin.title')}</h2>
            <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
              <p>{t('about.origin.story1')}</p>
              <p className="font-semibold text-slate-800 border-l-4 border-primary-500 pl-4 italic">
                {t('about.origin.story2')}
              </p>
              <p>{t('about.origin.story3')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- IMPACT SECTION (Dark) --- */}
      <section className="relative py-28 bg-slate-900 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
           <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary-600 blur-[120px]" />
           <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('about.impact.title')}</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t('about.impact.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 border-t border-slate-800 pt-12">
            {impactMetrics.map((metric) => (
              <Counter key={metric.key} {...metric} />
            ))}
          </div>
        </div>
      </section>

      {/* --- ADVANTAGES --- */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">The Power of Crowd</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Why Crowdfunding?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((item, i) => (
              <GlassCard key={i} delay={i * 0.1} className="h-full">
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOUNDER SECTION --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-1/3 flex flex-col items-center text-center"
            >
              <div className="relative w-72 h-72 mb-6 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200">
                <img 
                  src={IMAGES.founder} 
                  alt="Kaushal Khadka" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">Kaushal Khadka</h3>
              <p className="text-primary-600 font-medium text-lg mb-4">Founder & Visionary</p>
              
              <div className="flex gap-4 justify-center">
                <a 
                  href="https://www.linkedin.com/in/kaushal-khadka-073a0b347/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-[#0A66C2] transition-colors duration-300"
                >
                  <FiLinkedin className="w-6 h-6" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full md:w-2/3"
            >
              <div className="relative bg-slate-50 rounded-3xl p-10 md:p-12">
                <span className="absolute top-8 left-8 text-9xl leading-none text-slate-200 font-serif select-none">"</span>
                <h4 className="relative z-10 text-2xl font-bold text-slate-900 mb-6">Why I built NepFund</h4>
                <div className="relative z-10 space-y-6 text-lg text-slate-600 leading-relaxed font-light">
                  <p>
                    "I’ve always believed that financial barriers should never stand in the way of a life-saving treatment, a brilliant idea, or a community’s recovery. In Nepal, we have a deep culture of helping one another, but we lacked a centralized, transparent platform to channel that generosity effectively."
                  </p>
                  <p>
                    "Crowdfunding isn't just about money to me; it's about <strong className="text-slate-800 font-semibold">restoring hope through collective action</strong>. It empowers the ordinary person to be a hero in someone else's story. My passion lies in using technology to bridge the gap between those who need help and those willing to give it."
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <div className="h-1 w-12 bg-primary-500 rounded-full" />
                  <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Kaushal Khadka</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- PROFESSIONAL CONTACT US SECTION --- */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-600 rounded-full blur-[128px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-600 rounded-full blur-[128px] opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-bold uppercase tracking-wider mb-6">
                Get in Touch
              </div>
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
                Have questions? <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-white">We're here to help.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
                Whether you want to start a campaign, report an issue, or just say hello, our team is ready to answer your queries.
              </p>

              <div className="space-y-6">
                {/* Contact Item 1 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Visit Us</h4>
                    <p className="text-slate-400">Itahari, Nepal</p>
                  </div>
                </div>
                {/* Contact Item 2 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Email Us</h4>
                    <p className="text-slate-400">kaushalkhadka789@gmail.com</p>
                  </div>
                </div>
                {/* Contact Item 3 */}
                <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Call Us</h4>
                    <p className="text-slate-400">+977 9765982062</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Form */}
            <motion.div
               initial={{ opacity: 0, x: 30 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={contactData.name}
                    onChange={handleContactChange}
                    required
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                    placeholder="Your Name"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={contactData.email}
                    onChange={handleContactChange}
                    required
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                  <textarea 
                    name="message"
                    value={contactData.message}
                    onChange={handleContactChange}
                    required
                    rows="4"
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      Send Message <FiSend className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-primary-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to make a difference?</h2>
            <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
              Join us in our mission to democratize funding in Nepal. Start a campaign or donate to a cause today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/create-campaign')}
                className="px-8 py-4 bg-white text-primary-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                Start a Campaign <FiArrowRight />
              </button>
              <button 
                onClick={() => navigate('/campaigns')}
                className="px-8 py-4 bg-primary-800/50 text-white font-bold rounded-full shadow-lg border border-white/20 hover:bg-primary-800 transition-all backdrop-blur-sm"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;