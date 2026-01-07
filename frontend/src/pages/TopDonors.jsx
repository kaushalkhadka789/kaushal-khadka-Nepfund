import React, { useState } from 'react';
import { useGetTopDonorsQuery, useGetDonationTrendsQuery } from '../services/api';
import TierBadge from '../components/TierBadge';
import { 
  FiAward, 
  FiHeart, 
  FiSearch, 
  FiFilter, 
  FiStar,
  FiZap,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const TopDonors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real API Hooks from your service
  const { data: leaderboardData, isLoading: leaderboardLoading, error: leaderboardError } = useGetTopDonorsQuery({ limit: 50 });
  const { data: trendDataApi, isLoading: trendLoading } = useGetDonationTrendsQuery();

  if (leaderboardLoading || trendLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-gray-500 font-medium animate-pulse">Syncing Hall of Heroes...</p>
        </div>
      </div>
    );
  }

  if (leaderboardError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">
        <div className="bg-red-50 p-8 rounded-3xl inline-block border border-red-100">
            <FiAlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold">API Connection Error</h2>
            <p className="opacity-75">We couldn't load the donor rankings. Check your API server.</p>
        </div>
      </div>
    );
  }

  const leaderboard = leaderboardData?.data || [];
  const realTrendData = trendDataApi?.data || []; 

  const filteredDonors = leaderboard.filter(donor => 
    donor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);
  const remainingDonors = filteredDonors.slice(3);

  const getRankBadgeStyles = (rank) => {
    const styles = {
      1: "bg-amber-100 text-amber-600 border-amber-200 shadow-sm",
      2: "bg-slate-100 text-slate-500 border-slate-200",
      3: "bg-orange-100 text-orange-600 border-orange-200"
    };
    return styles[rank] || "bg-gray-50 text-gray-400 border-gray-100";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
               <FiZap className="fill-current animate-pulse" />
               Impact Leaderboard
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
               Hall of <span className="text-primary-600">Heroes</span>
             </h1>
          </div>

          <div className="relative group w-full lg:w-96">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search hero donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
            />
          </div>
        </div>

        {/* Podium (Hidden when searching) */}
        {!searchTerm && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-16 px-4">
            <PodiumCard donor={topThree[1]} rank={2} delay={0.1} icon="🥈" gradient="from-slate-50 to-slate-100" height="md:h-64" />
            <PodiumCard donor={topThree[0]} rank={1} delay={0} icon="🥇" gradient="from-amber-50 to-yellow-100" height="md:h-80" isChampion />
            <PodiumCard donor={topThree[2]} rank={3} delay={0.2} icon="🥉" gradient="from-orange-50 to-orange-100" height="md:h-56" />
          </div>
        )}

        {/* Real Data Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 mb-12 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <FiActivity className="text-primary-500" />
                Community Donation Trend
              </h3>
              <p className="text-slate-400 text-sm font-medium mt-1 font-mono">Real-time API Analytics</p>
            </div>
            {realTrendData.length > 0 && (
                <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-widest mb-1">Total Impact</span>
                    <span className="text-xl font-black text-slate-900">
                        रु {realTrendData.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}
                    </span>
                </div>
            )}
          </div>

          <div className="h-[300px] w-full">
            {realTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTrendData}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800">
                                    <p className="text-[10px] font-bold opacity-60 uppercase mb-1">{payload[0].payload.month}</p>
                                    <p className="text-sm font-black">रु {payload[0].value.toLocaleString()}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4F46E5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorImpact)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 border-2 border-dashed border-slate-50 rounded-3xl">
                    <FiActivity size={32} />
                    <p className="font-bold text-sm uppercase tracking-widest">Awaiting trend data...</p>
                </div>
            )}
          </div>
        </motion.div>

        {/* List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="px-8 py-7 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Full Leaderboard</h3>
            <FiFilter className="text-slate-300 cursor-pointer hover:text-primary-500 transition-colors" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                  <th className="px-8 py-5">Rank</th>
                  <th className="px-6 py-5">Donor</th>
                  <th className="px-6 py-5 text-center">Tier</th>
                  <th className="px-6 py-5">Stats</th>
                  <th className="px-8 py-5 text-right">Total Donated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {(searchTerm ? filteredDonors : remainingDonors).map((donor, index) => {
                    const actualRank = searchTerm ? index + 1 : index + 4;
                    return (
                      <motion.tr
                        layout
                        key={donor.userId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-[11px] font-black ${getRankBadgeStyles(actualRank)}`}>
                            {actualRank}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                                {donor.avatar ? (
                                    <img src={`http://localhost:5000/${donor.avatar}`} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-white" />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm">
                                        {donor.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{donor.name}</p>
                              <p className="text-[11px] text-slate-400 mt-1 font-medium">{donor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <TierBadge tier={donor.tier} size="sm" />
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-6">
                              <div>
                                <p className="text-sm font-black text-slate-800 tracking-tight">{donor.points.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Points</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiHeart className="text-red-500 fill-current w-3 h-3" />
                                <span className="text-sm font-bold text-slate-700">{donor.totalDonations}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className="text-sm font-black text-slate-900 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                             रु {donor.totalDonated.toLocaleString()}
                           </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Sub-component for Podium
const PodiumCard = ({ donor, rank, delay, icon, gradient, height, isChampion }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    className={`relative flex flex-col items-center justify-end ${height} group`}
  >
    {isChampion && (
        <div className="absolute -top-12 flex flex-col items-center">
             <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ repeat: Infinity, duration: 3 }}
                className="bg-amber-400 text-white p-2.5 rounded-2xl shadow-xl"
             >
                <FiStar className="fill-current w-5 h-5" />
             </motion.div>
        </div>
    )}
    
    <div className={`w-full bg-gradient-to-b ${gradient} rounded-t-[3.5rem] border-x border-t border-white shadow-2xl p-6 text-center group-hover:-translate-y-1 transition-transform duration-500`}>
      <div className="text-5xl mb-6 drop-shadow-lg">{icon}</div>
      
      <div className="relative inline-block mb-4">
        {donor?.avatar ? (
            <img src={`http://localhost:5000/${donor.avatar}`} className="w-16 h-16 rounded-[2rem] object-cover ring-4 ring-white shadow-xl mx-auto" alt="" />
        ) : (
            <div className="w-16 h-16 rounded-[2rem] bg-white/60 flex items-center justify-center text-2xl font-black text-slate-400 mx-auto">
                {donor?.name?.charAt(0)}
            </div>
        )}
      </div>

      <h3 className="text-lg font-black text-slate-900 truncate mb-1 leading-tight">{donor?.name || 'Anonymous'}</h3>
      <TierBadge tier={donor?.tier} size="sm" className="mb-4" />
      
      <div className="bg-white/50 backdrop-blur-md rounded-2xl py-3 px-4 border border-white">
        <div className="text-lg font-black text-primary-600">{donor?.points?.toLocaleString() || 0}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</div>
      </div>
    </div>
  </motion.div>
);

export default TopDonors;