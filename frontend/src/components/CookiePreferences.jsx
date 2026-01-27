import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLock, FiSettings, FiActivity, FiTarget, FiInfo } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { 
  getCookiePreferences, 
  saveCustomPreferences, 
  CookieTypes 
} from '../utils/cookieConsent';

const CookiePreferences = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [preferences, setPreferences] = useState({
    [CookieTypes.NECESSARY]: true,
    [CookieTypes.PREFERENCE]: false,
    [CookieTypes.ANALYTICS]: false,
    [CookieTypes.MARKETING]: false
  });

  useEffect(() => {
    if (isOpen) {
      const currentPrefs = getCookiePreferences();
      setPreferences(currentPrefs);
    }
  }, [isOpen]);

  const cookieTypes = [
    {
      id: CookieTypes.NECESSARY,
      name: 'Strictly Necessary Cookies',
      description: 'Required for the platform to function. These cannot be disabled.',
      icon: FiLock,
      color: 'emerald',
      required: true
    },
    {
      id: CookieTypes.PREFERENCE,
      name: 'Preference Cookies',
      description: 'Remember your choices (language, theme) to provide a personalized experience.',
      icon: FiSettings,
      color: 'blue',
      required: false
    },
    {
      id: CookieTypes.ANALYTICS,
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors use the platform to improve features and performance.',
      icon: FiActivity,
      color: 'purple',
      required: false
    },
    {
      id: CookieTypes.MARKETING,
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant content and measure campaign effectiveness.',
      icon: FiTarget,
      color: 'rose',
      required: false
    }
  ];

  const handleToggle = (cookieType) => {
    if (cookieType === CookieTypes.NECESSARY) return; // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }));
  };

  const handleSave = () => {
    const userId = user?.id || user?._id;
    saveCustomPreferences(preferences, userId);
    onClose();
    // Trigger any cookie initialization here based on preferences
  };

  const handleAcceptAll = () => {
    const userId = user?.id || user?._id;
    const allAccepted = {
      [CookieTypes.NECESSARY]: true,
      [CookieTypes.PREFERENCE]: true,
      [CookieTypes.ANALYTICS]: true,
      [CookieTypes.MARKETING]: true
    };
    setPreferences(allAccepted);
    saveCustomPreferences(allAccepted, userId);
    onClose();
  };

  const handleRejectAll = () => {
    const userId = user?.id || user?._id;
    const onlyNecessary = {
      [CookieTypes.NECESSARY]: true,
      [CookieTypes.PREFERENCE]: false,
      [CookieTypes.ANALYTICS]: false,
      [CookieTypes.MARKETING]: false
    };
    setPreferences(onlyNecessary);
    saveCustomPreferences(onlyNecessary, userId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[102] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black mb-1">Cookie Preferences</h2>
                    <p className="text-amber-100 text-sm">Control which cookies we use</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      <strong>Your Privacy Matters:</strong> You can enable or disable different types of cookies below. 
                      Necessary cookies are always active as they are essential for the website to function.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {cookieTypes.map((cookieType) => {
                    const Icon = cookieType.icon;
                    const isEnabled = preferences[cookieType.id];
                    const isRequired = cookieType.required;

                    return (
                      <motion.div
                        key={cookieType.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-6 rounded-2xl border-2 transition-all ${
                          isEnabled 
                            ? (cookieType.color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                               cookieType.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                               cookieType.color === 'purple' ? 'bg-purple-50 border-purple-200' :
                               'bg-rose-50 border-rose-200')
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 p-3 rounded-xl ${
                            isEnabled 
                              ? (cookieType.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                                 cookieType.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                 cookieType.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                 'bg-rose-100 text-rose-600')
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {cookieType.name}
                              </h3>
                              {isRequired && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-bold uppercase rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {cookieType.description}
                            </p>
                            
                            {!isRequired && (
                              <button
                                onClick={() => handleToggle(cookieType.id)}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                                  isEnabled ? 'bg-amber-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                    isEnabled ? 'translate-x-8' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            )}
                            {isRequired && (
                              <div className="text-xs text-gray-500 font-medium">
                                Always Active
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="flex gap-3">
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all duration-300"
                    >
                      Reject All
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-bold transition-all duration-300"
                    >
                      Accept All
                    </button>
                  </div>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-amber-500/30"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookiePreferences;
