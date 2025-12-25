import { useState } from 'react';
import { useGetProfileQuery, useUploadProfileImageMutation, useGetMyRewardsQuery } from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiUpload, FiAward } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/authSlice';
import { Link } from 'react-router-dom';
import TierBadge from '../components/TierBadge';
import { getTier } from '../utils/reward.utils.js';

const Profile = () => {
	const dispatch = useDispatch();
	// Get user from Redux state first (instant, from localStorage)
	const reduxUser = useSelector((state) => state.auth.user);
	
	// Sync with backend in background (non-blocking)
	const { data, isLoading } = useGetProfileQuery(undefined, {
		// Don't block rendering - use Redux state immediately
		refetchOnMountOrArgChange: true,
	});
	
	const [uploadProfileImage, { isLoading: isUploading }] = useUploadProfileImageMutation();

	// Use backend data if available, otherwise fall back to Redux state
	const user = data?.user || reduxUser;
	
	// Get reward information
	const { data: rewardsData } = useGetMyRewardsQuery(undefined, {
		skip: !user,
	});
	
	// Calculate tier from points
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
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-3xl font-bold mb-8">My Profile</h1>

			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						<div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border">
							{preview ? (
								<img src={preview} alt="preview" className="w-full h-full object-cover" />
							) : user?.profileImage || user?.avatar ? (
								<img src={`http://localhost:5000/${user.profileImage || user.avatar}`} alt={user?.name} className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center text-gray-400"><FiUser className="w-8 h-8" /></div>
							)}
						</div>
						<div>
							<div className="flex items-center gap-2 mb-1">
								<p className="text-lg font-semibold">{user?.name}</p>
								{userTier && <TierBadge tier={userTier} size="sm" />}
							</div>
							<p className="text-gray-500 text-sm">{user?.email}</p>
							{userPoints > 0 && (
								<p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
									<FiAward className="w-4 h-4 text-primary-600" />
									<span>{userPoints.toLocaleString()} reward points</span>
								</p>
							)}
						</div>
					</div>
					<label className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
						<FiUpload />
						<span>{isUploading ? 'Uploading...' : 'Change Photo'}</span>
						<input type="file" accept="image/*" onChange={onPickImage} className="hidden" />
					</label>
				</div>

				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Personal Information</h2>
					<Link
						to="/editprofile"
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
					>
						Edit Profile
					</Link>
				</div>

				<div className="space-y-4">
					<div className="flex items-center space-x-3">
						<FiUser className="w-5 h-5 text-gray-400" />
						<div>
							<p className="text-sm text-gray-600">Name</p>
							<p className="font-semibold">{user?.name}</p>
						</div>
					</div>
					<div className="flex items-center space-x-3">
						<FiMail className="w-5 h-5 text-gray-400" />
						<div>
							<p className="text-sm text-gray-600">Email</p>
							<p className="font-semibold">{user?.email}</p>
						</div>
					</div>
					{user?.phone && (
						<div className="flex items-center space-x-3">
							<FiPhone className="w-5 h-5 text-gray-400" />
							<div>
								<p className="text-sm text-gray-600">Phone</p>
								<p className="font-semibold">{user.phone}</p>
							</div>
						</div>
					)}
					{user?.address && (
						<div className="flex items-center space-x-3">
							<FiMapPin className="w-5 h-5 text-gray-400" />
							<div>
								<p className="text-sm text-gray-600">Address</p>
								<p className="font-semibold">{user.address}</p>
							</div>
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<p className="text-3xl font-bold text-primary-600 mb-2">
						{user?.campaignsCreated?.length || 0}
					</p>
					<p className="text-gray-600">Campaigns Created</p>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<p className="text-3xl font-bold text-green-600 mb-2">
						{user?.donationsMade?.length || 0}
					</p>
					<p className="text-gray-600">Donations Made</p>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<p className="text-3xl font-bold text-purple-600 mb-2">
						रु {user?.totalDonated?.toLocaleString() || '0'}
					</p>
					<p className="text-gray-600">Total Donated</p>
				</div>
				<Link
					to="/my-rewards"
					className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer border-2 border-primary-200"
				>
					<FiAward className="w-8 h-8 text-primary-600 mx-auto mb-2" />
					<p className="text-3xl font-bold text-primary-600 mb-2">
						{userPoints.toLocaleString()}
					</p>
					<p className="text-gray-600 text-sm">Reward Points</p>
					<p className="text-xs text-primary-600 mt-2 font-semibold">View Rewards →</p>
				</Link>
			</div>
		</div>
	);
};

export default Profile;

