import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetSuccessStoryQuery } from '../services/api';
import { FiArrowLeft, FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiHeart, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';

// --- Utility Functions ---
const buildAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const normalized = url.startsWith('/') ? url.substring(1) : url;
  return `http://localhost:5000/${normalized}`;
};

const calculateProgress = (raised, goal) => {
  if (!goal || goal === 0) return 100;
  const percent = (raised / goal) * 100;
  return Math.min(percent, 100);
};

// --- Sub-Components ---

// 1. Loading Skeleton with Shimmer Effect
const LoadingSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 py-12">
    <div className="animate-pulse space-y-8">
      <div className="h-96 bg-gray-200 rounded-3xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-4">
          <div className="h-10 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </div>
);

// 2. Error State
const ErrorState = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="bg-red-50 p-6 rounded-full mb-4">
      <FiHeart className="w-12 h-12 text-red-500 opacity-50" />
    </div>
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Story Unavailable</h1>
    <p className="text-gray-500 mb-8 max-w-md">The success story you're looking for might have been moved or removed.</p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
    >
      <FiArrowLeft /> Return Home
    </Link>
  </div>
);

const SuccessStoryPage = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSuccessStoryQuery(id, { skip: !id });
  const story = data?.data;

  if (isLoading) return <LoadingSkeleton />;
  if (error || !story) return <ErrorState />;

  // Data Preparation
  const coverImage = buildAssetUrl(story.imageUrl || story.images?.[0]);
  const galleryImages = Array.isArray(story.storyDetails?.images) ? story.storyDetails.images : [];
  const progress = calculateProgress(story.raisedAmount, story.goalAmount);

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[60vh] md:h-[70vh] bg-gray-900 overflow-hidden">
        {coverImage && (
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src={coverImage}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <Link
            to="/"
            className="absolute top-8 left-4 md:left-8 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
          >
            <FiArrowLeft /> Back to Home
          </Link>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-green-400 uppercase bg-green-900/30 backdrop-blur-md border border-green-500/30 rounded-full">
              Success Story
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
              {story.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-300 text-sm md:text-base">
              <span>Verified Campaign</span>
              <span className="w-1 h-1 bg-gray-500 rounded-full" />
              <span>{new Date().getFullYear()} Impact Report</span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT COLUMN: Main Content --- */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Story Text */}
            <motion.article variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-green-500 rounded-full"></span>
                The Journey
              </h2>
              
              <div className="prose prose-lg text-gray-600 leading-relaxed max-w-none">
                {story.description && (
                   <p className="text-xl text-gray-800 font-medium italic border-l-4 border-green-100 pl-4 mb-8">
                     {story.description}
                   </p>
                )}
                <p className="whitespace-pre-line">{story.story || story.description}</p>
              </div>

              {/* Share Section */}
              <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 font-medium">Share this impact:</span>
                <div className="flex gap-4">
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"><FiFacebook /></button>
                  <button className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors"><FiTwitter /></button>
                  <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"><FiLinkedin /></button>
                  <button className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"><FiShare2 /></button>
                </div>
              </div>
            </motion.article>

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Moments Captured</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="relative group overflow-hidden rounded-2xl shadow-md cursor-zoom-in aspect-square"
                    >
                      <img
                        src={buildAssetUrl(img)}
                        alt={`Moment ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Video Section */}
            {story.storyDetails?.videoUrl && (
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                  <iframe
                    src={story.storyDetails.videoUrl}
                    title="Success Story Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                  <FiPlay className="text-green-600" />
                  <span>Watch the full update video</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* --- RIGHT COLUMN: Stats & Sticky Sidebar --- */}
          <div className="lg:col-span-4 space-y-8">
            {/* Impact Card (Sticky-ish) */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 lg:sticky lg:top-8"
            >
              <h3 className="text-lg font-semibold text-gray-400 uppercase tracking-wider mb-6">Total Impact</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      रु {story.raisedAmount?.toLocaleString() || '0'}
                    </span>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                      Raised
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
                    <span>Goal: रु {story.goalAmount?.toLocaleString()}</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                </div>

                {/* Thank You Note */}
                {story.storyDetails?.message && (
                  <div className="bg-orange-50 rounded-2xl p-6 relative">
                    <div className="absolute -top-3 -left-2 text-4xl text-orange-200">❝</div>
                    <p className="text-gray-700 italic relative z-10 text-sm leading-relaxed">
                      "{story.storyDetails.message}"
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 font-bold text-xs">
                        FN
                      </div>
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">From the Fundraiser</span>
                    </div>
                  </div>
                )}

                <button className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                  <FiHeart className="fill-current" />
                  View More Campaigns
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessStoryPage;