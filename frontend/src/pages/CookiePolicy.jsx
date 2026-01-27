import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiShield, FiInfo, FiLayers, FiDatabase, 
  FiGlobe, FiSettings, FiRefreshCw, FiMail, 
  FiChevronDown, FiLock, FiActivity, FiTarget,
  FiTrash2, FiToggleRight, FiExternalLink
} from 'react-icons/fi';
import { clearCookieConsent } from '../utils/cookieConsent';

const CookiePolicy = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const { scrollYProgress } = useScroll();
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const formatCookieItem = (text) => {
    const delimiter = text.includes(' – ') ? ' – ' : '—';
    if (text.includes(delimiter)) {
      const parts = text.split(delimiter);
      return { label: parts[0], description: parts[1] };
    }
    return { label: text, description: null };
  };

  const sections = [
    { id: 1, icon: FiInfo, title: t('cookie.section1.title'), content: t('cookie.section1.content') },
    { 
      id: 2, 
      icon: FiLayers, 
      title: t('cookie.section2.title'), 
      type: 'interactive-cards',
      items: [
        { ...formatCookieItem(t('cookie.section2.necessary')), icon: <FiLock />, color: 'emerald', required: true },
        { ...formatCookieItem(t('cookie.section2.preference')), icon: <FiSettings />, color: 'blue', required: false },
        { ...formatCookieItem(t('cookie.section2.analytics')), icon: <FiActivity />, color: 'purple', required: false },
        { ...formatCookieItem(t('cookie.section2.marketing')), icon: <FiTarget />, color: 'rose', required: false }
      ]
    },
    { id: 3, icon: FiDatabase, title: t('cookie.section3.title'), content: t('cookie.section3.content') },
    { id: 4, icon: FiGlobe, title: t('cookie.section4.title'), content: t('cookie.section4.content') },
    { 
      id: 5, 
      icon: FiToggleRight, 
      title: t('cookie.section5.title'), 
      intro: t('cookie.section5.intro'),
      items: [
        t('cookie.section5.browser'),
        t('cookie.section5.site'),
        t('cookie.section5.optout')
      ],
      note: t('cookie.section5.note')
    },
    { id: 6, icon: FiRefreshCw, title: t('cookie.section6.title'), content: t('cookie.section6.content') },
    { id: 7, icon: FiMail, title: t('cookie.section7.title'), content: t('cookie.section7.content') }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-orange-100 selection:text-orange-900">
      {/* Dynamic Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-amber-500 z-50 origin-left" style={{ scaleX }} />

      {/* Modern Professional Header */}
      <header className="relative pt-24 pb-40 bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-8">
              <FiShield className="animate-pulse" /> Consent Management
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6">
              {t('cookie.title')}
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed">
              {t('cookie.intro')}
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 -mt-20 pb-24 relative z-20">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Navigation Sidebar */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-8 space-y-6">
              <nav className="bg-white rounded-3xl p-3 shadow-xl shadow-slate-200/50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 py-3">Navigation</p>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveTab(section.id);
                      document.getElementById(`section-${section.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      activeTab === section.id 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 translate-x-2' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <section.icon className={`w-5 h-5 ${activeTab === section.id ? 'text-white' : 'text-orange-500'}`} />
                    <span className="text-sm font-bold truncate">{section.title}</span>
                  </button>
                ))}
              </nav>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/20 blur-2xl rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                   Preference Reset
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Want to change your initial choice? Clicking below will clear your current consent token.
                </p>
                 <button 
                   onClick={() => {
                     const userId = user?.id || user?._id;
                     clearCookieConsent(userId);
                     window.location.reload();
                   }}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-rose-500 transition-colors rounded-xl text-xs font-bold"
                 >
                   <FiTrash2 /> Reset All Cookies
                 </button>
                 <button 
                   onClick={() => {
                     // Navigate to home and trigger preferences modal
                     navigate('/');
                     setTimeout(() => {
                       // This will be handled by Layout component
                       window.dispatchEvent(new CustomEvent('openCookiePreferences'));
                     }, 100);
                   }}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-orange-500 transition-colors rounded-xl text-xs font-bold mt-3"
                 >
                   <FiSettings /> Manage Preferences
                 </button>
              </div>
            </div>
          </aside>

          {/* Policy Content */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-10">
            {sections.map((section) => (
              <motion.section
                id={`section-${section.id}`}
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="bg-white rounded-[2.5rem] p-8 lg:p-14 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/30"
              >
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
                    <section.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                      {section.title}
                    </h2>
                    <div className="h-1 w-12 bg-orange-500 mt-2 rounded-full" />
                  </div>
                </div>

                {section.content && (
                  <p className="text-slate-600 text-lg leading-relaxed mb-6">
                    {section.content}
                    {section.id === 7 && (
                      <span className="block mt-4 p-4 bg-slate-50 border-l-4 border-orange-500 rounded-r-xl font-mono text-sm text-slate-800">
                        support@nepfund.org
                      </span>
                    )}
                  </p>
                )}

                {/* Professional Cookie Type Cards */}
                {section.type === 'interactive-cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="relative p-8 bg-white border border-slate-100 rounded-[2rem] hover:border-orange-200 transition-all group overflow-hidden">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${item.color}-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
                        
                        <div className="relative z-10">
                          <div className={`w-12 h-12 mb-6 rounded-xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center text-xl shadow-sm`}>
                            {item.icon}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="font-bold text-slate-900 text-lg">{item.label}</h3>
                            {item.required && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">Mandatory</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed italic">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Standard Detail Lists */}
                {section.items && section.type !== 'interactive-cards' && (
                  <div className="space-y-4">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-orange-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-orange-400 group-hover:scale-150 transition-transform" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.note && (
                  <div className="mt-10 flex items-center gap-4 p-6 bg-amber-50 rounded-3xl border border-amber-100/50">
                    <FiInfo className="w-6 h-6 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-900 font-medium leading-relaxed">
                      {section.note}
                    </p>
                  </div>
                )}
              </motion.section>
            ))}

            {/* Compliance Footer */}
            <div className="bg-orange-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-3xl lg:text-4xl font-black mb-4">Privacy is a human right.</h3>
                  <p className="text-orange-100 text-lg opacity-80 mb-8 max-w-lg">
                    We believe in transparency. If our policy isn't clear enough, our Data Protection Officer is ready to assist.
                  </p>
                  <a href="mailto:support@nepfund.org" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-black hover:scale-105 transition-transform shadow-2xl">
                    <FiMail /> Contact DPO
                  </a>
                </div>
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl border border-white/20">
                  <FiShield className="w-24 h-24 text-white opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default CookiePolicy;