import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCampaignMutation } from '../services/api';
import toast from 'react-hot-toast';

const categories = [
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
  'Memorial & Tribute Campaigns',
];

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    story: '',
    category: '',
    goalAmount: '',
    endDate: '',
    isUrgent: false,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documents, setDocuments] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    // append to existing selection
    const nextImages = [...images, ...files];
    setImages(nextImages);
    // generate previews
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
    // cleanup previews on unmount
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'isUrgent') {
        submitData.append(key, formData[key].toString());
      } else {
        submitData.append(key, formData[key]);
      }
    });

    images.forEach((image) => {
      submitData.append('images', image);
    });

    documents.forEach((doc) => {
      submitData.append('documents', doc);
    });

    try {
      const result = await createCampaign(submitData).unwrap();
      toast.success('Campaign created successfully! Awaiting admin approval.');
      navigate(`/campaign/${result.data._id}`);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create campaign');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Enter campaign title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Brief description of your campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Story *
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={handleChange}
            required
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Tell your story in detail..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Amount (NPR) *
            </label>
            <input
              type="number"
              name="goalAmount"
              value={formData.goalAmount}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="100000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Mark as Urgent</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Images (max 5)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative rounded overflow-hidden border">
                  <img src={src} alt={`preview-${idx}`} className="w-full h-28 object-cover" />
                  <button type="button" onClick={() => removeSelectedImage(idx)} className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-red-600 text-white">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Files (max 5, Images or PDF/DOC/DOCX)
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            multiple
            onChange={handleDocumentChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {documents.length > 0 && (
            <ul className="mt-3 space-y-2">
              {documents.map((f, idx) => (
                <li key={idx} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                  <span className="truncate mr-3">{f.name}</span>
                  <button type="button" onClick={() => removeSelectedDocument(idx)} className="px-2 py-1 rounded text-xs bg-red-600 text-white">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaign;

