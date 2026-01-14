import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CampaignCard = ({ campaign, variant = 'grid', showDonateButton = false }) => {
  const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isEnded = daysLeft <= 0 || progress >= 100;

  const imageUrl =
    campaign.images?.length > 0
      ? `http://localhost:5000/${campaign.images[0]}`
      : 'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?auto=format&fit=crop&q=80&w=800';

  /* ===================== HORIZONTAL ===================== */
  if (variant === 'horizontal') {
    return (
      <Link to={`/campaign/${campaign._id}`} className="group block">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            bg-white
            border border-gray-200
            shadow-md shadow-red-100/20
            transition-all
            flex
            h-[160px]
            w-full
          "
        >
          {/* Image */}
          <div className="relative w-[35%] h-full overflow-hidden">
            <img
              src={imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-white text-[8px] font-bold text-red-600 uppercase">
                {campaign.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between p-3">
            <div className="flex justify-between gap-2">
              <h3 className="text-xs font-bold text-gray-900 line-clamp-2">
                {campaign.title}
              </h3>
              <span
                className={`px-2 py-0.5 text-[8px] font-bold text-white ${
                  isEnded ? 'bg-gray-700' : 'bg-green-500'
                }`}
              >
                {isEnded ? 'Ended' : 'Active'}
              </span>
            </div>

            <p className="text-[10px] text-gray-500 line-clamp-2">
              {campaign.description}
            </p>

            <div>
              <div className="flex justify-between text-[9px] font-bold mb-1">
                <span className="text-red-600">
                  {Math.min(progress, 100).toFixed(0)}%
                </span>
                <span className="text-gray-400">
                  Target: रू {(campaign.goalAmount / 1000).toFixed(0)}k
                </span>
              </div>

              <div className="h-1 bg-gray-100">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              {/* CURRENT restored */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 flex items-center justify-center text-red-500">
                    <Heart size={12} />
                  </div>
                  <div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase">
                      CURRENT
                    </div>
                    <div className="text-xs font-bold text-gray-900">
                      रू {campaign.raisedAmount?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-red-600 text-[9px] font-bold">
                  <Clock size={10} />
                  {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  /* ===================== GRID / VERTICAL ===================== */
  return (
    <Link to={`/campaign/${campaign._id}`} className="group block h-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-white
          border border-gray-200
          shadow-md shadow-red-100/20
          transition-all
          flex flex-col
          h-[320px]
          w-full
        "
      >
        {/* Image */}
        <div className="relative w-full h-36 overflow-hidden">
          <img
            src={imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />

          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-white text-[8px] font-bold text-red-600 uppercase">
              {campaign.category}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-0.5 text-[8px] font-bold text-white ${
                isEnded ? 'bg-gray-700' : 'bg-green-500'
              }`}
            >
              {isEnded ? 'Ended' : 'Active'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1">
              {campaign.title}
            </h3>
            <p className="text-[11px] text-gray-500 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-[9px] font-bold mb-1">
              <span className="text-red-600">
                {Math.min(progress, 100).toFixed(0)}%
              </span>
              <span className="text-gray-400">
                Target: रू {(campaign.goalAmount / 1000).toFixed(0)}k
              </span>
            </div>

            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-red-600"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* CURRENT restored */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-50 flex items-center justify-center text-red-500">
                  <Heart size={14} />
                </div>
                <div>
                  <div className="text-[8px] font-bold text-gray-400 uppercase">
                    CURRENT
                  </div>
                  <div className="text-xs font-bold text-gray-900">
                    रू {campaign.raisedAmount?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-red-600 text-[9px] font-bold">
                <Clock size={10} />
                {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default CampaignCard;
