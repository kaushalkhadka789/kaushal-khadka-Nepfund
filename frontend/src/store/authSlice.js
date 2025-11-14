import { createSlice } from '@reduxjs/toolkit';

// Helper function to get initial state from localStorage
const getInitialState = () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('userToken');
    const adminData = localStorage.getItem('adminData');
    const userData = localStorage.getItem('userData');

    if (adminToken && adminData) {
      try {
        const user = JSON.parse(adminData);
        return {
          token: adminToken,
          user,
          role: 'admin',
          isAuthenticated: true,
        };
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    } else if (userToken && userData) {
      try {
        const user = JSON.parse(userData);
        return {
          token: userToken,
          user,
          role: 'user',
          isAuthenticated: true,
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    }
  } catch (error) {
    console.error('Error initializing auth state:', error);
  }

  return {
    token: null,
    user: null,
    role: null,
    isAuthenticated: false,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.role = user?.role || null;
      state.isAuthenticated = true;

      // Save tokens separately for admin and users
      if (user?.role === 'admin') {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(user));
        // Clear user tokens if they exist
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      } else {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        // Clear admin tokens if they exist
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    },
    logout: (state) => {
      const role = state.role || state.user?.role;
      
      // Clear role-specific tokens
      if (role === 'admin') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      } else {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }

      // Also clear legacy token if it exists
      localStorage.removeItem('token');

      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update localStorage if user data exists
      if (state.user) {
        if (state.role === 'admin' || state.user.role === 'admin') {
          localStorage.setItem('adminData', JSON.stringify(state.user));
        } else {
          localStorage.setItem('userData', JSON.stringify(state.user));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

export default authSlice.reducer;

