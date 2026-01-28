import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useGetDashboardStatsQuery, useGetPendingCampaignsQuery, useApproveCampaignMutation, useRejectCampaignMutation, useDeleteAdminCampaignMutation, useGetCampaignsQuery, useMarkSuccessStoryMutation, useGetAllUsersQuery, useUpdateUserRoleMutation, useToggleUserStatusMutation, useDeleteUserMutation } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiTrendingUp, FiUsers, FiHeart, FiFileText, FiChevronDown, FiChevronUp, FiSearch, FiAward, FiUpload, FiVideo, FiFilter, FiUser, FiLock, FiUnlock, FiTrash2, FiPhone, FiMapPin, FiDollarSign, FiMenu, FiBell, FiSettings, FiLogOut, FiHome, FiBarChart2, FiCalendar, FiChevronRight, FiChevronLeft, FiEye, FiEdit, FiDownload, FiRefreshCw, FiClock, FiAlertCircle, FiCheckCircle, FiXCircle, FiImage, FiPlay, FiArrowUp, FiArrowDown, FiMoreVertical } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ensureSocketConnected } from '../services/socket';
import { useSelector } from 'react-redux';

// Safe date formatting helper
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  } catch (error) {
    return null;
  }
};

// Number formatting helper
const formatNumber = (num, prefix = '') => {
  if (typeof num === 'string') {
    // Extract numeric value from string
    const numericValue = parseFloat(num.replace(/[^\d.]/g, '')) || 0;
    return formatNumber(numericValue, num.includes('रु') ? 'रु ' : '');
  }
  
  if (num >= 1000000000) {
    const billions = num / 1000000000;
    const formatted = billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(2);
    return `${prefix}${formatted}B`;
  } else if (num >= 1000000) {
    const millions = num / 1000000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(2);
    return `${prefix}${formatted}M`;
  } else if (num >= 1000) {
    const thousands = num / 1000;
    const formatted = thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(2);
    return `${prefix}${formatted}K`;
  }
  return `${prefix}${num.toLocaleString('en-IN')}`;
};

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, hasAnimated]);

  return count;
};

