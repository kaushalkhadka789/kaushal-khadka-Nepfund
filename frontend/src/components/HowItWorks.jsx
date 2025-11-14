import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiShare2, FiCreditCard, FiHeart, FiFlag } from 'react-icons/fi';
import { HiOutlineUserAdd } from 'react-icons/hi';

const iconMap = {
  setup: <HiOutlineUserAdd className="w-12 h-12 text-blue-600" />,
  share: <FiShare2 className="w-12 h-12 text-pink-500" />,
  donate: <FiHeart className="w-12 h-12 text-green-600" />,
  withdraw: <FiCreditCard className="w-12 h-12 text-yellow-500" />,
};

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = useMemo(
    () => [
      { key: 'setup', icon: iconMap.setup },
      { key: 'share', icon: iconMap.share },
      { key: 'donate', icon: iconMap.donate },
      { key: 'withdraw', icon: iconMap.withdraw },
    ],
    []
  );

  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.4 }}
          className="inline-flex items-center gap-3 text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          <FiFlag className="w-8 h-8 text-primary-600" />
          {t('howItWorks.title')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-gray-600 max-w-3xl mx-auto mb-14"
        >
          {t('howItWorks.subtitle')}
        </motion.p>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.key}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.55 }}
              className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center text-center"
            >
              <div className="mb-5">{step.icon}</div>
              <span className="text-xs font-semibold tracking-wide uppercase text-primary-500 mb-2">
                {t('howItWorks.stepLabel', { number: index + 1 })}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t(`howItWorks.steps.${step.key}.title`)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(`howItWorks.steps.${step.key}.description`)}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;

