import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiShare2, FiCreditCard, FiHeart, FiFlag, FiArrowRight } from 'react-icons/fi';
import { HiOutlineUserAdd } from 'react-icons/hi';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      { 
        key: 'setup', 
        icon: <HiOutlineUserAdd className="w-8 h-8" />, 
        color: 'blue',
        delay: 0
      },
      { 
        key: 'share', 
        icon: <FiShare2 className="w-8 h-8" />, 
        color: 'violet',
        delay: 0.2
      },
      { 
        key: 'donate', 
        icon: <FiHeart className="w-8 h-8" />, 
        color: 'rose',
        delay: 0.4
      },
      { 
        key: 'withdraw', 
        icon: <FiCreditCard className="w-8 h-8" />, 
        color: 'emerald',
        delay: 0.6
      },
    ],
    []
  );

  // Helper to get color classes based on the step theme
  const getColorClasses = (color) => {
    const maps = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', border: 'group-hover:border-blue-200' },
      violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', border: 'group-hover:border-violet-200' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', border: 'group-hover:border-rose-200' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', border: 'group-hover:border-emerald-200' },
    };
    return maps[color];
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid-pattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4 border border-primary-100"
          >
            <FiFlag className="w-4 h-4" />
            <span>Simple Process</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-rose-600">
              {t('howItWorks.title') || "Make a Difference in 4 Steps"}
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-500 leading-relaxed"
          >
            {t('howItWorks.subtitle') || "Start your fundraising journey today. It's easy, secure, and transparent."}
          </motion.p>
        </div>

        {/* Steps Container */}
        <div className="relative">
          
          {/* Connecting Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {steps.map((step, index) => {
              const colors = getColorClasses(step.color);

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: step.delay }}
                  className="group relative"
                >
                  {/* Card Content */}
                  <div className={`
                    h-full bg-white rounded-3xl p-8 
                    border border-gray-100 shadow-sm hover:shadow-xl 
                    transition-all duration-300 ease-out
                    flex flex-col items-center text-center
                    ${colors.border}
                  `}>
                    
                    {/* Floating Step Number Badge */}
                    <div className={`
                      absolute -top-4 bg-white border border-gray-100 shadow-sm
                      px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${colors.text}
                    `}>
                      Step 0{index + 1}
                    </div>

                    {/* Icon Container */}
                    <div className="mb-6 relative">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`
                          w-20 h-20 rounded-2xl flex items-center justify-center 
                          ${colors.bg} ${colors.text} ring-4 ${colors.ring}
                          transition-colors duration-300
                        `}
                      >
                        {step.icon}
                      </motion.div>
                      
                      {/* Mobile Arrow (Visual Cue) - Hidden on last item */}
                      {index !== steps.length - 1 && (
                        <div className="lg:hidden absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-300">
                           <FiArrowRight className="w-6 h-6 rotate-90 md:rotate-0" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {t(`howItWorks.steps.${step.key}.title`) || step.key.charAt(0).toUpperCase() + step.key.slice(1)}
                    </h3>
                    
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {t(`howItWorks.steps.${step.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;