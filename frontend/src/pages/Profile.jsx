import { useState } from 'react';
import { useGetProfileQuery, useUploadProfileImageMutation, useGetMyRewardsQuery } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiUpload, 
  FiAward, FiEdit3, FiHeart, FiPieChart, FiShoppingBag 
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/authSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const Profile = () => {
    const dispatch = useDispatch();
    const reduxUser = useSelector((state) => state.auth.user);
    
    const { data, isLoading: isProfileLoading } = useGetProfileQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    
    const [uploadProfileImage, { isLoading: isUploading }] = useUploadProfileImageMutation();

    const user = data?.user || reduxUser;
    
    const { data: rewardsData } = useGetMyRewardsQuery(undefined, {
        skip: !user,
    });
    
    const userPoints = user?.rewardPoints || 0;
    const userTier = rewardsData?.data?.tier || getTier(userPoints);

    const [preview, setPreview] = useState('');

    const onPickImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        try {
            const res = await uploadProfileImage(file).unwrap();
            toast.success('Profile image updated');
            dispatch(updateUser({ profileImage: res.data?.profileImage || res.data?.avatar }));
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to upload image');
        } finally {
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50/30 min-h-screen">
            {/* --- HERO SECTION --- */}
            <div className="relative mb-8">
                <div className="h-32 w-full bg-gradient-to-r from-primary-600 to-indigo-700 rounded-t-3xl shadow-lg"></div>
                <div className="absolute -bottom-12 left-8 flex flex-col sm:flex-row sm:items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white border-4 border-white shadow-xl">
                            {preview ? (
                                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            ) : user?.profileImage || user?.avatar ? (
                                <img src={`http://localhost:5000/${user.profileImage || user.avatar}`} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-300">
                                    <FiUser className="w-12 h-12" />
                                </div>
                            )}
                            {/* Overlay for upload */}
                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                                <FiUpload className="w-6 h-6" />
                                <input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
                            </label>
                        </div>
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="pb-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{user?.name}</h1>
                            {userTier && <TierBadge tier={userTier} size="md" />}
                        </div>
                        <p className="text-gray-500 font-medium">{user?.email}</p>
                    </div>
                </div>
                
                <div className="absolute -bottom-10 right-8 hidden sm:block">
                   <Link
                        to="/editprofile"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition font-bold text-sm"
                    >
                        <FiEdit3 className="text-primary-600" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 mb-10">
                <StatCard 
                  label="Campaigns" 
                  value={user?.campaignsCreated?.length || 0} 
                  icon={<FiPieChart />} 
                  color="text-blue-600" 
                  bg="bg-blue-50" 
                />
                <StatCard 
                  label="Donations" 
                  value={user?.donationsMade?.length || 0} 
                  icon={<FiHeart />} 
                  color="text-red-600" 
                  bg="bg-red-50" 
                />
                <StatCard 
                  label="Total Given" 
                  value={`रु ${user?.totalDonated?.toLocaleString() || '0'}`} 
                  icon={<FiShoppingBag />} 
                  color="text-emerald-600" 
                  bg="bg-emerald-50" 
                />
                <Link to="/my-rewards" className="group">
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg border border-primary-500 relative overflow-hidden"
                    >
                        <FiAward className="absolute -right-2 -bottom-2 w-24 h-24 text-white/10" />
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-100 opacity-80 mb-1">XP Points</p>
                        <p className="text-3xl font-black">{userPoints.toLocaleString()}</p>
                        <p className="text-[10px] mt-4 font-bold flex items-center gap-1 text-primary-100 uppercase group-hover:gap-2 transition-all">
                            View Rewards Status <span className="text-lg">›</span>
                        </p>
                    </motion.div>
                </Link>
            </div>

            {/* --- INFORMATION SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personal Info */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                        <Link to="/editprofile" className="text-sm font-bold text-primary-600 sm:hidden">Edit</Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoItem icon={<FiUser />} label="Full Name" value={user?.name} />
                        <InfoItem icon={<FiMail />} label="Email Address" value={user?.email} />
                        <InfoItem icon={<FiPhone />} label="Phone Number" value={user?.phone || 'Not provided'} />
                        <InfoItem icon={<FiMapPin />} label="Mailing Address" value={user?.address || 'Not provided'} />
                    </div>
                </div>

                {/* Impact Summary / Extra Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Community Impact</h2>
                    <div className="space-y-6">
                        <p className="text-gray-500 text-sm leading-relaxed">
                            You have been a member since <span className="font-bold text-gray-900">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>.
                        </p>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Current Tier Benefit</p>
                           <p className="text-sm font-bold text-gray-700">
                             {userPoints > 5000 ? "You are eligible for priority campaign features!" : "Donate more to unlock exclusive donor badges."}
                           </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const StatCard = ({ label, value, icon, color, bg }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5"
    >
        <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center text-2xl shadow-inner`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-black text-gray-900 leading-tight">{value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</div>
        </div>
    </motion.div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 p-2 bg-gray-50 text-gray-400 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-gray-800 font-bold">{value}</p>
        </div>
    </div>
);

export default Profile;