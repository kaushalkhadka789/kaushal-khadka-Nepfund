import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiHeart, FiClock, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const UrgentCampaigns = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useGetCampaignsQuery({
    status: 'approved',
    isUrgent: 'true',
    search: search || undefined,
    sortBy: 'createdAt',
    limit: 24,
  });

  const campaigns = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FiAlertCircle className="w-8 h-8 text-red-600" />
          <h1 className="text-4xl font-bold text-gray-900">Urgent Causes</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Time-sensitive campaigns that need immediate support
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search urgent campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-600">
          Error loading urgent campaigns
        </div>
      )}

      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No urgent campaigns found
        </div>
      )}

      {!isLoading && !error && campaigns.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {campaigns.map((campaign) => {
            const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
            const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            const isEnded = daysLeft <= 0 || progress >= 100;
            const isCritical = daysLeft > 0 && daysLeft < 10;

            return (
              <Link
                key={campaign._id}
                to={`/campaign/${campaign._id}`}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    {campaign.images && campaign.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000/${campaign.images[0]}`}
                        alt={campaign.title}
                        className="absolute inset-0 w-full h-full object-cover hover:opacity-90 transition duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                        {t('home.noImage')}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded">
                        URGENT
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                        {campaign.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-none">{campaign.description}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{t('home.progress')}</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-auto flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <FiHeart className="w-4 h-4 text-red-500" />
                        <span>
                          रु {campaign.raisedAmount?.toLocaleString()} / रु{' '}
                          {campaign.goalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 ${isCritical && !isEnded ? 'text-red-600 font-semibold' : ''}`}>
                        <FiClock className="w-4 h-4" />
                        <span>{isEnded ? t('home.ended') : `${daysLeft} ${t('home.daysLeft')}`}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default UrgentCampaigns;

