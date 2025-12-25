import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaignMutation } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Layout, Type, FileText, AlignLeft, DollarSign, Calendar, AlertCircle, 
  Image as ImageIcon, UploadCloud, X, File, Send, ChevronDown, Check,
  // Category Icons
  Activity, BookOpen, CloudRain, Smile, Heart, Cat, Leaf, MapPin, 
  Lightbulb, Medal, Users, Coffee, Home, Megaphone, Star,
  // File Type Icons
  FileCode, FileSpreadsheet
} from 'lucide-react';

// --- CONFIGURATION ---

const categoryConfig = {
  'Medical & Health Emergency': { icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  'Education Support': { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  'Natural Disaster Relief': { icon: CloudRain, color: 'text-gray-500', bg: 'bg-gray-50' },
  'Child Welfare': { icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'Women Empowerment': { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
  'Animal Rescue & Shelter': { icon: Cat, color: 'text-orange-500', bg: 'bg-orange-50' },
  'Environmental Conservation': { icon: Leaf, color: 'text-green-500', bg: 'bg-green-50' },
  'Rural Infrastructure Development': { icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  'Startup & Innovation': { icon: Lightbulb, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  'Sports & Talent Support': { icon: Medal, color: 'text-purple-500', bg: 'bg-purple-50' },
  'Community Projects': { icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' },
  'Elderly Care & Support': { icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-50' },
  'Emergency Shelter / Housing': { icon: Home, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'Social Cause / Awareness Campaigns': { icon: Megaphone, color: 'text-rose-500', bg: 'bg-rose-50' },
  'Memorial & Tribute Campaigns': { icon: Star, color: 'text-violet-500', bg: 'bg-violet-50' },
};

// --- HELPER FUNCTIONS ---

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileConfig = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  
  if (['pdf'].includes(ext)) {
    return { icon: FileText, color: 'text-red-600', bg: 'bg-red-100', label: 'PDF' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', label: 'WORD' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-100', label: 'EXCEL' };
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
    return { icon: ImageIcon, color: 'text-purple-600', bg: 'bg-purple-100', label: 'IMG' };
  }
  return { icon: File, color: 'text-gray-600', bg: 'bg-gray-100', label: 'FILE' };
};

// --- COMPONENT ---

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', description: '', story: '', category: '', goalAmount: '', endDate: '', isUrgent: false,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
    setIsCategoryOpen(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const nextImages = [...images, ...files];
    setImages(nextImages);
    const addedPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...addedPreviews]);
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeSelectedImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeSelectedDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  useEffect(() => () => {
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'isUrgent') submitData.append(key, formData[key].toString());
      else submitData.append(key, formData[key]);
    });
    images.forEach((image) => submitData.append('images', image));
    documents.forEach((doc) => submitData.append('documents', doc));

    try {
      const result = await createCampaign(submitData).unwrap();
      toast.success('Campaign created successfully! Awaiting admin approval.');
      navigate(`/campaign/${result.data._id}`);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create campaign');
    }
  };

  const SelectedIcon = formData.category && categoryConfig[formData.category] ? categoryConfig[formData.category].icon : Layout;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Start a Movement</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">Fill in the details below to begin your fundraising journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Section 1: Basics */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-600" /> Campaign Basics
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 transition-colors py-3" placeholder="e.g., Help Build a Community Library" />
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="relative w-full bg-white border border-gray-300 rounded-lg py-3 pl-3 pr-10 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <span className="flex items-center">
                        {formData.category ? (
                          <>
                            <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${categoryConfig[formData.category]?.bg || 'bg-gray-100'}`}>
                              <SelectedIcon className={`h-4 w-4 ${categoryConfig[formData.category]?.color || 'text-gray-500'}`} />
                            </span>
                            <span className="ml-3 block truncate font-medium text-gray-800">{formData.category}</span>
                          </>
                        ) : <span className="text-gray-400 ml-1">Select a category that best fits your cause</span>}
                      </span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </span>
                    </button>
                    {isCategoryOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {Object.keys(categoryConfig).map((cat) => {
                          const Config = categoryConfig[cat];
                          const Icon = Config.icon;
                          return (
                            <div key={cat} onClick={() => handleCategorySelect(cat)} className={`cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-gray-50 transition-colors ${formData.category === cat ? 'bg-indigo-50' : ''}`}>
                              <div className="flex items-center">
                                <span className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${Config.bg}`}>
                                  <Icon className={`h-5 w-5 ${Config.color}`} />
                                </span>
                                <span className={`ml-3 block truncate ${formData.category === cat ? 'font-semibold text-indigo-900' : 'font-normal text-gray-900'}`}>{cat}</span>
                              </div>
                              {formData.category === cat && <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600"><Check className="h-5 w-5" /></span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Story */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> The Story
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none"><AlignLeft className="h-5 w-5 text-gray-400" /></div>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="2" className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="A quick summary (1-2 sentences)." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Story <span className="text-red-500">*</span></label>
                <textarea name="story" value={formData.story} onChange={handleChange} required rows="8" className="block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 p-4" placeholder="Tell potential donors why this matters." />
              </div>
            </div>
          </div>

          {/* Section 3: Logistics */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-indigo-600" /> Goals & Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount (NPR) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold">Rs.</span></div>
                  <input type="number" name="goalAmount" value={formData.goalAmount} onChange={handleChange} required min="1" className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="100,000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-5 w-5 text-gray-400" /></div>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} className="pl-10 block w-full border-gray-300 rounded-lg border focus:ring-indigo-500 focus:border-indigo-500 py-3" />
                </div>
              </div>
              <div className="md:col-span-2">
                 <div className={`flex items-center p-4 rounded-lg border ${formData.isUrgent ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center h-5">
                    <input id="isUrgent" type="checkbox" name="isUrgent" checked={formData.isUrgent} onChange={handleChange} className="focus:ring-red-500 h-5 w-5 text-red-600 border-gray-300 rounded cursor-pointer" />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isUrgent" className="font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                      Mark as Urgent Campaign {formData.isUrgent && <AlertCircle className="w-4 h-4 text-red-600" />}
                    </label>
                    <p className="text-gray-500">Check this only if immediate attention is required.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Media */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" /> Media & Documents
            </h2>
            <div className="space-y-6">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Images (Max 5)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload images</span>
                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleImageChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-w-16 aspect-h-9">
                        <img src={src} alt={`preview-${idx}`} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <button type="button" onClick={() => removeSelectedImage(idx)} className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform scale-90 group-hover:scale-100">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ENHANCED DOCUMENT UPLOAD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-sm text-gray-500"><span className="font-semibold text-indigo-600">Click to upload</span> medical reports or proofs (PDF/Doc)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" multiple onChange={handleDocumentChange} />
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {documents.map((f, idx) => {
                      // Determine icon and style based on file type
                      const fileConfig = getFileConfig(f.name);
                      const FileIcon = fileConfig.icon;

                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center overflow-hidden">
                            {/* File Icon Container */}
                            <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${fileConfig.bg}`}>
                              <FileIcon className={`h-5 w-5 ${fileConfig.color}`} />
                            </div>
                            
                            {/* File Details */}
                            <div className="ml-3 truncate">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">{f.name}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${fileConfig.bg} ${fileConfig.color}`}>
                                  {fileConfig.label}
                                </span>
                                <span className="text-xs text-gray-400">{formatFileSize(f.size)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => removeSelectedDocument(idx)} 
                            className="ml-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Remove file"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* END ENHANCED DOCUMENT UPLOAD */}

            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={isLoading} className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : <>Create Campaign <Send className="ml-2 w-4 h-4" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;