// Enhanced Stat Card with animations and trends
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, trend, trendValue, sparklineData, gradientFrom, gradientTo, isCurrency = false }) => {
  // Generate stable gradient ID
  const gradientId = useMemo(() => {
    return `gradient-${title.replace(/\s+/g, '-').toLowerCase()}-${title.length}`;
  }, [title]);
  
  // Extract numeric value and prefix
  let numericValue = 0;
  let prefix = '';
  
  // Check if this is a currency value (donations, amounts, etc.)
  const isDonation = title.toLowerCase().includes('donation') || title.toLowerCase().includes('amount') || isCurrency;
  
  if (typeof value === 'string') {
    // Check if it has rupee symbol
    if (value.includes('रु')) {
      prefix = 'रु ';
      numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    } else {
      numericValue = parseFloat(value.replace(/[^\d.]/g, '')) || 0;
    }
  } else {
    numericValue = value || 0;
  }
  
  // Add rupee prefix for donation-related cards
  if (isDonation && !prefix) {
    prefix = 'रु ';
  }
  
  const animatedValue = useAnimatedCounter(numericValue);
  const displayValue = formatNumber(animatedValue, prefix);

  // Get colors for sparkline based on trend
  const getSparklineColors = () => {
    if (trend === 'up') {
      return { stroke: '#10b981', fill: '#d1fae5' };
    } else if (trend === 'down') {
      return { stroke: '#ef4444', fill: '#fee2e2' };
    }
    // Default colors based on colorClass
    if (colorClass.includes('purple')) {
      return { stroke: '#9333ea', fill: '#f3e8ff' };
    } else if (colorClass.includes('amber')) {
      return { stroke: '#d97706', fill: '#fef3c7' };
    } else if (colorClass.includes('blue')) {
      return { stroke: '#2563eb', fill: '#dbeafe' };
    }
    return { stroke: '#10b981', fill: '#d1fae5' };
  };

  const sparklineColors = getSparklineColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[140px] transition-shadow duration-300 hover:shadow-md overflow-hidden group flex flex-col"
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative flex items-start justify-between flex-1">
        <div className="flex-1 min-w-0">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{title}</p>
          <div className="flex items-baseline gap-3 mb-3 flex-wrap">
            <p className={`text-3xl font-bold ${colorClass} leading-tight`}>{displayValue}</p>
            {trend && trendValue && (
              <span className={`text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-full ${
                trend === 'up' 
                  ? 'text-emerald-700 bg-emerald-50' 
                  : 'text-red-700 bg-red-50'
              }`}>
                {trend === 'up' ? (
                  <FiArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <FiArrowDown className="w-3.5 h-3.5" />
                )}
                {trendValue}%
              </span>
            )}
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="mt-auto h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sparklineColors.fill} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={sparklineColors.fill} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparklineColors.stroke}
                    fill={`url(#${gradientId})`}
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className={`p-4 rounded-xl ${bgClass} shadow-sm flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Skeleton Loader Component
const SkeletonLoader = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[140px] flex flex-col">
    <div className="flex items-start justify-between flex-1">
      <div className="flex-1">
        <SkeletonLoader className="h-4 w-24 mb-3" />
        <SkeletonLoader className="h-8 w-32 mb-3" />
        <SkeletonLoader className="h-12 w-full mt-auto" />
      </div>
      <SkeletonLoader className="w-14 h-14 rounded-xl flex-shrink-0" />
    </div>
  </div>
);

// Simplified Header Component (just sticky positioning)
const DashboardHeader = () => {
  return (
    <div className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200 h-0">
      {/* Empty header for spacing - content moved to main area */}
    </div>
  );
};

// Toolbar Component with Search, Filters, and Tab Dropdown
const Toolbar = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, category, setCategory, categoryOptions, userSearchTerm, setUserSearchTerm, onRefresh, pendingCount, approvedCampaignsCount }) => {
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTabDropdown(false);
      }
    };

    if (showTabDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTabDropdown]);

  const menuItems = [
    { id: 'approved', label: 'Approved', icon: FiCheckCircle, count: approvedCampaignsCount },
    { id: 'pending', label: 'Pending', icon: FiClock, count: pendingCount },
    { id: 'top', label: 'Top Campaigns', icon: FiTrendingUp, count: null },
    { id: 'users', label: 'Users', icon: FiUsers, count: null },
  ];

  const activeItem = menuItems.find(item => item.id === activeTab) || menuItems[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={activeTab === 'users' ? userSearchTerm : searchTerm}
            onChange={(e) => {
              if (activeTab === 'users') {
                setUserSearchTerm(e.target.value);
              } else {
                setSearchTerm(e.target.value);
              }
            }}
            placeholder={activeTab === 'users' ? 'Search users...' : 'Search campaigns...'}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        {activeTab !== 'users' && (
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer min-w-[160px]"
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'All Categories' : opt}</option>
              ))}
            </select>
            <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="Refresh"
        >
          <FiRefreshCw className="w-5 h-5" />
        </button>

        {/* Tab Navigation Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowTabDropdown(!showTabDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition text-sm font-semibold"
          >
            <activeItem.icon className="w-4 h-4" />
            <span>{activeItem.label}</span>
            {activeItem.count !== null && activeItem.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeItem.id === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-primary-200 text-primary-800'
              }`}>
                {activeItem.count}
              </span>
            )}
            <FiChevronDown className={`w-4 h-4 transition-transform ${showTabDropdown ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showTabDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
              >
                <div className="py-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setShowTabDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${
                        activeTab === item.id
                          ? 'bg-primary-50 text-primary-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-600' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== null && item.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          item.id === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-primary-100 text-primary-700'
                        }`}>
                          {item.count}
                        </span>
                      )}
                      {activeTab === item.id && (
                        <FiCheck className="w-4 h-4 text-primary-600" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useGetPendingCampaignsQuery();

  // Pagination and filters
  const [activeTab, setActiveTab] = useState('pending');
  const [approvedPage, setApprovedPage] = useState(1);
  const [topPage, setTopPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [realTimeCampaigns, setRealTimeCampaigns] = useState(null);

  const APPROVED_PER_PAGE = 6;
  const TOP_PER_PAGE = 6;

  const { data: approvedData, isLoading: approvedLoading, refetch: refetchApproved } = useGetCampaignsQuery({
    status: 'approved,completed',
    limit: APPROVED_PER_PAGE,
    page: approvedPage,
    sortBy: 'createdAt',
    search: searchTerm || undefined,
    category: category !== 'all' ? category : undefined,
  });

  const [approveCampaign] = useApproveCampaignMutation();
  const [rejectCampaign] = useRejectCampaignMutation();
  const [deleteAdminCampaign] = useDeleteAdminCampaignMutation();
  const [markSuccessStory, { isLoading: isSavingStory }] = useMarkSuccessStoryMutation();

  // User management
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetAllUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [userDeleteModal, setUserDeleteModal] = useState({ isOpen: false, user: null, isDeleting: false });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, campaign: null, isDeleting: false });
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({ campaign: null, message: '', videoUrl: '', images: [] });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagePreviews, setImagePreviews] = useState([]);

  const stats = realTimeStats || statsData?.data || {};
  const pendingCampaigns = pendingData?.data || [];
  const approvedCampaigns = realTimeCampaigns || approvedData?.data || [];
  const users = usersData?.data || [];

  // Build category options
  const categoryOptions = useMemo(() => {
    const cats = new Set();
    pendingCampaigns.forEach(c => c.category && cats.add(c.category));
    approvedCampaigns.forEach(c => c.category && cats.add(c.category));
    (stats.topCampaigns || []).forEach(c => c.category && cats.add(c.category));
    return ['all', ...Array.from(cats)];
  }, [pendingCampaigns, approvedCampaigns, stats.topCampaigns]);

  // --- Real-time Socket Logic ---
  useEffect(() => {
    const socket = ensureSocketConnected({ userId: user?.id, role: 'admin' });
    if (!socket) return;
    const onNewCampaign = () => refetchPending();
    const onCampaignUpdate = (updated) => {
      setRealTimeCampaigns((prev) => {
        if (!prev) return null;
        return prev.map((c) =>
          c._id === updated._id
            ? { ...c, raisedAmount: updated.raisedAmount, goalAmount: updated.goalAmount, donorCount: updated.donorCount, status: updated.status }
            : c
        );
      });
      refetchApproved();
    };
    const onDashboardStats = (newStats) => {
      setRealTimeStats((prev) => ({ ...prev, ...newStats }));
      refetchStats();
    };
    socket.on('admin:campaign:new', onNewCampaign);
    socket.on('campaign:updated', onCampaignUpdate);
    socket.on('dashboard:stats', onDashboardStats);
    return () => {
      socket.off('admin:campaign:new', onNewCampaign);
      socket.off('campaign:updated', onCampaignUpdate);
      socket.off('dashboard:stats', onDashboardStats);
    };
  }, [user?.id, refetchPending, refetchApproved, refetchStats]);

  useEffect(() => {
    if (statsData?.data) setRealTimeStats(statsData.data);
  }, [statsData]);

  useEffect(() => {
    if (approvedData?.data) setRealTimeCampaigns(approvedData.data);
  }, [approvedData]);

  // --- Handlers ---
  const handleApprove = async (id) => {
    try {
      await approveCampaign(id).unwrap();
      toast.success('Campaign approved successfully!');
    } catch (error) { toast.error('Failed to approve campaign'); }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      await rejectCampaign({ id, rejectionReason }).unwrap();
      toast.success('Campaign rejected');
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) { toast.error('Failed to reject campaign'); }
  };

  const handleDeleteClick = (campaign) => setDeleteModal({ isOpen: true, campaign, isDeleting: false });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.campaign) return;
    setDeleteModal({ ...deleteModal, isDeleting: true });
    try {
      await deleteAdminCampaign(deleteModal.campaign._id).unwrap();
      toast.success('Campaign deleted successfully');
      setDeleteModal({ isOpen: false, campaign: null, isDeleting: false });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete campaign');
      setDeleteModal({ ...deleteModal, isDeleting: false });
    }
  };

  const openStoryModal = (campaign) => {
    setStoryForm({
      campaign,
      message: campaign.storyDetails?.message || '',
      videoUrl: campaign.storyDetails?.videoUrl || '',
      images: [],
    });
    setImagePreviews(campaign.storyDetails?.images || []);
    setCurrentImageIndex(0);
    setIsStoryModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isStoryModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isStoryModalOpen]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setStoryForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removeImage = (index) => {
    setStoryForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleStorySubmit = async () => {
    if (!storyForm.campaign) return;
    const formData = new FormData();
    formData.append('message', storyForm.message ?? '');
    formData.append('videoUrl', storyForm.videoUrl ?? '');
    storyForm.images.forEach((img) => formData.append('images', img));
    try {
      await markSuccessStory({ id: storyForm.campaign._id, formData }).unwrap();
      toast.success('Success story saved!');
      setIsStoryModalOpen(false);
      document.body.style.overflow = 'unset';
      setStoryForm({ campaign: null, message: '', videoUrl: '', images: [] });
    } catch (err) { toast.error(err?.data?.message || 'Failed to save success story'); }
  };

  // User management handlers
  const handleToggleUserStatus = async (userId) => {
    try {
      const result = await toggleUserStatus(userId).unwrap();
      toast.success(result.message || 'User status updated successfully');
      refetchUsers();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update user status');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateUserRole({ id: userId, role: newRole }).unwrap();
      toast.success('User role updated successfully');
      refetchUsers();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUserClick = (user) => {
    setUserDeleteModal({ isOpen: true, user, isDeleting: false });
  };

  const handleDeleteUserConfirm = async () => {
    if (!userDeleteModal.user) return;
    setUserDeleteModal({ ...userDeleteModal, isDeleting: true });
    try {
      await deleteUser(userDeleteModal.user._id).unwrap();
      toast.success('User deleted successfully');
      setUserDeleteModal({ isOpen: false, user: null, isDeleting: false });
      refetchUsers();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete user');
      setUserDeleteModal({ ...userDeleteModal, isDeleting: false });
    }
  };

  // Sort and filter users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];
    
    // Filter
    if (userSearchTerm) {
      const search = userSearchTerm.toLowerCase();
      result = result.filter(user =>
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search)
      );
    }
    
    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'name' || sortConfig.key === 'email') {
          aVal = (aVal || '').toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [users, userSearchTerm, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // Generate sparkline data (mock 7-day trend)
  const generateSparklineData = (baseValue) => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: baseValue + Math.random() * baseValue * 0.2 - baseValue * 0.1,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Overview of platform performance and moderation</p>
          </motion.div>

          {/* Toolbar: Search, Filters, and Tab Dropdown */}
          <Toolbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={(value) => {
              setSearchTerm(value);
              setApprovedPage(1);
              setTopPage(1);
            }}
            category={category}
            setCategory={(value) => {
              setCategory(value);
              setApprovedPage(1);
              setTopPage(1);
            }}
            categoryOptions={categoryOptions}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            onRefresh={() => {
              if (activeTab === 'pending') refetchPending();
              else if (activeTab === 'approved') refetchApproved();
              else if (activeTab === 'users') refetchUsers();
              else refetchStats();
            }}
            pendingCount={pendingCampaigns.length}
            approvedCampaignsCount={approvedCampaigns.length}
          />

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                title="Total Campaigns"
                value={stats.campaigns?.total || 0}
                icon={FiFileText}
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
                trend="up"
                trendValue="12"
                sparklineData={generateSparklineData(stats.campaigns?.total || 0)}
                gradientFrom="from-purple-400"
                gradientTo="to-purple-600"
              />
              <StatCard
                title="Pending Approval"
                value={stats.campaigns?.pending || 0}
                icon={FiAlertCircle}
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
                trend={stats.campaigns?.pending > 5 ? 'up' : 'down'}
                trendValue={stats.campaigns?.pending > 5 ? '8' : '3'}
                sparklineData={generateSparklineData(stats.campaigns?.pending || 0)}
                gradientFrom="from-amber-400"
                gradientTo="to-amber-600"
              />
              <StatCard
                title="Total Users"
                value={stats.users?.total || 0}
                icon={FiUsers}
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
                trend="up"
                trendValue="15"
                sparklineData={generateSparklineData(stats.users?.total || 0)}
                gradientFrom="from-blue-400"
                gradientTo="to-blue-600"
              />
              <StatCard
                title="Total Donations"
                value={stats.donations?.total || 0}
                icon={FiHeart}
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
                trend="up"
                trendValue="24"
                sparklineData={generateSparklineData(stats.donations?.total || 0)}
                gradientFrom="from-emerald-400"
                gradientTo="to-emerald-600"
              />
            </motion.div>
          )}

          {/* Charts Section */}
          {!statsLoading && stats.donationsByCategory && stats.donationsByCategory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="pb-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Analytics Overview</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donations by Category</h3>
                <ResponsiveContainer width="100%" height={350}>
                  {(() => {
                    // Transform data: convert _id to name and ensure proper structure
                    const pieData = (stats.donationsByCategory || [])
                      .slice(0, 5)
                      .map(item => ({
                        name: item._id || item.category || 'Unknown',
                        value: Number(item.total) || 0,
                        count: Number(item.count) || 0
                      }))
                      .filter(item => item.value > 0); // Only show categories with donations
                    
                    const total = pieData.reduce((sum, item) => sum + item.value, 0);
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    
                    if (pieData.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <FiBarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No donation data available</p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <PieChart>
                        <defs>
                          {pieData.map((entry, index) => (
                            <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={1} />
                              <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.7} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#pieGradient-${index})`}
                              stroke={colors[index % colors.length]}
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percent = total > 0 ? ((data.value / total) * 100).toFixed(2) : '0';
                              return (
                                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                  <p className="font-semibold text-gray-900">{data.name}</p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Amount: <span className="font-semibold text-primary-600">रु {data.value.toLocaleString('en-IN')}</span>
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Percentage: <span className="font-semibold text-gray-900">{percent}%</span>
                                  </p>
                                  {data.count > 0 && (
                                    <p className="text-sm text-gray-600">
                                      Donations: <span className="font-semibold text-gray-900">{data.count}</span>
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          formatter={(value, entry) => {
                            const item = pieData.find(d => d.name === value);
                            const percent = item && total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                            return `${value} (${percent}%)`;
                          }}
                          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                        />
                      </PieChart>
                    );
                  })()}
                </ResponsiveContainer>
              </div>

              {/* Top Campaigns Bar Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Campaigns Performance</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={(stats.topCampaigns || []).slice(0, 5).map(c => ({
                      ...c,
                      shortTitle: c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title
                    }))}
                    margin={{ top: 30, right: 30, left: 20, bottom: 60 }}
                    barCategoryGap="20%"
                  >
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="shortTitle" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      fontSize={11}
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `रु ${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `रु ${(value / 1000).toFixed(1)}K`;
                        return `रु ${value}`;
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percentage = ((data.raisedAmount / data.goalAmount) * 100).toFixed(1);
                          return (
                            <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                              <p className="font-semibold text-gray-900 mb-2">{data.title}</p>
                              <p className="text-sm text-gray-600">
                                Raised: <span className="font-semibold text-primary-600">रु {data.raisedAmount.toLocaleString('en-IN')}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Goal: <span className="font-semibold text-gray-700">रु {data.goalAmount.toLocaleString('en-IN')}</span>
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Progress: <span className="font-semibold text-emerald-600">{percentage}%</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="raisedAmount" 
                      fill="url(#barGradient)" 
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                      label={({ value, x, y, width, height }) => {
                        const formattedValue = value >= 1000000 
                          ? `रु ${(value / 1000000).toFixed(1)}M`
                          : value >= 1000
                          ? `रु ${(value / 1000).toFixed(1)}K`
                          : `रु ${value}`;
                        return (
                          <text
                            x={x + width / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#374151"
                            fontWeight="600"
                          >
                            {formattedValue}
                          </text>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              </div>
            </motion.div>
          )}


          {/* Content Area with Tab Transitions */}
          <AnimatePresence mode="wait">
            {activeTab === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Pending Review</h2>
                      <p className="text-sm text-gray-500 mt-1">Review and approve pending campaigns</p>
                    </div>
                    {pendingCampaigns.length > 0 && (
                      <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-semibold text-sm">
                        {pendingCampaigns.length} Pending
                      </span>
                    )}
                  </div>
                </div>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                        <SkeletonLoader className="h-6 w-3/4 mb-4" />
                        <SkeletonLoader className="h-4 w-full mb-2" />
                        <SkeletonLoader className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : pendingCampaigns
                    .filter(c => (category === 'all' ? true : c.category === category))
                    .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
                    .length === 0 ? (
                  <EmptyState
                    message="No pending campaigns found. All campaigns have been reviewed."
                    icon={FiCheckCircle}
                  />
                ) : (
                  <div className="space-y-4">
                    {pendingCampaigns
                      .filter(c => (category === 'all' ? true : c.category === category))
                      .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
                      .map((campaign, index) => (
                        <motion.div
                          key={campaign._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CollapsibleCampaignCard
                            campaign={campaign}
                            type="pending"
                            rightActions={
                              <div className="flex flex-col gap-2 min-w-[140px]">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleApprove(campaign._id)}
                                  className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                >
                                  <FiCheck className="w-4 h-4" /> Approve
                                </motion.button>
                                {rejectingId === campaign._id ? (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 p-3 rounded-xl border border-red-200"
                                  >
                                    <textarea
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      placeholder="Rejection reason..."
                                      className="w-full p-2 text-xs border border-red-300 rounded-lg mb-2 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                      rows="2"
                                      autoFocus
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleReject(campaign._id)}
                                        className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded-lg hover:bg-red-700 font-medium transition"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                                        className="flex-1 bg-white text-gray-600 text-xs py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setRejectingId(campaign._id); setRejectionReason(''); }}
                                    className="w-full px-4 py-2.5 bg-white text-red-600 border-2 border-red-200 text-sm font-semibold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                  >
                                    <FiX className="w-4 h-4" /> Reject
                                  </motion.button>
                                )}
                              </div>
                            }
                          />
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'approved' && (
              <motion.div
                key="approved"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage approved and active campaigns</p>
                  </div>
                </div>
                {approvedLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                        <SkeletonLoader className="h-6 w-3/4 mb-4" />
                        <SkeletonLoader className="h-4 w-full mb-2" />
                        <SkeletonLoader className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : approvedCampaigns.length === 0 ? (
                  <EmptyState
                    message="No approved campaigns found"
                    icon={FiFileText}
                  />
                ) : (
                  <>
                    <div className="space-y-4">
                      {approvedCampaigns.map((campaign, index) => (
                        <motion.div
                          key={campaign._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CollapsibleCampaignCard
                            campaign={campaign}
                            type="approved"
                            rightActions={
                              <div className="flex flex-col gap-2 min-w-[180px]">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => openStoryModal(campaign)}
                                  className={`w-full px-4 py-2.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
                                    campaign.isSuccessStory
                                      ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200 hover:bg-emerald-200 shadow-sm'
                                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                                  }`}
                                >
                                  <FiAward className={`w-4 h-4 ${campaign.isSuccessStory ? 'text-emerald-800' : 'text-white'}`} />
                                  {campaign.isSuccessStory ? 'Update Story' : 'Mark Success'}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleDeleteClick(campaign)}
                                  className="w-full px-4 py-2.5 bg-white text-red-600 border-2 border-red-200 text-sm font-semibold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                >
                                  <FiTrash2 className="w-4 h-4" /> Delete
                                </motion.button>
                              </div>
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                    <Pagination page={approvedPage} onPageChange={setApprovedPage} hasNext={approvedCampaigns.length === APPROVED_PER_PAGE} />
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'top' && (
              <motion.div
                key="top"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Top Performing Campaigns</h2>
                    <p className="text-sm text-gray-500 mt-1">Highest earning campaigns on the platform</p>
                  </div>
                </div>
                {(() => {
                  const filtered = (stats.topCampaigns || [])
                    .filter(c => (category === 'all' ? true : c.category === category))
                    .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())) : true));
                  const start = (topPage - 1) * TOP_PER_PAGE;
                  const pageItems = filtered.slice(start, start + TOP_PER_PAGE);

                  if (pageItems.length === 0) {
                    return <EmptyState message="No top campaigns found" icon={FiTrendingUp} />;
                  }

                  return (
                    <>
                      <div className="space-y-4">
                        {pageItems.map((campaign, index) => {
                          const percentage = Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100);
                          return (
                            <motion.div
                              key={campaign._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Link
                                to={`/campaign/${campaign._id}`}
                                className="block bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold">{campaign.category}</span>
                                      {formatDate(campaign.createdAt) && (
                                        <span className="text-xs text-gray-400">• {formatDate(campaign.createdAt)}</span>
                                      )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-xl mb-2">
                                      {campaign.title}
                                    </h3>
                                    <div className="mt-2 text-sm text-gray-600">
                                      Raised <span className="font-bold text-gray-900 text-base">रु {campaign.raisedAmount.toLocaleString()}</span> of रु {campaign.goalAmount.toLocaleString()}
                                    </div>
                                  </div>
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg"
                                  >
                                    <FiTrendingUp className="text-white w-6 h-6" />
                                  </motion.div>
                                </div>
                                <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full shadow-sm"
                                  />
                                </div>
                                <div className="mt-2 text-right text-xs font-semibold text-primary-600">
                                  {percentage.toFixed(1)}% Complete
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                      <Pagination page={topPage} onPageChange={setTopPage} hasNext={filtered.length > topPage * TOP_PER_PAGE} />
                    </>
                  );
                })()}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="pb-3 border-b border-gray-100 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-500 mt-1">Manage user roles, permissions, and account status</p>
                    </div>
                    <div className="flex items-center gap-3">
                    {selectedUsers.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold text-sm"
                      >
                        {selectedUsers.size} selected
                      </motion.div>
                    )}
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-semibold text-sm">
                      {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'User' : 'Users'}
                    </span>
                    </div>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <SkeletonLoader className="w-12 h-12 rounded-xl" />
                          <div className="flex-1">
                            <SkeletonLoader className="h-4 w-32 mb-2" />
                            <SkeletonLoader className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : filteredAndSortedUsers.length === 0 ? (
                  <EmptyState message="No users found" icon={FiUsers} />
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedUsers.size === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers(new Set(filteredAndSortedUsers.map(u => u._id)));
                                  } else {
                                    setSelectedUsers(new Set());
                                  }
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                              />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-2 hover:text-gray-900 transition group"
                              >
                                User
                                {sortConfig.key === 'name' ? (
                                  sortConfig.direction === 'asc' ? (
                                    <FiArrowUp className="w-4 h-4 text-primary-600" />
                                  ) : (
                                    <FiArrowDown className="w-4 h-4 text-primary-600" />
                                  )
                                ) : (
                                  <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Contact
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <button
                                onClick={() => handleSort('role')}
                                className="flex items-center gap-2 hover:text-gray-900 transition group"
                              >
                                Role
                                {sortConfig.key === 'role' ? (
                                  sortConfig.direction === 'asc' ? (
                                    <FiArrowUp className="w-4 h-4 text-primary-600" />
                                  ) : (
                                    <FiArrowDown className="w-4 h-4 text-primary-600" />
                                  )
                                ) : (
                                  <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              <button
                                onClick={() => handleSort('status')}
                                className="flex items-center gap-2 hover:text-gray-900 transition group"
                              >
                                Status
                                {sortConfig.key === 'status' ? (
                                  sortConfig.direction === 'asc' ? (
                                    <FiArrowUp className="w-4 h-4 text-primary-600" />
                                  ) : (
                                    <FiArrowDown className="w-4 h-4 text-primary-600" />
                                  )
                                ) : (
                                  <FiChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Activity</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredAndSortedUsers.map((user) => {
                          const profileImageUrl = user.profileImage || user.avatar;
                          const campaignsCount = user.campaignsCreated?.length || 0;
                          const totalDonated = user.totalDonated || 0;
                          const rewardPoints = user.rewardPoints || 0;

                            const isExpanded = expandedUsers.has(user._id);
                            const isSelected = selectedUsers.has(user._id);
                            
                            return (
                              <>
                                <tr
                                  key={user._id}
                                  className={`bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 border-b border-gray-100 group cursor-pointer ${
                                    isSelected ? 'bg-primary-50/50' : ''
                                  }`}
                                >
                                  <td className="px-6 py-5">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleUserSelection(user._id)}
                                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-6 py-5">
                                    <div className="flex items-center">
                                      {/* Enhanced Avatar with Ring & Status */}
                                      <div className="relative flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50 ring-2 ring-primary-100/50 shadow-sm group-hover:ring-primary-200 transition-all">
                                          {profileImageUrl ? (
                                            <img
                                              src={`http://localhost:5000/${profileImageUrl}`}
                                              alt={user.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <FiUser className="text-primary-600 w-6 h-6" />
                                            </div>
                                          )}
                                        </div>
                                        {/* Online Status Indicator */}
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                      </div>
                                      
                                      {/* Better Text Hierarchy */}
                                      <div className="ml-4">
                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 cursor-pointer transition-colors flex items-center gap-2">
                                          {user.name}
                                          {user.role === 'admin' && (
                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full ring-1 ring-red-200">ADMIN</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                                      </div>
                                    </div>
                                  </td>
                              <td className="px-6 py-5">
                                <div className="space-y-2">
                                  {/* Phone with Better Icon */}
                                  {user.phone && (
                                    <div className="flex items-center text-sm text-gray-700">
                                      <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                                        <FiPhone className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <span className="font-medium">{user.phone}</span>
                                    </div>
                                  )}
                                  
                                  {/* Address with Better Icon */}
                                  {user.address && (
                                    <div className="flex items-start text-sm text-gray-700">
                                      <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                                        <FiMapPin className="w-4 h-4 text-purple-600" />
                                      </div>
                                      <span className="line-clamp-1">{user.address}</span>
                                    </div>
                                  )}
                                  
                                  {/* Empty State */}
                                  {!user.phone && !user.address && (
                                    <div className="flex items-center text-xs text-gray-400 italic">
                                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                                      <span>No contact information</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                  className="text-sm font-medium border-2 border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-300 bg-white hover:border-gray-300 transition-all cursor-pointer shadow-sm"
                                >
                                  <option value="visitor">🔵 Visitor</option>
                                  <option value="creator">🟢 Creator</option>
                                  <option value="admin">🔴 Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                {/* Active Status with Pulse */}
                                {user.status === 'active' ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold ring-1 ring-emerald-200">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Active
                                  </span>
                                ) : (
                                  /* Inactive Status */
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-bold ring-1 ring-red-200">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Frozen
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-5">
                                <div className="space-y-2">
                                  {/* Campaigns Count */}
                                  {campaignsCount > 0 && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                                      <FiFileText className="w-4 h-4" />
                                      <span>{campaignsCount} campaign{campaignsCount > 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                  
                                  {/* Total Donated */}
                                  {totalDonated > 0 && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                                      <FiDollarSign className="w-4 h-4" />
                                      <span>रु {totalDonated.toLocaleString()}</span>
                                    </div>
                                  )}
                                  
                                  {/* Reward Points */}
                                  {rewardPoints > 0 && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                                      <FiAward className="w-4 h-4" />
                                      <span>{rewardPoints.toLocaleString()} pts</span>
                                    </div>
                                  )}
                                  
                                  {/* Empty State */}
                                  {campaignsCount === 0 && totalDonated === 0 && rewardPoints === 0 && (
                                    <div className="flex items-center text-xs text-gray-400 italic">
                                      <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                                      No activity yet
                                    </div>
                                  )}
                                </div>
                              </td>
                                  <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      {/* View Details Button - Individual Tooltip */}
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleUserExpansion(user._id)}
                                        className="group relative p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md ring-1 ring-blue-200"
                                      >
                                        <FiEye className="w-4 h-4" />
                                        
                                        {/* Tooltip only shows when THIS button is hovered */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap z-50">
                                          View Details
                                          {/* Arrow pointing down */}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="border-4 border-transparent border-t-gray-900"></div>
                                          </div>
                                        </div>
                                      </motion.button>
                                      
                                      {/* Lock/Unlock Button - Individual Tooltip */}
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleToggleUserStatus(user._id)}
                                        className={`group relative p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md ring-1 ${
                                          user.status === 'active'
                                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 ring-amber-200'
                                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 ring-emerald-200'
                                        }`}
                                      >
                                        {user.status === 'active' ? (
                                          <FiLock className="w-4 h-4" />
                                        ) : (
                                          <FiUnlock className="w-4 h-4" />
                                        )}
                                        
                                        {/* Tooltip only shows when THIS button is hovered */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap z-50">
                                          {user.status === 'active' ? 'Freeze Account' : 'Unfreeze Account'}
                                          {/* Arrow pointing down */}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="border-4 border-transparent border-t-gray-900"></div>
                                          </div>
                                        </div>
                                      </motion.button>
                                      
                                      {/* Delete Button - Individual Tooltip */}
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeleteUserClick(user)}
                                        className="group relative p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-md ring-1 ring-red-200"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                        
                                        {/* Tooltip only shows when THIS button is hovered */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap z-50">
                                          Delete User
                                          {/* Arrow pointing down */}
                                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                                            <div className="border-4 border-transparent border-t-gray-900"></div>
                                          </div>
                                        </div>
                                      </motion.button>
                                    </div>
                                  </td>
                                </tr>
                                {/* Expandable Row Details */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.tr
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="bg-gray-50"
                                    >
                                      <td colSpan={7} className="px-6 py-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                          <div>
                                            <span className="block text-gray-500 text-xs font-medium mb-1">Joined</span>
                                            <span className="text-gray-900 font-medium">
                                              {formatDate(user.createdAt) || 'N/A'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="block text-gray-500 text-xs font-medium mb-1">Last Active</span>
                                            <span className="text-gray-900 font-medium">
                                              {formatDate(user.lastLogin) || 'Never'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="block text-gray-500 text-xs font-medium mb-1">Campaigns</span>
                                            <span className="text-gray-900 font-medium">{campaignsCount}</span>
                                          </div>
                                          <div>
                                            <span className="block text-gray-500 text-xs font-medium mb-1">Total Donated</span>
                                            <span className="text-gray-900 font-medium">रु {totalDonated.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  )}
                                </AnimatePresence>
                              </>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 z-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center font-bold text-sm">
              {selectedUsers.size}
            </div>
            <span className="font-medium">users selected</span>
          </div>
          
          <div className="h-6 w-px bg-gray-700"></div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const promises = Array.from(selectedUsers).map(userId => {
                  const user = filteredAndSortedUsers.find(u => u._id === userId);
                  if (user && user.status !== 'active') {
                    return handleToggleUserStatus(userId);
                  }
                  return Promise.resolve();
                });
                await Promise.all(promises);
                toast.success(`${selectedUsers.size} users activated`);
                setSelectedUsers(new Set());
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FiUnlock className="w-4 h-4" />
              Activate All
            </button>
            
            <button
              onClick={async () => {
                const promises = Array.from(selectedUsers).map(userId => {
                  const user = filteredAndSortedUsers.find(u => u._id === userId);
                  if (user && user.status === 'active') {
                    return handleToggleUserStatus(userId);
                  }
                  return Promise.resolve();
                });
                await Promise.all(promises);
                toast.success(`${selectedUsers.size} users frozen`);
                setSelectedUsers(new Set());
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FiLock className="w-4 h-4" />
              Freeze All
            </button>
          </div>
          
          <button 
            onClick={() => setSelectedUsers(new Set())}
            className="ml-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Clear Selection"
          >
            <FiX className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      {/* Delete Campaign Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => !deleteModal.isDeleting && setDeleteModal({ isOpen: false, campaign: null, isDeleting: false })}
        onConfirm={handleDeleteConfirm}
        title={deleteModal.campaign?.title || ''}
        subtitle={deleteModal.campaign ? `${deleteModal.campaign.category} • Goal: रु ${deleteModal.campaign.goalAmount?.toLocaleString()}` : ''}
        isLoading={deleteModal.isDeleting}
      />

      {/* Delete User Modal */}
      <DeleteConfirmModal
        isOpen={userDeleteModal.isOpen}
        onClose={() => !userDeleteModal.isDeleting && setUserDeleteModal({ isOpen: false, user: null, isDeleting: false })}
        onConfirm={handleDeleteUserConfirm}
        title={userDeleteModal.user?.name || ''}
        subtitle={userDeleteModal.user ? `${userDeleteModal.user.email} • ${userDeleteModal.user.role}` : ''}
        isLoading={userDeleteModal.isDeleting}
      />

      {/* Enhanced Success Story Modal */}
      <AnimatePresence>
        {isStoryModalOpen && storyForm.campaign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => {
              if (!isSavingStory) {
                setIsStoryModalOpen(false);
                document.body.style.overflow = 'unset';
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative z-[101]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    {storyForm.campaign.isSuccessStory ? 'Edit Success Story' : 'Create Success Story'}
                  </h3>
                  <p className="text-xs text-gray-500 truncate mt-1">{storyForm.campaign.title}</p>
                </div>
                <button
                  onClick={() => {
                    setIsStoryModalOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                  disabled={isSavingStory}
                  className="p-2 hover:bg-gray-200 rounded-xl transition text-gray-500 disabled:opacity-50"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-hide" style={{ maxHeight: 'calc(85vh - 160px)' }}>
                {/* Image Carousel */}
                {imagePreviews.length > 0 && (
                  <div className="relative">
                    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imagePreviews[currentImageIndex]}
                        alt={`Preview ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {imagePreviews.length > 1 && (
                        <>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev - 1 + imagePreviews.length) % imagePreviews.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                          >
                            <FiChevronLeft className="w-5 h-5 text-gray-700" />
                          </button>
                          <button
                            onClick={() => setCurrentImageIndex((prev) => (prev + 1) % imagePreviews.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                          >
                            <FiChevronRight className="w-5 h-5 text-gray-700" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {imagePreviews.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setCurrentImageIndex(i)}
                                className={`w-2 h-2 rounded-full transition ${
                                  i === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={preview}
                            alt={`Thumbnail ${i + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-transparent group-hover:border-primary-500 cursor-pointer transition"
                            onClick={() => setCurrentImageIndex(i)}
                          />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Impact Message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Impact Message</label>
                  <textarea
                    value={storyForm.message}
                    onChange={(e) => setStoryForm((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Share the impact of this campaign... How did it help? What changed?"
                    rows={4}
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
                  />
                </div>

                {/* Video Link */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Video Link</label>
                  <div className="relative">
                    <FiVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="url"
                      value={storyForm.videoUrl}
                      onChange={(e) => setStoryForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>
                </div>

                {/* Upload New Images */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Add More Images</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition duration-200 group">
                    <FiUpload className="w-8 h-8 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-gray-900">Click to upload images</span>
                    <span className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB each</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setIsStoryModalOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                  disabled={isSavingStory}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStorySubmit}
                  disabled={isSavingStory}
                  className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-md hover:shadow-lg disabled:opacity-70 transition flex items-center gap-2"
                >
                  {isSavingStory ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Save Story
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const EmptyState = ({ message, icon: Icon = FiSearch, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 text-center"
  >
    <motion.div
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      className="bg-gradient-to-br from-primary-100 to-primary-50 p-6 rounded-full mb-4 shadow-sm"
    >
      <Icon className="w-12 h-12 text-primary-600" />
    </motion.div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
    <p className="text-gray-500 mb-6 max-w-md">{message}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition shadow-sm hover:shadow-md"
      >
        {actionLabel}
      </button>
    )}
  </motion.div>
);

const CollapsibleCampaignCard = ({ campaign, rightActions, type }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate Progress
  const percentage = campaign.goalAmount ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100) : 0;
  
  // Calculate days remaining
  const daysRemaining = campaign.deadline
    ? Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  const getDeadlineColor = () => {
    if (!daysRemaining) return 'text-gray-500';
    if (daysRemaining <= 7) return 'text-red-600';
    if (daysRemaining <= 30) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const campaignImage = campaign.images?.[0] || campaign.image;
  const imageUrl = campaignImage ? `http://localhost:5000/${campaignImage}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden group hover:shadow-lg ${
        expanded ? 'shadow-lg border-primary-200 ring-2 ring-primary-50' : 'shadow-sm border-gray-100'
      }`}
    >
      <div className="flex gap-4 p-5">
        {/* LEFT: Smaller Campaign Image */}
        {imageUrl && !imageError && (
          <div className="flex-shrink-0 w-48 h-32 rounded-xl overflow-hidden bg-gray-100 relative">
            <img
              src={imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
            {type === 'pending' && daysRemaining !== null && daysRemaining <= 7 && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                  URGENT
                </span>
              </div>
            )}
          </div>
        )}

        {/* MIDDLE: Campaign Info (takes up remaining space) */}
        <div className="flex-1 min-w-0">
          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                type === 'pending'
                  ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                  : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
              }`}
            >
              {type === 'pending' ? '⏳ Pending' : '✓ Active'}
            </motion.span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              {campaign.category}
            </span>
            {campaign.isSuccessStory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold ring-1 ring-purple-200">
                <FiAward className="w-3 h-3" /> Success Story
              </span>
            )}
            {daysRemaining !== null && (
              <span className={`px-3 py-1 rounded-full bg-gray-50 text-xs font-medium ${getDeadlineColor()}`}>
                <FiClock className="w-3 h-3 inline mr-1" />
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <Link
              to={`/campaign/${campaign._id}`}
              className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 flex-1"
            >
              {campaign.title}
            </Link>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition flex-shrink-0"
            >
              {expanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Description */}
          <p className={`text-sm text-gray-600 mb-3 ${!expanded ? 'line-clamp-2' : ''}`}>
            {campaign.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Raised: <span className="font-semibold text-gray-900">रु {campaign.raisedAmount?.toLocaleString() || 0}</span></span>
              <span>Goal: <span className="font-semibold text-gray-900">रु {campaign.goalAmount?.toLocaleString() || 0}</span></span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-2 rounded-full ${
                  type === 'pending'
                    ? 'bg-amber-500'
                    : percentage >= 100
                    ? 'bg-emerald-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
            <div className="text-right text-xs font-semibold text-primary-600 mt-1">
              {percentage.toFixed(1)}% Complete
            </div>
          </div>

          {/* Creator Info */}
          {campaign.fundraiser && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 ring-1 ring-blue-200">
                {(() => {
                  const profileImageUrl = campaign.fundraiser.profileImage || campaign.fundraiser.avatar;
                  if (profileImageUrl) {
                    return (
                      <>
                        <img
                          src={`http://localhost:5000/${profileImageUrl}`}
                          alt={campaign.fundraiser.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.profile-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="profile-fallback w-full h-full absolute inset-0 flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold" style={{ display: 'none' }}>
                          {campaign.fundraiser.name?.charAt(0)?.toUpperCase() || 'F'}
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xs font-semibold">
                      {campaign.fundraiser.name?.charAt(0)?.toUpperCase() || 'F'}
                    </div>
                  );
                })()}
              </div>
              <span className="font-medium">{campaign.fundraiser.name}</span>
              <span className="text-gray-400">•</span>
              <span>{formatDate(campaign.createdAt) || 'N/A'}</span>
            </div>
          )}

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-100 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-gray-400 text-xs font-medium mb-1">Donors</span>
                    <span className="font-semibold text-gray-900">{campaign.donorCount || 0}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-xs font-medium mb-1">Created</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(campaign.createdAt) || 'N/A'}
                    </span>
                  </div>
                  {campaign.deadline && formatDate(campaign.deadline) && (
                    <div>
                      <span className="block text-gray-400 text-xs font-medium mb-1">Deadline</span>
                      <span className={`font-semibold ${getDeadlineColor()}`}>
                        {formatDate(campaign.deadline)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: Action Buttons */}
        {rightActions && (
          <div className="flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Pagination = ({ page, onPageChange, hasNext }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    <button
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition bg-gray-50/50"
    >
      Previous
    </button>
    <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 shadow-sm">
      Page {page}
    </span>
    <button
      onClick={() => onPageChange(page + 1)}
      disabled={!hasNext}
      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition bg-gray-50/50"
    >
      Next
    </button>
  </div>
);

export default AdminDashboard;