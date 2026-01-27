import { Link } from 'react-router-dom';
import { useGetMyCampaignsQuery } from '../services/api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ensureSocketConnected } from '../services/socket';
import { 
  FiEdit3, FiEye, FiClock, FiPlus, 
  FiTrendingUp, FiTarget, FiZap,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MyCampaigns = () => {
  const { data, isLoading, refetch } = useGetMyCampaignsQuery();
  const user = useSelector((state) => state.auth.user);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Shows 6 items per page (2 rows on desktop)

  useEffect(() => {
    const socket = ensureSocketConnected({ userId: user?._id, role: 'user' });
    if (!socket) return;

    const onCampaignUpdated = () => refetch();
    socket.on('campaign:updated', onCampaignUpdated);
    
    return () => {
      socket.off('campaign:updated', onCampaignUpdated);
    };
  }, [user?._id, refetch]);

  // Filter full list first
  const allCampaigns = (data?.data || []).filter((c) => c.status !== 'rejected');

  // --- DASHBOARD METRICS (Calculated on ALL data, not just current page) ---
  const totalRaised = allCampaigns.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0);
  const activeCount = allCampaigns.filter(c => c.status === 'approved').length;

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(allCampaigns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCampaigns = allCampaigns.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Optional: Scroll to top of grid when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50/30 min-h-screen">
      
      {/* --- COMPACT HEADER --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Campaigns</h1>
          <p className="text-sm text-gray-500 font-medium">Overview of your fundraising impact</p>
        </div>
        <Link
          to="/create-campaign"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-700 transition-all active:scale-95"
        >
          <FiPlus /> Start New Campaign
        </Link>
      </div>

      {/* --- TIGHT SUMMARY STATS --- */}
      {allCampaigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <MiniStat label="Total Raised" value={`रु ${totalRaised.toLocaleString()}`} icon={<FiTrendingUp />} color="text-emerald-600" />
            <MiniStat label="Active Campaigns" value={activeCount} icon={<FiZap />} color="text-amber-500" />
            <MiniStat label="Total Campaigns" value={allCampaigns.length} icon={<FiTarget />} color="text-primary-600" />
        </div>
      )}

      {allCampaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">No campaigns found. Ready to make a difference?</p>
        </div>
      ) : (
        <>
          <motion.div 
            // Reset animation key when page changes to re-trigger stagger
            key={currentPage} 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode='wait'>
            {currentCampaigns.map((campaign) => {
              const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;
              const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <motion.div
                  key={campaign._id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Compact Image - Height reduced to h-40 */}
                  <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                    {campaign.images?.[0] ? (
                      <img
                        src={`http://localhost:5000/${campaign.images[0]}`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><FiTarget size={24}/></div>
                    )}
                    
                    {/* Category & Status Overlay */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md">
                        {campaign.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-md shadow-sm ${getStatusStyles(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content Area - Reduced Padding */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-md font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
                      {campaign.title}
                    </h3>
                    
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-lg font-black text-gray-900">रु {campaign.raisedAmount?.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">/ रु {campaign.goalAmount?.toLocaleString()}</span>
                    </div>

                    {/* Slim Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-primary-600'}`}
                      />
                    </div>

                    {/* Footer Meta */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-4">
                      <div className="flex items-center gap-1.5">
                        <FiClock className={daysLeft <= 0 ? 'text-red-500' : 'text-primary-500'} />
                        <span>{daysLeft <= 0 ? 'Ended' : `${daysLeft}d left`}</span>
                      </div>
                      <span className="text-primary-600">{Math.round(progress)}% Funded</span>
                    </div>

                    {/* Compact Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <Link
                        to={`/campaign/${campaign._id}`}
                        className="flex items-center justify-center gap-1.5 py-2 text-xs bg-gray-50 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition-colors border border-gray-100"
                      >
                        <FiEye size={14} /> View
                      </Link>
                      {campaign.status !== 'completed' && (
                        <Link
                          to={`/edit-campaign/${campaign._id}`}
                          className="flex items-center justify-center gap-1.5 py-2 text-xs bg-primary-50 text-primary-600 rounded-lg font-bold hover:bg-primary-100 transition-colors border border-primary-100"
                        >
                          <FiEdit3 size={14} /> Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>

          {/* --- PAGINATION CONTROLS --- */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === 1 
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <FiChevronLeft />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === pageNumber
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-200'
                          : 'text-gray-500 hover:bg-white hover:text-primary-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === totalPages 
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 text-gray-600 hover:bg-white hover:shadow-sm'
                }`}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const MiniStat = ({ label, value, icon, color }) => (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-md font-black text-gray-900">{value}</p>
        </div>
    </div>
);

export default MyCampaigns;