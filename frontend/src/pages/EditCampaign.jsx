import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCampaignQuery, useUpdateCampaignMutation } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiUploadCloud, FiX, FiImage, FiFileText, FiCalendar, 
  FiDollarSign, FiType, FiLayers, FiAlertCircle, FiCheck, FiArrowLeft, FiSave
} from 'react-icons/fi';

const categories = [
  'Medical & Health Emergency', 'Education Support', 'Natural Disaster Relief',
  'Child Welfare', 'Women Empowerment', 'Animal Rescue & Shelter',
  'Environmental Conservation', 'Rural Infrastructure Development',
  'Startup & Innovation', 'Sports & Talent Support', 'Community Projects',
  'Elderly Care & Support', 'Emergency Shelter / Housing',
  'Social Cause / Awareness Campaigns', 'Memorial & Tribute Campaigns',
];

const BASE_URL = 'http://localhost:5000/';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  const { data, isLoading: isFetching } = useGetCampaignQuery(id);
  const [updateCampaign, { isLoading }] = useUpdateCampaignMutation();

  const campaign = data?.data;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    goalAmount: '',
    endDate: '',
    isUrgent: false,
  });

  // Media State
  const [images, setImages] = useState([]); 
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState([]); 
  const [removedImages, setRemovedImages] = useState([]);
  const [removedDocuments, setRemovedDocuments] = useState([]);

  // Initialize Data
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        story: campaign.story || '',
        category: campaign.category || '',
        goalAmount: campaign.goalAmount || '',
        endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '',
        isUrgent: campaign.isUrgent || false,
      });
    }
  }, [campaign]);

  // Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 new images allowed.");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    const addedPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...addedPreviews]);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeSelectedNewImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeSelectedNewDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleRemoveImage = (url) => {
    setRemovedImages((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const toggleRemoveDocument = (urlOrObj) => {
    const url = typeof urlOrObj === 'string' ? urlOrObj : (urlOrObj.url || urlOrObj.path || '');
    if (!url) return;
    setRemovedDocuments((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    images.forEach((image) => submitData.append('images', image));
    documents.forEach((doc) => submitData.append('documents', doc));
    submitData.append('deletedImages', JSON.stringify(removedImages));
    submitData.append('deletedDocuments', JSON.stringify(removedDocuments));

    try {
      await updateCampaign({ id, data: submitData }).unwrap();
      toast.success('Campaign updated successfully!');
      navigate(`/campaign/${id}`);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update campaign');
    }
  };

  // --- Render Helpers ---

  if (isFetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading Campaign Details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Campaign Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/campaign/${id}`)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Edit Campaign</h1>
          </div>
          <div className="flex gap-3">
             <button
              type="button"
              onClick={() => navigate(`/campaign/${id}`)}
              className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-md hover:shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/> : <FiSave />}
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Basic Info */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><FiType /></span>
              Basic Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                  placeholder="Give your campaign a clear, catchy title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none resize-none"
                  placeholder="Summarize your cause in a few sentences..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                 <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <div className="relative">
                    <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none appearance-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">NPR</span>
                    <input
                      type="number"
                      name="goalAmount"
                      value={formData.goalAmount}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                      placeholder="e.g. 50000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: The Story */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><FiFileText /></span>
              Detailed Story
            </h2>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows="10"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
              placeholder="Tell the full story here. Be descriptive, honest, and compelling..."
            />
          </motion.div>

          {/* Section 3: Visuals */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
             <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><FiImage /></span>
              Gallery & Media
            </h2>

            {/* Custom File Upload Box */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                <FiUploadCloud className="w-6 h-6 text-gray-500 group-hover:text-primary-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Click to upload new images</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5)</p>
            </div>

            {/* Existing & New Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <AnimatePresence>
                {/* Existing Images */}
                {campaign.images?.filter(img => !removedImages.includes(img)).map((imgUrl) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    key={imgUrl} 
                    className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    <img src={`${BASE_URL}${imgUrl}`} alt="Campaign" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => toggleRemoveImage(imgUrl)} className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white shadow-lg transform hover:scale-110 transition-all">
                        <FiX />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                {/* New Preview Images */}
                {imagePreviews.map((src, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                    key={`new-${idx}`} 
                    className="relative group aspect-video rounded-lg overflow-hidden border-2 border-primary-200 bg-gray-100"
                  >
                    <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">New</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeSelectedNewImage(idx)} className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white shadow-lg transform hover:scale-110 transition-all">
                        <FiX />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Settings & Files */}
        <div className="space-y-6">
          
          {/* Timeline & Urgency */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign End Date</label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${formData.isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleChange}
                      className="peer sr-only" 
                    />
                    <div className={`w-11 h-6 rounded-full peer-focus:ring-4 peer-focus:ring-red-300 transition-colors ${formData.isUrgent ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white border border-gray-300 w-4 h-4 rounded-full transition-transform ${formData.isUrgent ? 'translate-x-full border-white' : ''}`}></div>
                  </div>
                  <div className="flex-1">
                    <span className={`block font-bold text-sm ${formData.isUrgent ? 'text-red-700' : 'text-gray-700'}`}>Mark as Urgent</span>
                    <span className="text-xs text-gray-500 mt-1">Highlights your campaign for immediate attention.</span>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Documents Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex justify-between items-center">
              Documents
              <button 
                type="button" 
                onClick={() => docInputRef.current.click()}
                className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center gap-1"
              >
                <FiUploadCloud /> Upload
              </button>
            </h2>
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={handleDocumentChange}
            />

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {/* Existing Documents */}
              {campaign.documents?.filter(d => {
                 const url = typeof d === 'string' ? d : (d.url || d.path);
                 return !removedDocuments.includes(url);
              }).map((doc, idx) => {
                const stored = typeof doc === 'string' ? { url: doc, name: 'Attached Document' } : doc;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                        <FiFileText />
                      </div>
                      <a href={`${BASE_URL}${stored.url || stored.path}`} target="_blank" rel="noreferrer" className="text-sm text-gray-700 font-medium truncate hover:text-primary-600 hover:underline">
                        {stored.name || `Document ${idx + 1}`}
                      </a>
                    </div>
                    <button type="button" onClick={() => toggleRemoveDocument(stored)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <FiX />
                    </button>
                  </div>
                );
              })}

              {/* New Documents */}
              {documents.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-8 h-8 rounded bg-white border border-blue-200 flex items-center justify-center text-blue-500">
                        <FiFileText />
                      </div>
                    <span className="text-sm text-gray-700 font-medium truncate">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeSelectedNewDocument(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <FiX />
                  </button>
                </div>
              ))}
              
              {documents.length === 0 && (!campaign.documents || campaign.documents.length === 0) && (
                <div className="text-center py-6 text-gray-400 text-sm italic">
                  No documents attached
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
};

export default EditCampaign;