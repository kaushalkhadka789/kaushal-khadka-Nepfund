import { Link } from 'react-router-dom';
import { useGetMyDonationsQuery, useGetMyRewardsQuery } from '../services/api';
import { 
  FiHeart, FiCalendar, FiAward, FiTrendingUp, 
  FiActivity, FiArrowRight, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useState } from 'react'; // Added useState
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const MyDonations = () => {
  const { data, isLoading } = useGetMyDonationsQuery();
  const user = useSelector((state) => state.auth.user);
  const { data: rewardsData } = useGetMyRewardsQuery(undefined, {
    skip: !user,
  });

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Display 5 donation cards per page

  const userPoints = user?.rewardPoints || 0;
  const userTier = rewardsData?.data?.tier || getTier(userPoints);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-600">
            <FiHeart className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading your impact...</p>
      </div>
    );
  }

  // --- DATA PROCESSING ---
  const raw = (data?.data || []).filter((d) => !!d.campaign);
  
  // Calculate Totals (Based on ALL data, not just current page)
  const totalDonated = raw.reduce((sum, donation) => sum + donation.amount, 0);

  // Group donations by campaign
  const allDonations = Object.values(
    raw.reduce((acc, d) => {
      const id = d.campaign._id;
      if (!acc[id]) {
        acc[id] = {
          campaign: d.campaign,
          totalAmount: 0,
          donationCount: 0,
          latestDate: d.createdAt,
          paymentMethod: d.paymentMethod,
          status: d.status,
        };
      }
      acc[id].totalAmount += d.amount;
      acc[id].donationCount += 1;
      if (new Date(d.createdAt) > new Date(acc[id].latestDate)) {
        acc[id].latestDate = d.createdAt;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate)); // Sort by newest first

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(allDonations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = allDonations.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to the top of the history section
    const historySection = document.getElementById('donation-history-header');
    if (historySection) {
        historySection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary-50 to-gray-50 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              My <span className="text-primary-600">Impact</span>
            </h1>
            <p className="mt-2 text-gray-600">Track your contributions and reward progress.</p>
          </div>
          {userTier && (
            <div className="transform hover:scale-105 transition-transform duration-300">
              <TierBadge tier={userTier} size="md" />
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Total Donated */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiTrendingUp className="w-24 h-24 text-primary-600" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                <FiHeart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Donated</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  रु {totalDonated.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 w-full animate-pulse opacity-50"></div>
            </div>
          </div>

          {/* Card 2: Reward Points */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiAward className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600">
                <FiAward className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Reward Points</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </div>
             <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-3/4"></div>
            </div>
          </div>

          {/* Card 3: Campaigns Supported */}
          <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300 group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiActivity className="w-24 h-24 text-rose-500" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-rose-50 rounded-xl text-rose-500">
                <FiHeart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contributions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {raw.length}
                </p>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <h2 id="donation-history-header" className="text-xl font-bold text-gray-800 mb-6 flex items-center scroll-mt-24">
          <span className="bg-primary-600 w-2 h-6 rounded-r mr-3"></span>
          Donation History
        </h2>

        {allDonations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <FiHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No donations yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              Your journey to making a difference starts here. Support a campaign today.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300"
            >
              Browse Campaigns <FiArrowRight className="ml-2" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentDonations.map((donation) => (
                <div
                  key={donation.campaign?._id}
                  className="group bg-gray-100 rounded-2xl p-3 border border-gray-200 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Image Section */}
                    <div className="relative flex-shrink-0 w-full md:w-48 h-32 md:h-32 rounded-xl overflow-hidden shadow-inner bg-gray-200">
                      {donation.campaign?.images && donation.campaign.images.length > 0 ? (
                        <img
                          src={`http://localhost:5000/${donation.campaign.images[0]}`}
                          alt={donation.campaign.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FiHeart className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                            <span className="px-2 py-1 bg-white/90 text-xs font-bold text-gray-700 rounded-md shadow-sm">
                              {donation.campaign?.category || 'General'}
                            </span>
                      </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 w-full text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-start justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                              <Link
                                  to={`/campaign/${donation.campaign?._id}`}
                                  className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 block"
                              >
                                  {donation.campaign?.title}
                              </Link>

                              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-500">
                                  {/* Date Pill: UPDATED COLORS */}
                                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                      {/* Icon color changed to yellow-600 */}
                                      <FiCalendar className="w-4 h-4 text-yellow-600" />
                                      {/* Text color changed to yellow-700 */}
                                      <span className="text-yellow-700 font-semibold">{new Date(donation.latestDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  {/* Payment Pill (unchanged) */}
                                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                      <span className={`w-2 h-2 rounded-full ${donation.paymentMethod === 'khalti' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                      <span className="capitalize text-gray-500">{donation.paymentMethod}</span>
                                  </div>
                              </div>
                          </div>

                          {/* Amount Section */}
                          <div className="mt-4 md:mt-0 flex-shrink-0 text-center md:text-right pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0">
                               <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Contribution</p>
                               <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                                  रु {donation.totalAmount.toLocaleString()}
                               </p>
                               <div className="mt-1 flex items-center justify-center md:justify-end space-x-1 text-xs font-medium text-green-600 bg-white border border-green-100 px-2 py-1 rounded inline-block shadow-sm">
                                  <FiActivity className="w-3 h-3" />
                                  <span>{donation.donationCount} {donation.donationCount === 1 ? 'Donation' : 'Donations'}</span>
                               </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
    </div>
  );
};

export default MyDonations;