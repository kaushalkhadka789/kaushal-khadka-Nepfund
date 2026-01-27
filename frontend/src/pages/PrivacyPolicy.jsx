import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  FiShield, FiDatabase, FiEye, FiShare2, 
  FiLock, FiUserCheck, FiMail, FiChevronDown, 
  FiPrinter, FiCheckCircle, FiArrowRight, FiClock,
  FiFileText, FiDownload, FiExternalLink, FiArrowUp, FiInfo
} from 'react-icons/fi';

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(1);
  const [readingTime, setReadingTime] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    // Reading time calculation logic
    const text = sections.map(s => (s.content || '') + (s.intro || '')).join(' ');
    setReadingTime(Math.ceil(text.split(/\s+/).length / 200) || 4);

    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 1, icon: FiDatabase, title: t('privacy.section1.title'), intro: t('privacy.section1.intro'), items: [t('privacy.section1.account'), t('privacy.section1.profile'), t('privacy.section1.campaign'), t('privacy.section1.donation'), t('privacy.section1.technical')] },
    { id: 2, icon: FiEye, title: t('privacy.section2.title'), intro: t('privacy.section2.intro'), items: [t('privacy.section2.operate'), t('privacy.section2.process'), t('privacy.section2.verify'), t('privacy.section2.communicate'), t('privacy.section2.personalize')] },
    { id: 3, icon: FiShare2, title: t('privacy.section3.title'), intro: t('privacy.section3.intro'), items: [t('privacy.section3.payment'), t('privacy.section3.providers'), t('privacy.section3.authorities')] },
    { id: 4, icon: FiLock, title: t('privacy.section4.title'), content: t('privacy.section4.content') },
    { id: 5, icon: FiUserCheck, title: t('privacy.section5.title'), intro: t('privacy.section5.intro'), items: [t('privacy.section5.access'), t('privacy.section5.preferences'), t('privacy.section5.clarification')] },
    { id: 6, icon: FiMail, title: t('privacy.section6.title'), content: t('privacy.section6.content'), isContact: true }
  ];

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const handleDownloadPDF = () => {
    window.print(); 
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-indigo-100 selection:text-indigo-700 pb-24 lg:pb-0">
      
      {/* Precision Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 origin-left z-[100]"
        style={{ scaleX }}
      />

      {/* Hero Section: Static & Professional */}
      <header className="relative bg-white pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#6366f1_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.1]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <FiShield className="text-indigo-500" /> Data Protection Officer Verified
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8">
                Privacy <span className="text-indigo-600">First.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                Transparent data practices designed to give you full control. We treat your information with the same care we treat our own.
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 mt-10">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <FiClock className="text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <FiInfo className="text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">V 2.4.0</span>
                </div>
              </div>
            </motion.div>

            {/* Static Image - No Pulse/Shine */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="hidden lg:block relative"
            >
              <div className="w-80 h-80 bg-slate-100 rounded-[3rem] rotate-3 absolute inset-0" />
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2092/2092663.png" 
                alt="Security Shield" 
                className="relative z-10 w-72 h-72 object-contain grayscale-[0.2]"
              />
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-32 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 p-4 shadow-xl shadow-slate-200/30">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3">Legal Map</p>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(`policy-${section.id}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${
                        activeSection === section.id 
                          ? 'bg-indigo-600 text-white shadow-lg translate-x-1' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{section.title}</span>
                      {activeSection === section.id && <FiArrowRight className="shrink-0" />}
                    </button>
                  ))}
                </nav>
              </div>

              <button 
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <FiDownload /> Export to PDF
              </button>
            </div>
          </aside>

          {/* Policy Articles */}
          <div className="flex-1 space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <motion.section
                  id={`policy-${section.id}`}
                  key={section.id}
                  layout
                  className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${
                    isActive ? 'border-indigo-400 shadow-xl shadow-indigo-100/20' : 'border-slate-100'
                  }`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full text-left p-6 lg:p-10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                        isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <Icon />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1 block">Article 0{section.id}</span>
                        <h2 className={`text-xl lg:text-2xl font-black tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                          {section.title}
                        </h2>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isActive ? 180 : 0 }}
                      className="text-slate-300"
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
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 lg:px-10 pb-10 pt-2">
                          <div className="h-px bg-slate-100 mb-8" />
                          {section.intro && (
                            <p className="text-slate-600 text-base lg:text-lg leading-relaxed mb-8 font-medium italic border-l-4 border-indigo-500 pl-6">
                              {section.intro}
                            </p>
                          )}

                          {section.items ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {section.items.map((item, i) => (
                                <div 
                                  key={i} 
                                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100"
                                >
                                  <FiCheckCircle className="text-indigo-500 w-5 h-5 shrink-0 mt-0.5" />
                                  <span className="text-slate-700 font-bold text-sm leading-snug">{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="prose prose-indigo max-w-none text-slate-600 text-base lg:text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              {section.content}
                            </div>
                          )}

                          {section.isContact && (
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                              <button className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-md">
                                <FiMail /> Message Support
                              </button>
                              <button className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                                Security Portal <FiExternalLink />
                              </button>
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

      {/* Floating Scroll to Top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 lg:bottom-10 right-6 lg:right-10 z-[60] w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all"
          >
            <FiArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Professional Dock */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-between z-[70] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <FiShield />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Privacy</p>
            <p className="text-xs font-bold text-slate-900 leading-none">Legal Document</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="p-3 bg-slate-100 text-slate-700 rounded-xl active:scale-95 transition-transform border border-slate-200"
          >
            <FiDownload />
          </button>
          <button 
            onClick={() => window.print()}
            className="p-3 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform"
          >
            <FiPrinter />
          </button>
        </div>
      </div>

    </div>
  );
};

export default PrivacyPolicy;