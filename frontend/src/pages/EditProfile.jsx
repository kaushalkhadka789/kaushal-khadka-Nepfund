import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/api';
import { updateUser } from '../store/authSlice';
import { 
  FiUser, FiPhone, FiMapPin, FiArrowLeft, 
  FiSave, FiX, FiCheckCircle 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const EditProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const reduxUser = useSelector((state) => state.auth.user);

    const { data, isLoading: isFetching } = useGetProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

    const user = data?.user || reduxUser;

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await updateProfile(formData).unwrap();
            dispatch(
                updateUser({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    ...result.data,
                })
            );
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            toast.error(error.data?.message || 'Failed to update profile');
        }
    };

    if (isFetching && !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-500 font-medium tracking-tight">Syncing your data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50/30 min-h-screen">
            {/* Header / Breadcrumb */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
            >
                <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </button>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-2">Edit Account</h1>
                <p className="text-gray-500 font-medium">Keep your contact information up to date</p>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
                {/* Form Progress/Decoration Header */}
                <div className="h-2 w-full bg-gray-50">
                    <div className="h-full bg-primary-600" style={{ width: '100%' }}></div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        
                        {/* Full Name Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <FiUser />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <FiPhone />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+977 98XXXXXXXX"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Address Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Permanent Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <FiMapPin />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="City, District, Province"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <FiSave className="text-lg" />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <FiX />
                            Discard
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Safety Note */}
            <p className="mt-6 text-center text-xs text-gray-400 font-medium">
                Your email address is managed by account security settings and cannot be changed here.
            </p>
        </div>
    );
};

export default EditProfile;