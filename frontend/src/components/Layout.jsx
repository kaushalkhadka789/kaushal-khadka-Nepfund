import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import {
  FiUser, FiLogOut, FiPlusCircle, FiGrid, FiHeart,
  FiAward, FiMail, FiPhone, FiShield, FiChevronDown,
  FiMenu, FiX, FiGlobe, FiInfo
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTier } from '../utils/reward.utils.js';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  
  // State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Click Outside Logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userPoints = user?.rewardPoints || 0;
  const userTier = userPoints > 0 ? getTier(userPoints) : null;

  const handleLogout = () => {
    dispatch(logout());
  };

  const navLinks = [
    { to: '/create-campaign', label: t('nav.create'), icon: FiPlusCircle, primary: true },
    { to: '/my-campaigns', label: t('nav.myCampaigns'), icon: FiGrid },
    { to: '/my-donations', label: t('nav.myDonations'), icon: FiHeart },
    { to: '/my-rewards', label: t('nav.rewards'), icon: FiAward, color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
      
      {/* --- DECORATIVE BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl border-gray-200/50 shadow-sm py-2' 
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group relative z-50">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <img
                  src="/logo.png"
                  alt="NepFund"
                  className="w-10 h-10 relative rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className={`text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 ${isScrolled ? '' : 'lg:text-gray-900'}`}>
                {t('app.name')}
              </span>
            </Link>

            {/* DESKTOP NAV LINKS */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 group overflow-hidden ${
                      link.primary 
                        ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 hover:shadow-inner' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    } ${link.color || ''}`}
                  >
                    <link.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${link.primary ? '' : 'opacity-70 group-hover:opacity-100'}`} />
                    {link.label}
                  </Link>
                ))}
                
                {/* About link - visible only when authenticated */}
                <Link
                  to="/about"
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 group overflow-hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 ${
                    location.pathname === '/about' ? 'text-primary-600 bg-primary-50' : ''
                  }`}
                >
                  <FiInfo className="w-4 h-4 transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  {t('nav.about')}
                </Link>
              </div>
            )}

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Language Switcher */}
              <button
                onClick={() => {
                  const next = i18n.language === 'en' ? 'np' : 'en';
                  i18n.changeLanguage(next);
                  localStorage.setItem('lng', next);
                }}
                className="p-2 rounded-full hover:bg-gray-100/80 transition-colors text-gray-500 hover:text-primary-600 border border-transparent hover:border-gray-200"
                title="Switch Language"
              >
                <FiGlobe className="w-5 h-5" />
                <span className="sr-only">Switch Language</span>
              </button>

              {isAuthenticated ? (
                <>
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="hidden md:flex flex-col items-end mr-1">
                        <span className="text-xs font-bold text-gray-700 leading-tight">{user?.name}</span>
                        {userTier && <span className="text-[10px] text-primary-600 font-medium">{userTier.name}</span>}
                      </div>
                      
                      {user?.profileImage ? (
                        <img
                          src={`http://localhost:5000/${user.profileImage}`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                          <FiUser className="w-4 h-4" />
                        </div>
                      )}
                      <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 ring-1 ring-black/5 py-2 overflow-hidden z-50 origin-top-right"
                        >
                           <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                             <p className="text-sm font-semibold text-gray-900">Signed in as</p>
                             <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                           </div>
                           
                           <div className="p-1">
                             <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors">
                               <FiUser className="w-4 h-4" /> Profile
                             </Link>
                             {user?.role === 'admin' && (
                               <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 rounded-xl transition-colors">
                                 <FiShield className="w-4 h-4" /> Admin Dashboard
                               </Link>
                             )}
                           </div>
                           
                           <div className="border-t border-gray-100 p-1 mt-1">
                             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
                               <FiLogOut className="w-4 h-4" /> {t('nav.logout')}
                             </button>
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="hidden sm:block text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && isAuthenticated && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${link.primary ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    {link.label}
                  </Link>
                ))}
                
                {/* About link in mobile menu - Kept at bottom */}
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                    <FiInfo className="w-5 h-5" />
                  </div>
                  {t('nav.about')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 pt-20 min-h-[80vh]">
        {children}
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative bg-slate-950 text-white mt-24 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg opacity-90" />
                <span className="text-xl font-bold tracking-tight">{t('app.name')}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                {t('footer.description')}
              </p>
              <div className="flex gap-4 pt-2">
                {/* Social Placeholders */}
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
                      <span className="w-2 h-2 bg-white/50 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-6">{t('footer.quickLinks')}</h3>
              <ul className="space-y-3">
                {[
                  { to: '/create-campaign', label: t('nav.create') },
                  { to: '/my-campaigns', label: t('nav.myCampaigns') },
                  { to: '/my-donations', label: t('nav.myDonations') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-slate-400 hover:text-white hover:translate-x-1 transition-all inline-block text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-400 mb-6">{t('footer.contactTitle')}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <FiMail className="w-5 h-5 mt-0.5 text-slate-500" />
                  <a href="mailto:support@nepfund.org" className="hover:text-white transition-colors">support@nepfund.org</a>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-400">
                  <FiPhone className="w-5 h-5 mt-0.5 text-slate-500" />
                  <span>+977 1234567890</span>
                </li>
              </ul>
            </div>

            {/* Newsletter / CTA */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-semibold mb-2">{t('footer.ctaTitle')}</h3>
              <p className="text-slate-400 text-xs mb-4">{t('footer.trust')}</p>
              <div className="space-y-3">
                  <Link to="/create-campaign" className="block w-full text-center py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
                    {t('footer.ctaLaunch')}
                  </Link>
                  <Link to="/" className="block w-full text-center py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors">
                    {t('footer.ctaDonate')}
                  </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {t('app.name')}. {t('footer.copyright')}</p>
            <div className="flex gap-6">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;