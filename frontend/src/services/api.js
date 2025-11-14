import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState, extra }) => {
    // Get token from Redux state first
    let token = getState().auth.token;
    
    // Fallback to localStorage if Redux doesn't have token
    if (!token) {
      token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    }
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    // RTK Query will automatically handle this
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Campaign', 'Donation', 'Reward'],
  endpoints: (builder) => ({}),
});

// Auth endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

// Campaign endpoints
export const campaignApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCampaigns: builder.query({
      query: (params = {}) => ({
        url: '/campaigns',
        params,
      }),
      providesTags: ['Campaign'],
    }),
    getSuccessStories: builder.query({
      query: (params = {}) => ({
        url: '/success-stories',
        params,
      }),
      providesTags: ['Campaign'],
    }),
    getSuccessStory: builder.query({
      query: (id) => `/success-stories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    getCampaign: builder.query({
      query: (id) => `/campaigns/${id}`,
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),
    createCampaign: builder.mutation({
      query: (formData) => ({
        url: '/campaigns',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Campaign'],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, data: formData }) => {
        // formData should be FormData instance
        return {
          url: `/campaigns/${id}`,
          method: 'PUT',
          body: formData,
          // FormData sets its own Content-Type with boundary, so don't override
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Campaign', id }, 'Campaign'],
    }),
    deleteCampaign: builder.mutation({
      query: (id) => ({
        url: `/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign'],
    }),
    addComment: builder.mutation({
      query: ({ campaignId, text }) => ({
        url: `/campaigns/${campaignId}/comments`,
        method: 'POST',
        body: { text },
      }),
      invalidatesTags: (result, error, { campaignId }) => [{ type: 'Campaign', id: campaignId }],
    }),
    addUpdate: builder.mutation({
      query: ({ campaignId, ...data }) => ({
        url: `/campaigns/${campaignId}/updates`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { campaignId }) => [{ type: 'Campaign', id: campaignId }],
    }),
    getMyCampaigns: builder.query({
      query: () => '/campaigns/my-campaigns',
      providesTags: ['Campaign'],
    }),
  }),
});

// Donation endpoints
export const donationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDonation: builder.mutation({
      query: (data) => ({
        url: '/donations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Campaign', 'Donation'],
    }),
    getCampaignDonations: builder.query({
      query: (campaignId) => `/donations/campaign/${campaignId}`,
      providesTags: ['Donation'],
    }),
    getMyDonations: builder.query({
      query: () => '/donations/my-donations',
      providesTags: ['Donation'],
    }),
  }),
});

// Admin endpoints
export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Campaign', 'Donation', 'User'],
    }),
    getPendingCampaigns: builder.query({
      query: () => '/admin/campaigns/pending',
      providesTags: ['Campaign'],
    }),
    markSuccessStory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/campaigns/${id}/success-story`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Campaign'],
    }),
    deleteAdminCampaign: builder.mutation({
      query: (id) => ({
        url: `/admin/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaign'],
    }),
    approveCampaign: builder.mutation({
      query: (id) => ({
        url: `/admin/campaigns/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Campaign'],
    }),
    rejectCampaign: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/campaigns/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Campaign'],
    }),
    getAllUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/admin/users/${id}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// User endpoints
export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    uploadProfileImage: builder.mutation({
      query: (file) => {
        const form = new FormData();
        form.append('image', file);
        return {
          url: '/users/profile/image',
          method: 'PUT',
          body: form,
        };
      },
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
} = authApi;

export const {
  useGetCampaignsQuery,
  useGetSuccessStoriesQuery,
  useGetSuccessStoryQuery,
  useGetCampaignQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useAddCommentMutation,
  useAddUpdateMutation,
  useGetMyCampaignsQuery,
} = campaignApi;

export const {
  useCreateDonationMutation,
  useGetCampaignDonationsQuery,
  useGetMyDonationsQuery,
} = donationApi;

export const {
  useGetDashboardStatsQuery,
  useGetPendingCampaignsQuery,
  useApproveCampaignMutation,
  useRejectCampaignMutation,
  useDeleteAdminCampaignMutation,
  useMarkSuccessStoryMutation,
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = adminApi;

export const {
  useGetProfileQuery,
  useUploadProfileImageMutation,
  useUpdateProfileMutation,
} = userApi;

// Reward endpoints
export const rewardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyRewards: builder.query({
      query: () => '/rewards/me',
      providesTags: ['User', 'Reward'],
    }),
    getTopDonors: builder.query({
      query: (params = {}) => ({
        url: '/rewards/top',
        params,
      }),
      providesTags: ['Reward'],
    }),
    grantBonusPoints: builder.mutation({
      query: (data) => ({
        url: '/rewards/admin/grant-points',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Reward'],
    }),
  }),
});

export const {
  useGetMyRewardsQuery,
  useGetTopDonorsQuery,
  useGrantBonusPointsMutation,
} = rewardApi;
