import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  FiUser,
  FiLogOut,
  FiPlusCircle,
  FiGrid,
  FiHeart,
  FiSettings,
  FiAward,
  FiMail,
  FiPhone,
  FiLayout,
  FiShield,
  FiChevronDown,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import TierBadge from './TierBadge';
import { getTier } from '../utils/reward.utils.js';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Get user tier for badge display
  const userPoints = user?.rewardPoints || 0;
  const userTier = userPoints > 0 ? getTier(userPoints) : null;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    // background gradient from red to yellow for the all page
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* ENHANCED NAVIGATION */}
      <nav className={`bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg border-b border-gray-100' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* LEFT: LOGO */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="NepFund Logo"
                    className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-600 transition-all">
                  {t('app.name')}
                </span>
              </Link>
            </div>

            {/* CENTER: NAVIGATION LINKS */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center justify-center flex-1 px-8">
                <div className="flex items-center space-x-2">
                  <Link
                    to="/create-campaign"
                    className="flex items-center space-x-2 px-4 py-2.5 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md group"
                  >
                    <FiPlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('nav.create')}</span>
                  </Link>
                  <Link
                    to="/my-campaigns"
                    className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 text-sm font-medium group"
                  >
                    <FiGrid className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('nav.myCampaigns')}</span>
                  </Link>
                  <Link
                    to="/my-donations"
                    className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-all duration-200 text-sm font-medium group"
                  >
                    <FiHeart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{t('nav.myDonations')}</span>
                  </Link>
                  <Link
                    to="/my-rewards"
                    className="flex items-center space-x-2 px-4 py-2.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all duration-200 text-sm font-medium group relative"
                  >
                    <FiAward className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                    <span>{t('nav.rewards')}</span>
                  </Link>
                </div>
              </nav>
            )}

            {/* RIGHT: LANGUAGE, PROFILE, LOGOUT */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">

              {/* LANGUAGE SWITCHER */}
              <button
                onClick={() => {
                  const next = i18n.language === 'en' ? 'np' : 'en';
                  i18n.changeLanguage(next);
                  localStorage.setItem('lng', next);
                }}
                className="relative px-3 py-2 text-sm font-semibold border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md group"
                aria-label="Switch language"
              >
                <span className={`transition-all ${i18n.language === 'en' ? 'font-bold text-primary-600 scale-105' : 'text-gray-500'}`}>
                  ENG
                </span>
                <span className="text-gray-300 group-hover:text-primary-300 transition-colors">/</span>
                <span className={`transition-all ${i18n.language === 'np' ? 'font-bold text-primary-600 scale-105' : 'text-gray-500'}`}>
                  ने
                </span>
              </button>

              {isAuthenticated ? (
                <>
                  {/* MOBILE/TABLET NAVIGATION (ICONS ONLY) */}
                  <div className="lg:hidden flex items-center space-x-1.5">
                    <Link
                      to="/create-campaign"
                      className="p-2.5 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                      title={t('nav.create')}
                    >
                      <FiPlusCircle className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-campaigns"
                      className="p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      title={t('nav.myCampaigns')}
                    >
                      <FiGrid className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-donations"
                      className="p-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      title={t('nav.myDonations')}
                    >
                      <FiHeart className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-rewards"
                      className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200"
                      title={t('nav.rewards')}
                    >
                      <FiAward className="w-5 h-5" />
                    </Link>
                  </div>

                  {/* PROFILE DROPDOWN */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      className="flex items-center space-x-2.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                    >
                      {user?.profileImage || user?.avatar ? (
                        <img
                          src={`http://localhost:5000/${user.profileImage || user.avatar}`}
                          alt={user?.name}
                          className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-200 group-hover:ring-primary-300 transition-all"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-md">
                          <FiUser className="w-4 h-4" />
                        </div>
                      )}
                      <span className="hidden md:inline text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                        {user?.name}
                      </span>
                      {userTier && (
                        <div className="hidden md:block">
                          <TierBadge tier={userTier} size="sm" showIcon={false} />
                        </div>
                      )}
                      <FiChevronDown
                        className={`hidden md:block w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                          }`}
                      />
                    </button>

                    {/* DROPDOWN MENU */}
                    {isDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 md:w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transform transition-all duration-200 ease-out origin-top-right"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                      >
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors group"
                        >
                          <FiUser className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          <span className="text-sm font-medium">Profile</span>
                        </Link>

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2.5 text-purple-700 hover:bg-purple-50 transition-colors group"
                          >
                            <FiShield className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
                            <span className="text-sm font-medium">Admin Panel</span>
                          </Link>
                        )}

                        <div className="border-t border-gray-100 my-2" />

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors group"
                        >
                          <FiLogOut className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
                          <span className="text-sm font-medium">{t('nav.logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* LOGIN & REGISTER FOR NON-AUTHENTICATED */}
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 text-sm font-semibold"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* FOOTER */}
      <footer className="relative mt-20 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=60')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-slate-950/85" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/90 to-primary-900/80 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-semibold tracking-tight">{t('app.name')}</p>
                <p className="mt-1 text-base text-gray-100/90">{t('app.tagline')}</p>
              </div>
              <p className="text-sm uppercase tracking-[0.35em] text-primary-200/90">{t('footer.badge')}</p>
              <p className="text-sm text-gray-300 leading-relaxed">{t('footer.description')}</p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-200">{t('footer.quickLinks')}</p>
              <div className="mt-5 space-y-3 text-sm text-gray-200">
                <Link to="/create-campaign" className="flex items-center justify-between hover:text-white transition-colors group">
                  <span>{t('nav.create')}</span>
                  <span className="text-primary-200 opacity-0 group-hover:opacity-100 transition">→</span>
                </Link>
                <Link to="/my-campaigns" className="flex items-center justify-between hover:text-white transition-colors group">
                  <span>{t('nav.myCampaigns')}</span>
                  <span className="text-primary-200 opacity-0 group-hover:opacity-100 transition">→</span>
                </Link>
                <Link to="/my-donations" className="flex items-center justify-between hover:text-white transition-colors group">
                  <span>{t('nav.myDonations')}</span>
                  <span className="text-primary-200 opacity-0 group-hover:opacity-100 transition">→</span>
                </Link>
                <Link to="/my-rewards" className="flex items-center justify-between hover:text-white transition-colors group">
                  <span>{t('nav.rewards')}</span>
                  <span className="text-primary-200 opacity-0 group-hover:opacity-100 transition">→</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-200">{t('footer.ctaTitle')}</p>
              <p className="mt-3 text-sm text-gray-300">{t('footer.trust')}</p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/create-campaign"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  {t('footer.ctaLaunch')}
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-primary-500/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/30 transition hover:bg-primary-400"
                >
                  {t('footer.ctaDonate')}
                </Link>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-200">{t('footer.contactTitle')}</p>
              <div className="space-y-4 text-sm text-gray-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 p-2">
                    <FiMail className="h-4 w-4" />
                  </div>
                  <a href="mailto:support@nepfund.org" className="hover:text-white transition-colors">
                    {t('footer.contactEmail')}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 p-2">
                    <FiPhone className="h-4 w-4" />
                  </div>
                  <a href="tel:+9779800000000" className="hover:text-white transition-colors">
                    {t('footer.contactPhone')}
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-gray-300 md:flex-row md:items-center md:justify-between">
            <p>© 2024 {t('app.name')}. {t('footer.copyright')}</p>
            <p className="text-gray-400">{t('footer.description')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;