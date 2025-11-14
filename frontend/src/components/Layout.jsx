import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { FiUser, FiLogOut, FiPlusCircle, FiGrid, FiHeart, FiSettings, FiAward } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import TierBadge from './TierBadge';
import { getTier } from '../utils/reward.utils.js';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  // Get user tier for badge display
  const userPoints = user?.rewardPoints || 0;
  const userTier = userPoints > 0 ? getTier(userPoints) : null;

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">{t('app.name')}</span>
              </Link>
            </div>

            {/* Center: Navigation Links */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center justify-center flex-1 px-4">
                <div className="flex items-center space-x-1">
                  <Link
                    to="/create-campaign"
                    className="flex items-center space-x-1.5 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md transition text-sm font-medium"
                  >
                    <FiPlusCircle className="w-4 h-4" />
                    <span>{t('nav.create')}</span>
                  </Link>
                  <Link
                    to="/my-campaigns"
                    className="flex items-center space-x-1.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition text-sm font-medium"
                  >
                    <FiGrid className="w-4 h-4" />
                    <span>{t('nav.myCampaigns')}</span>
                  </Link>
                  <Link
                    to="/my-donations"
                    className="flex items-center space-x-1.5 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition text-sm font-medium"
                  >
                    <FiHeart className="w-4 h-4" />
                    <span>{t('nav.myDonations')}</span>
                  </Link>
                  <Link
                    to="/my-rewards"
                    className="flex items-center space-x-1.5 px-3 py-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition text-sm font-medium"
                  >
                    <FiAward className="w-4 h-4" />
                    <span>{t('nav.rewards')}</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-sm font-medium ml-1"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                </div>
              </nav>
            )}

            {/* Right: Language, Profile, Logout */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  const next = i18n.language === 'en' ? 'np' : 'en';
                  i18n.changeLanguage(next);
                  localStorage.setItem('lng', next);
                }}
                className="px-3 py-2 text-sm font-medium border-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                aria-label="Switch language"
              >
                <span className={i18n.language === 'en' ? 'font-bold text-primary-600' : 'text-gray-600'}>ENG</span>
                <span className="text-gray-300">/</span>
                <span className={i18n.language === 'np' ? 'font-bold text-primary-600' : 'text-gray-600'}>ने</span>
              </button>
              
              {isAuthenticated ? (
                <>
                  {/* Mobile/Tablet navigation items (icons only) */}
                  <div className="lg:hidden flex items-center space-x-1">
                    <Link
                      to="/create-campaign"
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition"
                      title={t('nav.create')}
                    >
                      <FiPlusCircle className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-campaigns"
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                      title={t('nav.myCampaigns')}
                    >
                      <FiGrid className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-donations"
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                      title={t('nav.myDonations')}
                    >
                      <FiHeart className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/my-rewards"
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition"
                      title={t('nav.rewards')}
                    >
                      <FiAward className="w-5 h-5" />
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                        title={t('nav.admin')}
                      >
                        <FiGrid className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
                  >
                    {user?.profileImage || user?.avatar ? (
                      <img
                        src={`http://localhost:5000/${user.profileImage || user.avatar}`}
                        alt={user?.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline">{user?.name}</span>
                    {userTier && <TierBadge tier={userTier} size="sm" showIcon={false} />}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2 sm:px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="hidden md:inline">{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition text-sm font-medium"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm font-medium"
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
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">{t('app.name')}</p>
            <p className="text-gray-400">{t('app.tagline')}</p>
            <p className="text-gray-500 mt-4 text-sm">© 2024 {t('app.name')}. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

