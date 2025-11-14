import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetCampaignsQuery } from '../services/api';
import { FiSearch, FiHeart, FiClock } from 'react-icons/fi';

const Campaigns = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useGetCampaignsQuery({ status: 'approved', search: search || undefined, sortBy: 'createdAt', limit: 24 });
  const campaigns = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <FiSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search approved campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg"
        />
      </div>

      {isLoading && <div className="text-center py-12">Loading...</div>}
      {error && !isLoading && <div className="text-center py-12 text-red-600">Failed to load campaigns</div>}
      {!isLoading && !error && campaigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">No campaigns found</div>
      )}
      {!isLoading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1);
            const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <Link key={campaign._id} to={`/campaign/${campaign._id}`} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                {campaign.images?.length ? (
                  <img src={`http://localhost:5000/${campaign.images[0]}`} alt={campaign.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100"></div>
                )}
                <div className="p-5">
                  <div className="flex justify-between mb-2">
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">{campaign.category}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2">{campaign.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{campaign.description}</p>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1"><FiHeart className="w-4 h-4" /> रु {campaign.raisedAmount?.toLocaleString()} / रु {campaign.goalAmount?.toLocaleString()}</div>
                    <div className="flex items-center gap-1"><FiClock className="w-4 h-4" /> {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Campaigns;


