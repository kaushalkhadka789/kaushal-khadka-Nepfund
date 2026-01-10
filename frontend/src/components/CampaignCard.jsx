import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignCard = ({ campaign, variant = 'grid', showDonateButton = false }) => {
  const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100);
  const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isEnded = daysLeft <= 0 || progress >= 100;
  const imageUrl = campaign.images?.length > 0 
    ? `http://localhost:5000/${campaign.images[0]}` 
    : 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=800';

  // Horizontal variant (featured card) - Matching the exact design from image
  if (variant === 'horizontal') {
    return (
      <Link to={`/campaign/${campaign._id}`} className="group block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-lg shadow-red-100/20 border border-gray-100 transition-all duration-300 hover:shadow-xl w-full flex flex-row h-[200px]"
        >
          {/* Image Section - Left side (40% width) */}
          <div className="relative w-[40%] h-full overflow-hidden flex-shrink-0">
            <img 
              src={imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
            
            {/* Category Badge - Top Left */}
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-md text-[8px] font-black text-red-600 uppercase tracking-wider shadow-sm">
                {campaign.category}
              </span>
            </div>
          </div>

          {/* Content Section - Right side (60% width) */}
          <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
            {/* Title and Status Row */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-red-600 transition-colors flex-1 line-clamp-2 pr-2">
                {campaign.title}
              </h3>
              {/* Active Status Badge - Top Right */}
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-tight flex items-center gap-1 shrink-0 ${
                isEnded ? 'bg-gray-700' : 'bg-green-500'
              }`}>
                {!isEnded && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
                {isEnded ? 'Ended' : 'Active'}
              </span>
            </div>

            {/* Description */}
            <p className="text-[10px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
              {campaign.description}
            </p>

            {/* Progress Bar Row */}
            <div className="mb-3">
              <div className="flex justify-between items-center text-[9px] font-bold mb-1">
                <span className="text-red-600">{Math.min(progress, 100).toFixed(0)}% Raised</span>
                <span className="text-gray-400">Target: रू {(campaign.goalAmount / 1000).toFixed(0)}k</span>
              </div>
              <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              {/* Days Left - Right side of progress */}
              <div className="flex justify-end">
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[9px] font-bold">
                  <Clock size={9} strokeWidth={2.5} />
                  <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}</span>
                </div>
              </div>
            </div>

            {/* Current Amount Row */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                <Heart size={12} strokeWidth={2.5} fill="currentColor" fillOpacity={0.3} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase">CURRENT</span>
                <span className="text-sm font-bold text-gray-900">रू {campaign.raisedAmount?.toLocaleString()}</span>
              </div>
              {showDonateButton && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/campaign/${campaign._id}`;
                  }}
                  className="ml-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold shadow-md shadow-red-100 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-1"
                >
                  Donate
                  <ArrowRight size={10} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Vertical variant (grid layout)
  return (
    <Link to={`/campaign/${campaign._id}`} className="group h-full block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative bg-white rounded-[1.5rem] overflow-hidden shadow-lg shadow-red-100/20 border border-gray-100 transition-all duration-500 hover:-translate-y-1 hover:shadow-red-200/30 h-full flex flex-col"
      >
        {/* Image Section */}
        <div className="relative w-full h-44 overflow-hidden">
          <img 
            src={imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40"></div>
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[8px] font-black text-red-600 uppercase tracking-widest shadow-sm border border-white/20">
              {campaign.category}
            </span>
          </div>

          {/* Active Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold text-white uppercase tracking-tighter flex items-center gap-1 shrink-0 ${
              isEnded ? 'bg-gray-800' : 'bg-green-500'
            }`}>
              {!isEnded && <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>}
              {isEnded ? 'Ended' : 'Active'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors mb-2 line-clamp-2">
              {campaign.title}
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          <div className="space-y-4">
            {/* Progress & Stats Row */}
            <div className="flex flex-col gap-3">
               <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-red-600">{Math.min(progress, 100).toFixed(0)}% Raised</span>
                      <span className="text-gray-400">Target: रू {(campaign.goalAmount / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-[length:20px_20px] bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                     <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        <Clock size={10} strokeWidth={2.5} />
                        <span className="text-[9px] font-bold">{daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                        <Heart size={14} />
                     </div>
                     <div>
                        <div className="text-[8px] font-bold text-gray-400 uppercase">Current</div>
                        <div className="text-xs font-bold text-slate-800">रू {campaign.raisedAmount?.toLocaleString()}</div>
                     </div>
                  </div>
                  {showDonateButton && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/campaign/${campaign._id}`;
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-[10px] font-bold shadow-md shadow-red-100 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 group/btn"
                    >
                      Donate
                      <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CampaignCard;
