import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetCampaignQuery, useAddCommentMutation, useGetCampaignDonationsQuery, useGetCampaignsQuery } from '../services/api';
import { FiUser, FiClock, FiHeart, FiMessageCircle, FiFileText, FiRefreshCw, FiThumbsUp, FiTrash, FiCheckCircle, FiShare2, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DonateModal from '../components/DonateModal';
import { ensureSocketConnected } from '../services/socket';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';
import { shareToWhatsApp, copyCampaignLink } from '../utils/whatsappShare';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetCampaignQuery(id);
  const { data: donationsData, refetch: refetchDonations } = useGetCampaignDonationsQuery(id);
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [likes, setLikes] = useState({});
  const [realTimeCampaign, setRealTimeCampaign] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const campaign = realTimeCampaign || data?.data;
  const { data: relatedData } = useGetCampaignsQuery(
    campaign
      ? { status: 'approved', category: campaign.category, sortBy: 'createdAt', limit: 8 }
      : { skip: true }
  );
  const relatedAll = relatedData?.data || [];
  const relatedCampaigns = useMemo(
    () => relatedAll.filter((c) => c._id !== id).slice(0, 4),
    [relatedAll, id]
  );

  // Real-time Socket.IO updates
  useEffect(() => {
    if (!id) return;

    const socket = ensureSocketConnected({ userId: user?.id });
    if (!socket) return;

    const handleCampaignUpdate = (updated) => {
      if (updated._id === id) {
        setRealTimeCampaign((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            raisedAmount: updated.raisedAmount,
            goalAmount: updated.goalAmount,
            donorCount: updated.donorCount,
            status: updated.status
          };
        });
        refetch();
        refetchDonations();
      }
    };

    socket.on('campaign:updated', handleCampaignUpdate);

    return () => {
      socket.off('campaign:updated', handleCampaignUpdate);
    };
  }, [id, user?.id, refetch, refetchDonations]);

  // Sync real-time state
  useEffect(() => {
    if (data?.data) {
      setRealTimeCampaign(data.data);
      setAvatarError(false);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 border-t-2 border-primary-100"></div>
          <p className="text-gray-500 animate-pulse">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrash className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
  const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  const goalReached = campaign.raisedAmount >= campaign.goalAmount || campaign.status === 'completed';
  const donorsCount = donationsData?.count || 0;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment({ campaignId: id, text: commentText }).unwrap();
      setCommentText('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Failed to add comment');
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Title Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 sm:hidden">
        <div className="px-4 py-3 font-semibold text-gray-800 truncate">{campaign.title}</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Campaign Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {campaign.images && campaign.images.length > 0 ? (
                <div className="relative h-[400px] w-full">
                  <img
                    src={`http://localhost:5000/${campaign.images[0]}`}
                    alt={campaign.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary-600/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                        {campaign.category}
                      </span>
                      {campaign.isUrgent && (
                        <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm animate-pulse">
                          Urgent Fundraiser
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>

            {/* Campaign Header & Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight flex-1">
                  {campaign.title}
                </h1>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const userId = user?.id || user?._id;
                    shareToWhatsApp({
                      campaignId: campaign._id,
                      campaignTitle: campaign.title,
                      userId: userId || null,
                      raisedAmount: campaign.raisedAmount,
                      goalAmount: campaign.goalAmount,
                      donorCount: donorsCount,
                      isUrgent: campaign.isUrgent,
                      category: campaign.category
                    });
                    toast.success('Opening WhatsApp...');
                  }}
                  className="flex-shrink-0 p-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm border border-green-200"
                  title="Share on WhatsApp"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-primary-100 flex items-center justify-center">
                      {(campaign.fundraiser?.avatar || campaign.fundraiser?.profileImage) && !avatarError ? (
                        <img
                          src={`http://localhost:5000/${campaign.fundraiser?.avatar || campaign.fundraiser?.profileImage}`}
                          alt={campaign.fundraiser?.name}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <FiUser className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    {/* REMOVED: The green status indicator (absolute -bottom-1 -right-1 div) */}
                  </div>
                  <div>
                    {/* Label is Fundraiser */}
                    <p className="text-sm text-gray-500 mb-0.5">Fundraiser</p>
                    <p className="font-bold text-gray-900 flex items-center gap-2">
                      {campaign.fundraiser?.name}
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full">Verified</span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-gray-500 text-sm gap-1 mb-1">
                    <FiClock /> Created
                  </div>
                  <span className="text-sm font-medium text-gray-900">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tabs */}
              <div>
                <nav className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl mb-6" aria-label="Tabs">
                  {[
                    { id: 'about', icon: <FiFileText />, label: 'About' },
                    { id: 'documents', icon: <FiFileText />, label: 'Docs' },
                    { id: 'updates', icon: <FiRefreshCw />, label: 'Updates' },
                    { id: 'comments', icon: <FiMessageCircle />, label: 'Comments' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-white text-primary-700 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                    >
                      <span className="hidden sm:inline">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {/* Tab Content */}
                <div className="animate-fadeIn">
                  {activeTab === 'about' && (
                    <div className="space-y-8">
                      {/* Mobile Stats */}
                      <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-primary-50 p-3 rounded-lg border border-primary-100">
                          <p className="text-xs text-primary-600 font-semibold uppercase">Raised</p>
                          <p className="text-lg font-bold text-primary-800">रु {campaign.raisedAmount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <p className="text-xs text-green-600 font-semibold uppercase">Donors</p>
                          <p className="text-lg font-bold text-green-800">{donorsCount}</p>
                        </div>
                      </div>

                      <div className="prose prose-lg prose-indigo max-w-none">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">About this campaign</h3>
                        <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {campaign.description}
                        </div>

                        {campaign.story && (
                          <>
                            <hr className="my-8 border-gray-100" />
                            <h3 className="text-xl font-bold text-gray-900 mb-4">The Story</h3>
                            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                              {campaign.story}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Document Tab */}
                  {activeTab === 'documents' && (
                    <div>
                      {campaign.documents && campaign.documents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {campaign.documents.map((doc, idx) => {
                            const url = `http://localhost:5000/${doc.url || doc.path || doc}`;
                            const mime = doc.mime || '';
                            const isPdf = mime.includes('pdf') || url.toLowerCase().endsWith('.pdf');
                            const isDoc = mime.includes('msword') || mime.includes('officedocument') || url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.docx');
                            return (
                              <div key={idx} className="group border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-md transition-all duration-300 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="font-semibold text-gray-800 truncate pr-2">{doc.label || doc.name || `Document ${idx + 1}`}</p>
                                  {doc.verified && (
                                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded-full uppercase tracking-wide">Verified</span>
                                  )}
                                </div>
                                {isPdf ? (
                                  <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                                    <iframe src={url} title={`doc-${idx}`} className="w-full h-full opacity-50" sandbox="allow-same-origin allow-scripts" />
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition">
                                      <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-semibold text-gray-700">Open PDF</div>
                                    </a>
                                  </div>
                                ) : isDoc ? (
                                  <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300">
                                    <FiFileText className="w-12 h-12 text-gray-400 mb-2" />
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 text-sm font-semibold hover:underline">Download / View</a>
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100 cursor-zoom-in">
                                    <img src={url} alt={doc.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No documents verified yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Updates Tab */}
                  {activeTab === 'updates' && (
                    <div className="space-y-6">
                      {campaign.updates && campaign.updates.length > 0 ? (
                        campaign.updates.map((update, idx) => (
                          <div key={idx} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-0 before:w-0.5 before:bg-gray-200 last:before:hidden">
                            <div className="absolute left-0 top-0 w-6 h-6 bg-primary-100 rounded-full border-2 border-white ring-2 ring-primary-50 flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{update.title}</h3>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                  {new Date(update.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-gray-600 leading-relaxed mb-4">{update.content}</p>
                              {update.image && (
                                <img
                                  src={`http://localhost:5000/${update.image}`}
                                  alt="Update"
                                  className="w-full rounded-lg object-cover max-h-80 shadow-sm"
                                />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <FiRefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No updates posted yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments Tab */}
                  {activeTab === 'comments' && (
                    <div className="space-y-8">
                      {isAuthenticated ? (
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center text-primary-600 font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <form onSubmit={handleComment} className="flex-1 relative">
                            <textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Send some love and support..."
                              rows="3"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none shadow-inner"
                            />
                            <div className="absolute bottom-2 right-2">
                              <button
                                type="submit"
                                disabled={isCommenting || !commentText.trim()}
                                className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-200"
                              >
                                {isCommenting ? 'Posting...' : 'Post'}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-center text-sm">
                          Please login to leave a comment of support.
                        </div>
                      )}

                      <div className="space-y-4">
                        {campaign.comments && campaign.comments.length > 0 ? (
                          campaign.comments.map((comment, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden">
                                <FiUser />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-gray-900">{comment.user?.name || 'Anonymous'}</h4>
                                  <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-2">{comment.text}</p>
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => setLikes((l) => ({ ...l, [idx]: (l[idx] || 0) + 1 }))}
                                    className="text-xs font-medium text-gray-500 hover:text-primary-600 flex items-center gap-1.5 transition-colors"
                                  >
                                    <FiThumbsUp className={likes[idx] ? 'fill-current' : ''} />
                                    {likes[idx] || 'Like'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-400 py-8">Be the first to comment!</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Related Campaigns */}
            {relatedCampaigns.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FiActivity className="text-primary-500" /> Similar Causes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedCampaigns.map((rc) => {
                    const rProgress = ((rc.raisedAmount / rc.goalAmount) * 100).toFixed(0);
                    return (
                      <a key={rc._id} href={`/campaign/${rc._id}`} className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                        <div className="h-32 w-full overflow-hidden">
                          {rc.images?.length ? (
                            <img src={`http://localhost:5000/${rc.images[0]}`} alt={rc.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-primary-600 transition-colors">{rc.title}</h3>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.min(rProgress, 100)}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="font-medium text-gray-700">ru {rc.raisedAmount?.toLocaleString()}</span>
                            <span>{rProgress}%</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Stable Sticky Wrapper */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              {/* Action Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      रु {campaign.raisedAmount?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Raised of <span className="font-medium text-gray-700">रु {campaign.goalAmount?.toLocaleString()}</span> goal
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{progress}%</p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                    <FiHeart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <span className="block text-lg font-bold text-gray-900">{donorsCount}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Donors</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                    <FiClock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <span className="block text-lg font-bold text-gray-900">{daysLeft > 0 ? daysLeft : 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{daysLeft > 0 ? 'Days Left' : 'Days'}</span>
                  </div>
                </div>

                {campaign.status === 'approved' && daysLeft > 0 && (
                  <div className="space-y-3">
                    {goalReached ? (
                      <div className="w-full bg-green-50 border border-green-200 text-green-700 py-4 rounded-xl font-bold text-center flex flex-col items-center justify-center gap-1 shadow-sm">
                        <FiCheckCircle className="w-8 h-8 text-green-600" />
                        <span>Campaign Goal Reached! 🎉</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error('Please login to donate');
                              navigate('/login');
                              return;
                            }
                            setShowDonateModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg shadow-primary-500/30 transform active:scale-[0.98] font-bold text-lg flex items-center justify-center gap-2 group"
                        >
                          <FiHeart className="group-hover:scale-110 transition-transform" />
                          {isAuthenticated ? 'Donate Now' : 'Login to Donate'}
                        </button>
                        <button 
                          onClick={() => {
                            const userId = user?.id || user?._id;
                            shareToWhatsApp({
                              campaignId: campaign._id,
                              campaignTitle: campaign.title,
                              userId: userId || null,
                              raisedAmount: campaign.raisedAmount,
                              goalAmount: campaign.goalAmount,
                              donorCount: donorsCount,
                              isUrgent: campaign.isUrgent,
                              category: campaign.category
                            });
                            toast.success('Opening WhatsApp...');
                          }}
                          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-2 group"
                        >
                          <FiShare2 className="group-hover:scale-110 transition-transform" /> 
                          Share on WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                )}

                {campaign.status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                    <FiClock className="text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-yellow-800 text-sm">Pending Approval</h4>
                      <p className="text-yellow-700 text-xs mt-1">This campaign is currently being reviewed by admins.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Donations List */}
              {donationsData && donationsData.data && donationsData.data.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                    <span>Recent Donations</span>
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{donationsData.count} total</span>
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {donationsData.data.slice(0, 10).map((donation) => {
                      const donorPoints = donation.donor?.rewardPoints || 0;
                      const donorTier = donation.isAnonymous ? null : getTier(donorPoints);
                      return (
                        <div key={donation._id} className="flex justify-between items-center group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-300 shadow-sm">
                              {donation.isAnonymous ? <FiUser /> : donation.donor?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-gray-800 text-sm">{donation.isAnonymous ? 'Anonymous' : donation.donor?.name}</p>
                                {!donation.isAnonymous && donorTier && donorPoints > 0 && (
                                  <div className="transform scale-75 origin-left">
                                    <TierBadge tier={donorTier} size="sm" showIcon={false} />
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600 text-sm">
                            + रु {donation.amount.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Donate Button (Mobile Only) */}
      {campaign.status === 'approved' && daysLeft > 0 && !goalReached && (
        <div className="fixed inset-x-0 bottom-0 sm:hidden p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 z-30 animate-slideUp">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please login to donate');
                navigate('/login');
                return;
              }
              setShowDonateModal(true);
            }}
            className="w-full bg-primary-600 text-white py-3.5 rounded-xl shadow-lg shadow-primary-600/20 font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <FiHeart className="fill-current" /> Donate Now
          </button>
        </div>
      )}

      {showDonateModal && (
        <DonateModal
          campaign={campaign}
          onClose={() => setShowDonateModal(false)}
        />
      )}
    </div>
  );
};

export default CampaignDetails;