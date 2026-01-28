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
          
          {/* Cookie Banner - Compact Version */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] p-3 sm:p-4"
          >
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {/* Icon & Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                          <FiShield className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                            We Value Your Privacy
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-snug mb-2">
                            We use cookies to enhance your experience. By clicking "Accept All", you consent to our use of cookies.
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Link
                              to="/cookie-policy"
                              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                            >
                              Cookie Policy
                              <FiChevronRight className="w-3 h-3" />
                            </Link>
                            <span className="text-gray-300">•</span>
                            <button
                              onClick={handleCustomize}
                              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
                            >
                              <FiSettings className="w-3 h-3" />
                              Preferences
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-2 sm:flex-shrink-0">
                      <button
                        onClick={handleRejectNonEssential}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleCustomize}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <FiSettings className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Customize</span>
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-md shadow-amber-500/20"
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
