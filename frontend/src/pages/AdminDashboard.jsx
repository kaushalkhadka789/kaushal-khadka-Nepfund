import { useState, useEffect, useMemo } from 'react';
import { useGetDashboardStatsQuery, useGetPendingCampaignsQuery, useApproveCampaignMutation, useRejectCampaignMutation, useDeleteAdminCampaignMutation, useGetCampaignsQuery, useMarkSuccessStoryMutation } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrendingUp, FiUsers, FiHeart, FiFileText, FiChevronDown, FiChevronUp, FiSearch, FiAward, FiUpload, FiVideo } from 'react-icons/fi';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ensureSocketConnected } from '../services/socket';
import { useSelector } from 'react-redux';

const buildAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url.substring(1) : url;
  return `http://localhost:5000/${normalized}`;
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStatsQuery();
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useGetPendingCampaignsQuery();
  // Pagination and filters
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'top'
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
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, campaign: null, isDeleting: false });
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({
    campaign: null,
    message: '',
    videoUrl: '',
    images: [],
  });
  const [markSuccessStory, { isLoading: isSavingStory }] = useMarkSuccessStoryMutation();

  const stats = realTimeStats || statsData?.data || {};
  const pendingCampaigns = pendingData?.data || [];
  const approvedCampaigns = realTimeCampaigns || approvedData?.data || [];

  // Build category options from available data
  const categoryOptions = useMemo(() => {
    const cats = new Set();
    pendingCampaigns.forEach(c => c.category && cats.add(c.category));
    approvedCampaigns.forEach(c => c.category && cats.add(c.category));
    (stats.topCampaigns || []).forEach(c => c.category && cats.add(c.category));
    return ['all', ...Array.from(cats)];
  }, [pendingCampaigns, approvedCampaigns, stats.topCampaigns]);

  // Real-time: listen for new campaigns
  useEffect(() => {
    const socket = ensureSocketConnected({ userId: user?.id, role: 'admin' });
    if (!socket) return;

    const onNewCampaign = () => {
      refetchPending();
    };

    const onCampaignUpdate = (updated) => {
      // Update approved campaigns list in real-time
      setRealTimeCampaigns((prev) => {
        if (!prev) return null;
        return prev.map((c) => 
          c._id === updated._id 
            ? { ...c, raisedAmount: updated.raisedAmount, goalAmount: updated.goalAmount, donorCount: updated.donorCount, status: updated.status }
            : c
        );
      });
      // Refetch to ensure data consistency
      refetchApproved();
    };

    const onDashboardStats = (newStats) => {
      setRealTimeStats((prev) => ({ ...prev, ...newStats }));
      // Refetch to ensure data consistency
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

  // Sync real-time state with fetched data
  useEffect(() => {
    if (statsData?.data) {
      setRealTimeStats(statsData.data);
    }
  }, [statsData]);

  useEffect(() => {
    if (approvedData?.data) {
      setRealTimeCampaigns(approvedData.data);
    }
  }, [approvedData]);

  const handleApprove = async (id) => {
    try {
      await approveCampaign(id).unwrap();
      toast.success('Campaign approved successfully!');
    } catch (error) {
      toast.error('Failed to approve campaign');
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await rejectCampaign({ id, rejectionReason }).unwrap();
      toast.success('Campaign rejected');
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      toast.error('Failed to reject campaign');
    }
  };

  const handleDeleteClick = (campaign) => {
    setDeleteModal({ isOpen: true, campaign, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.campaign) return;
    
    setDeleteModal({ ...deleteModal, isDeleting: true });
    
    try {
      await deleteAdminCampaign(deleteModal.campaign._id).unwrap();
      toast.success('Campaign deleted successfully', {
        icon: '🗑️',
        duration: 3000,
      });
      setDeleteModal({ isOpen: false, campaign: null, isDeleting: false });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete campaign');
      setDeleteModal({ ...deleteModal, isDeleting: false });
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, campaign: null, isDeleting: false });
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

  const closeStoryModal = () => {
    setIsStoryModalOpen(false);
    setStoryForm({ campaign: null, message: '', videoUrl: '', images: [] });
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
      closeStoryModal();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save success story');
    }
  };

  if (statsLoading || pendingLoading || approvedLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid (Sticky) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 sticky top-0 z-20 bg-gray-50/70 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 py-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900">{stats.campaigns?.total || 0}</p>
            </div>
            <FiFileText className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.campaigns?.pending || 0}</p>
            </div>
            <FiTrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.users?.total || 0}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Donations</p>
              <p className="text-3xl font-bold text-green-600">
                रु {stats.donations?.total?.toLocaleString() || '0'}
              </p>
            </div>
            <FiHeart className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>
      {/* Tabs + Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg overflow-hidden border">
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm ${activeTab === 'pending' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}>Pending</button>
            <button onClick={() => setActiveTab('approved')} className={`px-4 py-2 text-sm border-l ${activeTab === 'approved' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}>Approved</button>
            <button onClick={() => setActiveTab('top')} className={`px-4 py-2 text-sm border-l ${activeTab === 'top' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}>Top Campaigns</button>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="relative w-full max-w-xs">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setApprovedPage(1);
                  setTopPage(1);
                }}
                placeholder="Search campaigns..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setApprovedPage(1);
                setTopPage(1);
              }}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'All categories' : opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Pending Campaigns</h2>
          {pendingCampaigns
            .filter(c => (category === 'all' ? true : c.category === category))
            .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
            .length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending campaigns</p>
          ) : (
            <div className="space-y-4">
              {pendingCampaigns
                .filter(c => (category === 'all' ? true : c.category === category))
                .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.description?.toLowerCase().includes(searchTerm.toLowerCase())) : true))
                .map((campaign) => (
                <CollapsibleCampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  rightActions={
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(campaign._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      {rejectingId === campaign._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Rejection reason..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleReject(campaign._id)}
                              className="flex-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectionReason('');
                              }}
                              className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRejectingId(campaign._id);
                            setRejectionReason('');
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
                        >
                          <FiX className="w-4 h-4" />
                          <span>Reject</span>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Approved Campaigns</h2>
          {approvedCampaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No approved campaigns</p>
          ) : (
            <>
              <div className="space-y-4">
                {approvedCampaigns.map((campaign) => (
                  <CollapsibleCampaignCard
                    key={campaign._id}
                    campaign={campaign}
                    rightActions={
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => openStoryModal(campaign)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2"
                        >
                          <FiAward className="w-4 h-4" />
                          <span>{campaign.isSuccessStory ? 'Update Success Story' : 'Mark as Success Story'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(campaign)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 shadow-md hover:shadow-lg"
                        >
                          <FiX className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
              <Pagination
                page={approvedPage}
                onPageChange={setApprovedPage}
                hasNext={approvedCampaigns.length === APPROVED_PER_PAGE}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'top' && stats.topCampaigns && stats.topCampaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Top Campaigns</h2>
          {(() => {
            const filtered = (stats.topCampaigns || [])
              .filter(c => (category === 'all' ? true : c.category === category))
              .filter(c => (searchTerm ? (c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())) : true));
            const start = (topPage - 1) * TOP_PER_PAGE;
            const pageItems = filtered.slice(start, start + TOP_PER_PAGE);
            return (
              <>
                {pageItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No top campaigns</p>
                ) : (
                  <div className="space-y-3">
                    {pageItems.map((campaign) => (
                      <Link
                        key={campaign._id}
                        to={`/campaign/${campaign._id}`}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">{campaign.title}</p>
                          <p className="text-sm text-gray-600">
                            रु {campaign.raisedAmount.toLocaleString()} / रु {campaign.goalAmount.toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm">
                          {campaign.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <Pagination
                  page={topPage}
                  onPageChange={setTopPage}
                  hasNext={filtered.length > topPage * TOP_PER_PAGE}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={deleteModal.campaign?.title || ''}
        subtitle={deleteModal.campaign ? `${deleteModal.campaign.category} • Goal: रु ${deleteModal.campaign.goalAmount?.toLocaleString()}` : ''}
        isLoading={deleteModal.isDeleting}
      />

      {isStoryModalOpen && storyForm.campaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{storyForm.campaign.isSuccessStory ? 'Update Success Story' : 'Mark as Success Story'}</h3>
                <p className="text-sm text-gray-500">{storyForm.campaign.title}</p>
              </div>
              <button onClick={closeStoryModal} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fundraiser message</label>
                <textarea
                  value={storyForm.message}
                  onChange={(e) => setStoryForm((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Write a heartfelt thank-you message..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video link (optional)</label>
                <div className="relative">
                  <FiVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={storyForm.videoUrl}
                    onChange={(e) => setStoryForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="Paste a YouTube or Vimeo link"
                    className="w-full border border-gray-300 rounded-lg px-10 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gallery images (up to 5)</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition">
                  <FiUpload className="w-6 h-6 text-primary-600 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload inspiring images</span>
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
                  <ul className="mt-3 text-sm text-gray-600 space-y-1">
                    {storyForm.images.map((file, idx) => (
                      <li key={idx}>{file.name}</li>
                    ))}
                  </ul>
                )}
                {storyForm.campaign.storyDetails?.images?.length > 0 && storyForm.images.length === 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 mb-2">Current gallery</p>
                    <div className="grid grid-cols-4 gap-2">
                      {storyForm.campaign.storyDetails.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={buildAssetUrl(img)}
                          alt={`Existing gallery ${idx + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Uploading new images will replace the current gallery.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={closeStoryModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                disabled={isSavingStory}
              >
                Cancel
              </button>
              <button
                onClick={handleStorySubmit}
                disabled={isSavingStory}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-lg ${isSavingStory ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isSavingStory ? 'Saving...' : 'Save Success Story'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Collapsible campaign card used by Pending and Approved lists
const CollapsibleCampaignCard = ({ campaign, rightActions }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link
              to={`/campaign/${campaign._id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition"
            >
              {campaign.title}
            </Link>
            {campaign.isSuccessStory && (
              <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                <FiAward className="w-3 h-3" />
                Success Story
              </span>
            )}
            <button
              onClick={() => setExpanded(v => !v)}
              className="ml-3 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              aria-expanded={expanded}
            >
              {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{campaign.category}</p>
          <p className={`text-gray-700 mt-2 ${expanded ? '' : 'line-clamp-2'}`}>{campaign.description}</p>
          {expanded && (
            <div className="mt-2 text-sm text-gray-600">
              <span>By: {campaign.fundraiser?.name}</span>
              {campaign.goalAmount != null && (
                <span className="ml-4">Goal: रु {campaign.goalAmount.toLocaleString()}</span>
              )}
              {campaign.raisedAmount != null && (
                <span className="ml-4">Raised: रु {campaign.raisedAmount.toLocaleString()}</span>
              )}
            </div>
          )}
        </div>
        {rightActions}
      </div>
    </div>
  );
};

const Pagination = ({ page, onPageChange, hasNext }) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={`px-3 py-1 rounded border text-sm ${page === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">Page {page}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className={`px-3 py-1 rounded border text-sm ${!hasNext ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
      >
        Next
      </button>
    </div>
  );
};

export default AdminDashboard;

