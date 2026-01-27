import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSettings, FiShield, FiChevronRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { hasConsent, hasUserConsent, acceptAllCookies, rejectNonEssentialCookies } from '../utils/cookieConsent';

const CookieConsent = ({ onPreferencesOpen }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownForSession, setHasShownForSession] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const checkAndShowBanner = () => {
      const userId = user?.id || user?._id;
      
      // If user is logged in, check user-specific consent
      if (isAuthenticated && userId) {
        if (!hasUserConsent(userId)) {
          setIsVisible(true);
          setHasShownForSession(true);
        }
      } else {
        // For guest users, check general consent
        if (!hasConsent() && !hasShownForSession) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            setHasShownForSession(true);
          }, 1000);
          return () => clearTimeout(timer);
        }
      }
    };

    checkAndShowBanner();
  }, [isAuthenticated, user, hasShownForSession]);

  // Show banner when user logs in (if they haven't given consent for this account)
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id || user._id;
      if (userId && !hasUserConsent(userId)) {
        // Small delay after login for better UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const handleAcceptAll = () => {
    const userId = user?.id || user?._id;
    acceptAllCookies(userId);
    setIsVisible(false);
    // Trigger any cookie initialization here
  };

  const handleRejectNonEssential = () => {
    const userId = user?.id || user?._id;
    rejectNonEssentialCookies(userId);
    setIsVisible(false);
  };

  const handleCustomize = () => {
    setIsVisible(false);
    onPreferencesOpen();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={handleRejectNonEssential}
          />
          
          {/* Cookie Banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] p-4 sm:p-6"
          >
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                    {/* Icon & Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl">
                          <FiShield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2">
                            We Value Your Privacy
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                            By clicking "Accept All", you consent to our use of cookies. You can also customize your preferences or reject non-essential cookies.
                          </p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <Link
                              to="/cookie-policy"
                              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                            >
                              Cookie Policy
                              <FiChevronRight className="w-4 h-4" />
                            </Link>
                            <span className="text-gray-300">•</span>
                            <button
                              onClick={handleCustomize}
                              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                            >
                              <FiSettings className="w-4 h-4" />
                              Manage Preferences
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                      <button
                        onClick={handleRejectNonEssential}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                      >
                        Reject Non-Essential
                      </button>
                      <button
                        onClick={handleCustomize}
                        className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <FiSettings className="w-5 h-5" />
                        Customize
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/30"
                      >
                        Accept All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
