import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation } from '../services/api';
import { updateUser } from '../store/authSlice';

const EditProfile = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const reduxUser = useSelector((state) => state.auth.user);

	const { data } = useGetProfileQuery(undefined, {
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

	const handleCancel = () => {
		navigate('/profile');
	};

	if (!user) {
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<p className="text-center text-gray-500">Loading profile...</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Personal Information</h2>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Full Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Phone
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Address
						</label>
						<input
							type="text"
							name="address"
							value={formData.address}
							onChange={handleChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
						/>
					</div>
					<div className="flex space-x-4">
						<button
							type="submit"
							disabled={isUpdating}
							className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
						>
							{isUpdating ? 'Saving...' : 'Save Changes'}
						</button>
						<button
							type="button"
							onClick={handleCancel}
							className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditProfile;


