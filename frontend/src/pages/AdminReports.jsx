import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { FiCalendar, FiDownload, FiRotateCcw, FiFilter } from 'react-icons/fi';
import {
  useGetAdminReportSummaryQuery,
  useGetAdminMonthlyDonationsQuery,
  useGetAdminTopCategoriesQuery,
  useGetAdminTopCampaignsQuery
} from '../services/api';

const campaignCategories = [
  'Medical & Health Emergency',
  'Education Support',
  'Natural Disaster Relief',
  'Child Welfare',
  'Women Empowerment',
  'Animal Rescue & Shelter',
  'Environmental Conservation',
  'Rural Infrastructure Development',
  'Startup & Innovation',
  'Sports & Talent Support',
  'Community Projects',
  'Elderly Care & Support',
  'Emergency Shelter / Housing',
  'Social Cause / Awareness Campaigns',
  'Memorial & Tribute Campaigns'
];

const sortOptions = [
  { value: 'amount', label: 'Highest Raised' },
  { value: 'donors', label: 'Most Donors' },
  { value: 'growth', label: 'Best Progress' },
  { value: 'recent', label: 'Most Recent' }
];

const chartColors = ['#6366F1', '#EC4899', '#F97316', '#10B981', '#14B8A6', '#F59E0B'];

const SummaryCard = ({ label, value, hint, accent }) => (
  <div className="group bg-white/80 rounded-2xl shadow-lg p-6 border border-white/60 overflow-hidden relative hover:-translate-y-1 hover:shadow-2xl transition-all">
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all bg-gradient-to-r from-white/0 to-white/40" />
    <p className="text-sm uppercase tracking-wide text-gray-500 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }}></span>
      {label}
    </p>
    <p className="text-3xl font-semibold text-gray-900 mt-3">
      {typeof value === 'number' ? `रु ${value.toLocaleString()}` : value}
    </p>
    {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
  </div>
);

const ChartCard = ({ title, description, isLoading, onExportCsv, onExportPdf, children }) => (
  <div className="bg-white/90 rounded-3xl shadow-xl p-6 border border-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/80 transition-all hover:-translate-y-1 hover:shadow-2xl">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {onExportCsv && (
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <FiDownload className="w-4 h-4" />
            CSV
          </button>
        )}
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-full bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <FiDownload className="w-4 h-4" />
            PDF
          </button>
        )}
      </div>
    </div>
    {isLoading ? (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-primary-500 rounded-full animate-spin border-t-transparent" />
      </div>
    ) : (
      children
    )}
  </div>
);

