import { Link } from 'react-router-dom';
import { useGetSuccessStoriesQuery } from '../services/api';
import { FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const buildAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url.substring(1) : url;
  return `http://localhost:5000/${normalized}`;
};

const SuccessStories = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetSuccessStoriesQuery({ limit: 6 });
  const stories = data?.data || [];

  return (
    <section className="bg-gradient-to-b from-white via-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t('successStories.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl">
              {t('successStories.subtitle')}
            </p>
          </div>
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700"
          >
            {t('successStories.cta')}
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center text-red-600 py-12">
            {t('successStories.error')}
          </div>
        )}

        {!isLoading && !error && stories.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            {t('successStories.empty')}
          </div>
        )}

        {!isLoading && !error && stories.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {stories.map((story) => {
              const imageUrl = buildAssetUrl(story.imageUrl || story.images?.[0]);
              return (
                <motion.article
                  key={story._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-52 bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={story.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {t('successStories.noImage')}
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-primary-700 shadow">
                      {t('successStories.completedBadge')}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {story.description}
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm font-semibold text-green-600">
                        {t('successStories.raisedLabel', {
                          raised: story.raisedAmount?.toLocaleString() || '0',
                          goal: story.goalAmount?.toLocaleString() || '0',
                        })}
                      </p>
                      <Link
                        to={`/success-story/${story._id}`}
                        className="mt-4 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {t('successStories.readMore')}
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default SuccessStories;

