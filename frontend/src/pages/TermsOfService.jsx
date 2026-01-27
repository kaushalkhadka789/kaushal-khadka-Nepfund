import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  FiUsers, FiTarget, FiHeart, FiCreditCard, 
  FiFile, FiXCircle, FiAlertTriangle, FiRefreshCw, 
  FiChevronDown, FiPrinter, FiCheck, FiArrowRight, 
  FiShield, FiBookOpen, FiDownload, FiArrowUp, FiMenu
} from 'react-icons/fi';

const TermsOfService = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Watch scroll for the "Scroll to Top" visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 1, icon: FiUsers, title: t('terms.section1.title'), intro: t('terms.section1.intro'), items: [t('terms.section1.accurate'), t('terms.section1.lawful'), t('terms.section1.respect')] },
    { id: 2, icon: FiTarget, title: t('terms.section2.title'), intro: t('terms.section2.intro'), items: [t('terms.section2.comply'), t('terms.section2.funds'), t('terms.section2.updates')] },
    { id: 3, icon: FiHeart, title: t('terms.section3.title'), intro: t('terms.section3.intro'), items: [t('terms.section3.refund'), t('terms.section3.payment'), t('terms.section3.rewards')] },
    { id: 4, icon: FiCreditCard, title: t('terms.section4.title'), content: t('terms.section4.content') },
    { id: 5, icon: FiFile, title: t('terms.section5.title'), content: t('terms.section5.content') },
    { id: 6, icon: FiXCircle, title: t('terms.section6.title'), content: t('terms.section6.content') },
    { id: 7, icon: FiAlertTriangle, title: t('terms.section7.title'), content: t('terms.section7.content') },
    { id: 8, icon: FiRefreshCw, title: t('terms.section8.title'), content: t('terms.section8.content') }
  ];

  const toggleSection = (id) => {
    setActiveSection(prev => (prev === id ? null : id));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-emerald-100 selection:text-emerald-900 pb-20 lg:pb-0">
      
      {/* Precision Scroll Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Hero Branding Section */}
      <header className="relative bg-[#064E3B] pt-20 pb-28 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 lg:mb-8">
              <FiShield className="animate-pulse" /> Official Legal Agreement
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6">
              Platform <span className="text-emerald-400">Terms</span>.
            </h1>
            <p className="text-emerald-100/70 text-base md:text-xl leading-relaxed">
              Updated Jan 2026. Please read these terms carefully to understand your rights and obligations while using NepFund.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:block relative">
            <img src="https://cdn-icons-png.flaticon.com/512/3534/3534033.png" alt="Legal" className="w-64 h-64 object-contain drop-shadow-2xl" />
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Navigation Side Rail */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-12 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-200 p-4 shadow-xl shadow-slate-200/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-3">Navigation</p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        toggleSection(section.id);
                        document.getElementById(`term-${section.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${
                        activeSection === section.id 
                          ? 'bg-emerald-600 text-white shadow-lg translate-x-1' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      {activeSection === section.id && <FiArrowRight className="shrink-0" />}
                    </button>
                  ))}
                </nav>
              </div>

              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                <FiPrinter /> Print Full Document
              </button>
            </div>
          </aside>

          {/* Main Document Content */}
          <div className="flex-1 space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <motion.section
                  id={`term-${section.id}`}
                  key={section.id}
                  layout
                  className={`bg-white rounded-[2rem] lg:rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                    isActive ? 'border-emerald-500 shadow-2xl shadow-emerald-100/50' : 'border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full text-left p-6 lg:p-10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 lg:gap-8">
                      <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 shrink-0 ${
                        isActive ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <Icon />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1 block">Section 0{section.id}</span>
                        <h2 className="text-lg lg:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                          {section.title}
                        </h2>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isActive ? 180 : 0 }}
                      className={`shrink-0 p-2 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300'}`}
                    >
                      <FiChevronDown className="w-6 h-6 lg:w-8 lg:h-8" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                      >
                        <div className="px-6 lg:px-10 pb-10 pt-2">
                          <div className="h-px bg-slate-100 mb-8" />
                          {section.intro && (
                            <p className="text-slate-600 text-base lg:text-lg leading-relaxed mb-8 font-medium italic border-l-4 border-emerald-500 pl-4 lg:pl-6">
                              {section.intro}
                            </p>
                          )}

                          {section.items ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                              {section.items.map((item, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ opacity: 0, x: -10 }} 
                                  animate={{ opacity: 1, x: 0 }} 
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-start gap-3 p-4 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-100 group"
                                >
                                  <FiCheck className="text-emerald-600 w-5 h-5 shrink-0 mt-0.5" />
                                  <span className="text-slate-700 font-bold text-sm leading-snug">{item}</span>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="prose prose-emerald max-w-none text-slate-600 text-base lg:text-lg leading-relaxed">
                              {section.content}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>

      {/* Floating Action Elements */}
      
      {/* Scroll to Top - Haptic Style */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-[60] w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-emerald-500 hover:-translate-y-2 transition-all active:scale-90"
          >
            <FiArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile-Only Bottom Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-between z-[70] shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <FiShield />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NepFund Legal</p>
            <p className="text-xs font-bold text-slate-900">Terms of Service</p>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
        >
          <FiDownload /> PDF
        </button>
      </div>

    </div>
  );
};

export default TermsOfService;