const AdminReports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: 'all',
    sort: 'amount'
  });

  const { token: storeToken } = useSelector((state) => state.auth);
  const token =
    storeToken || localStorage.getItem('adminToken') || localStorage.getItem('userToken') || '';

  const filterParams = useMemo(() => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.category !== 'all') params.category = filters.category;
    if (filters.sort) params.sort = filters.sort;
    return params;
  }, [filters]);

  const { data: summaryData, isFetching: summaryLoading } = useGetAdminReportSummaryQuery(filterParams);
  const { data: monthlyData, isFetching: monthlyLoading } = useGetAdminMonthlyDonationsQuery(filterParams);
  const { data: categoriesData, isFetching: categoriesLoading } = useGetAdminTopCategoriesQuery(filterParams);
  const { data: campaignsData, isFetching: campaignsLoading } = useGetAdminTopCampaignsQuery(filterParams);

  const summary = summaryData?.data;
  const monthlySeries = monthlyData?.data?.monthly || [];
  const dailySeries = monthlyData?.data?.daily || [];
  const categorySeries = categoriesData?.data || [];
  const topCampaigns = campaignsData?.data || [];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'all',
      sort: 'amount'
    });
  };

  const handleExport = async (dataset, format) => {
    if (!token) {
      toast.error('Please login again to export data.');
      return;
    }

    const params = new URLSearchParams({
      dataset,
      format,
      ...filterParams
    });

    try {
      const response = await fetch(`/api/admin/reports/export?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Unable to export data right now.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileName = `admin-${dataset}-${Date.now()}.${format === 'pdf' ? 'pdf' : 'csv'}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${dataset} as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(error?.message || 'Failed to export data');
    }
  };

  const summaryCards = [
    {
      label: 'Total Raised',
      value: summary?.totalRaised ?? 0,
      hint: filters.startDate || filters.endDate ? 'Within selected range' : 'All time',
      accent: '#6366F1'
    },
    {
      label: 'Donations This Month',
      value: summary?.totalDonationsThisMonth ?? 0,
      hint: 'Current calendar month',
      accent: '#EC4899'
    },
    {
      label: 'Top Category',
      value: summary?.topCategory?.name || 'Not enough data',
      hint: summary?.topCategory ? `रु ${summary.topCategory.totalAmount.toLocaleString()} raised` : 'Waiting for activity',
      accent: '#F97316'
    },
    {
      label: 'New Users',
      value: summary?.newUsers ?? 0,
      hint: filters.startDate || filters.endDate ? 'Within selected range' : 'This month',
      accent: '#10B981'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-primary-600 to-rose-500 text-white p-10 shadow-2xl">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative flex flex-col gap-6">
          <div>
            <p className="uppercase tracking-[0.3em] text-sm text-white/70">Admin Intelligence</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mt-2">Reports & Insights</h1>
            <p className="text-white/80 max-w-3xl mt-4">
              Monitor fundraising performance, donor momentum, and category health in one modern dashboard. Apply filters, compare trends, and export polished PDFs/CSVs in a click.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              Smart Filters
            </div>
            <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export Ready
            </div>
            <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              Live Trends
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600 mb-1 block">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600 mb-1 block">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600 mb-1 block">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50"
            >
              <option value="all">All categories</option>
              {campaignCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-gray-600 mb-1 block">Sort Top Campaigns By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-gray-50"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <FiRotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Funds Raised"
          description="Line chart across the last 12 months"
          isLoading={monthlyLoading}
          onExportCsv={() => handleExport('monthly', 'csv')}
          onExportPdf={() => handleExport('monthly', 'pdf')}
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlySeries}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `रु ${value / 1000}k`} />
                <Tooltip formatter={(value) => `रु ${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }} />
                <Line type="monotone" dataKey="total" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} fill="url(#lineGradient)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Daily Donations"
          description="Area chart for the last 30 days"
          isLoading={monthlyLoading}
          onExportCsv={() => handleExport('daily', 'csv')}
          onExportPdf={() => handleExport('daily', 'pdf')}
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySeries}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#FED7AA" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="label" stroke="#9CA3AF" hide />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `रु ${value / 1000}k`} />
                <Tooltip formatter={(value) => `रु ${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }} />
                <Area type="monotone" dataKey="total" stroke="#F97316" strokeWidth={2} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Category Mix"
          description="Share of funds raised by category"
          isLoading={categoriesLoading}
          onExportCsv={() => handleExport('categories', 'csv')}
          onExportPdf={() => handleExport('categories', 'pdf')}
        >
          <div className="h-80 w-full flex flex-col lg:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categorySeries}
                  dataKey="totalAmount"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={4}
                >
                  {categorySeries.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `रु ${Number(value).toLocaleString()}`,
                    `${props.payload.name} (${props.payload.percentage}%)`
                  ]}
                  contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 w-full lg:w-60">
              {categorySeries.length === 0 && <p className="text-sm text-gray-500">Not enough data for category split.</p>}
              {categorySeries.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }}></span>
                    <p className="text-sm font-medium text-gray-600">{item.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Top Campaigns (Bar)"
          description="Compare leading campaigns by the selected sort type"
          isLoading={campaignsLoading}
          onExportCsv={() => handleExport('campaigns', 'csv')}
          onExportPdf={() => handleExport('campaigns', 'pdf')}
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCampaigns} margin={{ top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="title" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `रु ${value / 1000}k`} />
                <Tooltip formatter={(value) => `रु ${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: '12px', borderColor: '#E5E7EB' }} />
                <Legend />
                <Bar dataKey="totalAmount" name="Total Raised" fill="#6366F1" radius={[12, 12, 0, 0]} />
                <Bar dataKey="donorCount" name="Donors" fill="#F97316" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Top Campaigns Leaderboard</h3>
            <p className="text-sm text-gray-500">Optimized for both desktop and tablet views</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('campaigns', 'csv')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('campaigns', 'pdf')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition"
            >
              <FiDownload className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Raised</th>
              <th className="px-4 py-3">Donors</th>
              <th className="px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topCampaigns.length === 0 && !campaignsLoading && (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500 text-sm">
                  Not enough data to rank campaigns right now.
                </td>
              </tr>
            )}
            {topCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50/70 transition">
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-gray-900">{campaign.title}</p>
                  <p className="text-xs text-gray-500">
                    Last gift {campaign.latestDonation ? new Date(campaign.latestDonation).toLocaleDateString() : '—'}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">{campaign.category}</td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">रु {campaign.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">{campaign.donorCount}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-500"
                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{campaign.progress.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;


