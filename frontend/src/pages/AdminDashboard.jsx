import { useState, useEffect, useMemo } from 'react';
import { useGetDashboardStatsQuery, useGetPendingCampaignsQuery, useApproveCampaignMutation, useRejectCampaignMutation, useDeleteAdminCampaignMutation, useGetCampaignsQuery, useMarkSuccessStoryMutation, useGetAllUsersQuery, useUpdateUserRoleMutation, useToggleUserStatusMutation, useDeleteUserMutation } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrendingUp, FiUsers, FiHeart, FiFileText, FiChevronDown, FiChevronUp, FiSearch, FiAward, FiUpload, FiVideo, FiFilter, FiUser, FiLock, FiUnlock, FiTrash2, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ensureSocketConnected } from '../services/socket';
import { useSelector } from 'react-redux';

const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  </div>
);

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

  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, campaign: null, isDeleting: false });
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({ campaign: null, message: '', videoUrl: '', images: [] });

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
    setIsStoryModalOpen(true);
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

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    const search = userSearchTerm.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  }, [users, userSearchTerm]);

  if (statsLoading || pendingLoading || approvedLoading || (activeTab === 'users' && usersLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of platform performance and moderation.</p>
        </div>

        {/* Stats Grid (Sticky) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-200/50">
          <StatCard 
            title="Total Campaigns" 
            value={stats.campaigns?.total || 0} 
            icon={FiFileText} 
            colorClass="text-purple-600" 
            bgClass="bg-purple-50"
          />
          <StatCard 
            title="Pending Approval" 
            value={stats.campaigns?.pending || 0} 
            icon={FiTrendingUp} 
            colorClass="text-amber-600" 
            bgClass="bg-amber-50"
          />
          <StatCard 
            title="Total Users" 
            value={stats.users?.total || 0} 
            icon={FiUsers} 
            colorClass="text-blue-600" 
            bgClass="bg-blue-50"
          />
          <StatCard 
            title="Total Donations" 
            value={`रु ${stats.donations?.total?.toLocaleString() || '0'}`} 
            icon={FiHeart} 
            colorClass="text-emerald-600" 
            bgClass="bg-emerald-50"
          />
        </div>

        {/* Toolbar: Tabs & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex p-1 bg-gray-100/80 rounded-xl w-full md:w-auto">
            {['pending', 'approved', 'top', 'users'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab 
                    ? 'bg-white text-primary-700 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'pending' && pendingCampaigns.length > 0 && `(${pendingCampaigns.length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={activeTab === 'users' ? userSearchTerm : searchTerm}
                onChange={(e) => {
                  if (activeTab === 'users') {
                    setUserSearchTerm(e.target.value);
                  } else {
                    setSearchTerm(e.target.value);
                    setApprovedPage(1);
                    setTopPage(1);
                  }
                }}
                placeholder={activeTab === 'users' ? 'Search users...' : 'Search campaigns...'}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setApprovedPage(1);
                  setTopPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              >
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt === 'all' ? 'All Categories' : opt}</option>
                ))}
              </select>
              <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'pending' && (
            <div className="animate-fade-in">
               <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Pending Review</h2>
              {pendingCampaigns
                .filter(c => (category === 'all' ? true : c.category === category))
                .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
                .length === 0 ? (
                <EmptyState message="No pending campaigns found" />
              ) : (
                <div className="space-y-4">
                  {pendingCampaigns
                    .filter(c => (category === 'all' ? true : c.category === category))
                    .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
                    .map((campaign) => (
                    <CollapsibleCampaignCard
                      key={campaign._id}
                      campaign={campaign}
                      type="pending"
                      rightActions={
                        <div className="flex flex-col gap-2 min-w-[140px] ml-4">
                          <button
                            onClick={() => handleApprove(campaign._id)}
                            className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <FiCheck className="w-4 h-4" /> Approve
                          </button>
                          {rejectingId === campaign._id ? (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Reason..."
                                className="w-full p-2 text-xs border border-red-200 rounded mb-2 focus:ring-1 focus:ring-red-500"
                                rows="2"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button onClick={() => handleReject(campaign._id)} className="flex-1 bg-red-600 text-white text-xs py-1 rounded hover:bg-red-700">Confirm</button>
                                <button onClick={() => { setRejectingId(null); setRejectionReason(''); }} className="flex-1 bg-white text-gray-600 text-xs py-1 rounded border border-gray-200 hover:bg-gray-50">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setRejectingId(campaign._id); setRejectionReason(''); }}
                              className="w-full px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                            >
                              <FiX className="w-4 h-4" /> Reject
                            </button>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div className="animate-fade-in">
               <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Active Campaigns</h2>
              {approvedCampaigns.length === 0 ? (
                <EmptyState message="No approved campaigns found" />
              ) : (
                <>
                  <div className="space-y-4">
                    {approvedCampaigns.map((campaign) => (
                      <CollapsibleCampaignCard
                        key={campaign._id}
                        campaign={campaign}
                        type="approved"
                        rightActions={
                          <div className="flex flex-col gap-2 min-w-[180px] ml-4">
                            <button
                              onClick={() => openStoryModal(campaign)}
                              className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 shadow-sm ${
                                campaign.isSuccessStory 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' // If already success story, keep light green
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg' // If NOT success story, make SOLID GREEN
                              }`}
                            >
                              <FiAward className={`w-4 h-4 ${campaign.isSuccessStory ? 'text-emerald-800' : 'text-white'}`} />
                              {campaign.isSuccessStory ? 'Update Story' : 'Mark Success'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(campaign)}
                              className="w-full px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                            >
                              <FiX className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        }
                      />
                    ))}
                  </div>
                  <Pagination page={approvedPage} onPageChange={setApprovedPage} hasNext={approvedCampaigns.length === APPROVED_PER_PAGE} />
                </>
              )}
            </div>
          )}

          {activeTab === 'top' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Top Performing</h2>
              {(() => {
                const filtered = (stats.topCampaigns || [])
                  .filter(c => (category === 'all' ? true : c.category === category))
                  .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())) : true));
                const start = (topPage - 1) * TOP_PER_PAGE;
                const pageItems = filtered.slice(start, start + TOP_PER_PAGE);
                
                if (pageItems.length === 0) return <EmptyState message="No top campaigns found" />;

                return (
                  <div className="space-y-4">
                    {pageItems.map((campaign) => (
                      <Link
                        key={campaign._id}
                        to={`/campaign/${campaign._id}`}
                        className="block bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">{campaign.category}</span>
                                <span className="text-xs text-gray-400">• {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg">{campaign.title}</h3>
                            <div className="mt-2 text-sm text-gray-600">
                               Raised <span className="font-semibold text-gray-900">रु {campaign.raisedAmount.toLocaleString()}</span> of रु {campaign.goalAmount.toLocaleString()}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                            <FiTrendingUp className="text-gray-400 group-hover:text-primary-600" />
                          </div>
                        </div>
                        <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100)}%` }}></div>
                        </div>
                      </Link>
                    ))}
                    <Pagination page={topPage} onPageChange={setTopPage} hasNext={filtered.length > topPage * TOP_PER_PAGE} />
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">User Management</h2>
              {filteredUsers.length === 0 ? (
                <EmptyState message="No users found" />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Activity</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => {
                          const profileImageUrl = user.profileImage || user.avatar;
                          const campaignsCount = user.campaignsCreated?.length || 0;
                          const totalDonated = user.totalDonated || 0;
                          const rewardPoints = user.rewardPoints || 0;
                          
                          return (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-primary-100 ring-2 ring-gray-100 flex items-center justify-center">
                                    {profileImageUrl ? (
                                      <img
                                        src={`http://localhost:5000/${profileImageUrl}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : null}
                                    {!profileImageUrl && (
                                      <FiUser className="text-primary-600 w-6 h-6" />
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  {user.phone && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <FiPhone className="w-3.5 h-3.5 mr-2 text-gray-400" />
                                      <span>{user.phone}</span>
                                    </div>
                                  )}
                                  {user.address && (
                                    <div className="flex items-start text-sm text-gray-600">
                                      <FiMapPin className="w-3.5 h-3.5 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                                      <span className="line-clamp-1">{user.address}</span>
                                    </div>
                                  )}
                                  {!user.phone && !user.address && (
                                    <span className="text-xs text-gray-400 italic">No contact info</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                >
                                  <option value="visitor">Visitor</option>
                                  <option value="creator">Creator</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${
                                  user.status === 'active' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.status === 'active' ? 'Active' : 'Frozen'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1 text-sm">
                                  {campaignsCount > 0 && (
                                    <div className="flex items-center text-gray-700">
                                      <FiFileText className="w-3.5 h-3.5 mr-1.5 text-primary-500" />
                                      <span>{campaignsCount} {campaignsCount === 1 ? 'campaign' : 'campaigns'}</span>
                                    </div>
                                  )}
                                  {totalDonated > 0 && (
                                    <div className="flex items-center text-gray-700">
                                      <FiDollarSign className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                                      <span>रु {totalDonated.toLocaleString()} donated</span>
                                    </div>
                                  )}
                                  {rewardPoints > 0 && (
                                    <div className="flex items-center text-gray-700">
                                      <FiAward className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                                      <span>{rewardPoints.toLocaleString()} points</span>
                                    </div>
                                  )}
                                  {campaignsCount === 0 && totalDonated === 0 && rewardPoints === 0 && (
                                    <span className="text-xs text-gray-400 italic">No activity</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleToggleUserStatus(user._id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      user.status === 'active'
                                        ? 'text-amber-600 hover:bg-amber-50'
                                        : 'text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                    title={user.status === 'active' ? 'Freeze Account' : 'Unfreeze Account'}
                                  >
                                    {user.status === 'active' ? (
                                      <FiLock className="w-4 h-4" />
                                    ) : (
                                      <FiUnlock className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUserClick(user)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete User"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      {/* Success Story Modal */}
      {isStoryModalOpen && storyForm.campaign && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                   {storyForm.campaign.isSuccessStory ? 'Edit Success Story' : 'Create Success Story'}
                </h3>
                <p className="text-sm text-gray-500 truncate max-w-md">{storyForm.campaign.title}</p>
              </div>
              <button onClick={() => setIsStoryModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impact Message</label>
                <textarea
                  value={storyForm.message}
                  onChange={(e) => setStoryForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Share the impact of this campaign..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Link</label>
                <div className="relative">
                  <FiVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={storyForm.videoUrl}
                    onChange={(e) => setStoryForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/..."
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition duration-200">
                  <FiUpload className="w-8 h-8 text-primary-500 mb-3" />
                  <span className="text-sm font-medium text-gray-900">Click to upload images</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                       const files = Array.from(e.target.files || []);
                       setStoryForm((prev) => ({ ...prev, images: files }));
                       e.target.value = null;
                    }}
                    className="hidden"
                  />
                </label>
                {storyForm.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                     {storyForm.images.map((f, i) => <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{f.name}</span>)}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition"
                disabled={isSavingStory}
              >
                Cancel
              </button>
              <button
                onClick={handleStorySubmit}
                disabled={isSavingStory}
                className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm disabled:opacity-70 transition"
              >
                {isSavingStory ? 'Saving...' : 'Save Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-2xl border border-dashed border-gray-300 text-center">
    <div className="bg-gray-50 p-4 rounded-full mb-3">
      <FiSearch className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

const CollapsibleCampaignCard = ({ campaign, rightActions, type }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate Progress
  const percentage = campaign.goalAmount ? Math.min((campaign.raisedAmount / campaign.goalAmount) * 100, 100) : 0;

  return (
    <div className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${expanded ? 'shadow-md border-primary-100 ring-1 ring-primary-50' : 'shadow-sm border-gray-100 hover:shadow-md'}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${type === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                 {type === 'pending' ? 'Pending' : 'Active'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                {campaign.category}
              </span>
              {campaign.isSuccessStory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                  <FiAward className="w-3 h-3" /> Success Story
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to={`/campaign/${campaign._id}`} 
                className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1"
              >
                {campaign.title}
              </Link>
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition"
              >
                {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
              </button>
            </div>

            <p className={`text-sm text-gray-600 mt-2 ${!expanded && 'line-clamp-2'}`}>
              {campaign.description}
            </p>

            {/* Progress Bar Visual */}
            <div className="mt-4">
               <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                  <span>Raised: <span className="text-gray-900">रु {campaign.raisedAmount?.toLocaleString()}</span></span>
                  <span>Goal: <span className="text-gray-900">रु {campaign.goalAmount?.toLocaleString()}</span></span>
               </div>
               <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${type === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${percentage}%` }}></div>
               </div>
            </div>

            {expanded && (
               <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                     <span className="block text-gray-400 text-xs">Fundraiser</span>
                     <span className="font-medium text-gray-800">{campaign.fundraiser?.name}</span>
                  </div>
                  <div>
                     <span className="block text-gray-400 text-xs">Date</span>
                     <span className="font-medium text-gray-800">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
               </div>
            )}
          </div>
          {rightActions}
        </div>
      </div>
    </div>
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