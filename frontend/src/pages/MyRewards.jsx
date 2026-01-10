import React, { useState } from 'react';
import { useGetMyRewardsQuery } from '../services/api';
import TierBadge from '../components/TierBadge';
import { 
  FiAward, 
  FiTrendingUp, 
  FiClock, 
  FiHeart, 
  FiFilter, 
  FiDownload, 
  FiActivity,
  FiBookOpen,
  FiPlusSquare,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { ORGANIZATION_LOGO, DIGITAL_SIGNATURE } from '../../../backend/utils/receiptAssets';

const MyRewards = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 4;

  const { data, isLoading, error } = useGetMyRewardsQuery({
    page: currentPage,
    limit: transactionsPerPage,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-600 font-medium">
        Error loading rewards. Please try again later.
      </div>
    );
  }

  const rewards = data?.data;
  if (!rewards) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        No rewards data available
      </div>
    );
  }

  const { points, tier, tierProgress, totalDonations, recentTransactions, pagination } = rewards;
  
  // Debug: Log pagination data to help troubleshoot
  if (process.env.NODE_ENV === 'development') {
    console.log('Rewards data:', { 
      hasPagination: !!pagination, 
      pagination,
      transactionsCount: recentTransactions?.length 
    });
  }
  const { nextTier, progress, pointsNeeded, amountNeeded } = tierProgress;

  // --- PDF GENERATION LOGIC WITH LOGO & SIGNATURE ---
  const downloadReceipt = (tx) => {
    const doc = new jsPDF();
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const trxId = `#TRX-${tx.id.toString().slice(-4).toUpperCase()}`;

    // 1. ADD WATERMARK (Light Grey Text in Background)
    doc.setTextColor(245, 245, 245);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RECEIPT", 105, 150, { align: "center", angle: 45 });

    // 2. HEADER WITH LOGO
    try {
      // addImage(data, format, x, y, w, h)
      doc.addImage(ORGANIZATION_LOGO, 'PNG', 20, 15, 25, 25);
    } catch (e) {
      console.error("Logo Error:", e);
    }

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Primary Indigo
    doc.setFont("helvetica", "bold");
    doc.text("IMPACT PLATFORM", 50, 25);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("Katari, Bagmati Province, Nepal", 50, 31);
    doc.text("Contact: support@impactplatform.com | Web: impact.org", 50, 36);

    // Divider
    doc.setDrawColor(230);
    doc.line(20, 45, 190, 45);

    // 3. TRANSACTION INFO
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Receipt Details", 20, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt ID: ${trxId}`, 20, 65);
    doc.text(`Date of Contribution: ${date}`, 20, 72);
    doc.text(`Campaign: ${tx.campaignTitle}`, 20, 79);

    // 4. TABLE SECTION
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 90, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 97);
    doc.text("Amount (NPR)", 150, 97);

    doc.setFont("helvetica", "normal");
    doc.text("Charitable Donation Contribution", 25, 110);
    doc.text(`Rs. ${tx.donationAmount.toLocaleString()}`, 150, 110);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Reward Points Earned: +${tx.pointsEarned} XP`, 25, 118);

    // Total Line
    doc.setDrawColor(200);
    doc.line(20, 130, 190, 130);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid: Rs. " + tx.donationAmount.toLocaleString(), 190, 142, { align: "right" });

    // 5. SIGNATURE SECTION
    const sigY = 190;
    try {
      doc.addImage(DIGITAL_SIGNATURE, 'PNG', 145, sigY - 18, 35, 15);
    } catch (e) {
      console.error("Signature Error:", e);
    }
    
    doc.setDrawColor(150);
    doc.line(140, sigY, 185, sigY); // Signature line
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");
    doc.text("Authorized Signatory", 162.5, sigY + 5, { align: "center" });

    // 6. FOOTER
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(120);
    doc.text("Thank you for your generous contribution. Your support changes lives.", 105, 220, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(180);
    doc.text("This is a system-generated document. No physical signature required.", 105, 280, { align: "center" });

    // Save PDF
    doc.save(`Receipt_${trxId}.pdf`);
  };

  const getCategoryIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes('foot') || t.includes('training')) return <FiActivity className="text-blue-500" />;
    if (t.includes('edu') || t.includes('school')) return <FiBookOpen className="text-indigo-500" />;
    if (t.includes('med') || t.includes('kit') || t.includes('relief')) return <FiPlusSquare className="text-red-500" />;
    return <FiHeart className="text-primary-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">My Rewards</h1>
          <p className="text-gray-500 mt-1 font-medium">View your impact and donor status</p>
        </div>
        <Link
          to="/top-donors"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md transition-all font-bold gap-2 text-sm"
        >
          <FiTrendingUp className="text-primary-600" />
          View Leaderboard
        </Link>
      </div>

      {/* Main Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-soft rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your Donor Status</h2>
            <div className="flex items-center gap-6">
              <div className="p-1 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                <TierBadge tier={tier} size="lg" />
              </div>
              <div>
                <div className="text-4xl font-black text-gray-900">
                  {points.toLocaleString()} <span className="text-lg font-medium text-gray-400">pts</span>
                </div>
                <p className="text-gray-600 font-bold mt-1">
                  Current Level: <span className="text-primary-600">{tier.name}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            {nextTier ? (
              <div className="space-y-3">
                <div className="flex justify-between items-end text-sm">
                  <span className="font-bold text-gray-700">Next Tier: {nextTier.name}</span>
                  <span className="font-black text-primary-500 font-black">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 border border-gray-50 shadow-inner overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full shadow-sm"
                    style={{
                      background: `linear-gradient(90deg, ${tier.color || '#4F46E5'} 0%, ${nextTier.color || '#9333EA'} 100%)`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 font-medium italic">
                  Donate NPR {amountNeeded.toLocaleString()} more ({pointsNeeded} pts) to unlock {nextTier.name}!
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <p className="text-sm font-bold text-yellow-800">
                  Highest Tier Achieved! You're a top-tier contributor.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Total Points', value: points.toLocaleString(), icon: <FiAward />, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Contributions', value: totalDonations, icon: <FiHeart />, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Current Tier', value: tier.name, icon: <FiTrendingUp />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-xl font-black text-gray-900 leading-tight">{stat.value}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions Table */}
      {recentTransactions && recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FiClock className="text-gray-400" />
              Transaction History
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition"><FiFilter /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-extrabold">
                  <th className="px-8 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-8 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-blue-50/30 transition-all duration-200">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-lg group-hover:bg-white transition-colors">
                          {getCategoryIcon(tx.campaignTitle)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{tx.campaignTitle}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Impact Fund Contribution</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-tight">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-mono text-gray-300 font-medium uppercase">
                        #TRX-{tx.id.toString().slice(-4)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-gray-800 tracking-tight">
                        NPR {tx.donationAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-black border border-emerald-100">
                        +{tx.pointsEarned}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => downloadReceipt(tx)}
                        className="p-2.5 bg-gray-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-2 ml-auto border border-gray-100"
                        title="Download PDF Receipt"
                      >
                        <FiDownload className="text-lg" />
                        <span className="text-[10px] font-bold uppercase">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && (
            <div className="py-6 px-8 bg-gray-50/20 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 font-medium">
                  Showing {((currentPage - 1) * transactionsPerPage) + 1} to{' '}
                  {Math.min(currentPage * transactionsPerPage, pagination.totalTransactions)} of{' '}
                  {pagination.totalTransactions} transactions
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage || pagination.totalPages <= 1}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white shadow-sm flex items-center gap-2"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 rounded-xl border border-gray-200">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage || pagination.totalPages <= 1}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-white hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white shadow-sm flex items-center gap-2"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Show link only if no pagination data (backward compatibility) */}
          {!pagination && recentTransactions && recentTransactions.length > 0 && (
            <div className="py-5 bg-gray-50/20 text-center border-t border-gray-50">
              <Link 
                to="/transactions" 
                className="text-[13px] font-bold text-gray-500 hover:text-primary-500 font-black transition-colors flex items-center justify-center gap-1 group"
              >
                View all transactions 
                <span className="text-lg group-hover:translate-x-1 transition-transform">›</span>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MyRewards;