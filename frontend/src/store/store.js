import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import { apiSlice } from '../services/api.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

