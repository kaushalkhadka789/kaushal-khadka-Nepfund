import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetCampaignQuery, useAddCommentMutation, useGetCampaignDonationsQuery, useGetCampaignsQuery } from '../services/api';
import { FiUser, FiClock, FiHeart, FiMessageCircle, FiShare2, FiFileText, FiRefreshCw, FiThumbsUp, FiTrash, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DonateModal from '../components/DonateModal';
import { ensureSocketConnected } from '../services/socket';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetCampaignQuery(id);
  const { data: donationsData, refetch: refetchDonations } = useGetCampaignDonationsQuery(id);
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('about'); // about | documents | updates | comments
  const [likes, setLikes] = useState({}); // local like counts for comments (UI only)
  const [realTimeCampaign, setRealTimeCampaign] = useState(null);

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
        // Refetch to get full updated data
        refetch();
        refetchDonations();
      }
    };

    socket.on('campaign:updated', handleCampaignUpdate);

    return () => {
      socket.off('campaign:updated', handleCampaignUpdate);
    };
  }, [id, user?.id, refetch, refetchDonations]);

  // Sync real-time state with fetched data
  useEffect(() => {
    if (data?.data) {
      setRealTimeCampaign(data.data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600">
        Campaign not found
      </div>
    );
  }

  const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
  const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  const goalReached = campaign.raisedAmount >= campaign.goalAmount || campaign.status === 'completed';

  const donorsCount = donationsData?.count || 0;

  const handleShare = (platform) => {
    const backendBase = import.meta.env.VITE_BACKEND_URL || window.location.origin.replace(':3000', ':5000');
    const shareTarget = `${backendBase}/share/campaign/${id}`;
    const text = encodeURIComponent(`${campaign.title} — Support this campaign`);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareTarget)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareTarget)}&text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(shareTarget)}`,
    };
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment({ campaignId: id, text: commentText }).unwrap();
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Campaign Images */}
      {campaign.images && campaign.images.length > 0 && (
        <div className="mb-6">
          <img
            src={`http://localhost:5000/${campaign.images[0]}`}
            alt={campaign.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded">
            {campaign.category}
          </span>
          {campaign.isUrgent && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded">
              Urgent
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

        <div className="flex items-center space-x-4 text-gray-600 mb-6">
          <div className="flex items-center space-x-1">
            <FiUser className="w-5 h-5" />
            <span>{campaign.fundraiser?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiClock className="w-5 h-5" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Raised</span>
            <span className="font-semibold text-lg">
              रु {campaign.raisedAmount?.toLocaleString()} / रु {campaign.goalAmount?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary-600 h-4 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{progress}% funded</p>
        </div>

        {/* Donate Button */}
        {campaign.status === 'approved' && daysLeft > 0 && (
          <div className="mb-6">
            {goalReached ? (
              <div className="w-full bg-green-50 border-2 border-green-500 text-green-700 py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2">
                <FiCheckCircle className="w-5 h-5" />
                Goal Reached! 🎉
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please login to donate');
                    navigate('/login');
                    return;
                  }
                  setShowDonateModal(true);
                }}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold text-lg"
              >
                {isAuthenticated ? '💝 Donate Now' : 'Login to Donate'}
              </button>
            )}
          </div>
        )}
        {campaign.status === 'pending' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">This campaign is pending approval from admin.</p>
          </div>
        )}

        {/* Tabs header */}
        <div className="border-b mb-4">
          <nav className="-mb-px flex flex-wrap gap-4" aria-label="Tabs">
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<FiFileText className="w-4 h-4" />} label="About" />
            <TabButton active={activeTab === 'documents'} onClick={() => setActiveTab('documents')} icon={<FiFileText className="w-4 h-4" />} label="Documents" />
            <TabButton active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} icon={<FiRefreshCw className="w-4 h-4" />} label="Updates" />
            <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<FiMessageCircle className="w-4 h-4" />} label="Comments" />
          </nav>
        </div>

        {/* Tab panels */}
        <div className="transition-all duration-300">
          {activeTab === 'about' && (
            <div>
              {/* Transparent summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50/60 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Amount Raised</p>
                  <p className="text-2xl font-semibold">रु {campaign.raisedAmount?.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50/60 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Donors</p>
                  <p className="text-2xl font-semibold">{donorsCount}</p>
                </div>
                <div className="bg-gray-50/60 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Time Left</p>
                  <p className="text-2xl font-semibold">{daysLeft > 0 ? `${daysLeft} days` : 'Ended'}</p>
                </div>
              </div>

              {/* About and story */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">About this campaign</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Story</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.story}</p>
              </div>

              {/* Share buttons */}
              <div className="flex items-center gap-3">
                <button onClick={() => handleShare('facebook')} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><FiShare2 /> Share</button>
                <button onClick={() => handleShare('twitter')} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">Twitter</button>
                <button onClick={() => handleShare('whatsapp')} className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">WhatsApp</button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              {campaign.documents && campaign.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaign.documents.map((doc, idx) => {
                    const url = `http://localhost:5000/${doc.url || doc.path || doc}`;
                    const mime = doc.mime || '';
                    const isPdf = mime.includes('pdf') || url.toLowerCase().endsWith('.pdf');
                    const isDoc = mime.includes('msword') || mime.includes('officedocument') || url.toLowerCase().endsWith('.doc') || url.toLowerCase().endsWith('.docx');
                    return (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm line-clamp-1">{doc.label || doc.name || `Document ${idx + 1}`}</p>
                          {doc.verified && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Verified by Admin</span>
                          )}
                        </div>
                        {isPdf ? (
                          <div className="aspect-video bg-gray-50 rounded overflow-hidden">
                            <iframe
                              src={url}
                              title={`doc-${idx}`}
                              className="w-full h-full"
                              sandbox="allow-same-origin allow-scripts"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : isDoc ? (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-3 py-2 border rounded text-sm text-primary-700 hover:bg-primary-50">View document</a>
                        ) : (
                          <div className="aspect-video bg-gray-50 rounded overflow-hidden">
                            <img src={url} alt={doc.label || `Document ${idx + 1}`} className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded.</p>
              )}
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              {campaign.updates && campaign.updates.length > 0 ? (
                <div className="space-y-4">
                  {campaign.updates.map((update, idx) => (
                    <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2">
                      <h3 className="font-semibold mb-1">{update.title}</h3>
                      <p className="text-gray-700">{update.content}</p>
                      {update.image && (
                        <img
                          src={`http://localhost:5000/${update.image}`}
                          alt="Update"
                          className="mt-2 rounded-lg max-w-md"
                        />
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No updates yet.</p>
              )}
              <p className="text-xs text-gray-500 mt-4">Fundraisers can post new updates from their dashboard. Donors are notified automatically.</p>
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              {isAuthenticated && (
                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isCommenting || !commentText.trim()}
                    className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isCommenting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {campaign.comments && campaign.comments.length > 0 ? (
                  campaign.comments.map((comment, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold">{comment.user?.name || 'Anonymous'}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLikes((l) => ({ ...l, [idx]: (l[idx] || 0) + 1 }))}
                            className="text-sm inline-flex items-center gap-1 px-2 py-1 border rounded hover:bg-gray-50"
                            aria-label="Like comment"
                          >
                            <FiThumbsUp /> {likes[idx] || 0}
                          </button>
                          {/* Placeholder admin moderation (UI only) */}
                          {/* <button className="text-sm inline-flex items-center gap-1 px-2 py-1 border rounded text-red-600 hover:bg-red-50"><FiTrash /> Remove</button> */}
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No comments yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Donate (mobile) */}
      {campaign.status === 'approved' && daysLeft > 0 && !goalReached && (
        <div className="fixed inset-x-0 bottom-0 sm:hidden p-3 z-20">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                toast.error('Please login to donate');
                navigate('/login');
                return;
              }
              setShowDonateModal(true);
            }}
            className="w-full bg-primary-600 text-white py-3 rounded-lg shadow-lg"
          >
            Donate Now
          </button>
        </div>
      )}

      {/* Donations List */}
      {donationsData && donationsData.data && donationsData.data.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiHeart className="w-6 h-6 mr-2" />
            Recent Donations ({donationsData.count})
          </h2>
          <div className="space-y-3">
            {donationsData.data.slice(0, 10).map((donation) => {
              const donorPoints = donation.donor?.rewardPoints || 0;
              const donorTier = donation.isAnonymous ? null : getTier(donorPoints);
              return (
                <div key={donation._id} className="flex justify-between items-center border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{donation.isAnonymous ? 'Anonymous' : donation.donor?.name}</p>
                      {!donation.isAnonymous && donorTier && donorPoints > 0 && (
                        <TierBadge tier={donorTier} size="sm" showIcon={false} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold text-primary-600">
                    रु {donation.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Campaigns */}
      {relatedCampaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Related Campaigns</h2>
          <div className="-mx-2 overflow-x-auto">
            <div className="flex gap-4 px-2 pb-2">
              {relatedCampaigns.map((rc) => {
                const rProgress = ((rc.raisedAmount / rc.goalAmount) * 100).toFixed(0);
                const rDaysLeft = Math.ceil((new Date(rc.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={rc._id} className="min-w-[260px] w-72 bg-white rounded-lg shadow-md overflow-hidden">
                    <a href={`/campaign/${rc._id}`} className="block">
                      {rc.images?.length ? (
                        <img
                          src={`http://localhost:5000/${rc.images[0]}`}
                          alt={rc.title}
                          loading="lazy"
                          className="w-full h-36 object-cover"
                        />
                      ) : (
                        <div className="w-full h-36 bg-gray-100" />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 mb-2">{rc.title}</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(rProgress, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-3">
                          <span>
                            रु {rc.raisedAmount?.toLocaleString()} / रु {rc.goalAmount?.toLocaleString()}
                          </span>
                          <span>{rDaysLeft > 0 ? `${rDaysLeft}d` : 'Ended'}</span>
                        </div>
                        <button className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Donate Now</button>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
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

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 px-4 py-2 text-sm border-b-2 ${active ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`}
  >
    {icon}
    {label}
  </button>
);

export default CampaignDetails;

