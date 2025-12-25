import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetMeQuery } from './services/api';
import { setCredentials } from './store/authSlice';
import ProtectedRoute from './utils/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CampaignDetails from './pages/CampaignDetails';
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import MyCampaigns from './pages/MyCampaigns';
import MyDonations from './pages/MyDonations';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/AdminDashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import Layout from './components/Layout';
import Campaigns from './pages/Campaigns';
import SuccessStoryPage from './pages/SuccessStoryPage';
import UrgentCampaigns from './pages/UrgentCampaigns';
import MyRewards from './pages/MyRewards';
import TopDonors from './pages/TopDonors';

function App() {
  const dispatch = useDispatch();
  
  // Check for role-specific tokens
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const token = adminToken || userToken;
  
  // getMe query runs in background to sync/validate token - non-blocking
  // State is already initialized from localStorage in authSlice
  const { data, isSuccess } = useGetMeQuery(undefined, {
    skip: !token,
    // Refetch on mount to sync with backend, but don't block rendering
    refetchOnMountOrArgChange: true,
  });

  // Sync with backend when getMe succeeds (optional background sync)
  // This updates Redux with any server-side changes, but doesn't block initial render
  useEffect(() => {
    if (isSuccess && data?.user && token) {
      // Only update if we have valid data from backend
      // This ensures profile stays in sync with server
      dispatch(setCredentials({
        token,
        user: data.user,
      }));
    }
  }, [isSuccess, data, token, dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/campaign/:id" element={<CampaignDetails />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/urgent-campaigns" element={<UrgentCampaigns />} />
        <Route path="/success-story/:id" element={<SuccessStoryPage />} />
        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-campaign/:id"
          element={
            <ProtectedRoute>
              <EditCampaign />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-campaigns"
          element={
            <ProtectedRoute>
              <MyCampaigns />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-donations"
          element={
            <ProtectedRoute>
              <MyDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rewards"
          element={
            <ProtectedRoute>
              <MyRewards />
            </ProtectedRoute>
          }
        />
        <Route path="/top-donors" element={<TopDonors />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;

