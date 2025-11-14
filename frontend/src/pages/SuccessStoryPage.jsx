import { Link, useParams } from 'react-router-dom';
import { useGetSuccessStoryQuery } from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';

const buildAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const normalized = url.startsWith('/') ? url.substring(1) : url;
  return `http://localhost:5000/${normalized}`;
};

const SuccessStoryPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSuccessStoryQuery(id, {
    skip: !id,
  });

  const story = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-2/3" />
          <div className="h-72 bg-gray-200 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Success story not found</h1>
        <p className="text-gray-600 mb-6">The story you are looking for might have been removed or is unavailable.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const coverImage = buildAssetUrl(story.imageUrl || story.images?.[0]);
  const galleryImages = Array.isArray(story.storyDetails?.images) ? story.storyDetails.images : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {coverImage && (
            <div className="relative h-80 bg-gray-100">
              <img src={coverImage} alt={story.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 text-sm font-semibold text-primary-700 shadow">
                  Success Story
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mt-4 leading-tight">
                  {story.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 md:p-10 space-y-10">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About this campaign</h2>
              {story.description && (
                <p className="text-gray-600 mb-4">
                  {story.description}
                </p>
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {story.story || story.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-primary-50 rounded-2xl p-6">
              <div>
                <p className="text-sm text-primary-700 uppercase tracking-wide">Amount Raised</p>
                <p className="text-3xl font-bold text-primary-900">
                  रु {story.raisedAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-primary-700 uppercase tracking-wide">Fundraising Goal</p>
                <p className="text-3xl font-bold text-primary-900">
                  रु {story.goalAmount?.toLocaleString() || '0'}
                </p>
              </div>
            </div>

            {story.storyDetails?.message && (
              <div className="bg-gray-100 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fundraiser's Thank-you Note</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {story.storyDetails.message}
                </p>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Moments from the Journey</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={buildAssetUrl(img)}
                      alt={`${story.title} gallery ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-xl shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}

            {story.storyDetails?.videoUrl && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Update</h3>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src={story.storyDetails.videoUrl}
                    title="Success story video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default SuccessStoryPage;

